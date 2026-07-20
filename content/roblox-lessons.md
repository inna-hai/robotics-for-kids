# Roblox 10+ — מערכי שיעור ללומדה

קורס Roblox Studio לגיל 10+: בנייה, Properties, Luau, אירועים, פונקציות, טבלאות ופרויקטים.

## שיעור 1: היכרות עם Roblox Studio והוספת עצמים

- יחידה: משחק המדרגות המעופפות
- תוצר: עולם Baseplate עם SpawnLocation, חלקים ושמות מסודרים
- מושג מרכזי: Studio, Workspace, Explorer, Properties, Move/Scale/Rotate, צירי X/Y/Z

### מה עושים ב־Studio
- פותחים Baseplate חדש
- מוודאים ש־Explorer, Properties ו־Output פתוחים
- מוסיפים SpawnLocation ומבינים שהוא מופיע תחת Workspace
- מוסיפים Parts, משנים מיקום, גודל, סיבוב ושם
- מארגנים כמה משטחי שיגור בתיקייה

### Properties / מושגים
- Name
- Position
- Size
- Orientation
- Parent

### קוד לדוגמה
```lua
-- שיעור 1: אין חובה לכתוב Script
-- בדיקת Output ראשונה, אם רוצים להתנסות:
print("Roblox Studio is ready!")
```

### תרגול
- הזיזו SpawnLocation לגובה אחר והריצו Play
- צרו 3 משטחי שיגור בגבהים שונים
- הוסיפו Block ו־Sphere, שנו שם, גודל וסיבוב
- הכניסו עצמים קשורים לתיקייה בעזרת Ctrl+G

### דגש מדריך
לוודא שכל תלמיד מבין איפה רואים עצם בעולם ואיפה הוא מופיע ב־Explorer. לעצור על ההבדל בין Workspace לבין מה שרואים במסך.

## שיעור 2: תכונות חלקים ובניית מסלול מכשולים

- יחידה: משחק המדרגות המעופפות
- תוצר: Obby בסיסי עם בלוקים, צבעים, חומרים וחלקים שאפשר/אי אפשר להתנגש בהם
- מושג מרכזי: Anchored, CanCollide, Color, BrickColor, Material, Transparency

### מה עושים ב־Studio
- בונים Part באוויר ומריצים כדי לראות שהוא נופל
- מפעילים Anchored כדי להשאיר חלק במקום
- משנים CanCollide כדי ליצור בלוקים “מטעים” במסלול
- משנים צבע, חומר ושקיפות
- בונים התחלה של מסלול מכשולים

### Properties / מושגים
- Anchored
- CanCollide
- BrickColor
- Color
- Material
- Transparency

### קוד לדוגמה
```lua
-- שיעור 2: התכונות נלמדות דרך Properties
-- בהמשך אפשר לשנות את אותן תכונות דרך Script:
local part = workspace.Part
part.Anchored = true
part.CanCollide = false
part.Transparency = 0.3
```

### תרגול
- צרו מסלול מכשולים עם לפחות 8 חלקים
- בחרו 3 בלוקים שהשחקן ייפול דרכם: CanCollide = false
- שנו Material וצבע לכל אזור במסלול
- נסו ערכי Transparency שונים: 0, 0.3, 0.8

### דגש מדריך
זה שיעור מצוין לשאלות ניבוי: מה יקרה אם Anchored כבוי? מה יקרה אם CanCollide כבוי אבל החלק באוויר?

## שיעור 3: שלט כניסה, GUI ויחסי Parent/Child

- יחידה: משחק המדרגות המעופפות
- תוצר: שלט כניסה מעוצב עם SurfaceGui ו־TextLabel
- מושג מרכזי: SurfaceGui, TextLabel, AnchorPoint, Position, Size, Parent/Child

### מה עושים ב־Studio
- משנים את Baseplate לחומר וצבע שמתאימים לעולם
- יוצרים Part בשם Sign
- מוסיפים לתוך Sign רכיב SurfaceGui
- מוסיפים TextLabel לתוך ה־SurfaceGui
- מעצבים Text, Font, TextColor, TextSize, Size ו־BackgroundTransparency

