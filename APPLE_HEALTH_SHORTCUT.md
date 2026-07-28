# Lift Tracker → Apple Health: Shortcut Setup

This setup lets you push Lift Tracker workouts into Apple Health **and** pull heart rate data back from your Apple Watch.

## Step 1: Set Your Body Weight

Open Lift Tracker → **Settings** → enter your body weight in lbs. This improves calorie accuracy.

## Step 2: Export Your Workouts

1. Open Lift Tracker → **Settings** (gear icon)
2. Tap **Export for Apple Health (JSON)**
3. Save the `lift-tracker-health.json` file to **iCloud Drive** → `HealthImports` folder

## Step 3: Create the Push Shortcut (Workouts → Apple Health)

Open **Shortcuts** app → create new shortcut → add these actions:

### Actions (in order):

1. **Get File** — Path: `HealthImports/lift-tracker-health.json` — Toggle OFF "Error if not found"

2. **Get Dictionary from Input**

3. **Get Value for Key** — Key: `workouts` — from the dictionary

4. **Repeat with Each** — from the list of workouts

   Inside the repeat loop:

   a. **Get Dictionary from Input**

   b. **Get Value for Key** — Key: `name` → set variable `WorkoutName`

   c. **Get Value for Key** — Key: `startDate`

   d. **Adjust Date** — Add: `0 seconds` → set variable `WorkoutStart`

   e. **Get Value for Key** — Key: `endDate`

   f. **Adjust Date** — Add: `0 seconds` → set variable `WorkoutEnd`

   g. **Get Value for Key** — Key: `caloriesBurned`

   h. **Log Health Sample** — Type: **Active Energy Burned**
      - Value: the calories number
      - Unit: kilocalories
      - Start Date: `WorkoutStart`
      - End Date: `WorkoutEnd`

   i. **Get Value for Key** — Key: `durationSeconds`

   j. **Log Health Sample** — Type: **Workout**
      - Activity Type: **Traditional Strength Training**
      - Duration: the duration value (convert seconds → minutes)
      - Start Date: `WorkoutStart`
      - End Date: `WorkoutEnd`
      - Calories Burned: the calories value

   k. **End Repeat**

## Step 4: Create the Pull Shortcut (Apple Watch Heart Rate → Lift Tracker)

This shortcut pulls heart rate data from Apple Health and saves it as a JSON file for Lift Tracker to import.

### Key: Get Dense Data

Heart rate sample rate depends on your Apple Watch state:

| Watch State | Sample Rate | Samples in 45 min |
|---|---|---|
| **Workout app running** | Every **1–3 sec** | **900–2700** |
| Rest / normal wear | Every **5–15 min** | **3–9** |

**Always start a Strength Training workout on your Watch before lifting.** This is the single biggest factor for detailed heart rate tracking.

### Actions (in order):

1. **Date** — Current Date → set variable `Now`

2. **Adjust Date** — Subtract: `30 days` → set variable `StartDate`

3. **Find Health Samples** — Type: **Heart Rate**
   - Start: `StartDate`
   - End: `Now`
   - Sort: Date, Oldest First

4. **Repeat with Each** — from the health samples found

   Inside the repeat loop:

   a. **Get Dictionary from Input**

   b. **Get Value for Key** — Key: `value` (the BPM number)

   c. **Get Value for Key** — Key: `startDate`

   d. **Set Variable** — Name: `SampleDate`

   e. **Set Variable** — Name: `SampleBPM`

   f. **Dictionary** — with keys:
      - `date`: `SampleDate`
      - `bpm`: `SampleBPM`

   g. **Add to Variable** — Name: `HeartRateSamples` — Value: the dictionary

   h. **End Repeat**

5. **Dictionary** — with key:
   - `heartRateSamples`: `HeartRateSamples`

6. **Get File** — Path: `HealthImports/heart-rate-data.json` — Toggle OFF "Error if not found"

7. **Save File** — Path: `HealthImports/heart-rate-data.json` — Toggle ON "Overwrite if exists"

### If the shortcut is slow (large data):

If you have months of Watch workouts, the shortcut may take a while. Two options:

**Option A — Shorter range:** Change step 2 to `7 days` or `14 days` instead of `30 days`.

**Option B — Workout-only filter (advanced):**
Add this before step 3:
- **Find Health Samples** — Type: **Workout** → set variable `Workouts`
- **Repeat with Each** workouts → get start/end dates → use those as the time window for Find Heart Samples instead of a fixed range. This pulls HR only during actual workout sessions.

## Step 5: Import Heart Rate into Lift Tracker

1. Run the Pull Shortcut (Step 4) — it saves `heart-rate-data.json` to iCloud Drive
2. Open Lift Tracker → **Settings** → **Import Heart Rate Data (JSON)**
3. Select the `heart-rate-data.json` file from iCloud Drive

Your workouts will now show:
- **♥ AVG / MAX / MIN BPM** in workout detail
- **♥ avg bpm** badge in history list
- **Mini heart rate chart** in workout detail view

## Calorie Estimation

The export uses MET (Metabolic Equivalent of Task) values per muscle group:

| Muscle Group | MET Value |
|---|---|
| Legs, Full Body | 6.0 |
| Chest, Back | 5.0 |
| Shoulders, Traps | 4.5 |
| Arms, Core | 4.0 |

Formula: `Calories = MET × body_weight_kg × duration_hours`

Heavy sets (>100 lbs) get a 1.15× multiplier; light sets (<50 lbs) get 0.85×.

Set your body weight in Settings for accurate results.

## Tips

- **Start a Workout on your Watch**: This is the #1 thing you can do for dense heart rate data. Open Workout app → Strength Training → start it when you begin lifting.
- **Re-run safely**: Re-importing the same heart rate JSON deduplicates by timestamp.
- **Calorie tuning**: Adjust MET values in the `MET_VALUES` object in `index.html` if estimates feel off.
- **Automate**: Create a Shortcuts Automation triggered by "When I arrive at gym" to auto-run both shortcuts.
