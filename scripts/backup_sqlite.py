#!/usr/bin/env python3
"""Create an atomic, verified backup of the Robotics SQLite database."""

from __future__ import annotations

import argparse
from contextlib import closing
import errno
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import stat
import sys
from datetime import datetime, timezone
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "data" / "summer-subscriptions.sqlite"
DEFAULT_BACKUP_DIR = ROOT / "backups" / "sqlite"
BACKUP_PREFIX = "summer-subscriptions-"
BACKUP_FILENAME = re.compile(rf"^{re.escape(BACKUP_PREFIX)}\d{{8}}T\d{{12}}Z\.sqlite$")
TEMP_ARTIFACT_FILENAME = re.compile(
    rf"^\.{re.escape(BACKUP_PREFIX)}\d{{8}}T\d{{12}}Z\.sqlite\."
    rf"[0-9a-f]{{32}}\.(?:tmp(?:-(?:journal|wal|shm))?|sha256\.tmp)$"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=Path(os.environ.get("ROBOTICS_SQLITE_FILE", DEFAULT_SOURCE)),
        help="SQLite database to back up",
    )
    parser.add_argument(
        "--backup-dir",
        type=Path,
        default=Path(os.environ.get("ROBOTICS_BACKUP_DIR", DEFAULT_BACKUP_DIR)),
        help="Directory for verified backups",
    )
    parser.add_argument(
        "--retention",
        type=int,
        default=int(os.environ.get("ROBOTICS_BACKUP_RETENTION", "30")),
        help="Number of newest backups to retain",
    )
    return parser.parse_args()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def integrity_check(path: Path) -> str:
    uri = f"file:{path.as_posix()}?mode=ro"
    with closing(sqlite3.connect(uri, uri=True)) as connection:
        row = connection.execute("PRAGMA integrity_check").fetchone()
    return str(row[0] if row else "missing result")


def create_backup(source: Path, destination: Path) -> None:
    source_uri = f"{source.resolve().as_uri()}?mode=ro"
    with closing(sqlite3.connect(source_uri, uri=True)) as source_db:
        source_db.execute("PRAGMA query_only = ON")
        with closing(sqlite3.connect(destination)) as backup_db:
            source_db.backup(backup_db)


def fsync_directory(path: Path) -> None:
    flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0)
    descriptor = os.open(path, flags)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def close_suppress_errors(descriptor: int) -> None:
    try:
        os.close(descriptor)
    except OSError:
        pass


def fsync_open_directory_at(directory_fd: int) -> None:
    descriptor = os.open(
        ".",
        os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC,
        dir_fd=directory_fd,
    )
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def ensure_backup_directory(backup_dir: Path) -> int:
    """Open/create every path component without following symlinks.

    The returned descriptor pins the final directory for the entire backup run,
    preventing ancestor replacement from redirecting later operations.
    """
    if not backup_dir.is_absolute():
        raise ValueError(f"backup path must be absolute: {backup_dir}")
    if not hasattr(os, "O_NOFOLLOW") or not hasattr(os, "O_PATH"):
        raise RuntimeError("secure backup paths require O_NOFOLLOW and O_PATH support")

    traversal_flags = os.O_PATH | os.O_DIRECTORY | os.O_CLOEXEC | os.O_NOFOLLOW
    current_fd: int | None = os.open(backup_dir.anchor, traversal_flags)
    try:
        for component in backup_dir.parts[1:]:
            next_fd: int | None = None
            try:
                next_fd = os.open(component, traversal_flags, dir_fd=current_fd)
            except FileNotFoundError:
                os.mkdir(component, mode=0o700, dir_fd=current_fd)
                next_fd = os.open(component, traversal_flags, dir_fd=current_fd)
                try:
                    fsync_open_directory_at(next_fd)
                    fsync_open_directory_at(current_fd)
                except Exception:
                    close_suppress_errors(next_fd)
                    next_fd = None
                    raise
            except OSError as error:
                if error.errno in {errno.ELOOP, errno.ENOTDIR}:
                    raise ValueError(
                        f"backup path contains a symlink or non-directory component: {backup_dir}"
                    ) from error
                raise

            previous_fd = current_fd
            current_fd = next_fd
            try:
                os.close(previous_fd)
            except OSError:
                close_suppress_errors(current_fd)
                current_fd = None
                raise

        backup_fd: int | None = None
        try:
            backup_fd = os.open(
                ".",
                os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC,
                dir_fd=current_fd,
            )
            directory_stat = os.fstat(backup_fd)
            if not stat.S_ISDIR(directory_stat.st_mode) or directory_stat.st_uid != os.geteuid():
                raise PermissionError("backup directory must be owned by the current user")
            os.fchmod(backup_fd, 0o700)
            os.fsync(backup_fd)
        except Exception:
            if backup_fd is not None:
                close_suppress_errors(backup_fd)
            raise

        previous_fd = current_fd
        current_fd = None
        try:
            os.close(previous_fd)
        except OSError:
            close_suppress_errors(backup_fd)
            raise
        return backup_fd
    except Exception:
        if current_fd is not None:
            close_suppress_errors(current_fd)
        raise