### Properties / מושגים
- Text
- Font
- TextColor
- TextSize
- AnchorPoint
- Position
- Size
- BackgroundTransparency

### קוד לדוגמה
```lua
-- שיעור 3: מבנה האובייקטים לפני קוד
-- Workspace > Sign > SurfaceGui > TextLabel
local label = workspace.Sign.SurfaceGui.TextLabel
label.Text = "Welcome to my obby!"
label.TextSize = 48
```

### תרגול
- כתבו הודעת פתיחה לשחקנים
- מקמו את הטקסט במרכז השלט עם AnchorPoint ו־Position
- הגדילו את התווית עם Size
- העלימו את רקע התווית בעזרת BackgroundTransparency

### דגש מדריך
להדגיש שה־Sign הוא Parent, וה־SurfaceGui/TextLabel הם Children. זו הכנה חשובה מאוד לכתיבת הפניות בקוד בשיעור הבא.

## שיעור 4: הפניות לאובייקטים וצעדים ראשונים ב־Luau

- יחידה: משחק המדרגות המעופפות
- תוצר: Script שמדפיס ומשנה תכונה של אובייקט
- מושג מרכזי: Script, print, game.Workspace, references

### מה עושים ב־Studio
- מוסיפים Script
- פותחים Output
- מריצים print ראשון
- יוצרים הפניה לאובייקט ב־Workspace
- משנים תכונה דרך קוד

### Properties / מושגים
- Name
- BrickColor
- Transparency

### קוד לדוגמה
```lua
print("Hello Roblox")
local part = game.Workspace.Part
part.Transparency = 0.5
```

### תרגול
- הדפיסו הודעה ל־Output
- צרו הפניה לחלק בשם Sign
- שנו צבע או שקיפות בעזרת קוד

### דגש מדריך
להקפיד על שמות אובייקטים באנגלית וללא רווחים כדי שההפניות יהיו פשוטות.

## שיעור 5: משתנים ושמירת הפניות

- יחידה: משחק המדרגות המעופפות
- תוצר: קוד מסודר עם משתנים לאובייקטים ולערכים
- מושג מרכזי: variables, string, number, boolean, object reference

### מה עושים ב־Studio
- יוצרים משתנה לחלק
- יוצרים משתנה למספר
- יוצרים משתנה לטקסט
- יוצרים משתנה בוליאני
- משתמשים במשתנים כדי לשנות עולם

### Properties / מושגים
- Name
- Value

### קוד לדוגמה
```lua
local sign = game.Workspace.Sign
local speed = 10
local message = "Welcome"
local isOpen = true
```

### תרגול
- שמרו הפניה לשלט במשתנה
- שמרו צבע/מספר/טקסט במשתנים
- השתמשו במשתנה כדי לשנות TextLabel

## שיעור 6: תנאים וקבלת החלטות

- יחידה: משחק המדרגות המעופפות
- תוצר: Script שמגיב אחרת לפי מצב
- מושג מרכזי: if, then, else, comparison

### מה עושים ב־Studio
- בודקים ערך של משתנה
- מריצים if בסיסי
- מוסיפים else
- משנים תכונה לפי החלטה

### Properties / מושגים
- Transparency
- CanCollide

### קוד לדוגמה
```lua
local isOpen = false
if isOpen then
    print("Open")
else
    print("Closed")
end
```

### תרגול
- צרו תנאי שבודק אם דלת פתוחה
- שנו CanCollide לפי מצב
- הדפיסו הודעה שונה לכל מצב

## שיעור 7: פונקציות חלק א

- יחידה: משחק המדרגות המעופפות
- תוצר: פונקציה שמבצעת פעולה חוזרת
- מושג מרכזי: function, call

### מה עושים ב־Studio
- מגדירים פונקציה
- קוראים לפונקציה
- מעבירים פעולה חוזרת לקוד מסודר

