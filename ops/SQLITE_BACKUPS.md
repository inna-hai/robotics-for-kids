# SQLite backups

The backup job protects `data/summer-subscriptions.sqlite` with SQLite's online
backup API. It does not copy a live database with `cp`, so the snapshot remains
consistent when the application writes concurrently or uses WAL mode.

## Defaults

- Source: `data/summer-subscriptions.sqlite`
- systemd destination: `~/backups/robotics-for-kids/sqlite/`
- Retention: 30 newest verified backups
- Schedule: daily at 03:30, with up to 30 minutes of randomized delay
- Permissions: backup directory `0700`; database and checksum files `0600`
- Filename: `summer-subscriptions-<UTC timestamp>.sqlite`

Each run acquires an exclusive lock, creates a temporary SQLite snapshot, runs
`PRAGMA integrity_check`, and writes a SHA-256 sidecar. The checksum is flushed,
renamed, and directory-synced before the final database name is published; this
means every visible generated `.sqlite` file already has a durable checksum.
Retention runs only after publication. A missing source is skipped without
creating an empty database.

## Install the user timer

Run from the repository root:

```sh
install -d -m 0700 "$HOME/backups/robotics-for-kids"
install -D -m 0644 ops/systemd/robotics-sqlite-backup.service \
  ~/.config/systemd/user/robotics-sqlite-backup.service
install -D -m 0644 ops/systemd/robotics-sqlite-backup.timer \
  ~/.config/systemd/user/robotics-sqlite-backup.timer
systemctl --user daemon-reload
systemctl --user enable --now robotics-sqlite-backup.timer
```

For unattended operation, the host must keep the user manager running after
logout. Check it with:

```sh
loginctl show-user "$USER" -p Linger
```

An administrator can enable it with `loginctl enable-linger "$USER"` if needed.

## Run and inspect

Manual backup using repository-local defaults:

```sh
python3 scripts/backup_sqlite.py
```

Manual backup using the production destination:

```sh
python3 scripts/backup_sqlite.py \
  --source data/summer-subscriptions.sqlite \
  --backup-dir "$HOME/backups/robotics-for-kids/sqlite" \
  --retention 30
```

Inspect scheduling and logs:

```sh
systemctl --user list-timers robotics-sqlite-backup.timer
journalctl --user -u robotics-sqlite-backup.service --no-pager
```

## Verify a backup

Set `BACKUP` to a selected `.sqlite` file:

```sh
set -eu
BACKUP="$HOME/backups/robotics-for-kids/sqlite/<backup-file>.sqlite"
cd "$(dirname "$BACKUP")"
sha256sum -c "$(basename "$BACKUP").sha256"
python3 - "$BACKUP" <<'PY'
import sqlite3, sys
connection = sqlite3.connect(f"file:{sys.argv[1]}?mode=ro", uri=True)
result = connection.execute("PRAGMA integrity_check").fetchone()[0]
connection.close()
assert result == "ok", result
print("integrity_check: ok")
PY
```

## Restore safely

Never replace the active database while the application is running.

1. Set `APP_SERVICE` to the actual application unit, stop it, and confirm it is
   inactive with `systemctl --user show "$APP_SERVICE" -p ActiveState`.
2. Verify the selected backup with both commands above.
3. Preserve the current database and all SQLite sidecars in a rollback directory.
4. Install the backup with mode `0600` and persist the replacement.
5. Start the application and run a login/progress smoke test.

Example after the application service has been stopped. The rollback directory
preserves the database and any WAL/SHM files together:

```sh
set -eu
APP_SERVICE="replace-with-actual-robotics.service"
SOURCE_DB="$HOME/robotics-for-kids/data/summer-subscriptions.sqlite"
BACKUP="$HOME/backups/robotics-for-kids/sqlite/<backup-file>.sqlite"
DATA_DIR="$(dirname "$SOURCE_DB")"
systemctl --user stop "$APP_SERVICE"
test "$(systemctl --user show "$APP_SERVICE" -p ActiveState --value)" = inactive
ROLLBACK_DIR="${SOURCE_DB}.rollback-$(date -u +%Y%m%dT%H%M%SZ)"
install -d -m 0700 "$ROLLBACK_DIR"
for suffix in "" "-wal" "-shm" "-journal"; do
  if [ -e "${SOURCE_DB}${suffix}" ]; then
    mv "${SOURCE_DB}${suffix}" "$ROLLBACK_DIR/"
  fi
done
python3 - "$ROLLBACK_DIR" "$DATA_DIR" <<'PY'
import os, sys
for directory in sys.argv[1:]:
    descriptor = os.open(directory, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)
PY
install -m 0600 "$BACKUP" "${SOURCE_DB}.restoring"
python3 - "${SOURCE_DB}.restoring" <<'PY'
import os, sys
with open(sys.argv[1], "rb") as restored:
    os.fsync(restored.fileno())
PY
mv -f "${SOURCE_DB}.restoring" "$SOURCE_DB"
python3 - "$DATA_DIR" <<'PY'
import os, sys
descriptor = os.open(sys.argv[1], os.O_RDONLY | os.O_DIRECTORY)
try:
    os.fsync(descriptor)
finally:
    os.close(descriptor)
PY
systemctl --user start "$APP_SERVICE"
```

If the smoke test fails, the application has already been started. Stop it again
before touching SQLite, remove the failed restored database and all of its
sidecars, restore every preserved file, fsync the data directory, and only then
restart:

```sh
set -eu
APP_SERVICE="replace-with-actual-robotics.service"
SOURCE_DB="$HOME/robotics-for-kids/data/summer-subscriptions.sqlite"
DATA_DIR="$(dirname "$SOURCE_DB")"
ROLLBACK_DIR="" # Paste the exact rollback directory created above.
test -n "$ROLLBACK_DIR"
test -d "$ROLLBACK_DIR"
systemctl --user stop "$APP_SERVICE"
test "$(systemctl --user show "$APP_SERVICE" -p ActiveState --value)" = inactive
for suffix in "" "-wal" "-shm" "-journal" ".restoring"; do
  rm -f "${SOURCE_DB}${suffix}"
done
for rollback_file in "$ROLLBACK_DIR"/*; do
  [ -e "$rollback_file" ] || continue
  mv "$rollback_file" "$DATA_DIR/"
done
python3 - "$DATA_DIR" <<'PY'
import os, sys
descriptor = os.open(sys.argv[1], os.O_RDONLY | os.O_DIRECTORY)
try:
    os.fsync(descriptor)
finally:
    os.close(descriptor)
PY
systemctl --user start "$APP_SERVICE"
```

Repeat the login/progress smoke test after rollback.

## Automated proof

`tests/sqlite-backup.test.mjs` creates a real temporary SQLite database, backs
it up repeatedly, validates integrity and SHA-256, exercises retention and
crash-artifact cleanup, copies a backup to a separate restore file, and reads
the restored rows. It never replaces the production database.