def cleanup_stale_temp_files(backup_dir: Path) -> list[str]:
    deleted: list[str] = []
    for artifact in backup_dir.iterdir():
        if not TEMP_ARTIFACT_FILENAME.fullmatch(artifact.name):
            continue
        if artifact.is_symlink() or artifact.is_file():
            artifact.unlink(missing_ok=True)
            deleted.append(str(artifact))
    if deleted:
        fsync_directory(backup_dir)
    return deleted


def recognized_backups(backup_dir: Path) -> list[Path]:
    return sorted(
        (
            path
            for path in backup_dir.iterdir()
            if BACKUP_FILENAME.fullmatch(path.name) and path.is_file() and not path.is_symlink()
        ),
        reverse=True,
    )


def prune_backups(backup_dir: Path, retention: int) -> list[str]:
    backups = recognized_backups(backup_dir)
    deleted: list[str] = []
    for old_backup in backups[retention:]:
        old_backup.unlink(missing_ok=True)
        fsync_directory(backup_dir)
        old_backup.with_name(f"{old_backup.name}.sha256").unlink(missing_ok=True)
        fsync_directory(backup_dir)
        deleted.append(str(old_backup))
    for checksum in backup_dir.glob(f"{BACKUP_PREFIX}*.sqlite.sha256"):
        matching_backup = Path(str(checksum)[: -len(".sha256")])
        if not BACKUP_FILENAME.fullmatch(matching_backup.name):
            continue
        if not matching_backup.exists():
            checksum.unlink(missing_ok=True)
    return deleted


def _run_in_backup_directory(
    source: Path,
    backup_dir: Path,
    display_backup_dir: Path,
    retention: int,
) -> dict[str, object]:
    lock_path = backup_dir / ".backup.lock"
    lock_flags = os.O_RDWR | os.O_CREAT | os.O_CLOEXEC | os.O_NOFOLLOW
    lock_fd = os.open(lock_path, lock_flags, 0o600)
    lock_stat = os.fstat(lock_fd)
    if not stat.S_ISREG(lock_stat.st_mode) or lock_stat.st_uid != os.geteuid():
        os.close(lock_fd)
        raise PermissionError("backup lock must be a regular file owned by the current user")
    with os.fdopen(lock_fd, "a+") as lock_handle:
        os.fchmod(lock_handle.fileno(), 0o600)
        try:
            fcntl.flock(lock_handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return {"status": "skipped", "reason": "another backup is running", "source": str(source)}

        cleanup_stale_temp_files(backup_dir)
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        final_path = backup_dir / f"{BACKUP_PREFIX}{timestamp}.sqlite"
        display_final_path = display_backup_dir / final_path.name
        temp_path = backup_dir / f".{final_path.name}.{uuid4().hex}.tmp"
        checksum_temp = backup_dir / f".{final_path.name}.{uuid4().hex}.sha256.tmp"
        checksum_path = final_path.with_name(f"{final_path.name}.sha256")
        checksum_published = False
        backup_published = False
        try:
            create_backup(source, temp_path)
            result = integrity_check(temp_path)
            if result.lower() != "ok":
                raise RuntimeError(f"SQLite integrity check failed: {result}")
            temp_path.chmod(0o600)
            with temp_path.open("rb") as backup_handle:
                os.fsync(backup_handle.fileno())
            checksum = sha256_file(temp_path)
            with checksum_temp.open("x", encoding="utf-8") as checksum_handle:
                os.fchmod(checksum_handle.fileno(), 0o600)
                checksum_handle.write(f"{checksum}  {final_path.name}\n")
                checksum_handle.flush()
                os.fsync(checksum_handle.fileno())
            os.replace(checksum_temp, checksum_path)
            checksum_published = True
            fsync_directory(backup_dir)
            os.replace(temp_path, final_path)
            backup_published = True
            fsync_directory(backup_dir)
            deleted_internal = prune_backups(backup_dir, retention)
            deleted = [str(display_backup_dir / Path(path).name) for path in deleted_internal]
            fsync_directory(backup_dir)
            retained = len(recognized_backups(backup_dir))
            return {
                "status": "created",
                "source": str(source),
                "backup": str(display_final_path),
                "sha256": checksum,
                "bytes": final_path.stat().st_size,
                "integrity": result,
                "retention": retention,
                "retained": retained,
                "deleted": deleted,
            }
        finally:
            temp_path.unlink(missing_ok=True)
            checksum_temp.unlink(missing_ok=True)
            if checksum_published and not backup_published:
                checksum_path.unlink(missing_ok=True)
            fsync_directory(backup_dir)


def run(source: Path, backup_dir: Path, retention: int) -> dict[str, object]:
    source = source.expanduser().resolve()
    backup_dir = backup_dir.expanduser().absolute()
    if retention < 1:
        raise ValueError("retention must be at least 1")
    if not source.exists():
        return {"status": "skipped", "reason": "source database does not exist", "source": str(source)}
    if not source.is_file():
        raise ValueError(f"source is not a regular file: {source}")

    backup_directory_fd = ensure_backup_directory(backup_dir)
    pinned_backup_dir = Path(f"/proc/self/fd/{backup_directory_fd}")
    try:
        return _run_in_backup_directory(source, pinned_backup_dir, backup_dir, retention)
    finally:
        os.close(backup_directory_fd)


def main() -> int:
    os.umask(0o077)
    args = parse_args()
    try:
        result = run(args.source, args.backup_dir, args.retention)
    except Exception as error:
        print(json.dumps({"status": "error", "error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