### Properties / מושגים
- Name

### קוד לדוגמה
```lua
local function showWinner()
    print("Winner!")
end

showWinner()
```

### תרגול
- צרו פונקציה שמדפיסה הודעת ניצחון
- קראו לה כמה פעמים
- הכניסו לתוכה שינוי בשלט

## שיעור 8: פונקציות חלק ב — ארגומנטים

- יחידה: משחק המדרגות המעופפות
- תוצר: פונקציה שמקבלת ערך ומשתמשת בו
- מושג מרכזי: parameters, arguments

### מה עושים ב־Studio
- מוסיפים פרמטר לפונקציה
- שולחים ערך בקריאה
- משתמשים בערך בתוך הפונקציה

### Properties / מושגים
- Text

### קוד לדוגמה
```lua
local function setSignText(text)
    print(text)
end

setSignText("Welcome")
```

### תרגול
- צרו פונקציה שמשנה טקסט בשלט
- שלחו אליה הודעות שונות
- השתמשו בה כדי לעדכן מנצח

## שיעור 9: אירועים וחיבור פעולה לנגיעה

- יחידה: משחק המדרגות המעופפות
- תוצר: אובייקט שמפעיל פונקציה כשנוגעים בו
- מושג מרכזי: events, Touched, Connect

### מה עושים ב־Studio
- מזהים אירוע מתאים
- מחברים פונקציה ל־Touched
- מדפיסים מי נגע
- מתחילים להציג מנצח על שלט

### Properties / מושגים
- Touched

### קוד לדוגמה
```lua
local part = script.Parent
part.Touched:Connect(function(hit)
    print("Touched")
end)
```

### תרגול
- חברו Touched לחלק סוף המסלול
- הדפיסו הודעת ניצחון
- נסו לזהות מה נגע בחלק

## שיעור 10: מציאת מנצח ו־Toolbox

- יחידה: משחק המדרגות המעופפות
- תוצר: שלט שמציג מנצח ושימוש מבוקר ב־Toolbox
- מושג מרכזי: winner display, toolbox assets

### מה עושים ב־Studio
- משלימים פונקציית מנצח
- מעדכנים TextLabel
- מכירים Toolbox
- בודקים מודלים לפני שימוש

### Properties / מושגים
- Text
- Parent

### קוד לדוגמה
```lua
local label = workspace.Sign.SurfaceGui.TextLabel
label.Text = "Winner!"
```

### תרגול
- עדכנו את השלט כאשר שחקן מגיע לסוף
- הוסיפו מודל מה־Toolbox בצורה מבוקרת
- בדקו שהמודל לא שובר את המשחק

## שיעור 11: כתיבת סיפורים — קלט מהשחקן

- יחידה: כתיבת סיפורים ב־Luau
- תוצר: סיפור שמתחיל מתשובה של שחקן
- מושג מרכזי: questions, input idea, strings

### מה עושים ב־Studio
- שואלים שאלה
- שומרים תשובה
- משלבים תשובה במשפט

### Properties / מושגים
- Text

### קוד לדוגמה
```lua
local name = "Noa"
local sentence = "Hello " .. name
print(sentence)
```

### תרגול
- כתבו משפט עם שם שחקן
- חברו כמה מחרוזות
- הציגו משפט ב־Output

## שיעור 12: הדפסת הסיפור והרחבת שאלות

- יחידה: כתיבת סיפורים ב־Luau
- תוצר: סיפור קצר שמודפס בשלבים
- מושג מרכזי: string concatenation, sequence

### מה עושים ב־Studio
- מוסיפים כמה שאלות
- בונים משפטים
- מדפיסים סיפור שלם

### Properties / מושגים
- Text

### קוד לדוגמה
```lua
local hero = "Robot"
local place = "Forest"
print(hero .. " went to " .. place)
```

### תרגול
- צרו 3 משתנים לסיפור
- חברו אותם למשפט אחד
- הדפיסו התחלה/אמצע/סוף

## שיעור 13: בחירת המשך לסיפור

