# Lift Tracker → Apple Health: Shortcut Setup

This one-time setup lets you push your Lift Tracker workouts into Apple Health / Fitness.

## Step 1: Export Your Workouts

1. Open Lift Tracker → **Settings** (gear icon)
2. Tap **Export for Apple Health (JSON)**
3. Save the `lift-tracker-health.json` file to **iCloud Drive** (e.g., in a folder called `HealthImports`)

## Step 2: Create the Apple Shortcut

Open the **Shortcuts** app on your iPhone and create a new shortcut with these steps:

### Actions (in order):

1. **Get File** — Path: `HealthImports/lift-tracker-health.json` — Toggle OFF "Error if not found"

2. **Get Dictionary from Input**

3. **Get Value for Key** — Key: `workouts` — from the dictionary

4. **Repeat with Each** — from the list of workouts

   Inside the repeat loop:

   a. **Get Dictionary from Input**

   b. **Get Value for Key** — Key: `name` — from the dictionary → set variable `WorkoutName`

   c. **Get Value for Key** — Key: `startDate` — from the dictionary

   d. **Adjust Date** — Add: `0 seconds` (this formats it as a Date)

   e. **Set Variable** — Name: `WorkoutStart`

   f. **Get Value for Key** — Key: `endDate` — from the dictionary

   g. **Adjust Date** — Add: `0 seconds`

   h. **Set Variable** — Name: `WorkoutEnd`

   i. **Get Value for Key** — Key: `caloriesBurned` — from the dictionary

   j. **Log Health Sample** — Type: **Active Energy Burned**
      - Value: the calories number
      - Unit: kilocalories
      - Start Date: `WorkoutStart`
      - End Date: `WorkoutEnd`

   k. **Get Value for Key** — Key: `durationSeconds` — from the dictionary

   l. **Log Health Sample** — Type: **Workout**
      - Activity Type: **Traditional Strength Training**
      - Duration: the duration value (convert from seconds → minutes if needed)
      - Start Date: `WorkoutStart`
      - End Date: `WorkoutEnd`
      - Calories Burned: the calories value

   m. **End Repeat**

### Simpler Alternative (if the above is complex):

If building the full shortcut is tricky, here's a **minimal version** that logs each workout as a strength training session:

1. **Get File** → `HealthImports/lift-tracker-health.json`
2. **Get Dictionary from Input**
3. **Get Value for Key** → `workouts`
4. **Repeat with Each**
5. Inside loop: **Log Health Sample** → Type: **Workout**
   - Activity Type: **Traditional Strength Training**
   - Use "Repeat Item" values for start/end dates and duration
6. **End Repeat**

## Step 3: Run It

After exporting from Lift Tracker:
1. Open Shortcuts
2. Tap the "Lift Tracker Import" shortcut
3. It reads the JSON and logs each workout to Apple Health

Your workouts will appear in:
- **Apple Health** → Browse → Activity → Workouts
- **Fitness** app → History tab

## Tips

- **Re-run safely**: The Shortcut only adds new entries. If you re-export with the same workouts, you'll get duplicates — so delete old entries first or export only new workouts.
- **Check estimated calories**: Lift Tracker estimates ~0.06 kcal per lb of volume lifted. Adjust the formula in `exportForAppleHealth()` if the numbers feel off.
- **Automate**: In Shortcuts, go to Automations → create a "When I arrive at gym" trigger that runs this shortcut automatically.

## Calorie Estimation

The JSON export estimates calories using:
```
caloriesBurned = totalVolume × 0.06
```
where `totalVolume = sum(reps × weight)` across all completed sets.

For a typical 45-min strength session with ~15,000 lbs total volume, this gives ~900 kcal, which is in the ballpark of what Apple Watch estimates for similar sessions.