- יחידה: כתיבת סיפורים ב־Luau
- תוצר: סיפור עם מסלולים שונים
- מושג מרכזי: conditions in stories

### מה עושים ב־Studio
- מוסיפים בחירה
- בודקים תנאי
- מדפיסים המשך שונה

### Properties / מושגים
- Text

### קוד לדוגמה
```lua
local choice = "left"
if choice == "left" then
    print("You found a cave")
else
    print("You found a bridge")
end
```

### תרגול
- צרו שתי בחירות לסיפור
- כתבו המשך לכל בחירה
- הוסיפו סוף שונה

## שיעור 14: התחלת משחק המדורה

- יחידה: משחק המדורה
- תוצר: עיצוב חלקי משחק ופונקציית PickUp ראשונה
- מושג מרכזי: game rules, PickUp function

### מה עושים ב־Studio
- מסבירים חוקי משחק
- מעצבים עצים/חלקים לאיסוף
- מתחילים פונקציה לאיסוף

### Properties / מושגים
- Name
- Anchored

### קוד לדוגמה
```lua
local function pickUp()
    print("Picked up")
end
```

### תרגול
- צרו חלקים לאיסוף
- כתבו פונקציה בסיסית
- חברו אותה לאירוע מתאים

## שיעור 15: סיום הרמת מקל וזיהוי שחקן

- יחידה: משחק המדורה
- תוצר: איסוף שמוודא שמי שנגע הוא שחקן
- מושג מרכזי: humanoid, character detection

### מה עושים ב־Studio
- מקבלים את החלק שנגע
- מחפשים Humanoid
- מפעילים איסוף רק לשחקן

### Properties / מושגים
- Parent

### קוד לדוגמה
```lua
local humanoid = hit.Parent:FindFirstChild("Humanoid")
if humanoid then
    print("Player touched")
end
```

### תרגול
- בדקו האם לנוגע יש Humanoid
- מנעו איסוף מחפצים רגילים
- הדפיסו הודעה רק לשחקן

## שיעור 16: פונקציות גלובליות

- יחידה: משחק המדורה
- תוצר: פונקציה משותפת לכמה Scripts
- מושג מרכזי: global/shared functions

### מה עושים ב־Studio
- מזהים פעולה שחוזרת בכמה מקומות
- מעבירים אותה לפונקציה משותפת
- משתמשים בה מכמה Scripts

### Properties / מושגים
- Script organization

### קוד לדוגמה
```lua
-- דוגמה רעיונית: פונקציה משותפת לאיסוף
_G.pickUp = function()
    print("global pickup")
end
```

### תרגול
- זהו קוד שחוזר על עצמו
- הפכו אותו לפונקציה
- קראו לפונקציה מכמה מקומות

## שיעור 17: עבודה עם Instance

- יחידה: משחק המדורה
- תוצר: יצירת אובייקט חדש דרך קוד
- מושג מרכזי: Instance.new, Parent

### מה עושים ב־Studio
- יוצרים אובייקט דרך קוד
- נותנים לו Parent
- משנים לו תכונות

### Properties / מושגים
- Parent
- Name
- Position

### קוד לדוגמה
```lua
local part = Instance.new("Part")
part.Name = "Wood"
part.Parent = workspace
```

### תרגול
- צרו Part דרך קוד
- שנו לו שם וצבע
- מקמו אותו בעולם

## שיעור 18: טבלת ניקוד

- יחידה: משחק המדורה
- תוצר: שמירת ניקוד לשחקנים
- מושג מרכזי: tables, players, score

### מה עושים ב־Studio
- מבינים צורך בניקוד לכל שחקן
- יוצרים טבלה
- מעדכנים ערך בטבלה

### Properties / מושגים
- Value

### קוד לדוגמה
```lua
local scores = {}
scores["Player1"] = 0
scores["Player1"] += 1
```

### תרגול
- צרו טבלת scores
- הוסיפו שחקן
- עדכנו ניקוד אחרי איסוף

## שיעור 19: עדכון ערכי הטבלה ומאגר מידע

- יחידה: משחק המדורה
- תוצר: ניהול חפצים שנאספו
- מושג מרכזי: tables as data store

### מה עושים ב־Studio
- שומרים אילו חפצים נאספו
- מעדכנים טבלה
- קוראים ערכים מהטבלה

### Properties / מושגים
- Value

### קוד לדוגמה
```lua
local inventory = {}
table.insert(inventory, "Wood")
print(#inventory)
```

### תרגול
- צרו inventory
- הוסיפו אליו חפצים
- הדפיסו כמה נאסף

## שיעור 20: הדלקת המדורה

- יחידה: משחק המדורה
- תוצר: מדורה שמופעלת לאחר איסוף מספיק חפצים
- מושג מרכזי: state, conditions, visual feedback

### מה עושים ב־Studio
- בונים מדורה
- בודקים כמה עצים נאספו
- משנים תצוגה כשהתנאי מתקיים

### Properties / מושגים
- Transparency
- Color
- Material

### קוד לדוגמה
```lua
if woodCount >= 3 then
    fire.Transparency = 0
end
```

### תרגול
- צרו תנאי להדלקה
- שנו צבע/שקיפות של אש
- הציגו הודעה כשהמדורה דולקת

## שיעור 21: מיקומים רנדומליים וצירי X/Y/Z

- יחידה: משחק המדורה
- תוצר: חלקים שמופיעים במקומות אקראיים
- מושג מרכזי: random, Vector3, 3D coordinates

### מה עושים ב־Studio
- מסבירים X/Y/Z
- יוצרים מיקום אקראי
- ממקמים חלק במרחב

### Properties / מושגים
- Position

### קוד לדוגמה
```lua
local x = math.random(-20, 20)
local z = math.random(-20, 20)
part.Position = Vector3.new(x, 5, z)
```

### תרגול
- צרו מיקום אקראי
- הגבילו את אזור ההופעה
- בדקו שהחלק מופיע בגובה מתאים

## שיעור 22: ממשק גרפי למשחק

- יחידה: משחק המדורה
- תוצר: GUI שמציג כמה חפצים נאספו
- מושג מרכזי: ScreenGui, TextLabel, UI update

### מה עושים ב־Studio
- יוצרים ScreenGui
- מוסיפים TextLabel
- מעדכנים טקסט לפי ניקוד

### Properties / מושגים
- Text
- Size
- Position

### קוד לדוגמה
```lua
label.Text = "Wood: " .. woodCount
```

### תרגול
- צרו תווית ניקוד
- עדכנו אותה לאחר איסוף
- מקמו אותה בפינת המסך

## שיעור 23: סיום משחק המדורה

- יחידה: משחק המדורה
- תוצר: משחק מדורה שלם עם GUI וסיום
- מושג מרכזי: game end, UI script

### מה עושים ב־Studio
- מחברים איסוף, טבלה, מדורה ו־GUI
- מוסיפים מצב סיום
- מציגים הודעת ניצחון

### Properties / מושגים
- Text
- Visible

### קוד לדוגמה
```lua
if woodCount >= target then
    label.Text = "Fire is ready!"
end
```

### תרגול
- הגדירו יעד איסוף
- הציגו הודעת סיום
- בדקו את המשחק מתחילה ועד סוף

## שיעור 24: חזרה וסיכום פרויקט

- יחידה: סיכום
- תוצר: שיפור, בדיקה והצגת משחק
- מושג מרכזי: review, debugging, presentation

### מה עושים ב־Studio
- חוזרים על Studio ו־Properties
- חוזרים על variables/functions/events/tables
- מתקנים באגים
- מציגים משחק לחברים

### Properties / מושגים
- All learned properties

### קוד לדוגמה
```lua
-- בחרו קטע קוד אחד מהפרויקט והסבירו אותו במילים
```

### תרגול
- תקנו באג אחד במשחק
- שפרו עיצוב אחד
- הציגו לחבר מה הקוד שלכם עושה

