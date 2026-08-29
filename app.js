// ============================================================
// DATA
// ============================================================
const EXERCISE_CATALOG = [
  // Chest
  {id:'barbell-bench-press',name:'Barbell Bench Press',muscle:'Chest',equipment:'Barbell',tips:['Lie flat on bench, grip bar slightly wider than shoulder width','Lower bar to mid-chest with control, elbows at ~45°','Press up and slightly back toward face','Keep feet flat and shoulder blades retracted'],proTip:'Retract your scapula before each rep for a stable base and more chest activation.'},
  {id:'incline-bench-press',name:'Incline Bench Press',muscle:'Chest',equipment:'Barbell',tips:['Set bench to 30-45° incline','Grip bar slightly wider than shoulders','Lower to upper chest, elbows at 45°','Press up to lockout'],proTip:'Steeper inclines shift more work to front delts — 30° is the sweet spot for upper chest.'},
  {id:'dumbbell-bench-press',name:'Dumbbell Bench Press',muscle:'Chest',equipment:'Dumbbell',tips:['Lie flat, hold dumbbells at chest level','Press up while bringing dumbbells slightly together','Lower with control, feeling the stretch','Keep a slight arch in lower back'],proTip:'Let your palms face each other at the top for better chest contraction.'},
  {id:'dumbbell-fly',name:'Dumbbell Fly',muscle:'Chest',equipment:'Dumbbell',tips:['Lie flat with dumbbells above chest, slight elbow bend','Lower dumbbells in a wide arc until you feel a stretch','Squeeze chest to bring dumbbells back together','Maintain slight elbow bend throughout'],proTip:'Think about hugging a tree — not pressing — to keep the movement in your chest.'},
  {id:'cable-fly',name:'Cable Fly',muscle:'Chest',equipment:'Cable',tips:['Stand between cable stations, grab handles','Step forward for tension, slight forward lean','Bring hands together in front of chest in an arc','Squeeze at the bottom, control the return'],proTip:'Changing the cable height (high, mid, low) targets different chest fibers.'},
  {id:'push-up',name:'Push-up',muscle:'Chest',equipment:'Bodyweight',tips:['Hands slightly wider than shoulders, body in a plank','Lower chest to floor, elbows at 45°','Push back up fully','Keep core tight and body straight throughout'],proTip:'Elevate your feet on a bench to increase the load on your upper chest.'},
  // Back
  {id:'deadlift',name:'Deadlift',muscle:'Back',equipment:'Barbell',tips:['Stand with feet hip-width, bar over mid-foot','Hinge at hips, grip bar just outside knees','Drive through heels, keep bar close to body','Lock out hips at top, shoulders back'],proTip:'Think "push the floor away" instead of pulling the bar up — it activates more posterior chain.'},
  {id:'barbell-row',name:'Barbell Row',muscle:'Back',equipment:'Barbell',tips:['Hinge at hips, slight knee bend, grip bar','Pull bar to lower chest/upper abdomen','Squeeze shoulder blades at the top','Control the descent, avoid momentum'],proTip:'Pull to your belly button to maximize lat activation over upper back.'},
  {id:'pull-up',name:'Pull-up',muscle:'Back',equipment:'Bodyweight',tips:['Grip bar shoulder-width, palms away','Hang fully extended, engage lats first','Pull chin over bar, drive elbows down','Lower with control, full dead hang'],proTip:'Initiate each rep by depressing your scapulae — "shrug down" before pulling.'},
  {id:'lat-pulldown',name:'Lat Pulldown',muscle:'Back',equipment:'Cable',tips:['Sit at lat pulldown, secure knees under pad','Grip bar wider than shoulders, lean back slightly','Pull bar to upper chest, driving elbows down','Control the ascent, full stretch at top'],proTip:'Imagine putting your elbows in your back pockets to maximize lat engagement.'},
  {id:'seated-cable-row',name:'Seated Cable Row',muscle:'Back',equipment:'Cable',tips:['Sit upright, feet on foot plates, grip handle','Pull handle to lower chest, squeeze shoulder blades','Keep torso upright, avoid excessive leaning','Extend arms fully for stretch between reps'],proTip:'Pull with your elbows, not your hands — it keeps the load on your back.'},
  {id:'single-arm-dumbbell-row',name:'Single-Arm Dumbbell Row',muscle:'Back',equipment:'Dumbbell',tips:['Place one hand and knee on bench for support','Hold dumbbell with other hand, arm hanging','Pull dumbbell to hip, elbow close to body','Lower with control, full stretch at bottom'],proTip:'Think about starting the pull with your elbow to avoid bicep takeover.'},
  // Shoulders
  {id:'overhead-press',name:'Overhead Press',muscle:'Shoulders',equipment:'Barbell',tips:['Stand with feet shoulder-width, bar at collarbone','Press bar overhead, move head slightly forward','Lock out arms fully, bar over mid-foot','Lower with control back to starting position'],proTip:'Squeeze your glutes and brace your core — it turns your body into a stable platform.'},
  {id:'dumbbell-shoulder-press',name:'Dumbbell Shoulder Press',muscle:'Shoulders',equipment:'Dumbbell',tips:['Sit or stand with dumbbells at shoulder height','Press up and slightly inward','Lower to ear level or slightly below','Keep core braced throughout'],proTip:'Press in a slight arc (dumbbells meet slightly at top) for better activation.'},
  {id:'lateral-raise',name:'Lateral Raise',muscle:'Shoulders',equipment:'Dumbbell',tips:['Stand with dumbbells at sides, slight bend in elbows','Raise arms out to sides until parallel to floor','Lead with elbows, not hands','Lower slowly, maintaining slight elbow bend'],proTip:'Tilt slightly forward and lead with your pinky to better isolate the medial delt.'},
  {id:'face-pulls',name:'Face Pulls',muscle:'Shoulders',equipment:'Cable',tips:['Set cable at face height with rope attachment','Pull rope toward face, separating ends','Squeeze rear delts and external rotators','Hold peak contraction for 1-2 seconds'],proTip:'Keep your elbows high — they should be at or above shoulder level throughout.'},
  {id:'front-raise',name:'Front Raise',muscle:'Shoulders',equipment:'Dumbbell',tips:['Stand with dumbbells in front of thighs','Raise one or both dumbbells to shoulder height','Lower with control, alternate or together','Keep slight bend in elbows'],proTip:'Use an alternating pattern with a slight pause at the top to minimize momentum.'},
  // Biceps
  {id:'barbell-bicep-curl',name:'Barbell Bicep Curl',muscle:'Biceps',equipment:'Barbell',tips:['Stand with feet shoulder-width, grip bar underhand','Curl bar up by flexing elbows, keep upper arms still','Squeeze biceps at the top','Lower with full control, full extension at bottom'],proTip:'Keep your elbows pinned to your sides — any forward drift shifts load off the biceps.'},
  {id:'hammer-curl',name:'Hammer Curl',muscle:'Biceps',equipment:'Dumbbell',tips:['Stand with dumbbells at sides, palms facing each other','Curl dumbbells up maintaining neutral grip','Squeeze at the top, lower with control','Avoid swinging your body'],proTip:'Hammer curls build the brachialis — a muscle that pushes your bicep up for a bigger peak.'},
  // Triceps
  {id:'tricep-pushdown',name:'Tricep Pushdown',muscle:'Triceps',equipment:'Cable',tips:['Stand at cable machine, grip bar or rope','Keep elbows pinned at your sides','Push down to full extension','Squeeze triceps at bottom, control the return'],proTip:'Use a rope and spread at the bottom for a stronger tricep contraction.'},
  {id:'skull-crusher',name:'Skull Crusher',muscle:'Triceps',equipment:'Barbell',tips:['Lie on bench, hold bar above chest with straight arms','Bend elbows to lower bar toward forehead','Keep upper arms vertical, only forearms move','Extend back to starting position'],proTip:'Lower the bar slightly behind your head to increase the stretch on the long head.'},
  // Legs
  {id:'barbell-back-squat',name:'Barbell Back Squat',muscle:'Legs',equipment:'Barbell',tips:['Bar across upper back, feet shoulder-width or wider','Brace core, push hips back and descend','Go to at least parallel depth','Drive through full foot to stand'],proTip:'Take a deep breath and brace like you are about to be punched — it protects your spine.'},
  {id:'front-squat',name:'Front Squat',muscle:'Legs',equipment:'Barbell',tips:['Bar in front rack position, elbows high','Descend keeping torso as upright as possible','Go to depth while maintaining elbow height','Drive up leading with elbows'],proTip:'Cross-arm grip works if you lack wrist mobility — but front rack is worth learning.'},
  {id:'leg-press',name:'Leg Press',muscle:'Legs',equipment:'Machine',tips:['Sit in leg press, feet shoulder-width on platform','Lower platform toward chest, knees track over toes','Press through full foot, do not lock knees','Control the descent'],proTip:'Wider stance hits more glutes and adductors; narrow stance targets quads more.'},
  {id:'leg-curl',name:'Leg Curl',muscle:'Legs',equipment:'Machine',tips:['Lie face down or sit in leg curl machine','Position pad behind ankles','Curl legs toward glutes, squeeze hamstrings','Lower with full control'],proTip:'Point your toes during the curl to increase hamstring activation.'},
  {id:'leg-extension',name:'Leg Extension',muscle:'Legs',equipment:'Machine',tips:['Sit in leg extension, pad on shins','Extend legs to full lockout','Squeeze quads at the top for 1-2 seconds','Lower slowly, do not let weight slam'],proTip:'A slight pause at full extension dramatically increases quad activation.'},
  {id:'walking-lunges',name:'Walking Lunges',muscle:'Legs',equipment:'Dumbbell',tips:['Hold dumbbells at sides, take a large step forward','Lower back knee toward floor','Drive through front heel to step forward','Alternate legs, keeping torso upright'],proTip:'Longer steps target glutes more, shorter steps hit quads harder.'},
  {id:'calf-raise',name:'Calf Raise',muscle:'Legs',equipment:'Machine',tips:['Stand on calf raise machine, balls of feet on edge','Lower heels for full stretch at bottom','Press up to full contraction on toes','Hold peak contraction for 1-2 seconds'],proTip:'The stretch at the bottom is the most important part — don\'t cut it short.'},
  // Glutes
  {id:'hip-thrust',name:'Hip Thrust',muscle:'Glutes',equipment:'Barbell',tips:['Upper back on bench, feet flat on floor','Bar across hip crease with pad','Drive hips up until body forms a straight line','Squeeze glutes hard at the top, lower with control'],proTip:'Tuck your chin and look forward — it prevents hyperextension and increases glute activation.'},
  {id:'romanian-deadlift',name:'Romanian Deadlift',muscle:'Glutes',equipment:'Barbell',tips:['Stand with feet hip-width, bar at hip level','Hinge at hips, push them back while keeping legs slightly bent','Lower bar along legs until you feel a deep hamstring stretch','Drive hips forward to return to standing'],proTip:'Imagine pushing your butt into a wall behind you — the hip hinge is everything.'},
  // Core
  {id:'plank',name:'Plank',muscle:'Core',equipment:'Bodyweight',tips:['Forearms on ground, body in a straight line','Engage core, squeeze glutes','Keep hips level, do not sag or pike','Breathe steadily throughout'],proTip:'Actively push your forearms into the floor — it engages your core much more than just holding on.'},
  {id:'cable-crunch',name:'Cable Crunch',muscle:'Core',equipment:'Cable',tips:['Kneel facing cable, rope behind head','Crunch down bringing elbows toward knees','Focus on contracting abs, not pulling with arms','Return slowly to starting position'],proTip:'Think about bringing your rib cage toward your pelvis — that is the real ab contraction.'},
  // Cardio
  {id:'rowing-machine',name:'Rowing Machine',muscle:'Cardio',equipment:'Machine',tips:['Strap feet in, grab handle with straight arms','Push with legs first, then lean back, then pull arms','Drive through heels during the leg press phase','Reverse: arms, lean, legs for the return'],proTip:'The drive should be 60% legs, 20% core, 20% arms — most people get this backwards.'},
  {id:'stationary-bike',name:'Stationary Bike',muscle:'Cardio',equipment:'Machine',tips:['Adjust seat so knee has slight bend at bottom of pedal stroke','Maintain steady cadence, keep upper body relaxed','Vary resistance or follow interval programs','Focus on smooth, circular pedal strokes'],proTip:'High cadence (80-100 RPM) at lower resistance builds endurance; low cadence builds power.'},
];

const SET_TYPES = [
  {id:'working',name:'Working Set',color:'var(--green)'},
  {id:'warmup',name:'Warm-up',color:'var(--orange)'},
  {id:'dropset',name:'Drop Set',color:'var(--red)'},
  {id:'superset',name:'Super Set',color:'var(--blue)'},
  {id:'amrap',name:'AMRAP',color:'var(--purple)'},
  {id:'failure',name:'Failure',color:'var(--red)'},
  {id:'giant',name:'Giant Set',color:'var(--orange)'},
  {id:'restpause',name:'Rest Pause',color:'var(--blue)'},
  {id:'mechdrop',name:'Mech. Drop',color:'var(--purple)'},
];
const SET_TYPE_IDS = new Set(SET_TYPES.map(t => t.id));

const MUSCLE_GROUPS = [...new Set(EXERCISE_CATALOG.map(e => e.muscle))];
const MUSCLE_COLORS = {Chest:'var(--blue)',Back:'var(--green)',Shoulders:'var(--purple)',Biceps:'var(--orange)',Triceps:'var(--red)',Legs:'var(--green2)',Glutes:'var(--purple)',Core:'var(--orange)',Cardio:'var(--red)'};
const MUSCLE_EMOJIS = {Chest:'💪',Back:'🔙',Shoulders:'🏋️',Biceps:'💪',Triceps:'💪',Legs:'🦵',Glutes:'🍑',Core:'🧱',Cardio:'❤️'};

const MEASUREMENT_FIELDS = [
  {id:'weight',name:'Weight',unit:'lbs'},
  {id:'bodyFat',name:'Body Fat',unit:'%'},
  {id:'neck',name:'Neck',unit:'in'},
  {id:'chest',name:'Chest',unit:'in'},
  {id:'waist',name:'Waist',unit:'in'},
  {id:'hips',name:'Hips',unit:'in'},
  {id:'biceps',name:'Biceps',unit:'in'},
  {id:'forearms',name:'Forearms',unit:'in'},
  {id:'thighs',name:'Thighs',unit:'in'},
  {id:'calves',name:'Calves',unit:'in'},
];

const SPLIT_TYPES = [
  {id:'ppl',name:'Push/Pull/Legs',desc:'Classic 6-day split',days:6},
  {id:'upper-lower',name:'Upper/Lower',desc:'4-day split',days:4},
  {id:'full-body',name:'Full Body',desc:'3-day total body',days:3},
  {id:'bro',name:'Bro Split',desc:'5-day muscle group split',days:5},
  {id:'custom',name:'Custom',desc:'Design your own',days:3},
];

const EQUIPMENT_LIST = ['Barbell','Dumbbell','Cable','Machine','Bodyweight'];

// 214-exercise autocomplete database: [name, muscle, equipment]
const EXERCISE_DB = [
// Chest
['Bench Press','Chest','Barbell'],['Incline Bench Press','Chest','Barbell'],
['Decline Bench Press','Chest','Barbell'],['Push-Up','Chest','Bodyweight'],
['Weighted Dip','Chest','Bodyweight'],['Machine Chest Press','Chest','Machine'],
['Cable Chest Press','Chest','Cable'],['Cable Chest Fly','Chest','Cable'],
['Dumbbell Chest Fly','Chest','Dumbbell'],['Pec Deck Fly','Chest','Machine'],
['Incline Cable Fly','Chest','Cable'],['Low-to-High Cable Fly','Chest','Cable'],
['High-to-Low Cable Fly','Chest','Cable'],['Decline Push-Up','Chest','Bodyweight'],
['Archer Push-Up','Chest','Bodyweight'],['Diamond Push-Up','Chest','Bodyweight'],
['Wide Push-Up','Chest','Bodyweight'],['Landmine Press','Chest','Barbell'],
['Plate Press','Chest','Barbell'],['Guillotine Press','Chest','Barbell'],
['Pullover','Chest','Dumbbell'],['Barbell Bench Press','Chest','Barbell'],
['Incline Barbell Bench Press','Chest','Barbell'],['Decline Barbell Bench Press','Chest','Barbell'],
['Floor Press','Chest','Barbell'],['Spoto Press','Chest','Barbell'],
['Pin Press','Chest','Barbell'],['Dumbbell Bench Press','Chest','Dumbbell'],
['Incline Dumbbell Press','Chest','Dumbbell'],['Decline Dumbbell Press','Chest','Dumbbell'],
['Dumbbell Squeeze Press','Chest','Dumbbell'],['Single-Arm Dumbbell Press','Chest','Dumbbell'],
['Hex Press','Chest','Dumbbell'],['Svend Press','Chest','Dumbbell'],
['Cable Crossover','Chest','Cable'],['Low Cable Fly','Chest','Cable'],
['High Cable Fly','Chest','Cable'],['Smith Machine Bench Press','Chest','Machine'],
// Back
['Lat Pulldown','Back','Machine'],['Pull-Up','Back','Bodyweight'],
['Chin-Up','Back','Bodyweight'],['Seated Cable Row','Back','Cable'],
['Chest-Supported Row','Back','Dumbbell'],['One-Arm Dumbbell Row','Back','Dumbbell'],
['T-Bar Row','Back','Barbell'],['Barbell Bent-Over Row','Back','Barbell'],
['Straight-Arm Pulldown','Back','Cable'],['Back Extension','Back','Machine'],
['Rack Pull','Back','Barbell'],['Kroc Row','Back','Dumbbell'],
['Seal Row','Back','Barbell'],['Helms Row','Back','Dumbbell'],
['Meadows Row','Back','Barbell'],['Barbell Row','Back','Barbell'],
['Pendlay Row','Back','Barbell'],['Deadlift','Back','Barbell'],
['Chest-Supported T-Bar Row','Back','Machine'],['Yates Row','Back','Barbell'],
['Cable Pullover','Back','Cable'],['Machine Row','Back','Machine'],
['Wide-Grip Lat Pulldown','Back','Machine'],['Close-Grip Lat Pulldown','Back','Machine'],
['Inverted Row','Back','Bodyweight'],['Superman','Back','Bodyweight'],
// Shoulders
['Face Pull','Shoulders','Cable'],['Reverse Fly','Shoulders','Dumbbell'],
['Lateral Raise','Shoulders','Dumbbell'],['Front Raise','Shoulders','Dumbbell'],
['Overhead Press','Shoulders','Barbell'],['Seated Shoulder Press Machine','Shoulders','Machine'],
['Arnold Press','Shoulders','Dumbbell'],['Upright Row','Shoulders','Barbell'],
['Cable Lateral Raise','Shoulders','Cable'],['Cable Rear Delt Fly','Shoulders','Cable'],
['Push Press','Shoulders','Barbell'],['Military Press','Shoulders','Barbell'],
['Dumbbell Shoulder Press','Shoulders','Dumbbell'],['Seated Dumbbell Press','Shoulders','Dumbbell'],
['Rear Delt Fly','Shoulders','Dumbbell'],['Machine Shoulder Press','Shoulders','Machine'],
['Handstand Push-Up','Shoulders','Bodyweight'],['Pike Push-Up','Shoulders','Bodyweight'],
['Z Press','Shoulders','Barbell'],['Cuban Press','Shoulders','Dumbbell'],
// Arms
['Close-Grip Bench Press','Arms','Barbell'],['Skull Crusher','Arms','Barbell'],
['Cable Triceps Pushdown','Arms','Cable'],['Overhead Cable Triceps Extension','Arms','Cable'],
['Cable Rope Overhead Extension','Arms','Cable'],['Cable Biceps Curl','Arms','Cable'],
['Incline Dumbbell Curl','Arms','Dumbbell'],['Hammer Curl','Arms','Dumbbell'],
['Preacher Curl','Arms','Barbell'],['Farmer Carry','Arms','Dumbbell'],
['Barbell Curl','Arms','Barbell'],['EZ-Bar Curl','Arms','Barbell'],
['Incline Hammer Curl','Arms','Dumbbell'],['Concentration Curl','Arms','Dumbbell'],
['Cable Hammer Curl','Arms','Cable'],['Bayesian Curl','Arms','Cable'],
['Zottman Curl','Arms','Dumbbell'],['Reverse Curl','Arms','Barbell'],
['Dumbbell Kickback','Arms','Dumbbell'],['Tricep Dip','Arms','Bodyweight'],
['Bench Dip','Arms','Bodyweight'],['Rolling Tricep Extension','Arms','Dumbbell'],
['French Press','Arms','Barbell'],['Wrist Curl','Arms','Barbell'],
['Reverse Wrist Curl','Arms','Barbell'],['Wrist Roller','Arms','Dumbbell'],
['Plate Pinch','Arms','Dumbbell'],['Towel Hang','Arms','Bodyweight'],
['Dead Hang','Arms','Bodyweight'],['Hand Gripper','Arms','Bodyweight'],
// Legs
['Barbell Back Squat','Legs','Barbell'],['Front Squat','Legs','Barbell'],
['Goblet Squat','Legs','Dumbbell'],['Romanian Deadlift','Legs','Barbell'],
['Conventional Deadlift','Legs','Barbell'],['Sumo Deadlift','Legs','Barbell'],
['Bulgarian Split Squat','Legs','Dumbbell'],['Walking Lunge','Legs','Dumbbell'],
['Reverse Lunge','Legs','Dumbbell'],['Step-Up','Legs','Dumbbell'],
['Leg Press','Legs','Machine'],['Hack Squat','Legs','Machine'],
['Leg Extension','Legs','Machine'],['Seated Leg Curl','Legs','Machine'],
['Lying Leg Curl','Legs','Machine'],['Hip Thrust','Legs','Barbell'],
['Glute Bridge','Legs','Bodyweight'],['Cable Pull-Through','Legs','Cable'],
['Cable Romanian Deadlift','Legs','Cable'],['Cable Squat','Legs','Cable'],
['Cable Reverse Lunge','Legs','Cable'],['Cable Kickback','Legs','Cable'],
['Cable Hip Abduction','Legs','Cable'],['Cable Hip Adduction','Legs','Cable'],
['Cable Calf Raise','Legs','Cable'],['Standing Calf Raise','Legs','Machine'],
['Seated Calf Raise','Legs','Machine'],['Good Morning','Legs','Barbell'],
['Glute-Ham Raise','Legs','Bodyweight'],['Nordic Curl','Legs','Bodyweight'],
['Overhead Squat','Legs','Barbell'],['Box Squat','Legs','Barbell'],
['Pause Squat','Legs','Barbell'],['Belt Squat','Legs','Machine'],
['Pendulum Squat','Legs','Machine'],['V-Squat','Legs','Machine'],
['Barbell Lunge','Legs','Barbell'],['Curtsy Lunge','Legs','Dumbbell'],
['Lateral Lunge','Legs','Bodyweight'],['Sissy Squat','Legs','Bodyweight'],
['Pistol Squat','Legs','Bodyweight'],['Skater Squat','Legs','Bodyweight'],
['Cossack Squat','Legs','Bodyweight'],['Single-Leg Romanian Deadlift','Legs','Dumbbell'],
['Stiff-Leg Deadlift','Legs','Barbell'],['Glute Kickback','Legs','Machine'],
['Fire Hydrant','Legs','Bodyweight'],['Clamshell','Legs','Bodyweight'],
['Wall Sit','Legs','Bodyweight'],['Single-Leg Calf Raise','Legs','Bodyweight'],
['Donkey Calf Raise','Legs','Bodyweight'],['Calf Press','Legs','Machine'],
['Leg Press Calf Raise','Legs','Machine'],
// Core
['Pallof Press','Core','Cable'],['Wood Chop','Core','Cable'],
['Russian Twist','Core','Bodyweight'],['Hanging Leg Raise','Core','Bodyweight'],
['Cable Crunch','Core','Cable'],['Plank','Core','Bodyweight'],
['Ab Wheel Rollout','Core','Bodyweight'],['Side Plank','Core','Bodyweight'],
['Crunch','Core','Bodyweight'],['Bicycle Crunch','Core','Bodyweight'],
['Reverse Crunch','Core','Bodyweight'],['Hanging Knee Raise','Core','Bodyweight'],
['Hanging Windshield Wiper','Core','Bodyweight'],['Cable Woodchop','Core','Cable'],
['Ab Rollout','Core','Machine'],['Dead Bug','Core','Bodyweight'],
['Bird Dog','Core','Bodyweight'],['Mountain Climber','Core','Bodyweight'],
['Flutter Kick','Core','Bodyweight'],['Farmer Walk','Core','Dumbbell'],
['Hollow Body Hold','Core','Bodyweight'],['Dragon Flag','Core','Bodyweight'],
['Suitcase Carry','Core','Dumbbell'],
// Traps
['Shrug','Traps','Dumbbell'],['Barbell Shrug','Traps','Barbell'],
['Power Shrug','Traps','Barbell'],['Behind-the-Back Barbell Shrug','Traps','Barbell'],
['Machine Shrug','Traps','Machine'],['Cable Shrug','Traps','Cable'],
// Full Body
['Clean','Full Body','Barbell'],['Power Clean','Full Body','Barbell'],
['Hang Clean','Full Body','Barbell'],['Clean and Jerk','Full Body','Barbell'],
['Snatch','Full Body','Barbell'],['Thruster','Full Body','Barbell'],
['Burpee','Full Body','Bodyweight'],['Turkish Get-Up','Full Body','Dumbbell'],
['Kettlebell Swing','Full Body','Dumbbell'],['Man Maker','Full Body','Dumbbell'],
['Devil Press','Full Body','Dumbbell'],['Box Jump','Full Body','Bodyweight'],
['Medicine Ball Slam','Full Body','Dumbbell'],['Battle Rope','Full Body','Machine'],
['Rowing Machine','Full Body','Machine'],['Assault Bike','Full Body','Machine'],
['Muscle-Up','Full Body','Bodyweight'],['Bear Crawl','Full Body','Bodyweight'],
];

// Combine built-in catalog with user-created custom exercises
function getAllExercises() {
  // Merge EXERCISE_CATALOG (has tips/proTips) with EXERCISE_DB (214 exercises, no tips)
  // EXERCISE_CATALOG wins for exercises it covers; EXERCISE_DB fills in the rest
  const catalogMap = {};
  EXERCISE_CATALOG.forEach(e => { catalogMap[e.name.toLowerCase()] = e; });
  const dbExercises = EXERCISE_DB.map(([name, muscle, equipment]) => {
    const key = name.toLowerCase();
    if (catalogMap[key]) return catalogMap[key]; // prefer catalog (has tips)
    return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, muscle, equipment, tips: [], proTip: '' };
  });
  // Dedupe by name (catalog first, then DB extras, then custom)
  const seen = new Set();
  const merged = [];
  [...dbExercises, ...(state.customExercises || [])].forEach(e => {
    const key = e.name.toLowerCase();
    if (!seen.has(key)) { seen.add(key); merged.push(e); }
  });
  return merged;
}

// ============================================================
// STATE
// ============================================================
const SCHEMA_VERSION = 2;

function defaultState() {
  return {
    templates: [],
    workouts: [],
    measurements: [],
    activeWorkout: null,
    customExercises: [],
    settings: {},
    profile: null,
    heartRateData: [],
    _schemaVersion: SCHEMA_VERSION
  };
}

let state = defaultState();

function loadState() {
  try {
    const saved = localStorage.getItem('liftTracker');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object') throw new Error('Corrupt state');
      state = {...state, ...parsed};
    }
  } catch(e) {
    console.error('Failed to load state', e);
    // Preserve the corrupt blob for recovery instead of silently losing it.
    const raw = localStorage.getItem('liftTracker');
    if (raw) {
      try { localStorage.setItem('liftTracker_corrupt_' + Date.now(), raw); } catch(_) {}
    }
    state = defaultState();
    try { localStorage.removeItem('liftTracker'); } catch(_) {}
  }
  migrateState();
}

function migrateState() {
  const current = state._schemaVersion || 1;
  if (current === SCHEMA_VERSION) return;
  if (current < 2) {
    // v1 → v2: structure is unchanged. Sync now uses per-record timestamps
    // stamped during cloud sync, so no data reshape is required here.
    state.workouts = state.workouts || [];
    state.templates = state.templates || [];
    state.measurements = state.measurements || [];
    state.customExercises = state.customExercises || [];
    state.heartRateData = state.heartRateData || [];
    state.settings = state.settings || {};
    state._schemaVersion = SCHEMA_VERSION;
  }
  try { localStorage.setItem('liftTracker', JSON.stringify(state)); } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('liftTracker', JSON.stringify(state));
  } catch(e) { console.error('Failed to save state', e); }
  // Push to cloud if logged in
  if (currentUser && db) {
    syncToFirestore(state);
  }
}

// ============================================================
// FIREBASE / CLOUD SYNC
// ============================================================
//
// Google sign-in branches on platform because no single Firebase method
// works everywhere (each case below was a real bug found on that platform):
//   - iOS Home Screen PWA (standalone): no popups, and Firebase's own
//     signInWithRedirect hops through firebaseapp.com — iOS treats that as
//     leaving the PWA, and Safari/the PWA have isolated storage since
//     iOS 16.4, so the result never makes it back in. Fixed by driving
//     Google's OIDC implicit flow directly (startIosGoogleOidc) back to
//     auth.html on THIS origin, which hands the id_token to
//     completeGoogleIdTokenSignIn via signInWithCredential.
//   - Everything else (desktop, mobile Safari/Chrome in a normal tab):
//     signInWithPopup, falling back to signInWithRedirect only if the
//     popup is blocked.
// installFirebaseSessionStorageMirror exists because Firebase's redirect
// flow (used both as the desktop popup-blocked fallback and internally by
// getRedirectResult) stores its pending-auth key in sessionStorage, which
// iOS kills when a Home Screen app is backgrounded for the OAuth hop.
let firebaseApp = null;
let db = null;
let auth = null;
let googleProvider = null;
let currentUser = null;
let syncInProgress = false;
let lastSyncTime = 0;

// Load config from localStorage (separate from state document)
function loadFirebaseConfig() {
  try {
    const raw = localStorage.getItem('liftTrackerFirebase');
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAw2BlvU4QhIC-TaH-hP-ELHOpjhoEe0UE",
  authDomain: "lift-tracker-fade7.firebaseapp.com",
  projectId: "lift-tracker-fade7",
  storageBucket: "lift-tracker-fade7.firebasestorage.app",
  messagingSenderId: "1045140412331",
  appId: "1:1045140412331:web:9668f12422e5d6a48d64ee"
};
const GOOGLE_OAUTH_CLIENT_ID = "1045140412331-30reu9jtrqcvs3pv63e49f6qjuie83cs.apps.googleusercontent.com";
const FBSS_PREFIX = "fbss:";

function getFirebaseConfig() {
  return loadFirebaseConfig() || (state.settings && state.settings.firebaseConfig) || DEFAULT_FIREBASE_CONFIG;
}

function isIosDevice() {
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalonePwa() {
  return window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
}

function isIosStandalonePwa() {
  return isIosDevice() && isStandalonePwa();
}

function googleOidcRedirectUri() {
  const u = new URL(window.location.href);
  let dir = u.pathname.replace(/\/index\.html$/i, "/");
  if (!dir.endsWith("/")) dir += "/";
  return u.origin + dir + "auth.html";
}

// iOS Home Screen apps kill sessionStorage when they leave for Google.
// Firebase's redirect flow stores its pending key there, so we mirror it.
function restoreFirebaseSessionStorage() {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.indexOf(FBSS_PREFIX) === 0) {
        const sk = k.slice(FBSS_PREFIX.length);
        if (!sessionStorage.getItem(sk)) sessionStorage.setItem(sk, localStorage.getItem(k));
      }
    });
  } catch (e) {}
}

function installFirebaseSessionStorageMirror() {
  try {
    restoreFirebaseSessionStorage();
    const origSet = sessionStorage.setItem.bind(sessionStorage);
    const origRemove = sessionStorage.removeItem.bind(sessionStorage);
    sessionStorage.setItem = function (key, value) {
      origSet(key, value);
      try { localStorage.setItem(FBSS_PREFIX + key, value); } catch (e) {}
    };
    sessionStorage.removeItem = function (key) {
      origRemove(key);
      try { localStorage.removeItem(FBSS_PREFIX + key); } catch (e) {}
    };
  } catch (e) {}
}

function clearAuthHandoff() {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.indexOf(FBSS_PREFIX) === 0) localStorage.removeItem(k);
    });
    localStorage.removeItem("liftTrackerAuthPending");
    localStorage.removeItem("liftTrackerOauthNonce");
    localStorage.removeItem("liftTrackerGoogleIdToken");
  } catch (e) {}
}

function takeStoredGoogleIdToken() {
  let idToken = null;
  try {
    const hash = (window.location.hash || "").replace(/^#/, "");
    if (hash) {
      const params = new URLSearchParams(hash);
      idToken = params.get("id_token");
      if (idToken) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    if (!idToken) idToken = localStorage.getItem("liftTrackerGoogleIdToken");
    if (idToken) localStorage.removeItem("liftTrackerGoogleIdToken");
  } catch (e) {}
  return idToken;
}

// Shared by every sign-in path (popup, redirect, iOS OIDC) once a Firebase
// user is available, so "mark signed in" stays in exactly one place.
function applySignedInUser(user) {
  currentUser = user;
  updateSyncStatus("synced", user.displayName || user.email);
  renderCloudUI();
}

async function completeGoogleIdTokenSignIn(idToken) {
  if (!auth || !idToken) return false;
  try {
    const cred = firebase.auth.GoogleAuthProvider.credential(idToken);
    const result = await auth.signInWithCredential(cred);
    console.log("[Auth] ID-token sign-in:", result.user && result.user.email);
    clearAuthHandoff();
    if (result.user) applySignedInUser(result.user);
    return true;
  } catch (e) {
    console.error("[Auth] ID-token sign-in failed:", e.code, e.message);
    updateSyncStatus("error", "Sign-in failed");
    showToast("Sign in failed: " + (e.message || e), "error");
    renderCloudUI();
    return false;
  }
}

function startIosGoogleOidc() {
  const redirectUri = googleOidcRedirectUri();
  const nonce = (crypto.randomUUID && crypto.randomUUID()) || (String(Date.now()) + "." + Math.random());
  try {
    localStorage.setItem("liftTrackerOauthNonce", nonce);
    localStorage.setItem("liftTrackerAuthPending", String(Date.now()));
  } catch (e) {}
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "id_token",
    response_mode: "fragment",
    scope: "openid email profile",
    nonce: nonce,
    prompt: "select_account"
  });
  console.log("[Auth] iOS PWA OIDC →", redirectUri);
  updateSyncStatus("syncing", "Opening Google…");
  window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}

function saveFirebaseConfig() {
  const config = {
    apiKey: document.getElementById('fb-api-key').value.trim(),
    authDomain: document.getElementById('fb-auth-domain').value.trim(),
    projectId: document.getElementById('fb-project-id').value.trim(),
    storageBucket: document.getElementById('fb-storage-bucket').value.trim(),
    messagingSenderId: document.getElementById('fb-sender-id').value.trim(),
    appId: document.getElementById('fb-app-id').value.trim()
  };
  if (!config.apiKey || !config.projectId) {
    showToast('Enter at least API Key and Project ID', 'error');
    return;
  }
  localStorage.setItem('liftTrackerFirebase', JSON.stringify(config));
  showToast('Config saved');
  initFirebase(config);
  renderCloudUI();
}

function exportFirebaseConfig() {
  const config = getFirebaseConfig();
  if (!config || !config.apiKey) {
    showToast('No config to export. Save one first.', 'error');
    return;
  }
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lift-tracker-firebase-config.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Config exported');
}

function importFirebaseConfig(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result);
      if (!config.apiKey || !config.projectId) {
        showToast('Invalid config — needs apiKey + projectId', 'error');
        return;
      }
      document.getElementById('fb-api-key').value = config.apiKey || '';
      document.getElementById('fb-auth-domain').value = config.authDomain || '';
      document.getElementById('fb-project-id').value = config.projectId || '';
      document.getElementById('fb-storage-bucket').value = config.storageBucket || '';
      document.getElementById('fb-sender-id').value = config.messagingSenderId || '';
      document.getElementById('fb-app-id').value = config.appId || '';
      localStorage.setItem('liftTrackerFirebase', JSON.stringify(config));
      showToast('Config imported & saved');
      initFirebase(config);
      renderCloudUI();
    } catch (err) {
      console.error(err);
      showToast('Failed to parse config file', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

async function initFirebase(config) {
  if (!config || !config.apiKey) return;
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded');
    updateSyncStatus('error', 'SDK missing');
    return;
  }
  if (firebaseApp) {
    // Already initialized — just update if config changed
    return;
  }
  try {
    installFirebaseSessionStorageMirror();
    firebaseApp = firebase.initializeApp(config);
    auth = firebase.auth();
    try { auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
    db = firebase.firestore();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });

    // Offline persistence queues writes in IndexedDB and retries them when
    // connectivity returns, so saves made offline are no longer dropped.
    try {
      db.enablePersistence({ synchronizeTabs: false }).catch(err => {
        // failed-precondition: another tab already enabled persistence —
        // harmless, that tab keeps working. unimplemented: browser unsupported.
        if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
          console.warn('Offline persistence not enabled:', err.code);
        }
      });
    } catch(e) {
      console.warn('Offline persistence init:', e);
    }

    // Handle redirect-based sign-in result (iOS PWA)
    try {
      console.log('[Auth] Pending redirect keys:', Object.keys(sessionStorage).filter(k => k.includes('firebase') || k.includes('redirect') || k.includes('auth')));
    } catch(e) {}
    auth.getRedirectResult().then(result => {
      if (result && result.user) {
        console.log('[Auth] Redirect sign-in result:', result.user.email);
        clearAuthHandoff();
        if (!currentUser) {
          applySignedInUser(result.user);
          syncToFirestore(state);
        }
      } else {
        console.log('[Auth] No redirect result on load');
      }
    }).catch(e => {
      console.warn('Redirect sign-in error:', e.code, e.message);
      if (e.code && e.code !== 'auth/no-auth-event' && e.code !== 'auth/popup-closed-by-user') {
        updateSyncStatus('error', 'Auth error');
        showToast('Sign-in error: ' + e.message, 'error');
      }
    });

    // Listen for auth state
    auth.onAuthStateChanged(async (user) => {
      currentUser = user;
      if (user) {
        console.log('[Auth] Signed in:', user.email);
        updateSyncStatus('synced', user.displayName || user.email);
        // Render immediately; sync runs in the background so a slow
        // Firestore read can never leave the UI stuck on "Not signed in".
        renderCloudUI();
        try {
          await syncFromFirestore(user);
          syncToFirestore(state);
        } catch(e) {
          console.error('[Auth] State change error:', e);
        }
      } else {
        currentUser = null;
        console.log('[Auth] Signed out');
        updateSyncStatus('offline', 'Not signed in');
        renderCloudUI();
      }
    });
    renderCloudUI();
  } catch(e) {
    console.error('Firebase init error:', e);
    updateSyncStatus('error', 'Config error');
    showToast('Firebase init failed: ' + e.message, 'error');
  }
}

function signInWithGoogle() {
  if (!auth || !googleProvider) {
    const config = getFirebaseConfig();
    if (config && config.apiKey) initFirebase(config);
  }
  if (!auth || !googleProvider) {
    showToast('Firebase not configured. Save your config first.', 'error');
    return;
  }
  updateSyncStatus('syncing', 'Signing in…');
  // iOS Home Screen (standalone) has no popups. Firebase signInWithRedirect
  // also fails there: it hops through firebaseapp.com, iOS leaves the PWA,
  // and the result lands in Safari with empty sessionStorage.
  // Direct Google OIDC returns to auth.html on THIS origin instead.
  if (isIosStandalonePwa()) {
    startIosGoogleOidc();
    return;
  }
  auth.signInWithPopup(googleProvider).then(result => {
      console.log('[Auth] Popup sign-in result:', result.user ? result.user.email : 'no user');
      if (!currentUser && result.user) applySignedInUser(result.user);
    }).catch(e => {
      console.error('[Auth] Sign-in popup error:', e.code, e.message);
      if (e.code === 'auth/popup-blocked') {
        updateSyncStatus('syncing', 'Popup blocked, trying redirect…');
        auth.signInWithRedirect(googleProvider).catch(e2 => {
          console.error('[Auth] Sign-in redirect fallback error:', e2);
          updateSyncStatus('error', 'Sign-in failed');
          showToast('Sign in failed: ' + e2.message, 'error');
          renderCloudUI();
        });
      } else if (e.code === 'auth/popup-closed-by-user') {
        console.log('[Auth] Popup closed by user');
        updateSyncStatus('offline', 'Not signed in');
        renderCloudUI();
      } else {
        updateSyncStatus('error', 'Sign-in failed');
        showToast('Sign in failed: ' + e.message, 'error');
        renderCloudUI();
      }
    });
}

function signOutUser() {
  if (!auth) return;
  updateSyncStatus('syncing', 'Signing out…');
  auth.signOut().then(() => {
    currentUser = null;
    updateSyncStatus('offline', 'Not signed in');
    showToast('Signed out');
    renderCloudUI();
  }).catch(e => {
    console.error('Sign out error:', e);
    updateSyncStatus('error', 'Sign-out error');
  });
}

function updateSyncStatus(status, label) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  el.className = `sync-status ${status}`;
  el.style.display = 'inline-flex';
  const labelEl = el.querySelector('.ss-label');
  if (labelEl) {
    labelEl.textContent = label || status;
    // Truncate long emails
    if (labelEl.textContent.length > 18) {
      labelEl.textContent = labelEl.textContent.substring(0, 16) + '…';
    }
  }
}

// Collections mirrored to Firestore subcollections under users/{uid}.
// One document per record: avoids the 1 MiB single-doc limit, spreads
// writes across documents (no 1 write/sec per-doc bottleneck), and lets
// each record sync on its own updatedAt timestamp.
const SYNC_COLLECTIONS = ['workouts', 'templates', 'measurements', 'customExercises', 'heartRateData'];

function syncCacheKey() { return 'liftTrackerSync'; }

function loadSyncCache() {
  try {
    const raw = localStorage.getItem(syncCacheKey());
    const c = raw ? JSON.parse(raw) : {};
    if (!c.collections) c.collections = {};
    return c;
  } catch(e) { return { lastSyncedAt: 0, collections: {} }; }
}

function saveSyncCache(cache) {
  try { localStorage.setItem(syncCacheKey(), JSON.stringify(cache)); } catch(e) {}
}

// Stable fingerprint for change detection. Ignores sync metadata so a
// record is never re-uploaded just because its _updatedAt was stamped.
function recordFingerprint(rec) {
  const copy = Object.assign({}, rec);
  delete copy._updatedAt;
  delete copy._deleted;
  delete copy._deletedAt;
  try { return JSON.stringify(copy); } catch(e) { return 'obj:' + (rec && rec.id); }
}

function docIdFor(collection, rec) {
  let base;
  if (collection === 'heartRateData') {
    // Heart-rate samples dedupe on `date`; reuse it as the doc id.
    base = (rec && rec.date) || (rec && rec.id) || uid();
  } else {
    base = (rec && rec.id) || (rec && rec.date) || uid();
  }
  return 'd' + String(base).replace(/[^A-Za-z0-9_-]/g, '_');
}

async function syncToFirestore(data) {
  if (!currentUser || !db || syncInProgress) return;
  const now = Date.now();
  // Debounce: skip if we synced less than 2 seconds ago.
  if (now - lastSyncTime < 2000) return;
  lastSyncTime = now;
  syncInProgress = true;
  try {
    const uid = currentUser.uid;
    const userRef = db.collection('users').doc(uid);
    const cache = loadSyncCache();

    for (const collection of SYNC_COLLECTIONS) {
      const local = Array.isArray(data[collection]) ? data[collection] : [];
      const colCache = cache.collections[collection] || (cache.collections[collection] = {});
      const colRef = userRef.collection(collection);
      const seen = new Set();

      // Upload new or changed records (per-record last-write-wins).
      for (const rec of local) {
        const id = docIdFor(collection, rec);
        seen.add(id);
        const fp = recordFingerprint(rec);
        if (colCache[id] && colCache[id]._deleted === undefined && colCache[id].fingerprint === fp) continue;
        rec._updatedAt = Date.now();
        const payload = Object.assign({}, rec);
        payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await colRef.doc(id).set(payload, { merge: true });
        colCache[id] = { fingerprint: recordFingerprint(rec), _updatedAt: rec._updatedAt };
      }

      // Soft-delete (tombstone) records that were previously synced but are
      // gone locally, so other devices know to drop them too.
      for (const id in colCache) {
        if (seen.has(id) || colCache[id]._deleted) continue;
        const deletedAt = Date.now();
        const tomb = { _deleted: true, _deletedAt: deletedAt, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
        await colRef.doc(id).set(tomb, { merge: true });
        colCache[id] = { fingerprint: 'deleted', _deleted: true, _deletedAt: deletedAt };
      }
    }

    // Meta doc: profile + settings (firebase config stays local-only) and
    // the schema version that gates legacy migration.
    const meta = {
      email: currentUser.email,
      displayName: currentUser.displayName || '',
      _schemaVersion: SCHEMA_VERSION,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    if (data.profile) meta.profile = data.profile;
    if (data.settings) {
      const s = Object.assign({}, data.settings);
      delete s.firebaseConfig;
      meta.settings = s;
    }
    await userRef.set(meta, { merge: true });

    cache.lastSyncedAt = Date.now();
    saveSyncCache(cache);
    // Persist the stamped _updatedAt values so conflict resolution
    // survives reloads.
    try { localStorage.setItem('liftTracker', JSON.stringify(data)); } catch(e) {}
    updateSyncStatus(navigator.onLine ? 'synced' : 'offline', navigator.onLine ? (currentUser.displayName || currentUser.email) : 'Queued offline');
  } catch(e) {
    console.error('Firestore sync error:', e);
    // Don't show toast for every save — just update icon
    updateSyncStatus('error', 'Sync error');
  } finally {
    syncInProgress = false;
  }
}

async function syncFromFirestore(user) {
  if (!db || !user) return;
  try {
    const uid = user.uid;
    const userRef = db.collection('users').doc(uid);
    const metaDoc = await userRef.get();
    const meta = metaDoc.exists ? metaDoc.data() : null;

    // Legacy: the old code stored one big `data` blob per user. Migrate once.
    if (meta && meta.data && !meta._schemaVersion) {
      await migrateLegacyData(uid, meta);
    }
    if (!meta || !meta._schemaVersion) {
      // First run with subcollections — seed the cloud from local data.
      await syncToFirestore(state);
      return;
    }

    const cache = loadSyncCache();
    const cacheCols = cache.collections || (cache.collections = {});
    let changed = false;

    for (const collection of SYNC_COLLECTIONS) {
      const snap = await userRef.collection(collection).get();
      const cloudById = {};
      snap.forEach(d => { cloudById[d.id] = d.data(); });

      const localArr = Array.isArray(state[collection]) ? state[collection] : [];
      const localById = {};
      localArr.forEach(r => { localById[docIdFor(collection, r)] = r; });
      const colCache = cacheCols[collection] || (cacheCols[collection] = {});

      // Adopt cloud records newer than the local copy (per-record LWW).
      for (const id in cloudById) {
        const cloud = cloudById[id];
        const local = localById[id];
        const cloudT = cloud._updatedAt || 0;
        const localT = local ? (local._updatedAt || 0) : -1;
        if (cloud._deleted) {
          if (localT >= (cloud._deletedAt || cloudT)) continue; // local wins
          if (local) delete localById[id];
          continue;
        }
        if (cloudT > localT) {
          const rec = Object.assign({}, cloud);
          delete rec.updatedAt;
          localById[id] = rec;
        }
      }

      // Records we previously pushed but that are gone from cloud were
      // deleted on another device — drop them unless locally newer.
      for (const id in colCache) {
        if (colCache[id]._deleted) continue;
        if (!(id in cloudById) && localById[id]) {
          if ((localById[id]._updatedAt || 0) > (colCache[id]._updatedAt || 0)) continue;
          delete localById[id];
        }
      }

      const newArr = Object.values(localById);
      if (collection === 'heartRateData') {
        newArr.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      if (JSON.stringify(newArr) !== JSON.stringify(localArr)) {
        state[collection] = newArr;
        changed = true;
      }

      // Mirror cloud into the cache so adopted records aren't re-uploaded.
      for (const id in cloudById) {
        const cloud = cloudById[id];
        if (cloud._deleted) {
          colCache[id] = { fingerprint: 'deleted', _deleted: true, _deletedAt: cloud._deletedAt || 0 };
        } else if (!colCache[id] || colCache[id]._deleted || colCache[id].fingerprint !== recordFingerprint(cloud)) {
          colCache[id] = { fingerprint: recordFingerprint(cloud), _updatedAt: cloud._updatedAt || 0 };
        }
      }
    }

    // Meta: adopt a newer profile, merge settings without clobbering the
    // local firebase config.
    if (meta.profile) {
      const localT = state.profile ? new Date(state.profile.completedAt || 0).getTime() : -1;
      const cloudT = new Date(meta.profile.completedAt || 0).getTime();
      if (cloudT > localT) { state.profile = meta.profile; changed = true; }
    }
    if (meta.settings) {
      const localSettings = state.settings || {};
      const merged = Object.assign({}, meta.settings, localSettings);
      merged.firebaseConfig = localSettings.firebaseConfig;
      if (JSON.stringify(merged) !== JSON.stringify(state.settings)) {
        state.settings = merged;
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem('liftTracker', JSON.stringify(state));
      showToast('Cloud data synced to this device');
      renderCloudUI();
    }
    saveSyncCache(cache);
    // Converge: upload anything still newer locally.
    syncToFirestore(state);
  } catch(e) {
    console.error('Firestore read error:', e);
    // Offline — that's ok, local data works
  }
}

async function migrateLegacyData(uid, meta) {
  try {
    const legacy = meta.data;
    if (!legacy || typeof legacy !== 'object') return;
    let cloudTime = 0;
    if (legacy.updatedAt) {
      cloudTime = (typeof legacy.updatedAt === 'object' && legacy.updatedAt.toDate)
        ? legacy.updatedAt.toDate().getTime()
        : new Date(legacy.updatedAt).getTime();
    }
    const localTime = state._localUpdatedAt || 0;
    if (cloudTime > localTime + 5000) {
      // Cloud blob is meaningfully newer — replace local with it.
      const clean = Object.assign({}, legacy);
      delete clean.updatedAt;
      state = Object.assign({}, state, clean);
      localStorage.setItem('liftTracker', JSON.stringify(state));
    }
    // Drop the legacy blob so the doc becomes a clean meta doc.
    await db.collection('users').doc(uid).update({
      data: firebase.firestore.FieldValue.delete()
    }).catch(() => {});
  } catch(e) {
    console.error('Legacy migration error:', e);
  }
}

function renderCloudUI() {
  const config = getFirebaseConfig();
  const authArea = document.getElementById('cloud-auth-area');
  const configArea = document.getElementById('cloud-config-area');
  const authStatus = document.getElementById('cloud-auth-status');
  const userEl = document.getElementById('cloud-user');

  if (!authArea) return;

  if (currentUser) {
    userEl.textContent = currentUser.displayName || currentUser.email || 'Signed in';
    authArea.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:0.9rem;font-weight:800;color:var(--bg);flex-shrink:0">
          ${(currentUser.displayName || currentUser.email || '?')[0].toUpperCase()}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:0.85rem;font-weight:600;color:var(--text)">${esc(currentUser.displayName || '')}</div>
          <div style="font-size:0.75rem;color:var(--text3)">${esc(currentUser.email)}</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="signOutUser()" style="color:var(--orange);flex-shrink:0">Sign Out</button>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-secondary btn-sm" onclick="manualSync()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Sync Now
        </button>
      </div>
    `;
    authStatus.innerHTML = '<p class="cs-note" style="color:var(--green)">✓ Your data is backed up to the cloud. Signed in changes sync automatically.</p>';
    // Fill config fields with existing values
    if (config) {
      document.getElementById('fb-api-key').value = config.apiKey || '';
      document.getElementById('fb-auth-domain').value = config.authDomain || '';
      document.getElementById('fb-project-id').value = config.projectId || '';
      document.getElementById('fb-storage-bucket').value = config.storageBucket || '';
      document.getElementById('fb-sender-id').value = config.messagingSenderId || '';
      document.getElementById('fb-app-id').value = config.appId || '';
    }
    configArea.style.display = 'none';
  } else {
    userEl.textContent = 'Not connected';
    const iosNote = isIosStandalonePwa()
      ? `<p class="cs-note">iPhone Home Screen sign-in jumps to Google and returns here. If Google shows <em>redirect_uri_mismatch</em>, add this exact URL under Google Cloud → APIs & Credentials → your Web client → Authorized redirect URIs:<br><code style="color:var(--green);word-break:break-all">${googleOidcRedirectUri()}</code></p>`
      : (isIosDevice() ? `<p class="cs-note">On iPhone the Home Screen app has its own Google login, separate from Safari. Open Lift Tracker from the icon and tap Sign in there.</p>` : "");
    authArea.innerHTML = `
      <button class="google-btn" onclick="signInWithGoogle()">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
        Sign in with Google
      </button>
      ${iosNote}
    `;
    authStatus.innerHTML = '';
    if (config) {
      configArea.style.display = 'block';
      document.getElementById('fb-api-key').value = config.apiKey || '';
      document.getElementById('fb-auth-domain').value = config.authDomain || '';
      document.getElementById('fb-project-id').value = config.projectId || '';
      document.getElementById('fb-storage-bucket').value = config.storageBucket || '';
      document.getElementById('fb-sender-id').value = config.messagingSenderId || '';
      document.getElementById('fb-app-id').value = config.appId || '';
    } else {
      configArea.style.display = 'block';
    }
  }
}

function manualSync() {
  if (!currentUser || !db) {
    showToast('Sign in to sync', 'error');
    return;
  }
  updateSyncStatus('syncing', 'Syncing…');
  syncToFirestore(state).then(() => {
    syncFromFirestore(currentUser).then(() => {
      showToast('Sync complete');
    });
  }).catch(e => {
    showToast('Sync failed', 'error');
  });
}

// Auto-init Firebase on page load if config exists
function initCloudOnLoad() {
  installFirebaseSessionStorageMirror();
  try {
    if (!loadFirebaseConfig()) {
      localStorage.setItem("liftTrackerFirebase", JSON.stringify(DEFAULT_FIREBASE_CONFIG));
    }
  } catch (e) {}
  const pendingIdToken = takeStoredGoogleIdToken();
  const config = getFirebaseConfig();
  if (config) {
    initFirebase(config);
    if (pendingIdToken) completeGoogleIdTokenSignIn(pendingIdToken);
    // Fill config fields if they exist
    const els = ['fb-api-key','fb-auth-domain','fb-project-id','fb-storage-bucket','fb-sender-id','fb-app-id'];
    const keys = ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId'];
    els.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && config[keys[i]]) el.value = config[keys[i]];
    });
  }
  renderCloudUI();
}

// Stamp local timestamp so merge can compare
function stampLocalUpdate() {
  state._localUpdatedAt = Date.now();
}
// Call stamp on saveState
const _origSaveState = saveState;
saveState = function() {
  stampLocalUpdate();
  _origSaveState();
};

// ============================================================
// UTILITIES
// ============================================================
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }

// Escapes user-authored text (custom exercise names, template/workout names,
// Google account name) before it's interpolated into innerHTML templates.
function esc(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// Completed sets store the actually logged load in actualReps/actualWeight;
// planned weight/reps are only a fallback for older records. Volume must
// always use the actual values or the totals come out wrong.
function setVolume(s) {
  if (!s || !s.completed) return 0;
  // Nullish coalescing: only missing fields (legacy records) fall back to
  // planned values. A real 0 stays 0 — `||` would wrongly resurrect the
  // planned weight/reps for a set logged at zero.
  const reps = s.actualReps ?? s.reps ?? 0;
  const weight = s.actualWeight ?? s.weight ?? 0;
  return reps * weight;
}

function workoutVolume(w) {
  if (!w || !Array.isArray(w.exercises)) return 0;
  return w.exercises.reduce((es, e) => es + (Array.isArray(e.sets) ? e.sets.reduce((ss, s2) => ss + setVolume(s2), 0) : 0), 0);
}

function formatDate(d) {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric', year:'numeric'});
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

function showToast(msg, type='success') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2500);
}

// ============================================================
// NAVIGATION
// ============================================================
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.view === name);
  });
  window.scrollTo(0, 0);
  if (name === 'dashboard') renderDashboard();
  if (name === 'exercises') renderExercises();
  if (name === 'templates') renderTemplates();
  if (name === 'measurements') renderMeasurements();
  if (name === 'history') renderHistory();
  if (name === 'workout') renderWorkout();
  if (name === 'profile') renderProfile();
  if (name === 'settings') { renderCloudUI(); renderVoiceSettings(); }
}

// ============================================================
// CONFIRM DIALOG
// ============================================================
let confirmCallback = null;
function openConfirm(title, message, cb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  document.getElementById('confirm-dialog').classList.add('open');
  confirmCallback = cb;
  document.getElementById('confirm-ok-btn').onclick = () => { closeConfirm(); confirmCallback(); };
}
function closeConfirm() { document.getElementById('confirm-dialog').classList.remove('open'); }

function confirmClearData() {
  openConfirm('Clear All Data', 'This will delete all workouts, templates, and measurements. This cannot be undone.', () => {
    state.templates = []; state.workouts = []; state.measurements = []; state.activeWorkout = null;
    saveState(); showView('dashboard'); showToast('All data cleared');
  });
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
  const weekWorkouts = state.workouts.filter(w => new Date(w.date) >= weekStart);
  const totalSets = state.workouts.reduce((sum, w) => sum + w.exercises.reduce((s, e) => s + e.sets.filter(s2 => s2.completed).length, 0), 0);
  const totalVolume = state.workouts.reduce((sum, w) => sum + workoutVolume(w), 0);
  const latestWeight = state.measurements.length > 0 ? state.measurements[state.measurements.length - 1].values.weight : null;

  document.getElementById('dashboard-stats').innerHTML = `
    <div class="stat-card"><div class="stat-value">${weekWorkouts.length}</div><div class="stat-label">This Week</div></div>
    <div class="stat-card"><div class="stat-value">${totalSets}</div><div class="stat-label">Total Sets</div></div>
    <div class="stat-card"><div class="stat-value">${(totalVolume/1000).toFixed(1)}k</div><div class="stat-label">Volume (lbs)</div></div>
    <div class="stat-card"><div class="stat-value">${latestWeight ? latestWeight : '—'}</div><div class="stat-label">Body Weight</div></div>
  `;

  const recent = [...state.workouts].reverse().slice(0, 5);
  if (recent.length === 0) {
    document.getElementById('dashboard-activity').innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="8" width="4" height="12" rx="1"/><rect x="5" y="10" width="3" height="8" rx="0.5"/><rect x="23" y="8" width="4" height="12" rx="1" transform="translate(-3)"/><rect x="20" y="10" width="3" height="8" rx="0.5"/><line x1="8" y1="14" x2="20" y2="14" stroke-width="2.5"/></svg>
        <p>No workouts yet. Start your first one!</p>
      </div>`;
  } else {
    document.getElementById('dashboard-activity').innerHTML = recent.map(w => {
      const v = workoutVolume(w);
      const sets = w.exercises.reduce((s,e) => s + e.sets.filter(s2 => s2.completed).length, 0);
      return `<div class="history-item" style="cursor:pointer" onclick="viewWorkoutDetail('${w.id}')">
        <div class="hi-date">${formatDate(w.date)}</div>
        <div class="hi-title">${w.name || 'Workout'}</div>
        <div class="hi-stats">
          <span>${w.exercises.length} exercises</span>
          <span>${sets} sets</span>
          <span>${v.toLocaleString()} lbs</span>
        </div>
      </div>`;
    }).join('');
  }

  // Active workout bar
  const aw = state.activeWorkout;
  if (aw) {
    const elapsed = Math.floor((Date.now() - aw.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const completedSets = aw.exercises.reduce((s,e) => s + e.sets.filter(s2 => s2.completed).length, 0);
    document.getElementById('dashboard-active-workout-bar').innerHTML = `
      <div class="dash-active-bar" onclick="showView('workout')">
        <div class="dab-pulse"></div>
        <div class="dab-info">
          <div class="dab-name">${aw.name || 'Workout'} in progress</div>
          <div class="dab-time">${mins}:${String(secs).padStart(2,'0')} &middot; ${completedSets} sets done</div>
        </div>
        <div class="dab-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>`;
    // Update elapsed time every second
    if (!window._dashTimerInterval) {
      window._dashTimerInterval = setInterval(() => {
        if (!state.activeWorkout || !document.getElementById('view-dashboard').classList.contains('active')) {
          clearInterval(window._dashTimerInterval);
          window._dashTimerInterval = null;
          return;
        }
        const el = Math.floor((Date.now() - state.activeWorkout.startTime) / 1000);
        const m = Math.floor(el / 60);
        const s = el % 60;
        const cs = state.activeWorkout.exercises.reduce((sum,e) => sum + e.sets.filter(s2 => s2.completed).length, 0);
        const bar = document.querySelector('.dab-time');
        if (bar) bar.textContent = `${m}:${String(s).padStart(2,'0')} · ${cs} sets done`;
      }, 1000);
    }
  } else {
    document.getElementById('dashboard-active-workout-bar').innerHTML = '';
    if (window._dashTimerInterval) { clearInterval(window._dashTimerInterval); window._dashTimerInterval = null; }
  }

  // Quick rest timer
  const restPresets = [
    { secs: 30, label: '30s' },
    { secs: 60, label: '1m' },
    { secs: 90, label: '1:30' },
    { secs: 120, label: '2m' }
  ];
  document.getElementById('dashboard-rest-timer').innerHTML = `
    <div class="dash-rest-timer">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Quick Rest Timer
      </h4>
      <div class="drt-btns">
        ${restPresets.map(p => `<button class="drt-btn" onclick="startRestTimer(${p.secs})"><span class="drt-time">${p.label}</span></button>`).join('')}
      </div>
    </div>`;

  renderCalendar();
}

// ============================================================
// WORKOUT SPLIT CALENDAR
// ============================================================
let calendarState = { weekOffset: 0, selectedDate: null };

function renderCalendar() {
  const cs = calendarState;
  const today = new Date();
  today.setHours(0,0,0,0);

  // Find Monday of the target week
  const target = new Date(today);
  target.setDate(today.getDate() + (cs.weekOffset * 7));
  const dow = target.getDay();
  const monday = new Date(target);
  monday.setDate(target.getDate() - ((dow + 6) % 7));

  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // Index workouts by date
  const workoutsByDate = {};
  state.workouts.forEach(w => {
    const d = w.date.substring(0, 10);
    if (!workoutsByDate[d]) workoutsByDate[d] = [];
    workoutsByDate[d].push(w);
  });

  // Build week grid
  let grid = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const isToday = d.getTime() === today.getTime();
    const hasWorkout = workoutsByDate[dateStr];
    const isSelected = cs.selectedDate === dateStr;
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (hasWorkout) cls += ' has-workout';
    if (isSelected) cls += ' selected';

    let dots = hasWorkout ? '<div class="cal-dots"><span class="cal-dot"></span></div>' : '';
    grid += `<div class="${cls}" onclick="selectCalendarDate('${dateStr}')">
      <span class="cal-dow">${dayNames[i]}</span>
      <span class="cal-date">${d.getDate()}</span>
      ${dots}
    </div>`;
  }

  // Week label
  const weekEnd = new Date(monday);
  weekEnd.setDate(monday.getDate() + 6);
  let weekLabel;
  if (monday.getMonth() === weekEnd.getMonth()) {
    weekLabel = `${monday.toLocaleDateString('en-US',{month:'short'})} ${monday.getDate()} – ${weekEnd.getDate()}`;
  } else {
    weekLabel = `${monday.toLocaleDateString('en-US',{month:'short'})} ${monday.getDate()} – ${weekEnd.toLocaleDateString('en-US',{month:'short'})} ${weekEnd.getDate()}`;
  }
  if (cs.weekOffset === 0) weekLabel = 'This Week';

  // Selected day detail
  let detailHtml = '';
  if (cs.selectedDate) {
    const dw = workoutsByDate[cs.selectedDate] || [];
    const parts = cs.selectedDate.split('-');
    const dObj = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
    const dateLabel = dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (dw.length > 0) {
      const w = dw[0];
      const sets = w.exercises.reduce((s,e) => s + e.sets.filter(s2 => s2.completed).length, 0);
      const vol = workoutVolume(w);
      detailHtml = `<div class="cal-day-detail">
        <div class="cdd-date">${dateLabel}</div>
        <div class="cdd-title">${w.name || 'Workout'}</div>
        <div class="cdd-exercises">${w.exercises.length} exercises &middot; ${sets} sets &middot; ${vol.toLocaleString()} lbs volume</div>
        <button class="cdd-btn view" onclick="viewWorkoutDetail('${w.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Workout
        </button>
      </div>`;
    } else {
      detailHtml = `<div class="cal-day-detail">
        <div class="cdd-date">${dateLabel}</div>
        <div class="cdd-title" style="color:var(--text3)">No workout logged</div>
        <button class="cdd-btn log" onclick="logWorkoutForDate('${cs.selectedDate}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log Workout
        </button>
      </div>`;
    }
  }

  document.getElementById('dashboard-calendar').innerHTML = `
    <div class="calendar">
      <div class="cal-header">
        <div class="cal-nav">
          <button onclick="navCalendar(-1)">&#8249;</button>
        </div>
        <h3>${weekLabel}</h3>
        <div class="cal-nav">
          <button onclick="navCalendar(1)">&#8250;</button>
        </div>
      </div>
      <div class="cal-week">${grid}</div>
      ${detailHtml}
    </div>`;
}

function navCalendar(dir) {
  calendarState.weekOffset += dir;
  calendarState.selectedDate = null;
  renderCalendar();
}

function selectCalendarDate(dateStr) {
  calendarState.selectedDate = calendarState.selectedDate === dateStr ? null : dateStr;
  renderCalendar();
}

function logWorkoutForDate(dateStr) {
  if (state.templates.length > 0) {
    showView('templates');
    showToast('Select a template to start');
  } else {
    openTemplateEditor();
  }
}

function buildUpcomingSchedule(days, workoutsByDate) {
  const schedule = [];
  const today = new Date();
  today.setHours(0,0,0,0);

  // Determine split pattern from most recent template with split info in name
  let splitPattern = null;
  let splitDays = 0;
  for (const t of state.templates) {
    const matched = SPLIT_TYPES.find(sp => t.name.toLowerCase().includes(sp.name.toLowerCase()));
    if (matched) { splitPattern = matched; splitDays = matched.days; break; }
  }

  // Count days since a recent reference point (last 30 days of workouts)
  const recentDates = state.workouts.map(w => w.date.substring(0, 10)).sort().reverse();
  const lastWorkoutDate = recentDates.length > 0 ? new Date(recentDates[0] + 'T00:00:00') : null;

  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const isWorkoutDay = workoutsByDate[dateStr] && workoutsByDate[dateStr].length > 0;

    if (isWorkoutDay) {
      schedule.push({ date: dateStr, label: workoutsByDate[dateStr][0].name || 'Workout', type: 'workout' });
    } else if (splitPattern && lastWorkoutDate) {
      // Estimate rest vs workout based on split rhythm
      const daysSinceLast = Math.round((d - lastWorkoutDate) / (1000 * 60 * 60 * 24));
      const restDays = 7 - splitDays;
      const cycleDay = daysSinceLast % (restDays + 1);
      if (cycleDay === 0) {
        // Estimate which split day
        const splitNames = {
          'ppl': ['Push Day', 'Pull Day', 'Legs Day', 'Push Day', 'Pull Day', 'Legs Day'],
          'upper-lower': ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'],
          'full-body': ['Full Body', 'Full Body', 'Full Body'],
          'bro': ['Chest & Triceps', 'Back & Biceps', 'Shoulders', 'Legs', 'Arms & Abs'],
          'custom': ['Training Day']
        };
        const names = splitNames[splitPattern.id] || ['Training Day'];
        const dayIdx = Math.floor(daysSinceLast / (restDays + 1)) % names.length;
        schedule.push({ date: dateStr, label: names[dayIdx], type: 'planned' });
      } else {
        schedule.push({ date: dateStr, label: 'Rest Day', type: 'rest' });
      }
    } else if (i <= 5) {
      schedule.push({ date: dateStr, label: 'Rest Day', type: 'rest' });
    }
  }

  return schedule.filter(s => s.type !== 'rest' || schedule.indexOf(s) < 6).slice(0, 10);
}

function startQuickWorkout() {
  if (state.templates.length > 0) {
    showView('templates');
    showToast('Select a template or create a new one');
  } else {
    openTemplateEditor();
  }
}

// ============================================================
// EXERCISES
// ============================================================
let currentMuscleFilter = 'All';
function renderExercises() {
  const filters = document.getElementById('muscle-filters');
  filters.innerHTML = `<button class="chip ${currentMuscleFilter==='All'?'active':''}" onclick="filterByMuscle('All')">All</button>` +
    MUSCLE_GROUPS.map(m => `<button class="chip ${currentMuscleFilter===m?'active':''}" onclick="filterByMuscle('${m}')">${MUSCLE_EMOJIS[m]||''} ${m}</button>`).join('');
  filterExercises();
}

function filterByMuscle(m) { currentMuscleFilter = m; renderExercises(); }

function filterExercises() {
  const q = (document.getElementById('exercise-search')?.value || '').toLowerCase();
  const allEx = getAllExercises();
  const list = allEx.filter(e => {
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q);
    const matchM = currentMuscleFilter === 'All' || e.muscle === currentMuscleFilter;
    return matchQ && matchM;
  });
  document.getElementById('exercise-list').innerHTML = list.map(e => `
    <div class="exercise-item" onclick="showExerciseDetail('${e.id}')">
      <div class="ex-icon" style="background:${MUSCLE_COLORS[e.muscle]||'var(--green)'}22;color:${MUSCLE_COLORS[e.muscle]||'var(--green)'}">${e.custom?'✏️':(MUSCLE_EMOJIS[e.muscle]||'🏋️')}</div>
      <div class="ex-info">
        <div class="ex-name">${esc(e.name)}${e.custom?' <span style="font-size:0.65rem;color:var(--orange);font-weight:600">CUSTOM</span>':''}</div>
        <div class="ex-meta"><span>${esc(e.muscle)}</span><span>•</span><span>${esc(e.equipment)}</span></div>
      </div>
      <div class="ex-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
    </div>
  `).join('');
}

function showExerciseDetail(id) {
  const e = getAllExercises().find(x => x.id === id);
  if (!e) return;
  const ytQuery = encodeURIComponent(e.name + ' exercise form tutorial');
  const tipsHtml = (e.tips && e.tips.length) ? e.tips.map(t => `<li style="font-size:0.85rem;color:var(--text);margin-bottom:6px">${t}</li>`).join('') : '<li style="font-size:0.85rem;color:var(--text3)">No form tips available for this exercise.</li>';
  document.getElementById('exercise-detail-content').innerHTML = `
    <div class="modal-title">
      <span>${esc(e.name)}</span>
      <button class="icon-btn" aria-label="Close" onclick="closeModal('exercise-detail-modal')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div class="flex gap-2 mb-3">
      <span class="tag" style="background:${MUSCLE_COLORS[e.muscle]||'var(--green)'}22;color:${MUSCLE_COLORS[e.muscle]||'var(--green)'}">${esc(e.muscle)}</span>
      <span class="tag tag-blue">${esc(e.equipment)}</span>
      ${e.custom?'<span class="tag" style="background:var(--orange)22;color:var(--orange)">Custom</span>':''}
    </div>
    <a class="video-btn" href="https://www.youtube.com/results?search_query=${ytQuery}" target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Watch Video Guide
    </a>
    <h4 style="font-size:0.85rem;font-weight:600;margin:14px 0 8px;color:var(--text2)">Form Tips</h4>
    <ol style="padding-left:18px;margin-bottom:16px">${tipsHtml}</ol>
    ${e.proTip ? `<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px">
      <div style="font-size:0.75rem;font-weight:600;color:var(--green);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Pro Tip</div>
      <div style="font-size:0.85rem;color:var(--text)">${esc(e.proTip)}</div>
    </div>` : ''}
    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary" style="flex:1" onclick="addExerciseToWorkout('${e.id}');closeModal('exercise-detail-modal')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add to Workout
      </button>
      ${e.custom ? `<button class="btn btn-danger btn-sm" onclick="deleteCustomExercise('${e.id}')">Delete</button>` : ''}
    </div>
  `;
  openModal('exercise-detail-modal');
}

// ============================================================
// TEMPLATES
// ============================================================
function renderTemplates() {
  if (state.templates.length === 0) {
    document.getElementById('template-list').innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <p>No templates yet. Create one or use the wizard!</p>
        <button class="btn btn-primary" onclick="openTemplateEditor()">Create Template</button>
      </div>`;
    return;
  }
  document.getElementById('template-list').innerHTML = state.templates.map(t => `
    <div class="template-card">
      <div class="tc-name">${esc(t.name)}</div>
      <div class="tc-meta">
        <span>${t.exercises.length} exercise${t.exercises.length!==1?'s':''}</span>
        <span>${t.exercises.reduce((s,e)=>s+e.sets.length,0)} sets</span>
      </div>
      <div class="tc-exercises">
        ${t.exercises.slice(0,6).map(e => `<span class="tc-ex">${esc(e.name)}</span>`).join('')}
        ${t.exercises.length > 6 ? `<span class="tc-ex">+${t.exercises.length-6} more</span>` : ''}
      </div>
      <div class="tc-actions">
        <button class="btn btn-primary btn-sm" onclick="startWorkoutFromTemplate('${t.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
          Start
        </button>
        <button class="btn btn-secondary btn-sm" onclick="openTemplateEditor('${t.id}')">Edit</button>
        <button class="btn btn-secondary btn-sm" onclick="duplicateTemplate('${t.id}')">Copy</button>
        <button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="deleteTemplate('${t.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function duplicateTemplate(id) {
  const orig = state.templates.find(t => t.id === id);
  if (!orig) return;
  const copy = JSON.parse(JSON.stringify(orig));
  copy.id = uid();
  copy.name = orig.name + ' (Copy)';
  state.templates.push(copy);
  saveState();
  renderTemplates();
  showToast('Template duplicated');
}

function deleteTemplate(id) {
  openConfirm('Delete Template', 'Are you sure you want to delete this template?', () => {
    state.templates = state.templates.filter(t => t.id !== id);
    saveState(); renderTemplates(); showToast('Template deleted');
  });
}

// ============================================================
// TEMPLATE EDITOR
// ============================================================
let editingTemplate = null;
function openTemplateEditor(templateId) {
  if (templateId) {
    editingTemplate = JSON.parse(JSON.stringify(state.templates.find(t => t.id === templateId)));
  } else {
    editingTemplate = {id: uid(), name: 'New Template', exercises: []};
  }
  renderTemplateEditor();
  openModal('template-editor-modal');
}

function renderTemplateEditor() {
  const t = editingTemplate;
  document.getElementById('template-editor-content').innerHTML = `
    <div class="modal-title">
      <span>${t.name ? 'Edit Template' : 'New Template'}</span>
      <button class="icon-btn" aria-label="Close" onclick="closeModal('template-editor-modal')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div class="form-group">
      <label class="form-label">Template Name</label>
      <input class="form-input" value="${escHtml(t.name)}" oninput="editingTemplate.name=this.value">
    </div>
    <div id="template-exercises-editor"></div>
    <button class="btn btn-secondary btn-block mb-3" onclick="addExerciseToTemplate()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Exercise
    </button>
    <button class="btn btn-primary btn-block" onclick="saveTemplate()">Save Template</button>
  `;
  renderTemplateExercises();
}

function renderTemplateExercises() {
  const t = editingTemplate;
  const SUPERSET_COLORS = ['var(--purple)','var(--blue)','var(--orange)','var(--red)','#5cf2d4','#f2c85c'];
  // Build superset group map
  const groupColors = {};
  let colorIdx = 0;
  t.exercises.forEach(ex => {
    const g = ex.supersetGroup;
    if (g != null && !(g in groupColors)) {
      groupColors[g] = SUPERSET_COLORS[colorIdx % SUPERSET_COLORS.length];
      colorIdx++;
    }
  });

  document.getElementById('template-exercises-editor').innerHTML = t.exercises.map((ex, i) => {
    const g = ex.supersetGroup;
    const barColor = g != null ? groupColors[g] : null;
    const isGiantSet = g != null && t.exercises.filter(e => e.supersetGroup === g).length >= 3;
    const groupLabel = g != null ? getGroupLabel(t.exercises, g) : '';
    const supersetLabel = (g != null && (i === 0 || t.exercises[i-1].supersetGroup !== g))
      ? `<div class="superset-label" style="color:${barColor}"><span class="sl-dot" style="background:${barColor}"></span>${groupLabel} ${String.fromCharCode(65 + g)}</div>`
      : '';
    const barHtml = barColor ? (isGiantSet ? `<div class="giantset-bar" style="border-color:${barColor}"></div>` : `<div class="superset-bar" style="background:${barColor}"></div>`) : '';
    // Link button: only show for exercises adjacent to another exercise
    const canLinkPrev = i > 0;
    const canLinkNext = i < t.exercises.length - 1;
    const isLinked = g != null;
    const canGiantSet = i + 2 < t.exercises.length;

    return `
      ${supersetLabel}
      <div class="card superset-card ${isGiantSet ? 'giant-set-card' : ''}" style="border-color:${barColor || 'var(--border)'}">
        ${barHtml}
        <div class="flex justify-between items-center mb-2">
          <div class="fw-600 text-sm">${esc(ex.name)}</div>
          <div class="flex gap-2">
            ${canGiantSet ? `<button class="superset-link-btn ${isGiantSet?'active':''}" onclick="toggleGiantSet(${i})" title="Link/Unlink Giant Set (3 exercises)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              ${isGiantSet ? 'Unlink 3' : 'Giant Set'}
            </button>` : ''}
            <button class="superset-link-btn ${isLinked && !isGiantSet?'active':''}" onclick="toggleSuperset(${i})" title="Link/Unlink Superset">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              ${isLinked && !isGiantSet ? 'Unlink' : 'Superset'}
            </button>
            <button class="icon-btn" onclick="moveTemplateExercise(${i},-1)" ${i===0?'disabled':''}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg></button>
            <button class="icon-btn" onclick="moveTemplateExercise(${i},1)" ${i===t.exercises.length-1?'disabled':''}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
            <button class="icon-btn" style="color:var(--red)" onclick="removeTemplateExercise(${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
        </div>
        <div class="set-headers"><span>#</span><span>Reps</span><span>Weight</span><span>Rest</span><span style="text-align:right">Type</span></div>
        ${ex.sets.map((s, si) => `
          <div class="set-row">
            <div class="set-num">${si+1}</div>
            <input class="set-input" type="number" value="${s.reps||''}" placeholder="Reps" oninput="editingTemplate.exercises[${i}].sets[${si}].reps=parseInt(this.value)||0">
            <input class="set-input" type="number" value="${s.weight||''}" placeholder="lbs" oninput="editingTemplate.exercises[${i}].sets[${si}].weight=parseFloat(this.value)||0">
            <input class="set-input" type="number" value="${s.rest||''}" placeholder="s" oninput="editingTemplate.exercises[${i}].sets[${si}].rest=parseInt(this.value)||0">
            <select class="form-select" style="padding:6px 24px 6px 6px;font-size:0.7rem;width:auto;min-width:70px" onchange="editingTemplate.exercises[${i}].sets[${si}].type=this.value">
              ${SET_TYPES.map(st => `<option value="${st.id}" ${s.type===st.id?'selected':''}>${st.name}</option>`).join('')}
            </select>
          </div>
        `).join('')}
        <div class="flex gap-2 mt-2">
          <button class="btn btn-ghost btn-sm" onclick="addSetToTemplateExercise(${i})">+ Add Set</button>
          <button class="btn btn-ghost btn-sm" onclick="removeSetFromTemplateExercise(${i})">- Remove Set</button>
        </div>
      </div>
    `;
  }).join('');
}

function toggleSuperset(i) {
  const t = editingTemplate;
  const ex = t.exercises[i];
  if (ex.supersetGroup != null) {
    // Unlink: remove from group. If only one left in group, remove group from all
    const g = ex.supersetGroup;
    ex.supersetGroup = null;
    const remaining = t.exercises.filter(e => e.supersetGroup === g);
    if (remaining.length <= 1) {
      remaining.forEach(e => e.supersetGroup = null);
    }
  } else {
    // Link with the previous exercise (or start a new group)
    const prev = i > 0 ? t.exercises[i - 1] : null;
    if (prev && prev.supersetGroup != null) {
      ex.supersetGroup = prev.supersetGroup;
    } else if (prev) {
      // Create new group using the next available group id
      const maxGroup = t.exercises.reduce((max, e) => Math.max(max, e.supersetGroup != null ? e.supersetGroup : -1), -1);
      const newGroup = maxGroup + 1;
      ex.supersetGroup = newGroup;
      prev.supersetGroup = newGroup;
    } else {
      // First exercise, no prev — start group with next exercise if exists
      if (i < t.exercises.length - 1) {
        const maxGroup = t.exercises.reduce((max, e) => Math.max(max, e.supersetGroup != null ? e.supersetGroup : -1), -1);
        const newGroup = maxGroup + 1;
        ex.supersetGroup = newGroup;
        t.exercises[i + 1].supersetGroup = newGroup;
      }
    }
  }
  renderTemplateExercises();
}

function toggleGiantSet(i) {
  // Link current exercise and the next 2 (3 exercises total) into a giant set
  const t = editingTemplate;
  // Need at least 2 more exercises after this one (i, i+1, i+2)
  if (i + 2 >= t.exercises.length) return;
  // Check if any of these are already in a group
  const exes = [t.exercises[i], t.exercises[i+1], t.exercises[i+2]];
  const alreadyGrouped = exes.some(e => e.supersetGroup != null);
  if (alreadyGrouped) {
    // Unlink all three
    exes.forEach(e => {
      const g = e.supersetGroup;
      if (g != null) {
        e.supersetGroup = null;
        const remaining = t.exercises.filter(e2 => e2.supersetGroup === g);
        if (remaining.length <= 1) {
          remaining.forEach(e2 => e2.supersetGroup = null);
        }
      }
    });
  } else {
    // Create new group
    const maxGroup = t.exercises.reduce((max, e) => Math.max(max, e.supersetGroup != null ? e.supersetGroup : -1), -1);
    const newGroup = maxGroup + 1;
    exes.forEach(e => e.supersetGroup = newGroup);
  }
  renderTemplateExercises();
}

function getGroupLabel(exercises, groupIdx) {
  // Determine if a group is a superset (2 exercises) or giant set (3+)
  const groupExercises = exercises.filter(e => e.supersetGroup === groupIdx);
  return groupExercises.length >= 3 ? 'Giant Set' : 'Superset';
}

function addExerciseToTemplate() {
  openAddExerciseModal((ex) => {
    editingTemplate.exercises.push({
      exerciseId: ex.id, name: ex.name, muscle: ex.muscle,
      sets: [{reps:10, weight:0, rest:60, type:'working'}]
    });
    renderTemplateExercises();
  });
}

function addSetToTemplateExercise(i) {
  const last = editingTemplate.exercises[i].sets[editingTemplate.exercises[i].sets.length-1];
  editingTemplate.exercises[i].sets.push({...last, type:'working'});
  renderTemplateExercises();
}

function removeSetFromTemplateExercise(i) {
  if (editingTemplate.exercises[i].sets.length > 1) {
    editingTemplate.exercises[i].sets.pop();
    renderTemplateExercises();
  }
}

function removeTemplateExercise(i) {
  editingTemplate.exercises.splice(i, 1);
  renderTemplateExercises();
}

function moveTemplateExercise(i, dir) {
  const j = i + dir;
  const arr = editingTemplate.exercises;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  renderTemplateExercises();
}

function saveTemplate() {
  if (!editingTemplate.name.trim()) { showToast('Please enter a template name', 'error'); return; }
  if (editingTemplate.exercises.length === 0) { showToast('Add at least one exercise', 'error'); return; }
  const existing = state.templates.findIndex(t => t.id === editingTemplate.id);
  if (existing >= 0) state.templates[existing] = editingTemplate;
  else state.templates.push(editingTemplate);
  saveState();
  closeModal('template-editor-modal');
  renderTemplates();
  showToast('Template saved');
}

// ============================================================
// ADD EXERCISE MODAL
// ============================================================
function openAddExerciseModal(callback, title) {
  const searchInput = document.getElementById('add-ex-search-input');
  const resultsDiv = document.getElementById('add-ex-results');
  const titleEl = document.getElementById('add-ex-title');
  titleEl.textContent = title || 'Add Exercise';

  function renderList(q) {
    const filtered = getAllExercises().filter(e => !q || e.name.toLowerCase().includes(q));
    resultsDiv.innerHTML = filtered.map(e => `
      <div class="exercise-item" onclick="window._addExCallback(${JSON.stringify({id:e.id,name:e.name,muscle:e.muscle}).replace(/"/g,'&quot;')});closeModal('add-exercise-modal')">
        <div class="ex-icon" style="background:${MUSCLE_COLORS[e.muscle]||'var(--green)'}22;color:${MUSCLE_COLORS[e.muscle]||'var(--green)'};font-size:1rem">${MUSCLE_EMOJIS[e.muscle]||'🏋️'}</div>
        <div class="ex-info">
          <div class="ex-name">${esc(e.name)}</div>
          <div class="ex-meta"><span>${esc(e.muscle)}</span><span>•</span><span>${esc(e.equipment)}</span></div>
        </div>
      </div>
    `).join('') + `
      <div class="exercise-item" style="border:1px dashed var(--border2);justify-content:center;color:var(--green);gap:8px" onclick="closeModal('add-exercise-modal');openCustomExerciseModal(function(){openAddExerciseModal(window._addExCallback)})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span class="fw-600 text-sm">New Exercise</span>
      </div>
    `;
  }

  // Remove old listener by replacing the element
  const newInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newInput, searchInput);
  newInput.value = '';
  newInput.addEventListener('input', () => renderList(newInput.value.toLowerCase()));

  window._addExCallback = callback;
  renderList('');
  openModal('add-exercise-modal');
  setTimeout(() => newInput.focus(), 100);
}

// ============================================================
// WIZARD
// ============================================================
let wizardState = { step: 0, split: null, days: 3, equipment: [], length: 30, focus: [] };

function openWizard() {
  wizardState = { step: 0, split: null, days: 3, equipment: [], length: 30, focus: [] };
  renderWizard();
  openModal('wizard-modal');
}

function renderWizard() {
  const s = wizardState.step;
  const totalSteps = 5;
  const progressHTML = Array.from({length:totalSteps}, (_, i) => `<div class="dot ${i<s?'done':i===s?'current':''}"></div>`).join('');

  let content = `<div class="wizard-progress">${progressHTML}</div>`;

  if (s === 0) {
    content += `
      <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:4px">What's your training split?</h3>
      <p class="text-sm text-muted mb-3">Choose a split style or go custom.</p>
      <div class="wizard-options">
        ${SPLIT_TYPES.map(sp => `
          <div class="wizard-option ${wizardState.split===sp.id?'selected':''}" onclick="wizardState.split='${sp.id}';wizardState.days=${sp.days};renderWizard()">
            <div class="wo-icon">${sp.id==='ppl'?'🔄':sp.id==='upper-lower'?'⬆️':sp.id==='full-body'?'🏋️':sp.id==='bro'?'💪':'🎯'}</div>
            <div class="wo-label">${esc(sp.name)}</div>
            <div class="wo-desc">${sp.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (s === 1) {
    content += `
      <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:4px">How many days per week?</h3>
      <p class="text-sm text-muted mb-3">Adjust based on your schedule.</p>
      <div class="flex items-center gap-3 justify-center" style="padding:20px 0">
        <button class="btn btn-secondary" aria-label="Decrease training days" onclick="if(wizardState.days>1){wizardState.days--;renderWizard()}" ${wizardState.days<=1?'disabled':''}>-</button>
        <span style="font-size:2.5rem;font-weight:800;color:var(--green);min-width:60px;text-align:center">${wizardState.days}</span>
        <button class="btn btn-secondary" onclick="if(wizardState.days<7){wizardState.days++;renderWizard()}" ${wizardState.days>=7?'disabled':''}>+</button>
      </div>
      <p class="text-center text-sm text-muted">days per week</p>
    `;
  } else if (s === 2) {
    content += `
      <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:4px">What equipment do you have?</h3>
      <p class="text-sm text-muted mb-3">Select all that apply.</p>
      <div class="wizard-options" style="grid-template-columns:1fr 1fr">
        ${EQUIPMENT_LIST.map(eq => `
          <div class="wizard-option ${wizardState.equipment.includes(eq)?'selected':''}" onclick="toggleArray(wizardState.equipment,'${eq}');renderWizard()">
            <div class="wo-icon">${eq==='Barbell'?'🏋️':eq==='Dumbbell'?'💪':eq==='Cable'?'🔗':eq==='Machine'?'⚙️':'🤸'}</div>
            <div class="wo-label">${eq}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (s === 3) {
    content += `
      <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:4px">Workout length?</h3>
      <p class="text-sm text-muted mb-3">Approximate minutes per session.</p>
      <div class="wizard-options" style="grid-template-columns:1fr 1fr 1fr">
        ${[{v:20,l:'Quick',d:'~20 min'},{v:30,l:'Standard',d:'~30 min'},{v:45,l:'Long',d:'~45 min'},{v:60,l:'Extended',d:'~60 min'},{v:75,l:'Marathon',d:'75+ min'}].map(o => `
          <div class="wizard-option ${wizardState.length===o.v?'selected':''}" onclick="wizardState.length=${o.v};renderWizard()">
            <div class="wo-label">${o.l}</div>
            <div class="wo-desc">${o.d}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (s === 4) {
    content += `
      <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:4px">What's your focus?</h3>
      <p class="text-sm text-muted mb-3">Select all that apply.</p>
      <div class="wizard-options" style="grid-template-columns:1fr 1fr">
        ${[{id:'strength',l:'Strength',d:'Heavy compound lifts'},{id:'hypertrophy',l:'Hypertrophy',d:'Muscle growth'},{id:'endurance',l:'Endurance',d:'Higher reps, shorter rest'},{id:'fat-loss',l:'Fat Loss',d:'Circuit-style, minimal rest'},{id:'power',l:'Power',d:'Explosive movements'},{id:'flexibility',l:'Mobility',d:'Stretching & movement'}].map(o => `
          <div class="wizard-option ${wizardState.focus.includes(o.id)?'selected':''}" onclick="toggleArray(wizardState.focus,'${o.id}');renderWizard()">
            <div class="wo-label">${o.l}</div>
            <div class="wo-desc">${o.d}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  const isFirst = s === 0;
  const isLast = s === totalSteps - 1;

  content += `
    <div class="wizard-nav">
      ${!isFirst ? `<button class="btn btn-secondary" onclick="wizardState.step--;renderWizard()">Back</button>` : '<div></div>'}
      <button class="btn ${isLast?'btn-primary':'btn-primary'}" style="flex:1" onclick="${isLast ? 'generateWizardTemplate()' : 'wizardState.step++;renderWizard()'}">
        ${isLast ? 'Generate Template' : 'Next'}
      </button>
    </div>
  `;

  document.getElementById('wizard-content').innerHTML = `
    <div class="modal-title">
      <span>Workout Wizard</span>
      <button class="icon-btn" aria-label="Close" onclick="closeModal('wizard-modal')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    ${content}
  `;
}

function toggleArray(arr, val) {
  const i = arr.indexOf(val);
  if (i >= 0) arr.splice(i, 1); else arr.push(val);
}

function generateWizardTemplate() {
  const ws = wizardState;
  const split = ws.split || 'full-body';
  const exercises = [];
  const hasEq = eq => ws.equipment.length === 0 || ws.equipment.includes(eq);

  function addEx(id, sets, reps) {
    const e = EXERCISE_CATALOG.find(x => x.id === id);
    if (e) exercises.push({exerciseId: e.id, name: e.name, muscle: e.muscle,
      sets: Array.from({length: sets}, () => ({reps, weight:0, rest: ws.length <= 30 ? 45 : 60, type:'working'}))});
  }

  if (split === 'ppl') {
    // Push
    if (hasEq('Barbell')) addEx('barbell-bench-press', 4, 8);
    if (hasEq('Dumbbell')) addEx('incline-bench-press', 3, 10);
    if (hasEq('Cable')) addEx('cable-fly', 3, 12);
    if (hasEq('Barbell')) addEx('overhead-press', 3, 10);
    if (hasEq('Dumbbell')) addEx('lateral-raise', 3, 15);
    if (hasEq('Cable')) addEx('tricep-pushdown', 3, 12);
  } else if (split === 'upper-lower' || split === 'bro') {
    if (hasEq('Barbell')) addEx('barbell-bench-press', 4, 8);
    if (hasEq('Barbell')) addEx('barbell-row', 4, 8);
    if (hasEq('Barbell')) addEx('overhead-press', 3, 10);
    if (hasEq('Dumbbell')) addEx('hammer-curl', 3, 12);
    if (hasEq('Barbell')) addEx('barbell-back-squat', 4, 8);
    if (hasEq('Barbell')) addEx('romanian-deadlift', 3, 10);
    addEx('leg-press', 3, 12);
    addEx('calf-raise', 3, 15);
  } else {
    // Full body or custom
    if (hasEq('Barbell')) addEx('barbell-bench-press', 3, 10);
    if (hasEq('Barbell')) addEx('barbell-back-squat', 3, 10);
    if (hasEq('Barbell')) addEx('barbell-row', 3, 10);
    if (hasEq('Barbell')) addEx('overhead-press', 3, 10);
    if (hasEq('Dumbbell')) addEx('hammer-curl', 2, 12);
    addEx('plank', 3, 0);
  }

  const template = {
    id: uid(),
    name: `${SPLIT_TYPES.find(s => s.id === split)?.name || 'Custom'} - Generated`,
    exercises
  };

  state.templates.push(template);
  saveState();
  closeModal('wizard-modal');
  renderTemplates();
  showToast('Template generated!');
}

// ============================================================
// ACTIVE WORKOUT
// ============================================================
function startWorkoutFromTemplate(templateId) {
  const t = state.templates.find(x => x.id === templateId);
  if (!t) return;
  state.activeWorkout = {
    id: uid(),
    templateId: t.id,
    name: t.name,
    date: new Date().toISOString(),
    startTime: Date.now(),
    nutrition: t.nutrition || null,
    exercises: t.exercises.map(e => ({
      exerciseId: e.exerciseId,
      name: e.name,
      muscle: e.muscle,
      supersetGroup: e.supersetGroup != null ? e.supersetGroup : null,
      sets: e.sets.map(s => ({
        ...s,
        actualReps: s.reps,
        actualWeight: s.weight,
        completed: false
      }))
    }))
  };
  saveState();
  showView('workout');
  // Show nutrition tip
  if (t.nutrition) {
    showToast(t.nutrition.summary || 'Pre-workout: ' + t.nutrition.pre);
  }
}

function showNutritionInfo() {
  const w = state.activeWorkout;
  if (!w || !w.nutrition) return;
  document.getElementById('nutrition-content').innerHTML = `
    <div class="modal-title">
      <span style="display:flex;align-items:center;gap:6px">🍽️ ${esc(w.name)} — Nutrition Guide</span>
      <button class="icon-btn" aria-label="Close" onclick="closeModal('nutrition-modal')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div style="margin-top:12px;display:flex;flex-direction:column;gap:12px">
      <div style="padding:12px;border-radius:10px;background:linear-gradient(135deg,#1a2e1a,#0f1f0f);border:1px solid #4caf5055">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <span style="font-size:1.1rem">🏃</span>
          <span style="font-weight:600;color:#4caf50;font-size:0.9rem">PRE-WORKOUT — Eat this before:</span>
        </div>
        <div style="font-size:0.85rem;color:var(--text2);line-height:1.5">${w.nutrition.pre}</div>
      </div>
      <div style="padding:12px;border-radius:10px;background:linear-gradient(135deg,#2e1a1a,#1f0f0f);border:1px solid #ff3b5c55">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <span style="font-size:1.1rem">🏁</span>
          <span style="font-weight:600;color:#ff3b5c;font-size:0.9rem">POST-WORKOUT — Eat this after:</span>
        </div>
        <div style="font-size:0.85rem;color:var(--text2);line-height:1.5">${w.nutrition.post}</div>
      </div>
      <div style="padding:10px;border-radius:10px;background:var(--card);border:1px solid var(--border);text-align:center;font-size:0.8rem;color:var(--text2)">
        💧 Don't forget: 16-24 oz of water during your workout. Hydration is not optional.
      </div>
    </div>
  `;
  openModal('nutrition-modal');
}

function startEmptyWorkout() {
  state.activeWorkout = {
    id: uid(), templateId: null, name: 'Workout',
    date: new Date().toISOString(), startTime: Date.now(),
    exercises: []
  };
  saveState();
  showView('workout');
}

function addExerciseToWorkout(exerciseId) {
  if (!state.activeWorkout) {
    state.activeWorkout = {
      id: uid(), templateId: null, name: 'Workout',
      date: new Date().toISOString(), startTime: Date.now(),
      exercises: []
    };
  }
  if (exerciseId) {
    const e = getAllExercises().find(x => x.id === exerciseId);
    if (e && !state.activeWorkout.exercises.find(x => x.exerciseId === e.id)) {
      state.activeWorkout.exercises.push({
        exerciseId: e.id, name: e.name, muscle: e.muscle,
        sets: [{reps:10, weight:0, rest:60, type:'working', actualReps:10, actualWeight:0, completed:false}]
      });
      saveState(); renderWorkout();
    }
  } else {
    openAddExerciseModal((ex) => {
      if (!state.activeWorkout.exercises.find(x => x.exerciseId === ex.id)) {
        const e = EXERCISE_CATALOG.find(x => x.id === ex.id);
        state.activeWorkout.exercises.push({
          exerciseId: ex.id, name: ex.name, muscle: e?.muscle || '',
          sets: [{reps:10, weight:0, rest:60, type:'working', actualReps:10, actualWeight:0, completed:false}]
        });
        saveState(); renderWorkout();
      }
    });
  }
  showView('workout');
}

let workoutTimerInterval = null;
function renderWorkout() {
  const w = state.activeWorkout;
  if (!w) {
    document.getElementById('workout-title').textContent = 'No Active Workout';
    document.getElementById('workout-timer-display').textContent = '';
    document.getElementById('voice-btn').style.display = 'none';
    if (voiceListening) voiceStop();
    document.getElementById('workout-exercises').innerHTML = `
      <div class="empty-state">
        <p>Start a workout from a template or begin empty.</p>
        <div class="flex gap-2" style="justify-content:center">
          <button class="btn btn-primary" onclick="startEmptyWorkout()">Empty Workout</button>
          <button class="btn btn-secondary" onclick="showView('templates')">From Template</button>
        </div>
      </div>`;
    document.getElementById('finish-workout-btn').style.display = 'none';
    document.getElementById('nutrition-btn').style.display = 'none';
    return;
  }

  document.getElementById('finish-workout-btn').style.display = '';
  document.getElementById('nutrition-btn').style.display = w.nutrition ? '' : 'none';
  document.getElementById('voice-btn').style.display = voiceAvailable() ? '' : 'none';
  document.getElementById('workout-title').textContent = w.name;

  // Timer
  if (workoutTimerInterval) clearInterval(workoutTimerInterval);
  const updateTimer = () => {
    const elapsed = Math.floor((Date.now() - w.startTime) / 1000);
    document.getElementById('workout-timer-display').textContent = formatTime(elapsed);
  };
  updateTimer();
  workoutTimerInterval = setInterval(updateTimer, 1000);

  document.getElementById('workout-exercises').innerHTML = w.exercises.map((ex, ei) => {
    const setTypeMap = {};
    SET_TYPES.forEach(st => setTypeMap[st.id] = st);
    const g = ex.supersetGroup;
    const SUPERSET_COLORS = ['var(--purple)','var(--blue)','var(--orange)','var(--red)','#5cf2d4','#f2c85c'];
    // Compute group color
    let barColor = null;
    if (g != null) {
      const groupIds = [...new Set(w.exercises.map(e => e.supersetGroup).filter(x => x != null))].sort();
      const groupIdx = groupIds.indexOf(g);
      barColor = SUPERSET_COLORS[groupIdx % SUPERSET_COLORS.length];
    }
    const isGiantSet = g != null && w.exercises.filter(e => e.supersetGroup === g).length >= 3;
    const groupLabel = g != null ? getGroupLabel(w.exercises, g) : '';
    const supersetLabel = (g != null && (ei === 0 || w.exercises[ei-1].supersetGroup !== g))
      ? `<div class="superset-label" style="color:${barColor};padding:0 12px;margin-top:8px"><span class="sl-dot" style="background:${barColor}"></span>${groupLabel} ${String.fromCharCode(65 + g)}</div>`
      : '';
    const barHtml = barColor ? (isGiantSet ? `<div class="giantset-bar" style="border-color:${barColor}"></div>` : `<div class="superset-bar" style="background:${barColor}"></div>`) : '';
    return `
    ${supersetLabel}
    <div class="workout-ex-block superset-card ${isGiantSet ? 'giant-set-card' : ''}" id="wex-${ei}" style="${barColor ? 'border-color:'+barColor : ''}">
      ${barHtml}
      <div class="workout-ex-header">
        <div>
          <div class="workout-ex-name">${esc(ex.name)}</div>
          <div class="text-xs text-muted">${esc(ex.muscle)}</div>
        </div>
        <div class="flex gap-2">
          <button class="icon-btn" onclick="removeWorkoutExercise(${ei})" title="Remove"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
      </div>
      <div class="set-headers" style="padding-left:12px;padding-right:12px">
        <span>#</span><span>Reps</span><span>Weight</span><span>Rest</span><span style="text-align:right">Done</span>
      </div>
      <div class="workout-ex-sets">
        ${ex.sets.map((s, si) => `
          <div class="set-row">
            <div class="set-num" style="color:${setTypeMap[s.type]?.color || 'var(--text3)'}" title="${setTypeMap[s.type]?.name || 'Working'}">${si+1}</div>
            <input class="set-input" type="number" value="${s.actualReps||''}" placeholder="Reps" onchange="updateWorkoutSet(${ei},${si},'actualReps',this.value)">
            <input class="set-input" type="number" value="${s.actualWeight||''}" placeholder="lbs" onchange="updateWorkoutSet(${ei},${si},'actualWeight',this.value)">
            <input class="set-input" type="number" value="${s.rest||''}" placeholder="s" onchange="updateWorkoutSet(${ei},${si},'rest',this.value)">
            <button class="set-check ${s.completed?'done':''}" onclick="toggleWorkoutSet(${ei},${si})">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <div class="set-ctl-row">
              <select class="set-type-select" style="color:${(setTypeMap[s.type]||setTypeMap.working).color};border-color:${(setTypeMap[s.type]||setTypeMap.working).color}44" onchange="changeWorkoutSetType(${ei},${si},this.value)" title="Set type">
                ${SET_TYPES.map(st => `<option value="${st.id}" ${s.type===st.id?'selected':''}>${st.name}</option>`).join('')}
              </select>
              <button class="set-move-btn" onclick="moveWorkoutSet(${ei},${si},-1)" ${si===0?'disabled':''} title="Move up" aria-label="Move set up">↑</button>
              <button class="set-move-btn" onclick="moveWorkoutSet(${ei},${si},1)" ${si===ex.sets.length-1?'disabled':''} title="Move down" aria-label="Move set down">↓</button>
              <button class="set-del-btn" onclick="deleteWorkoutSet(${ei},${si})" title="Delete set">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `).join('')}
        <div style="padding:8px 12px">
          <div class="flex gap-2" style="flex-wrap:wrap;margin-bottom:8px">
            ${SET_TYPES.map(st => `<button class="set-type-btn" onclick="addSetToWorkout(${ei},'${st.id}')" style="border-color:${st.color}33;color:${st.color}">+ ${st.name}</button>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `}).join('');
}

function updateWorkoutSet(ei, si, field, val) {
  if (!state.activeWorkout) return;
  state.activeWorkout.exercises[ei].sets[si][field] = parseFloat(val) || 0;
  saveState();
}

function toggleWorkoutSet(ei, si) {
  if (!state.activeWorkout) return;
  const set = state.activeWorkout.exercises[ei].sets[si];
  const wasCompleted = set.completed;
  set.completed = !set.completed;
  saveState();
  renderWorkout();
  if (set.completed && set.rest > 0) {
    startRestTimer(set.rest);
    const ex = state.activeWorkout.exercises[ei];
    const isLastSet = si === ex.sets.length - 1;
    if (isLastSet) {
      lastSetPromptTimeout = setTimeout(() => {
        if (timerInterval) {
          openConfirm('Rest Timer', 'Stop the timer?', () => { skipTimer(); });
        }
      }, 5000);
    }
  }
}

function addSetToWorkout(ei, typeId) {
  if (!state.activeWorkout) return;
  const last = state.activeWorkout.exercises[ei].sets[state.activeWorkout.exercises[ei].sets.length - 1];
  state.activeWorkout.exercises[ei].sets.push({
    reps: last?.reps || 10, weight: last?.weight || 0, rest: last?.rest || 60,
    type: typeId, actualReps: last?.actualReps || 10, actualWeight: last?.actualWeight || 0, completed: false
  });
  saveState(); renderWorkout();
}

function changeWorkoutSetType(ei, si, typeId) {
  if (!state.activeWorkout) return;
  const set = state.activeWorkout?.exercises?.[ei]?.sets?.[si];
  if (!set || !SET_TYPE_IDS.has(typeId)) return;
  set.type = typeId;
  saveState(); renderWorkout();
}

function moveWorkoutSet(ei, si, dir) {
  if (!state.activeWorkout) return;
  const sets = state.activeWorkout?.exercises?.[ei]?.sets;
  if (!sets) return;
  const to = si + dir;
  if (to < 0 || to >= sets.length) return;
  [sets[si], sets[to]] = [sets[to], sets[si]];
  saveState(); renderWorkout();
}

function deleteWorkoutSet(ei, si) {
  if (!state.activeWorkout) return;
  const ex = state.activeWorkout.exercises[ei];
  if (!ex || !ex.sets?.[si]) return;
  if (ex.sets.length <= 1) {
    openConfirm('Delete Set', `This is the only set for ${esc(ex.name)}. Delete the whole exercise?`, () => removeWorkoutExercise(ei));
    return;
  }
  openConfirm('Delete Set', 'Delete this set?', () => {
    ex.sets.splice(si, 1);
    saveState(); renderWorkout();
  });
}

function removeWorkoutExercise(ei) {
  if (!state.activeWorkout) return;
  state.activeWorkout.exercises.splice(ei, 1);
  saveState(); renderWorkout();
}

function finishWorkout() {
  if (!state.activeWorkout) return;
  const w = state.activeWorkout;
  const completedSets = w.exercises.reduce((s, e) => s + e.sets.filter(s2 => s2.completed).length, 0);
  if (completedSets === 0) {
    openConfirm('Discard Workout', 'No sets completed. Discard this workout?', () => {
      state.activeWorkout = null;
      saveState(); showView('dashboard');
    });
    return;
  }
  w.endTime = Date.now();
  w.duration = w.endTime - w.startTime;
  state.workouts.push(JSON.parse(JSON.stringify(w)));
  state.activeWorkout = null;
  saveState();
  if (voiceListening) voiceStop();
  showView('dashboard');
  showToast(`Workout complete! ${completedSets} sets logged.`);
}

// ============================================================
// REST TIMER
// ============================================================
let timerInterval = null;
let timerTotal = 0;
let timerRemaining = 0;
let lastSetPromptTimeout = null;
const CIRCUMFERENCE = 2 * Math.PI * 100;

function startRestTimer(seconds) {
  if (lastSetPromptTimeout) { clearTimeout(lastSetPromptTimeout); lastSetPromptTimeout = null; }
  timerTotal = seconds;
  timerRemaining = seconds;
  document.getElementById('timer-overlay').classList.add('active');
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timerRemaining--;
    updateTimerDisplay();
    if (timerRemaining <= 0) skipTimer();
  }, 1000);
}

function updateTimerDisplay() {
  document.getElementById('timer-time').textContent = formatTime(Math.max(0, timerRemaining));
  const progress = 1 - (timerRemaining / timerTotal);
  document.getElementById('timer-progress').setAttribute('stroke-dashoffset', CIRCUMFERENCE * progress);
}

function skipTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  if (lastSetPromptTimeout) { clearTimeout(lastSetPromptTimeout); lastSetPromptTimeout = null; }
  document.getElementById('timer-overlay').classList.remove('active');
}

function timerAdd(sec) { timerRemaining += sec; timerTotal += sec; updateTimerDisplay(); }
function timerSubtract(sec) { timerRemaining = Math.max(1, timerRemaining - sec); timerTotal = Math.max(timerTotal, timerRemaining); updateTimerDisplay(); }

// ============================================================
// VOICE COMMANDS (set / rep logging)
// ============================================================
let voiceRecognition = null;
let voiceListening = false;
let voiceFlashTimer = null;
let voiceRestartTimer = null;

function getVoiceSetting(key) {
  return !(state.settings && state.settings[key] === false);
}

function setVoiceSetting(key, val) {
  state.settings = state.settings || {};
  state.settings[key] = val;
  saveState();
  const el = document.getElementById(key === 'voiceEnabled' ? 'voice-enabled' : 'voice-speak');
  if (el) el.checked = val;
}

function renderVoiceSettings() {
  const en = document.getElementById('voice-enabled');
  const sp = document.getElementById('voice-speak');
  if (en) en.checked = getVoiceSetting('voiceEnabled');
  if (sp) sp.checked = getVoiceSetting('voiceSpeak');
}

function voiceAvailable() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function voiceStart() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    voiceFlash('Voice not supported in this browser', 'err');
    return;
  }
  if (!getVoiceSetting('voiceEnabled')) {
    voiceFlash('Enable voice in Settings first', 'err');
    return;
  }
  if (!state.activeWorkout) {
    voiceFlash('Start a workout first', 'err');
    return;
  }
  if (voiceListening) return;
  voiceListening = true;
  voiceRecognition = new SR();
  voiceRecognition.lang = 'en-US';
  voiceRecognition.continuous = true;
  voiceRecognition.interimResults = false;
  voiceRecognition.maxAlternatives = 3;

  voiceRecognition.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) transcript = e.results[i][0].transcript;
    }
    if (transcript) handleVoiceCommand(transcript);
  };

  voiceRecognition.onerror = (e) => {
    console.warn('[Voice] Recognition error:', e.error);
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      voiceStop();
      voiceFlash('Microphone permission denied', 'err');
    } else if (e.error !== 'no-speech') {
      voiceStop();
      voiceFlash('Voice error: ' + e.error, 'err');
    }
  };

  voiceRecognition.onend = () => {
    // Browsers (esp. iOS Safari) stop recognition after a while; restart to stay live.
    if (voiceListening) {
      voiceRestartTimer = setTimeout(() => {
        if (voiceListening && voiceRecognition) {
          try { voiceRecognition.start(); } catch(_) {}
        }
      }, 250);
    }
  };

  try {
    voiceRecognition.start();
    updateVoiceButton();
    voiceFlash('Listening… say "ten reps", "done", "skip"', 'muted');
  } catch(e) {
    voiceListening = false;
    console.error('[Voice] start error:', e);
    voiceFlash('Could not start voice', 'err');
  }
}

function voiceStop() {
  if (voiceRestartTimer) { clearTimeout(voiceRestartTimer); voiceRestartTimer = null; }
  voiceListening = false;
  if (voiceRecognition) {
    try { voiceRecognition.onend = null; voiceRecognition.stop(); } catch(_) {}
    voiceRecognition = null;
  }
  updateVoiceButton();
  hideVoiceFlash();
}

function toggleVoice() {
  if (voiceListening) voiceStop();
  else voiceStart();
}

function updateVoiceButton() {
  const btn = document.getElementById('voice-btn');
  if (btn) btn.classList.toggle('listening', voiceListening);
}

function voiceFlash(text, type) {
  const el = document.getElementById('voice-flash');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('muted', 'err');
  if (type === 'muted') el.classList.add('muted');
  if (type === 'err') el.classList.add('err');
  el.classList.add('show');
  if (voiceFlashTimer) clearTimeout(voiceFlashTimer);
  voiceFlashTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

function hideVoiceFlash() {
  const el = document.getElementById('voice-flash');
  if (el) el.classList.remove('show');
}

function speakConfirm(text, force) {
  if (!force && !getVoiceSetting('voiceSpeak')) return;
  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    }
  } catch(e) {}
}

function testVoice() {
  if (!window.speechSynthesis && !voiceAvailable()) {
    voiceFlash('Speech not supported', 'err');
    return;
  }
  speakConfirm('Voice commands ready. Say ten reps, done, or skip.', true);
  voiceFlash('Testing voice…', 'muted');
}

function parseSpokenNumber(text) {
  const wordMap = {zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1000};
  const tokens = String(text || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const digitTokens = tokens.filter(t => /^\d+$/.test(t));
  if (digitTokens.length) {
    if (tokens.every(t => /^\d+$/.test(t)) && tokens.length <= 4) return parseInt(tokens.join(''), 10);
    return parseInt(digitTokens[0], 10);
  }
  let total = 0, current = 0, hasNumber = false;
  for (const tok of tokens) {
    const v = wordMap[tok];
    if (v === undefined) continue;
    hasNumber = true;
    if (v === 100) {
      current = (current || 1) * 100;
    } else if (v === 1000) {
      total += (current || 1) * 1000;
      current = 0;
    } else if (v >= 20 && v <= 90 && current > 0 && current < 10) {
      current = current * 100 + v;   // "one thirty five" → 135
    } else {
      current += v;
    }
  }
  return hasNumber ? total + current : null;
}

function firstUncompletedSet(ex) {
  if (!ex || !Array.isArray(ex.sets)) return -1;
  for (let si = 0; si < ex.sets.length; si++) {
    if (!ex.sets[si].completed) return si;
  }
  return -1;
}

function findVoicePosition() {
  const w = state.activeWorkout;
  if (!w) return null;
  for (let ei = 0; ei < w.exercises.length; ei++) {
    const si = firstUncompletedSet(w.exercises[ei]);
    if (si >= 0) return { ei, si };
  }
  return null;
}

function scrollToExercise(ei) {
  const el = document.getElementById('wex-' + ei);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.style.outline = '2px solid var(--green)';
    setTimeout(() => { el.style.outline = 'none'; }, 1500);
  }
}

function handleVoiceCommand(raw) {
  const t = String(raw || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return;
  console.log('[Voice] Command:', t);

  // Timer control
  if (timerInterval && /\b(skip|stop|dismiss|clear|done with rest)\b/.test(t)) {
    skipTimer();
    voiceFlash('Timer skipped');
    speakConfirm('Timer skipped');
    return;
  }
  if (!timerInterval && /\b(skip|stop)\b/.test(t)) return;

  const w = state.activeWorkout;
  if (!w) return;

  // Next exercise
  if (/\bnext\s+ex(ercise)?\b|\bchange\s+ex(ercise)?\b|\bmove\s+on\b/.test(t)) {
    const cur = findVoicePosition();
    const startEx = cur ? cur.ei : -1;
    for (let ei = startEx + 1; ei < w.exercises.length; ei++) {
      if (firstUncompletedSet(w.exercises[ei]) >= 0) {
        scrollToExercise(ei);
        voiceFlash('Now: ' + w.exercises[ei].name);
        speakConfirm(w.exercises[ei].name);
        return;
      }
    }
    voiceFlash('No more exercises');
    speakConfirm('No more exercises');
    return;
  }

  // Add a set to the current exercise
  if (/\b(add|another|extra|new)\s+(?:a\s+)?set\b/.test(t)) {
    const pos = findVoicePosition();
    if (pos) {
      addSetToWorkout(pos.ei, 'working');
      voiceFlash('Set added');
      speakConfirm('Set added');
    }
    return;
  }

  // Rest timer
  if (/\brest\b/.test(t)) {
    const n = parseSpokenNumber(t);
    if (n) {
      startRestTimer(n);
      voiceFlash('Rest ' + n + 's');
      speakConfirm('Rest ' + n + ' seconds');
      return;
    }
  }

  // Weight
  if (/\bweight\b|\bpounds?\b|\blbs?\b/.test(t)) {
    const n = parseSpokenNumber(t);
    const pos = findVoicePosition();
    if (n !== null && pos) {
      updateWorkoutSet(pos.ei, pos.si, 'actualWeight', n);
      renderWorkout();
      voiceFlash('Weight ' + n);
      speakConfirm(n + ' pounds');
      return;
    }
  }

  // Complete current set
  if (/\b(done|complete|completed|finished|finish|got it|good)\b|\bnext\b/.test(t)) {
    const pos = findVoicePosition();
    if (!pos) {
      voiceFlash('Workout complete!');
      speakConfirm('Workout complete');
      return;
    }
    const ex = w.exercises[pos.ei];
    toggleWorkoutSet(pos.ei, pos.si);
    voiceFlash(ex.name + ' — Set ' + (pos.si + 1) + ' done');
    speakConfirm('Set ' + (pos.si + 1) + ' complete');
    return;
  }

  // Reps: bare number → log reps, complete the set, advance to next
  const n = parseSpokenNumber(t);
  if (n !== null) {
    const pos = findVoicePosition();
    if (!pos) {
      voiceFlash('Workout complete!');
      speakConfirm('Workout complete');
      return;
    }
    const ex = w.exercises[pos.ei];
    updateWorkoutSet(pos.ei, pos.si, 'actualReps', n);
    toggleWorkoutSet(pos.ei, pos.si);
    voiceFlash(ex.name + ' — Set ' + (pos.si + 1) + ': ' + n + ' reps');
    speakConfirm('Set ' + (pos.si + 1) + ', ' + n + ' reps');
    return;
  }

  voiceFlash('Not recognized: "' + raw.trim() + '"', 'err');
}

// ============================================================
// MEASUREMENTS
// ============================================================
function renderMeasurements() {
  document.getElementById('measurement-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('measurement-fields').innerHTML = MEASUREMENT_FIELDS.map(f => `
    <div class="measurement-row">
      <span class="measurement-label">${f.name}</span>
      <div class="flex items-center">
        <input class="measurement-input" type="number" step="0.1" id="mf-${f.id}" placeholder="—">
        <span class="measurement-unit">${f.unit}</span>
      </div>
    </div>
  `).join('');

  const history = [...state.measurements].reverse();
  if (history.length === 0) {
    document.getElementById('measurement-history').innerHTML = `<p class="text-sm text-muted text-center" style="padding:20px">No measurements logged yet.</p>`;
  } else {
    document.getElementById('measurement-history').innerHTML = history.map((m, idx) => {
      const prev = idx < history.length - 1 ? history[idx + 1] : null;
      return `
      <div class="card">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm fw-600">${formatDate(m.date)}</span>
          <button class="icon-btn" style="color:var(--red)" onclick="deleteMeasurement('${m.id}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          ${MEASUREMENT_FIELDS.filter(f => m.values[f.id]).map(f => {
            const trend = getMeasurementTrend(f.id, m, prev);
            return `<div class="measurement-field-row">
              <span class="text-xs text-muted">${f.name}</span>
              <div class="flex items-center gap-2">
                <span style="color:var(--text);font-size:0.85rem;font-weight:500">${m.values[f.id]} ${f.unit}</span>
                ${trend}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');
  }
}

// Trend direction: lower is better for weight/bodyFat/waist; higher is better for everything else
const LOWER_IS_BETTER = ['weight', 'bodyFat', 'waist'];
function getMeasurementTrend(fieldId, current, previous) {
  if (!previous || !previous.values[fieldId] || !current.values[fieldId]) return '';
  const curr = current.values[fieldId];
  const prev = previous.values[fieldId];
  const diff = curr - prev;
  if (diff === 0) return '<span class="trend-badge flat">= 0</span>';
  const isGood = LOWER_IS_BETTER.includes(fieldId) ? diff < 0 : diff > 0;
  const arrow = diff > 0 ? '↑' : '↓';
  const sign = diff > 0 ? '+' : '';
  const pct = prev !== 0 ? ((diff / prev) * 100).toFixed(1) : '';
  return `<span class="trend-badge ${isGood ? 'up' : 'down'}">${arrow} ${sign}${diff.toFixed(1)}${pct ? ' (' + (diff > 0 ? '+' : '') + pct + '%)' : ''}</span>`;
}

function saveMeasurement() {
  const date = document.getElementById('measurement-date').value;
  if (!date) { showToast('Please select a date', 'error'); return; }
  const values = {};
  MEASUREMENT_FIELDS.forEach(f => {
    const v = parseFloat(document.getElementById('mf-' + f.id).value);
    if (!isNaN(v) && v > 0) values[f.id] = v;
  });
  if (Object.keys(values).length === 0) { showToast('Enter at least one measurement', 'error'); return; }
  state.measurements.push({id: uid(), date: date, values});
  saveState();
  renderMeasurements();
  showToast('Measurements saved');
}

function deleteMeasurement(id) {
  openConfirm('Delete', 'Delete these measurements?', () => {
    state.measurements = state.measurements.filter(m => m.id !== id);
    saveState(); renderMeasurements(); showToast('Deleted');
  });
}

// ============================================================
// CUSTOM EXERCISES
// ============================================================
function openCustomExerciseModal(onSaveCallback) {
  window._customExCallback = onSaveCallback || null;
  document.getElementById('custom-exercise-content').innerHTML = `
    <div class="modal-title">
      <span>Add Custom Exercise</span>
      <button class="icon-btn" aria-label="Close" onclick="closeModal('custom-exercise-modal')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div class="custom-ex-form">
      <div class="form-group">
        <label class="form-label">Exercise Name *</label>
        <div class="ex-autocomplete">
          <input class="form-input" type="text" id="custom-ex-name" placeholder="Start typing to search 300+ exercises..." autocomplete="off">
          <div class="ex-autocomplete-list" id="ex-ac-list"></div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Muscle Group *</label>
          <select class="form-select" id="custom-ex-muscle">
            ${MUSCLE_GROUPS.map(m => `<option value="${m}">${MUSCLE_EMOJIS[m]||''} ${m}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Equipment *</label>
          <select class="form-select" id="custom-ex-equipment">
            ${EQUIPMENT_LIST.map(e => `<option value="${e}">${e}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Form Tips (one per line)</label>
        <textarea class="form-input" id="custom-ex-tips" rows="3" placeholder="Step 1: ...\nStep 2: ...\nStep 3: ..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Pro Tip (optional)</label>
        <input class="form-input" type="text" id="custom-ex-protip" placeholder="Advanced tip for this exercise...">
      </div>
      <button class="btn btn-primary btn-block mt-2" onclick="saveCustomExercise()">Save Exercise</button>
    </div>
  `;
  openModal('custom-exercise-modal');
  initExerciseAutocomplete();
}

let acIndex = -1;
function initExerciseAutocomplete() {
  const input = document.getElementById('custom-ex-name');
  const list = document.getElementById('ex-ac-list');
  if (!input || !list) return;
  acIndex = -1;

  function renderSuggestions(q) {
    if (!q || q.length < 1) { list.classList.remove('open'); list.innerHTML = ''; return; }
    const matches = EXERCISE_DB.filter(e => e[0].toLowerCase().includes(q.toLowerCase())).slice(0, 10);
    if (matches.length === 0) { list.classList.remove('open'); list.innerHTML = ''; return; }
    list.innerHTML = '<div class="ex-autocomplete-hint">' + matches.length + ' matches — tap to autofill</div>' +
      matches.map((e, i) => `
        <div class="ex-autocomplete-item" data-idx="${i}" onmousedown="selectExerciseAC(${i})">
          <span class="fw-600">${highlightMatch(e[0], q)}</span>
          <span class="aai-muscle">${e[1]}</span>
          <span class="aai-equip">${e[2]}</span>
        </div>
      `).join('');
    list.classList.add('open');
    window._acMatches = matches;
    acIndex = -1;
  }

  function highlightMatch(name, q) {
    const idx = name.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return name;
    return name.substring(0, idx) + '<span style="color:var(--green)">' + name.substring(idx, idx + q.length) + '</span>' + name.substring(idx + q.length);
  }

  input.oninput = () => { renderSuggestions(input.value.trim()); };
  input.onkeydown = (e) => {
    const items = list.querySelectorAll('.ex-autocomplete-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); acIndex = Math.min(acIndex + 1, items.length - 1); updateACActive(items); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); acIndex = Math.max(acIndex - 1, 0); updateACActive(items); }
    else if (e.key === 'Enter' && acIndex >= 0) { e.preventDefault(); selectExerciseAC(acIndex); }
    else if (e.key === 'Escape') { list.classList.remove('open'); }
  };
  input.onblur = () => { setTimeout(() => list.classList.remove('open'), 150); };
  input.onfocus = () => { if (input.value.trim()) renderSuggestions(input.value.trim()); };

  function updateACActive(items) {
    items.forEach((it, i) => it.classList.toggle('active', i === acIndex));
    if (acIndex >= 0 && items[acIndex]) items[acIndex].scrollIntoView({ block: 'nearest' });
  }
}

function selectExerciseAC(idx) {
  const match = window._acMatches ? window._acMatches[idx] : null;
  if (!match) return;
  const input = document.getElementById('custom-ex-name');
  const muscleSelect = document.getElementById('custom-ex-muscle');
  const equipSelect = document.getElementById('custom-ex-equipment');
  input.value = match[0];
  // Auto-select muscle group
  for (let i = 0; i < muscleSelect.options.length; i++) {
    if (muscleSelect.options[i].value === match[1]) { muscleSelect.selectedIndex = i; break; }
  }
  // Auto-select equipment
  for (let i = 0; i < equipSelect.options.length; i++) {
    if (equipSelect.options[i].value === match[2]) { equipSelect.selectedIndex = i; break; }
  }
  const list = document.getElementById('ex-ac-list');
  if (list) list.classList.remove('open');
}

function saveCustomExercise() {
  const name = document.getElementById('custom-ex-name').value.trim();
  if (!name) { showToast('Enter an exercise name', 'error'); return; }
  const muscle = document.getElementById('custom-ex-muscle').value;
  const equipment = document.getElementById('custom-ex-equipment').value;
  const tipsRaw = document.getElementById('custom-ex-tips').value.trim();
  const tips = tipsRaw ? tipsRaw.split('\n').map(t => t.trim()).filter(Boolean) : [];
  const proTip = document.getElementById('custom-ex-protip').value.trim();

  const exercise = {
    id: 'custom-' + uid(),
    name,
    muscle,
    equipment,
    tips,
    proTip: proTip || '',
    custom: true
  };

  if (!state.customExercises) state.customExercises = [];
  state.customExercises.push(exercise);
  saveState();
  closeModal('custom-exercise-modal');
  if (window._customExCallback) {
    window._customExCallback(exercise);
    window._customExCallback = null;
  } else {
    renderExercises();
  }
  showToast(name + ' added to catalog');
}

function deleteCustomExercise(id) {
  openConfirm('Delete Exercise', 'Remove this custom exercise from your catalog?', () => {
    state.customExercises = (state.customExercises || []).filter(e => e.id !== id);
    saveState();
    closeModal('exercise-detail-modal');
    renderExercises();
    showToast('Exercise deleted');
  });
}

// ============================================================
// HISTORY
// ============================================================
function renderHistory() {
  if (state.workouts.length === 0) {
    document.getElementById('history-list').innerHTML = `<div class="empty-state"><p>No workout history yet.</p></div>`;
    return;
  }
  const sorted = [...state.workouts].reverse();
  document.getElementById('history-list').innerHTML = sorted.map(w => {
    const v = workoutVolume(w);
    const sets = w.exercises.reduce((s,e) => s + e.sets.filter(s2 => s2.completed).length, 0);
    const dur = w.duration ? Math.floor(w.duration / 1000) : 0;
    const hr = getHeartRateForWorkout(w);
    return `<div class="history-item" onclick="viewWorkoutDetail('${w.id}')" style="cursor:pointer">
      <div class="hi-date">${formatDate(w.date)}</div>
      <div class="hi-title">${w.name || 'Workout'}</div>
      <div class="hi-stats">
        <span>${w.exercises.length} exercises</span>
        <span>${sets} sets</span>
        <span>${v.toLocaleString()} lbs vol</span>
        ${dur ? `<span>${formatTime(dur)}</span>` : ''}
        ${hr ? `<span style="color:#ff3b5c">♥ ${hr.avg} bpm</span>` : ''}
      </div>
      <div class="hi-exercises">${w.exercises.map(e => e.name).join(', ')}</div>
    </div>`;
  }).join('');
}

function viewWorkoutDetail(id) {
  const w = state.workouts.find(x => x.id === id);
  if (!w) return;
  const v = workoutVolume(w);
  const hr = getHeartRateForWorkout(w);
  const calories = estimateCalories(w.exercises, w.duration ? Math.floor(w.duration / 1000) : 0);
  document.getElementById('exercise-detail-content').innerHTML = `
    <div class="modal-title">
      <span>${w.name || 'Workout'}</span>
      <button class="icon-btn" aria-label="Close" onclick="closeModal('exercise-detail-modal')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div class="text-sm text-muted mb-3">${formatDate(w.date)}${w.duration ? ' • ' + formatTime(Math.floor(w.duration/1000)) : ''}</div>
    <div class="stat-grid mb-3">
      <div class="stat-card"><div class="stat-value">${w.exercises.length}</div><div class="stat-label">Exercises</div></div>
      <div class="stat-card"><div class="stat-value">${w.exercises.reduce((s,e)=>s+e.sets.filter(s2=>s2.completed).length,0)}</div><div class="stat-label">Sets</div></div>
      <div class="stat-card"><div class="stat-value" style="font-size:1.2rem">${(v/1000).toFixed(1)}k</div><div class="stat-label">Volume</div></div>
      <div class="stat-card"><div class="stat-value">${calories}</div><div class="stat-label">Est. Calories</div></div>
    </div>
    ${hr ? `
    <div class="card" style="background:linear-gradient(135deg,#1a0a0a,#2a0f1a);border:1px solid #ff3b5c33;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff3b5c" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span style="font-size:0.85rem;font-weight:600;color:#ff3b5c">Heart Rate</span>
      </div>
      <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);gap:6px">
        <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700;color:#ff3b5c">${hr.avg}</div><div style="font-size:0.65rem;color:#ff3b5c99">AVG BPM</div></div>
        <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700;color:#ff3b5c">${hr.max}</div><div style="font-size:0.65rem;color:#ff3b5c99">MAX BPM</div></div>
        <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700;color:#ff3b5c">${hr.min}</div><div style="font-size:0.65rem;color:#ff3b5c99">MIN BPM</div></div>
      </div>
      <div style="margin-top:8px;height:40px;display:flex;align-items:end;gap:1px">
        ${hr.samples.map(bpm => {
          const h = Math.max(4, Math.round((bpm / hr.max) * 36));
          return '<div style="flex:1;background:#ff3b5c;border-radius:2px 2px 0 0;height:' + h + 'px;opacity:0.7"></div>';
        }).join('')}
      </div>
    </div>` : ''}
    ${w.nutrition ? `
    <div class="card" style="background:linear-gradient(135deg,#1a2e1a,#0f1f0f);border:1px solid #4caf5055;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:1rem">🍽️</span>
        <span style="font-size:0.85rem;font-weight:600;color:#4caf50">Nutrition Guide</span>
      </div>
      <div style="font-size:0.78rem;color:var(--text2);line-height:1.5">
        <div><b style="color:#4caf50">🏃 Pre:</b> ${w.nutrition.pre}</div>
        <div style="margin-top:6px"><b style="color:#ff3b5c">🏁 Post:</b> ${w.nutrition.post}</div>
      </div>
    </div>` : ''}
    ${w.exercises.map((e, ei) => {
      const g = e.supersetGroup;
      const SUPERSET_COLORS = ['var(--purple)','var(--blue)','var(--orange)','var(--red)','#5cf2d4','#f2c85c'];
      let barColor = null;
      if (g != null) {
        const groupIds = [...new Set(w.exercises.map(x => x.supersetGroup).filter(x => x != null))].sort();
        barColor = SUPERSET_COLORS[groupIds.indexOf(g) % SUPERSET_COLORS.length];
      }
      const isGiantSet = g != null && w.exercises.filter(ex => ex.supersetGroup === g).length >= 3;
      const groupLabel = g != null ? getGroupLabel(w.exercises, g) : '';
      const supersetLabel = (g != null && (ei === 0 || w.exercises[ei-1].supersetGroup !== g))
        ? `<div class="superset-label" style="color:${barColor};margin-top:10px"><span class="sl-dot" style="background:${barColor}"></span>${groupLabel} ${String.fromCharCode(65 + g)}</div>`
        : '';
      return `
      ${supersetLabel}
      <div class="mb-2" style="${barColor ? 'border-left:' + (isGiantSet ? '3px dashed ' : '3px solid ') + barColor + ';padding-left:8px;margin-left:4px' : ''}">
        <div class="fw-600 text-sm mb-2">${esc(e.name)} <span class="text-muted text-xs">${esc(e.muscle)}</span></div>
        ${e.sets.map((s, si) => `
          <div class="flex justify-between text-xs" style="padding:4px 0;border-bottom:1px solid var(--border);${s.completed?'':'opacity:0.4'}">
            <span class="text-muted">Set ${si+1}</span>
            <span>${s.actualReps||0} reps × ${s.actualWeight||0} lbs</span>
            <span>${s.completed ? '✓' : '—'}</span>
          </div>
        `).join('')}
      </div>
    `}).join('')}
    <button class="btn btn-danger btn-block btn-sm mt-3" onclick="deleteWorkout('${w.id}')">Delete Workout</button>
  `;
  openModal('exercise-detail-modal');
}

function deleteWorkout(id) {
  openConfirm('Delete Workout', 'Are you sure?', () => {
    state.workouts = state.workouts.filter(w => w.id !== id);
    saveState(); closeModal('exercise-detail-modal'); renderHistory(); showToast('Workout deleted');
  });
}

// ============================================================
// HEART RATE DATA
// ============================================================
function importHeartRateData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.heartRateSamples || !Array.isArray(data.heartRateSamples)) {
        showToast('Invalid heart rate file format', 'error'); return;
      }
      // Merge with existing data, dedupe by timestamp
      const existing = new Map((state.heartRateData || []).map(s => [s.date, s]));
      data.heartRateSamples.forEach(s => existing.set(s.date, s));
      state.heartRateData = [...existing.values()].sort((a,b) => new Date(a.date) - new Date(b.date));
      saveState();
      showToast(`Imported ${data.heartRateSamples.length} heart rate samples`);
      renderHistory();
    } catch(err) { showToast('Failed to parse heart rate file', 'error'); }
  };
  reader.readAsText(file);
}

function getHeartRateForWorkout(workout) {
  if (!state.heartRateData || state.heartRateData.length === 0 || !workout.date) return null;
  const start = new Date(workout.date).getTime();
  const end = workout.duration ? start + workout.duration : start + 3600000;
  const samples = state.heartRateData.filter(s => {
    const t = new Date(s.date).getTime();
    return t >= start && t <= end && s.bpm > 0;
  });
  if (samples.length === 0) return null;
  const bpms = samples.map(s => s.bpm);
  return {
    avg: Math.round(bpms.reduce((a,b) => a+b, 0) / bpms.length),
    min: Math.min(...bpms),
    max: Math.max(...bpms),
    samples: bpms,
    count: bpms.length
  };
}

// ============================================================
// CSV EXPORT/IMPORT
// ============================================================
function exportWorkouts() {
  if (state.workouts.length === 0) { showToast('No workouts to export', 'error'); return; }
  let csv = 'Date,Name,Exercises,Completed Sets,Total Volume (lbs)\n';
  state.workouts.forEach(w => {
    const sets = w.exercises.reduce((s,e) => s + e.sets.filter(s2=>s2.completed).length, 0);
    const vol = w.exercises.reduce((s,e) => s + e.sets.reduce((ss,s2) => ss + (s2.completed?(s2.actualReps||0)*(s2.actualWeight||0):0), 0), 0);
    csv += `"${w.date}","${(w.name||'').replace(/"/g,'""')}","${w.exercises.map(e=>e.name).join('; ')}",${sets},${vol}\n`;
  });
  downloadCSV(csv, 'workouts.csv');
  showToast('Workouts exported');
}

// MET values by muscle group (Compendium of Physical Activities)
// Compound lifts get higher METs; isolation exercises lower
const MET_VALUES = {
  'Chest': 5.0, 'Back': 5.0, 'Legs': 6.0, 'Shoulders': 4.5,
  'Arms': 4.0, 'Core': 4.0, 'Traps': 4.5, 'Full Body': 6.0, 'default': 5.0
};

function estimateCalories(exercises, durationSec) {
  // Use body weight from settings (default 180 lbs / 81.6 kg)
  const weightKg = (state.settings.bodyWeight || 180) * 0.453592;
  const durationHr = durationSec / 3600;
  // Calculate weighted average MET based on completed sets per muscle group
  let totalMetTime = 0;
  let totalSets = 0;
  exercises.forEach(ex => {
    const completedSets = ex.sets.filter(s => s.completed);
    const met = MET_VALUES[ex.muscle] || MET_VALUES['default'];
    // Weight compound exercises higher (heavier sets = more effort)
    const avgWeight = completedSets.reduce((s, set) => s + (set.actualWeight ?? set.weight ?? 0), 0) / (completedSets.length || 1);
    const weightMultiplier = avgWeight > 100 ? 1.15 : avgWeight > 50 ? 1.0 : 0.85;
    totalMetTime += met * weightMultiplier * completedSets.length;
    totalSets += completedSets.length;
  });
  const avgMet = totalSets > 0 ? totalMetTime / totalSets : 5.0;
  // Calories = MET × body weight (kg) × duration (hours)
  return Math.round(avgMet * weightKg * durationHr);
}

function exportForAppleHealth() {
  if (state.workouts.length === 0) { showToast('No workouts to export', 'error'); return; }
  const workouts = state.workouts.map(w => {
    const completedSets = w.exercises.reduce((s,e) => s + e.sets.filter(s2=>s2.completed).length, 0);
    const totalVolume = w.exercises.reduce((s,e) => s + e.sets.reduce((ss,s2) => ss + setVolume(s2), 0), 0);
    const start = w.date || new Date().toISOString();
    const durationSec = w.duration ? Math.floor(w.duration / 1000) : completedSets * 90;
    const end = new Date(new Date(start).getTime() + durationSec * 1000).toISOString();
    const caloriesBurned = estimateCalories(w.exercises, durationSec);
    const muscles = [...new Set(w.exercises.map(e => e.muscle))];
    return {
      name: w.name || 'Workout',
      startDate: start,
      endDate: end,
      durationSeconds: durationSec,
      caloriesBurned: caloriesBurned,
      exercises: w.exercises.map(e => ({
        name: e.name,
        muscle: e.muscle,
        sets: e.sets.filter(s => s.completed).map(s => ({
          reps: s.actualReps ?? s.reps ?? 0,
          weight: s.actualWeight ?? s.weight ?? 0,
          type: s.type || 'working'
        }))
      })),
      completedSets: completedSets,
      totalVolume: totalVolume,
      muscles: muscles
    };
  });
  const json = JSON.stringify({ version: 2, exportDate: new Date().toISOString(), bodyWeight: state.settings.bodyWeight || 180, workouts }, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'lift-tracker-health.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('Exported for Apple Health — run the Shortcut next');
}

function exportMeasurements() {
  if (state.measurements.length === 0) { showToast('No measurements to export', 'error'); return; }
  const fields = MEASUREMENT_FIELDS.map(f => f.name);
  let csv = 'Date,' + fields.join(',') + '\n';
  state.measurements.forEach(m => {
    csv += `"${m.date}"` + fields.map((_, i) => {
      const v = m.values[MEASUREMENT_FIELDS[i].id];
      return v !== undefined ? `,${v}` : ',';
    }).join('') + '\n';
  });
  downloadCSV(csv, 'measurements.csv');
  showToast('Measurements exported');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function importWorkouts(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const lines = e.target.result.split('\n').filter(l => l.trim());
      if (lines.length < 2) { showToast('CSV appears empty', 'error'); return; }
      const header = lines[0];
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length >= 3) {
          state.workouts.push({
            id: uid(), date: cols[0], name: cols[1],
            exercises: cols[2].split('; ').filter(Boolean).map(n => ({
              exerciseId: '', name: n.trim(), muscle: '',
              sets: [{reps:10, weight:0, completed:true}]
            })),
            duration: null
          });
          count++;
        }
      }
      saveState(); showToast(`${count} workouts imported`);
    } catch(e) { showToast('Failed to parse CSV', 'error'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function importMeasurements(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const lines = e.target.result.split('\n').filter(l => l.trim());
      if (lines.length < 2) { showToast('CSV appears empty', 'error'); return; }
      const header = parseCSVLine(lines[0]);
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length >= 2) {
          const values = {};
          for (let j = 1; j < cols.length && j <= MEASUREMENT_FIELDS.length; j++) {
            const v = parseFloat(cols[j]);
            if (!isNaN(v) && v > 0) values[MEASUREMENT_FIELDS[j-1].id] = v;
          }
          if (Object.keys(values).length > 0) {
            state.measurements.push({id: uid(), date: cols[0], values});
            count++;
          }
        }
      }
      saveState(); showToast(`${count} measurements imported`);
    } catch(e) { showToast('Failed to parse CSV', 'error'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes; }
    else if (line[i] === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += line[i]; }
  }
  result.push(current.trim());
  return result;
}

// ============================================================
// SCREENSHOT RECOVERY
// ============================================================
let parsedScreenshotWorkouts = [];

function previewScreenshots(event) {
  const files = Array.from(event.target.files || []);
  const container = document.getElementById('screenshot-preview');
  if (!container) return;
  container.innerHTML = '';
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border)';
    container.appendChild(img);
  });
}

function parseScreenshotText() {
  const raw = (document.getElementById('screenshot-text') || {}).value || '';
  if (!raw.trim()) {
    showToast('Paste some text first', 'error');
    return;
  }
  parsedScreenshotWorkouts = parseWorkoutText(raw.trim());
  const preview = document.getElementById('screenshot-preview-workouts');
  const importBtn = document.getElementById('btn-import-screenshots');
  if (!preview || !importBtn) return;

  if (parsedScreenshotWorkouts.length === 0) {
    preview.innerHTML = '<p class="text-sm text-muted">Could not detect any workouts. Try adjusting the text format.</p>';
    importBtn.style.display = 'none';
    return;
  }

  preview.innerHTML = parsedScreenshotWorkouts.map((w, i) => {
    const sets = w.exercises.reduce((s, e) => s + e.sets.length, 0);
    const vol = w.exercises.reduce((s, e) => s + e.sets.reduce((ss, set) => ss + (set.actualReps * set.actualWeight), 0), 0);
    return `<div class="card" style="padding:12px;margin-bottom:8px">
      <div style="font-weight:600;margin-bottom:4px">${escHtml(w.name || ('Workout ' + (i+1)))}</div>
      <div class="text-xs text-muted" style="margin-bottom:6px">${escHtml(String(w.date || ''))} · ${w.exercises.length} exercises · ${sets} sets · ${vol.toLocaleString()} lbs</div>
      ${w.exercises.map(e => `<div style="font-size:0.8rem;margin-bottom:2px"><strong>${escHtml(e.name)}</strong> ${e.sets.map(s => s.actualWeight + '×' + s.actualReps).join(', ')}</div>`).join('')}
    </div>`;
  }).join('');
  importBtn.style.display = 'block';
  showToast('Found ' + parsedScreenshotWorkouts.length + ' workout(s)');
}

function parseWorkoutText(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const workouts = [];
  let current = null;
  let currentExercise = null;

  const setRegex = /^(\d+(?:\.\d+)?)\s*[x×@]\s*(\d+)$/i;
  const setRegex2 = /^(\d+)\s*(?:reps?)?\s*(?:@|at)?\s*(\d+(?:\.\d+)?)$/i;
  const setRegex3 = /^(\d+(?:\.\d+)?)\s*(?:lbs?|kg)?\s*[x×]\s*(\d+)$/i;
  const dateRegex = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}|^\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?/i;

  for (let line of lines) {
    const looksLikeWorkoutTitle = /(?:push|pull|legs|upper|lower|full|chest|back|shoulder|arm|day|workout)/i.test(line)
      && !setRegex.test(line) && !setRegex2.test(line) && !setRegex3.test(line);

    if (looksLikeWorkoutTitle || (dateRegex.test(line) && line.length < 40)) {
      if (current && current.exercises.length) workouts.push(current);
      current = {
        id: uid(),
        name: line.replace(dateRegex, '').trim() || 'Recovered Workout',
        date: extractDate(line) || new Date().toISOString().slice(0, 10),
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 3600000,
        exercises: []
      };
      currentExercise = null;
      continue;
    }

    let match = line.match(setRegex) || line.match(setRegex3);
    let weight, reps;
    if (match) {
      weight = parseFloat(match[1]);
      reps = parseInt(match[2], 10);
    } else {
      match = line.match(setRegex2);
      if (match) {
        reps = parseInt(match[1], 10);
        weight = parseFloat(match[2]);
      }
    }

    if (match && currentExercise) {
      currentExercise.sets.push({
        reps, weight, actualReps: reps, actualWeight: weight,
        rest: 90, type: 'working', completed: true
      });
      continue;
    }

    if (current && line.length > 1 && line.length < 60 && !/^\d+$/.test(line)) {
      currentExercise = { exerciseId: '', name: line, muscle: '', sets: [] };
      current.exercises.push(currentExercise);
    }
  }

  if (current && current.exercises.length) workouts.push(current);
  workouts.forEach(w => { w.exercises = w.exercises.filter(e => e.sets.length > 0); });
  return workouts.filter(w => w.exercises.length > 0);
}

function extractDate(text) {
  const m = text.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (m) {
    let y = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : String(new Date().getFullYear());
    return y + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0');
  }
  const months = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
  const m2 = text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})/i);
  if (m2) {
    const month = months[m2[1].toLowerCase().slice(0, 3)];
    const day = m2[2].padStart(2, '0');
    return new Date().getFullYear() + '-' + String(month).padStart(2, '0') + '-' + day;
  }
  return null;
}

function importParsedScreenshots() {
  if (!parsedScreenshotWorkouts.length) return;
  let added = 0;
  parsedScreenshotWorkouts.forEach(w => {
    const exists = state.workouts.some(existing =>
      (existing.date || '').slice(0, 10) === (w.date || '').slice(0, 10) &&
      (existing.name || '').toLowerCase() === (w.name || '').toLowerCase()
    );
    if (!exists) {
      state.workouts.push(w);
      added++;
    }
  });
  saveState();
  parsedScreenshotWorkouts = [];
  const ta = document.getElementById('screenshot-text');
  if (ta) ta.value = '';
  const prev = document.getElementById('screenshot-preview-workouts');
  if (prev) prev.innerHTML = '';
  const btn = document.getElementById('btn-import-screenshots');
  if (btn) btn.style.display = 'none';
  const imgs = document.getElementById('screenshot-preview');
  if (imgs) imgs.innerHTML = '';
  showToast(added + ' workout(s) recovered');
  showView('history');
}

// ============================================================
// MODALS
// ============================================================
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', (e) => {
    if (e.target === o) o.classList.remove('open');
  });
});

// ============================================================
// UTILITIES
// ============================================================
function escHtml(str) {
  return (str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ============================================================
// PWA / SERVICE WORKER
// ============================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'APP_UPDATE' && typeof showToast === 'function') {
      showToast('Update available — refresh to get the latest version');
    }
  });
}

// ============================================================
// INIT
// ============================================================
loadState();
// Firebase SDKs load with `defer` so they don't block first paint; wait for
// them (they execute right before DOMContentLoaded) before touching `firebase`.
document.addEventListener('DOMContentLoaded', initCloudOnLoad);

// Add default templates if first run — each with nutrition advice
if (state.templates.length === 0 && state.workouts.length === 0) {
  state.templates = [
    {
      id: uid(), name: 'Push Day',
      nutrition: { pre: 'Eat a carb-heavy meal 1.5-2 hrs before (oatmeal + banana + honey) — you need fuel for compound pressing.',
        post: 'Down 35-40g fast protein within 90 min — whey shake, chicken breast, or Greek yogurt. Your chest and triceps are rebuilt on protein, not wishful thinking.',
        summary: '🍚 Carbs before ☕' },
      exercises: [
        {exerciseId:'barbell-bench-press',name:'Barbell Bench Press',muscle:'Chest',sets:[{reps:5,weight:0,rest:120,type:'warmup'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'}]},
        {exerciseId:'incline-bench-press',name:'Incline Bench Press',muscle:'Chest',sets:[{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'}]},
        {exerciseId:'dumbbell-fly',name:'Dumbbell Fly',muscle:'Chest',sets:[{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'}]},
        {exerciseId:'overhead-press',name:'Overhead Press',muscle:'Shoulders',sets:[{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'}]},
        {exerciseId:'lateral-raise',name:'Lateral Raise',muscle:'Shoulders',sets:[{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'}]},
        {exerciseId:'tricep-pushdown',name:'Tricep Pushdown',muscle:'Triceps',sets:[{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'}]},
      ]
    },
    {
      id: uid(), name: 'Pull Day',
      nutrition: { pre: 'Have slow-burn carbs 2 hrs before (sweet potatoes, brown rice) — deadlifts and rows are the most demanding movements on your CNS.',
        post: '30-40g protein + fast carbs immediately — your back and biceps just got torn down. Greek yogurt + berries + honey hits the spot.',
        summary: '🍠 Slow carbs before, 🥛 Protein + carbs after' },
      exercises: [
        {exerciseId:'deadlift',name:'Deadlift',muscle:'Back',sets:[{reps:5,weight:0,rest:120,type:'warmup'},{reps:5,weight:0,rest:120,type:'working'},{reps:5,weight:0,rest:120,type:'working'},{reps:5,weight:0,rest:120,type:'working'}]},
        {exerciseId:'barbell-row',name:'Barbell Row',muscle:'Back',sets:[{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'}]},
        {exerciseId:'pull-up',name:'Pull-up',muscle:'Back',sets:[{reps:8,weight:0,rest:75,type:'working'},{reps:8,weight:0,rest:75,type:'working'},{reps:8,weight:0,rest:75,type:'working'}]},
        {exerciseId:'seated-cable-row',name:'Seated Cable Row',muscle:'Back',sets:[{reps:10,weight:0,rest:60,type:'working'},{reps:10,weight:0,rest:60,type:'working'},{reps:10,weight:0,rest:60,type:'working'}]},
        {exerciseId:'face-pulls',name:'Face Pulls',muscle:'Shoulders',sets:[{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'}]},
        {exerciseId:'barbell-bicep-curl',name:'Barbell Bicep Curl',muscle:'Biceps',sets:[{reps:10,weight:0,rest:60,type:'working'},{reps:10,weight:0,rest:60,type:'working'},{reps:10,weight:0,rest:60,type:'working'}]},
      ]
    },
    {
      id: uid(), name: 'Leg Day',
      nutrition: { pre: 'Eat BIG 2-2.5 hrs before — this is your highest calorie-burning workout. Rice + chicken + avocado gives you slow-release energy that lasts.',
        post: 'Double up on protein (50g+) — your largest muscle group needs the most repair. Whey isolate + milk, then eat a full meal 1 hr later.',
        summary: '🍗 Heavy meal before, 🥩 Double protein after' },
      exercises: [
        {exerciseId:'barbell-back-squat',name:'Barbell Back Squat',muscle:'Legs',sets:[{reps:5,weight:0,rest:120,type:'warmup'},{reps:8,weight:0,rest:120,type:'working'},{reps:8,weight:0,rest:120,type:'working'},{reps:8,weight:0,rest:120,type:'working'}]},
        {exerciseId:'romanian-deadlift',name:'Romanian Deadlift',muscle:'Glutes',sets:[{reps:10,weight:0,rest:90,type:'working'},{reps:10,weight:0,rest:90,type:'working'},{reps:10,weight:0,rest:90,type:'working'}]},
        {exerciseId:'leg-press',name:'Leg Press',muscle:'Legs',sets:[{reps:12,weight:0,rest:75,type:'working'},{reps:12,weight:0,rest:75,type:'working'},{reps:12,weight:0,rest:75,type:'working'}]},
        {exerciseId:'leg-curl',name:'Leg Curl',muscle:'Legs',sets:[{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'}]},
        {exerciseId:'leg-extension',name:'Leg Extension',muscle:'Legs',sets:[{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'}]},
        {exerciseId:'calf-raise',name:'Calf Raise',muscle:'Legs',sets:[{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'}]},
      ]
    },
    {
      id: uid(), name: 'Chest Focus',
      nutrition: { pre: 'Light carbs 1 hr before (apple + almonds) — you want energy without feeling full. Chest pressing requires stability, not a full stomach.',
        post: 'Lean protein + veggies — grilled chicken salad or a shake with greens. Chest recovers fast, so quick-absorbing protein is ideal.',
        summary: '🥜 Light snack before, 🥗 Lean protein after' },
      exercises: [
        {exerciseId:'barbell-bench-press',name:'Barbell Bench Press',muscle:'Chest',sets:[{reps:5,weight:0,rest:120,type:'warmup'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'}]},
        {exerciseId:'incline-bench-press',name:'Incline Bench Press',muscle:'Chest',sets:[{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'}]},
        {exerciseId:'dumbbell-fly',name:'Dumbbell Fly',muscle:'Chest',sets:[{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'}]},
        {exerciseId:'cable-fly',name:'Cable Fly',muscle:'Chest',sets:[{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'}]},
        {exerciseId:'push-up',name:'Push-up',muscle:'Chest',sets:[{reps:20,weight:0,rest:45,type:'dropset'},{reps:20,weight:0,rest:45,type:'dropset'},{reps:20,weight:0,rest:45,type:'dropset'}]},
      ]
    },
    {
      id: uid(), name: 'Back Focus',
      nutrition: { pre: 'Complex carbs 2 hrs before (rolled oats + banana) — back training demands sustained energy through rows, pulls, and deadlifts.',
        post: 'Lean red meat or dark poultry + potatoes for recovery. Back muscles are large and need complete protein with iron for recovery.',
        summary: '🌾 Sustained carbs before, 🥩 Iron-rich protein after' },
      exercises: [
        {exerciseId:'deadlift',name:'Deadlift',muscle:'Back',sets:[{reps:5,weight:0,rest:120,type:'warmup'},{reps:5,weight:0,rest:120,type:'working'},{reps:5,weight:0,rest:120,type:'working'}]},
        {exerciseId:'barbell-row',name:'Barbell Row',muscle:'Back',sets:[{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'}]},
        {exerciseId:'pull-up',name:'Pull-up',muscle:'Back',sets:[{reps:8,weight:0,rest:75,type:'working'},{reps:8,weight:0,rest:75,type:'working'},{reps:8,weight:0,rest:75,type:'working'}]},
        {exerciseId:'seated-cable-row',name:'Seated Cable Row',muscle:'Back',sets:[{reps:10,weight:0,rest:60,type:'working'},{reps:10,weight:0,rest:60,type:'working'},{reps:10,weight:0,rest:60,type:'working'}]},
        {exerciseId:'face-pulls',name:'Face Pulls',muscle:'Shoulders',sets:[{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'}]},
      ]
    },
    {
      id: uid(), name: 'Shoulders Focus',
      nutrition: { pre: 'Quick-digesting carbs 45 min before (white rice cakes + honey) — you need fast energy but nothing heavy. Shoulder work is all about stability.',
        post: 'Anti-inflammatory protein — salmon, tuna, or a turmeric shake. Shoulder joints work hard; omega-3s reduce inflammation and aid recovery.',
        summary: '🍯 Fast carbs before, 🐟 Anti-inflammatory protein after' },
      exercises: [
        {exerciseId:'overhead-press',name:'Overhead Press',muscle:'Shoulders',sets:[{reps:5,weight:0,rest:120,type:'warmup'},{reps:10,weight:0,rest:90,type:'working'},{reps:10,weight:0,rest:90,type:'working'},{reps:10,weight:0,rest:90,type:'working'}]},
        {exerciseId:'lateral-raise',name:'Lateral Raise',muscle:'Shoulders',sets:[{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'}]},
        {exerciseId:'front-raise',name:'Front Raise',muscle:'Shoulders',sets:[{reps:12,weight:0,rest:45,type:'working'},{reps:12,weight:0,rest:45,type:'working'},{reps:12,weight:0,rest:45,type:'working'}]},
        {exerciseId:'face-pulls',name:'Face Pulls',muscle:'Shoulders',sets:[{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'}]},
        {exerciseId:'dumbbell-shoulder-press',name:'Dumbbell Shoulder Press',muscle:'Shoulders',sets:[{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'}]},
      ]
    },
    {
      id: uid(), name: 'Arms Day',
      nutrition: { pre: 'Simple carbs 30 min before (banana, juice) — arms are small muscles that recover fast. You want pumps, not full digestion.',
        post: 'Fast-absorbing protein like whey isolate or egg whites. Arms need quick delivery of amino acids for that peak growth window.',
        summary: '🍌 Quick pre energy, 🥚 Fast protein after' },
      exercises: [
        {exerciseId:'barbell-bicep-curl',name:'Barbell Bicep Curl',muscle:'Biceps',sets:[{reps:10,weight:0,rest:60,type:'warmup'},{reps:10,weight:0,rest:60,type:'working'},{reps:10,weight:0,rest:60,type:'working'},{reps:10,weight:0,rest:60,type:'working'}]},
        {exerciseId:'hammer-curl',name:'Hammer Curl',muscle:'Biceps',sets:[{reps:12,weight:0,rest:45,type:'working'},{reps:12,weight:0,rest:45,type:'working'},{reps:12,weight:0,rest:45,type:'working'}]},
        {exerciseId:'tricep-pushdown',name:'Tricep Pushdown',muscle:'Triceps',sets:[{reps:12,weight:0,rest:45,type:'working'},{reps:12,weight:0,rest:45,type:'working'},{reps:12,weight:0,rest:45,type:'working'}]},
        {exerciseId:'overhead-press',name:'Overhead Press',muscle:'Shoulders',sets:[{reps:10,weight:0,rest:90,type:'working'},{reps:10,weight:0,rest:90,type:'working'},{reps:10,weight:0,rest:90,type:'working'}]},
        {exerciseId:'dumbbell-fly',name:'Dumbbell Fly',muscle:'Chest',sets:[{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'}]},
      ]
    },
    {
      id: uid(), name: 'Full Body',
      nutrition: { pre: 'Your biggest pre-workout meal of the week. Rice + chicken + veggies 2.5 hrs before, then a banana 30 min before. Full body training taps every energy system.',
        post: 'Protein + carb combo immediately — whey + dextrose or chocolate milk followed by a full meal within 2 hrs. You just taxed everything; refuel everything.',
        summary: '🍛 Biggest pre meal, 🥛 Protein + carb reload after' },
      exercises: [
        {exerciseId:'barbell-bench-press',name:'Barbell Bench Press',muscle:'Chest',sets:[{reps:8,weight:0,rest:90,type:'warmup'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'}]},
        {exerciseId:'barbell-back-squat',name:'Barbell Back Squat',muscle:'Legs',sets:[{reps:8,weight:0,rest:90,type:'warmup'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'}]},
        {exerciseId:'barbell-row',name:'Barbell Row',muscle:'Back',sets:[{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'},{reps:8,weight:0,rest:90,type:'working'}]},
        {exerciseId:'overhead-press',name:'Overhead Press',muscle:'Shoulders',sets:[{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'},{reps:10,weight:0,rest:75,type:'working'}]},
        {exerciseId:'hammer-curl',name:'Hammer Curl',muscle:'Biceps',sets:[{reps:12,weight:0,rest:45,type:'working'},{reps:12,weight:0,rest:45,type:'working'}]},
        {exerciseId:'plank',name:'Plank',muscle:'Core',sets:[{reps:0,weight:0,rest:45,type:'working',durationSeconds:60},{reps:0,weight:0,rest:45,type:'working',durationSeconds:60}]},
      ]
    },
    {
      id: uid(), name: 'Core + Abs',
      nutrition: { pre: 'Light and easy — small piece of fruit 30 min before. Any food on your stomach during ab work will make you miserable.',
        post: 'Lean protein like turkey breast or tofu — abs are revealed in the kitchen. You can train them all year, but if your diet is off, nobody sees them.',
        summary: '🍎 Light before, 🥗 Clean protein after — abs are made in the kitchen' },
      exercises: [
        {exerciseId:'plank',name:'Plank',muscle:'Core',sets:[{reps:0,weight:0,rest:45,type:'working',durationSeconds:60},{reps:0,weight:0,rest:45,type:'working',durationSeconds:60},{reps:0,weight:0,rest:45,type:'working',durationSeconds:45}]},
        {exerciseId:'cable-crunch',name:'Cable Crunch',muscle:'Core',sets:[{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'},{reps:15,weight:0,rest:45,type:'working'}]},
        {exerciseId:'leg-press',name:'Leg Press',muscle:'Legs',sets:[{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'},{reps:12,weight:0,rest:60,type:'working'}]},
      ]
    }
  ];
  saveState();
}

showView('dashboard');

// ============================================================
// PROFILE & COACHING
// ============================================================

const SURVEY_QUESTIONS = [
  {id:'goal',title:'What\'s your #1 goal?',icon:'🎯',options:[
    {id:'fat-loss',label:'Lose Fat',desc:'Drop body fat while keeping muscle',icon:'🔥'},
    {id:'muscle',label:'Build Muscle',desc:'Add size and definition',icon:'💪'},
    {id:'strength',label:'Get Stronger',desc:'Increase numbers on main lifts',icon:'🏋️'},
    {id:'general',label:'General Fitness',desc:'Stay healthy and feel good',icon:'⚡'},
    {id:'recomp',label:'Body Recomposition',desc:'Lose fat and build muscle simultaneously',icon:'🔄'},
  ]},
  {id:'experience',title:'How long have you been training consistently?',icon:'📅',options:[
    {id:'beginner',label:'0-6 months',desc:'Just getting started',icon:'🌱'},
    {id:'intermediate',label:'6 months - 2 years',desc:'Know the basics, building habits',icon:'📈'},
    {id:'advanced',label:'2+ years',desc:'Experienced lifter',icon:'🏆'},
  ]},
  {id:'frequency',title:'How many days per week can you realistically train?',icon:'📆',options:[
    {id:'2',label:'2 days',desc:'Minimum effective dose',icon:'2️⃣'},
    {id:'3',label:'3 days',desc:'Solid foundation',icon:'3️⃣'},
    {id:'4',label:'4 days',desc:'Serious commitment',icon:'4️⃣'},
    {id:'5',label:'5+ days',desc:'All-in lifestyle',icon:'5️⃣'},
  ]},
  {id:'obstacle',title:'What\'s your biggest obstacle right now?',icon:'🚧',options:[
    {id:'consistency',label:'Consistency',desc:'Can\'t stick to a routine',icon:'😤'},
    {id:'knowledge',label:'Don\'t Know What to Do',desc:'Confused by all the info out there',icon:'🤷'},
    {id:'motivation',label:'Motivation',desc:'Start strong, fizzle out',icon:'😞'},
    {id:'diet',label:'Nutrition',desc:'Training hard but eating wrong',icon:'🍔'},
    {id:'time',label:'Time',desc:'Busy schedule, limited hours',icon:'⏰'},
    {id:'plateau',label:'Plateau',desc:'Not seeing results anymore',icon:'📊'},
  ]},
  {id:'body',title:'Where do you store the most fat / want to change most?',icon:'🔍',options:[
    {id:'belly',label:'Belly',desc:'The stubborn midsection',icon:'🎯'},
    {id:'arms',label:'Arms / Back',desc:'Upper body softness',icon:'💪'},
    {id:'legs',label:'Thighs / Hips',desc:'Lower body focus',icon:'🦵'},
    {id:'everywhere',label:'Evenly Distributed',desc:'Overall',icon:'🔲'},
    {id:'none',label:'Not Sure / Skip',desc:'',icon:'⏭️'},
  ]},
  {id:'diet-status',title:'How\'s your nutrition right now?',icon:'🍽️',options:[
    {id:'track',label:'I Track Everything',desc:'Macros, calories, the works',icon:'✅'},
    {id:'healthy',label:'Eat Pretty Healthy',desc:'No tracking but decent choices',icon:'🥗'},
    {id:'messy',label:'All Over the Place',desc:'Good days and bad days',icon:'🌗'},
    {id:'terrible',label:'Need Serious Help',desc:'Fast food, emotional eating, etc.',icon:'🚨'},
  ]},
];

let surveyState = { step: 0, answers: {} };

function openSurvey() {
  surveyState = { step: 0, answers: {} };
  renderSurveyStep();
  openModal('survey-modal');
}

function renderSurveyStep() {
  const q = SURVEY_QUESTIONS[surveyState.step];
  const total = SURVEY_QUESTIONS.length;
  const progress = ((surveyState.step) / total) * 100;
  const container = document.getElementById('survey-modal-content');
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="font-size:0.8rem;color:var(--text3)">${surveyState.step + 1} of ${total}</span>
      <button class="icon-btn" aria-label="Close" onclick="closeModal('survey-modal')" style="margin-right:-8px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div style="height:4px;background:var(--surface2);border-radius:2px;margin-bottom:20px;overflow:hidden">
      <div style="height:100%;width:${progress}%;background:var(--green);border-radius:2px;transition:width .3s ease"></div>
    </div>
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:2rem;margin-bottom:8px">${q.icon}</div>
      <h3 style="font-size:1.1rem;font-weight:700;color:var(--text)">${q.title}</h3>
    </div>
    <div class="survey-options">
      ${q.options.map(o => `
        <div class="survey-opt ${surveyState.answers[q.id]===o.id?'selected':''}" onclick="selectSurveyOption('${q.id}','${o.id}')">
          <div class="so-title">${o.label}</div>
          ${o.desc ? `<div class="so-desc">${o.desc}</div>` : ''}
        </div>
      `).join('')}
    </div>
    <div style="display:flex;gap:10px;margin-top:20px">
      ${surveyState.step > 0 ? `<button class="btn btn-secondary" onclick="surveyBack()" style="flex:0 0 auto">Back</button>` : ''}
      <button class="btn btn-primary" onclick="surveyNext()" ${surveyState.answers[q.id]?'':'disabled'} style="flex:1">
        ${surveyState.step === total - 1 ? 'Get My Analysis' : 'Next'}
      </button>
    </div>
  `;
}

function selectSurveyOption(qId, optId) {
  surveyState.answers[qId] = optId;
  renderSurveyStep();
}

function surveyBack() {
  if (surveyState.step > 0) { surveyState.step--; renderSurveyStep(); }
}

function surveyNext() {
  const q = SURVEY_QUESTIONS[surveyState.step];
  if (!surveyState.answers[q.id]) return;
  if (surveyState.step < SURVEY_QUESTIONS.length - 1) {
    surveyState.step++;
    renderSurveyStep();
  } else {
    // Save and render profile
    state.profile = { ...surveyState.answers, completedAt: new Date().toISOString() };
    saveState();
    closeModal('survey-modal');
    renderProfile();
  }
}

// ============================================================
// ANALYSIS ENGINE
// ============================================================

function computeAnalysis() {
  const now = Date.now();
  const DAY = 86400000;
  const thirtyDaysAgo = now - 30 * DAY;
  const fourteenDaysAgo = now - 14 * DAY;

  // Recent workouts (last 30 days)
  const recentWorkouts = (state.workouts || []).filter(w => {
    const t = new Date(w.date).getTime();
    return t >= thirtyDaysAgo;
  });

  // Workout frequency
  const workoutsLast30 = recentWorkouts.length;
  const workoutsLast14 = (state.workouts || []).filter(w => new Date(w.date).getTime() >= fourteenDaysAgo).length;
  const avgPerWeek = workoutsLast30 > 0 ? (workoutsLast30 / 4.3).toFixed(1) : 0;

  // Consistency: gaps between workouts
  const sortedDates = recentWorkouts.map(w => new Date(w.date).getTime()).sort((a, b) => a - b);
  let maxGap = 0;
  let totalGap = 0;
  let gapCount = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const gap = (sortedDates[i] - sortedDates[i - 1]) / DAY;
    maxGap = Math.max(maxGap, gap);
    totalGap += gap;
    gapCount++;
  }
  const avgGap = gapCount > 0 ? (totalGap / gapCount).toFixed(1) : '—';

  // Muscle group analysis
  const muscleGroupMap = {Biceps:'Arms',Triceps:'Arms',Glutes:'Legs',Cardio:'Cardio'};
  const muscleCounts = {};
  const muscleVolume = {};
  let totalSets = 0;
  let totalVolume = 0;

  recentWorkouts.forEach(w => {
    (w.exercises || []).forEach(ex => {
      let muscle = ex.muscle || 'Other';
      if (muscleGroupMap[muscle]) muscle = muscleGroupMap[muscle];
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
      const completedSets = (ex.sets || []).filter(s => s.completed);
      muscleVolume[muscle] = (muscleVolume[muscle] || 0) + completedSets.length;
      totalSets += completedSets.length;
      completedSets.forEach(s => {
        totalVolume += setVolume(s);
      });
    });
  });

  // Strength progress: compare first half vs second half of recent workouts
  let strengthTrend = 'stable';
  if (recentWorkouts.length >= 4) {
    const mid = Math.floor(recentWorkouts.length / 2);
    const firstHalf = recentWorkouts.slice(0, mid);
    const secondHalf = recentWorkouts.slice(mid);
    const avgFirst = getAvgIntensity(firstHalf);
    const avgSecond = getAvgIntensity(secondHalf);
    if (avgSecond > avgFirst * 1.05) strengthTrend = 'improving';
    else if (avgSecond < avgFirst * 0.95) strengthTrend = 'declining';
  }

  // Measurement trends
  const meas = (state.measurements || []).slice(-2);
  let weightTrend = null, bodyFatTrend = null;
  if (meas.length === 2) {
    const w0 = meas[0].weight, w1 = meas[1].weight;
    if (w0 && w1) weightTrend = { from: w0, to: w1, diff: (w1 - w0).toFixed(1) };
    const bf0 = meas[0].bodyFat, bf1 = meas[1].bodyFat;
    if (bf0 && bf1) bodyFatTrend = { from: bf0, to: bf1, diff: (bf1 - bf0).toFixed(1) };
  }

  // Find weakest muscle groups (fewest exercises trained)
  const allMuscles = ['Chest','Back','Shoulders','Arms','Legs','Core','Cardio'];
  const muscleScores = allMuscles.map(m => ({
    name: m,
    count: muscleCounts[m] || 0,
    sets: muscleVolume[m] || 0,
    pct: totalSets > 0 ? Math.round(((muscleVolume[m] || 0) / totalSets) * 100) : 0
  }));

  const sorted = [...muscleScores].sort((a, b) => b.sets - a.sets);
  const strengths = sorted.filter(m => m.sets > 0).slice(0, 3);
  const weaknesses = sorted.filter(m => m.sets > 0).reverse().slice(0, 3);

  // Workout types (which exercises appear most)
  const exerciseFreq = {};
  recentWorkouts.forEach(w => {
    (w.exercises || []).forEach(ex => {
      exerciseFreq[ex.name] = (exerciseFreq[ex.name] || 0) + 1;
    });
  });
  const topExercises = Object.entries(exerciseFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    workoutsLast30, workoutsLast14, avgPerWeek, avgGap, maxGap: maxGap.toFixed(0),
    muscleScores: sorted, strengths, weaknesses, totalSets, totalVolume,
    strengthTrend, weightTrend, bodyFatTrend, topExercises,
    totalWorkoutsAllTime: (state.workouts || []).length,
    hasData: recentWorkouts.length > 0
  };
}

function getAvgIntensity(workouts) {
  let total = 0, count = 0;
  workouts.forEach(w => {
    (w.exercises || []).forEach(ex => {
      (ex.sets || []).forEach(s => {
        if (s.completed && s.actualWeight > 0) { total += s.actualWeight; count++; }
      });
    });
  });
  return count > 0 ? total / count : 0;
}

// ============================================================
// COACHING ADVICE ENGINE (Jillian Michaels Style)
// ============================================================

function generateAdvice(profile, analysis) {
  const advice = [];
  const goal = profile.goal;
  const freq = parseInt(profile.frequency) || 3;
  const experience = profile.experience;
  const obstacle = profile.obstacle;
  const diet = profile['diet-status'];
  const body = profile.body;

  // --- FREQUENCY CHECK ---
  if (analysis.hasData) {
    if (analysis.avgPerWeek < freq * 0.7) {
      advice.push({
        type: 'urgent', title: 'You\'re Not Showing Up',
        body: `You said you can train ${freq}x/week but you're averaging ${analysis.avgPerWeek}x. That's not a schedule — that's a wish. Nobody ever got fit by planning to work out. You either do it or you don't. Set non-negotiable appointment times and treat them like a doctor's visit. Would you skip your dentist? Then stop skipping the gym.`,
        action: `Block ${freq} specific days on your calendar RIGHT NOW. Not "sometime this week." Monday, Wednesday, Saturday. Done.`
      });
    } else if (analysis.avgPerWeek >= freq * 0.9) {
      advice.push({
        type: 'win', title: 'Consistency Is Your Superpower',
        body: `You're hitting ${analysis.avgPerWeek}x/week — that's exactly what you committed to. Most people don't even get close. This is why you're going to win. Keep this momentum rolling.`,
        action: 'Don\'t get comfortable. Increase intensity or volume this week — add one more set per exercise or push for an extra rep.'
      });
    }
  }

  // --- GAP ANALYSIS ---
  if (analysis.hasData && parseFloat(analysis.avgGap) > 5) {
    advice.push({
      type: 'urgent', title: `${analysis.avgGap} Days Between Workouts? Come On.`,
      body: `Your average gap between sessions is ${analysis.avgGap} days. That means you're barely maintaining, let alone progressing. Muscle doesn't wait for you to feel motivated. It adapts to the stimulus you give it — and right now, you're giving it permission to coast.`,
      action: `Set a phone alarm for your rest days that says "Tomorrow is gym day." No excuses. Lay out your clothes the night before.`
    });
  }

  // --- MUSCLE IMBALANCES ---
  const { strengths, weaknesses, muscleScores } = analysis;
  if (weaknesses.length > 0) {
    const weakNames = weaknesses.filter(m => m.sets > 0).map(m => m.name);
    if (weakNames.length > 0) {
      const muscle = weakNames[0];
      const sets = weaknesses[0].sets;
      advice.push({
        type: 'urgent', title: `${muscle} Is Getting Neglected`,
        body: `You've done ${sets} sets on ${muscle} in the last 30 days. That's basically a participation trophy. ${
          muscle === 'Legs' ? 'Stop skipping leg day. Your upper body isn\'t going to impress anyone if you\'re walking around on toothpicks.' :
          muscle === 'Core' ? 'Your core is the foundation of EVERYTHING. Weak core = weak lifts, bad posture, and eventual injury.' :
          muscle === 'Back' ? 'A strong back prevents injuries and builds that V-taper everyone wants. You can\'t just bench press your way to a great physique.' :
          muscle === 'Shoulders' ? 'Shoulders make your frame look wider and your waist smaller. Neglecting them is a rookie mistake.' :
          `You need to bring this up or you're going to plateau everywhere else.`
        }`,
        action: `Add at least 2 more ${muscle.toLowerCase()} exercises per week. Minimum 12-16 sets total. No exceptions.`
      });
    }
  }

  // --- STRENGTH BALANCE ---
  if (strengths.length > 0 && weaknesses.length > 1) {
    const topSets = strengths[0].sets;
    const botSets = weaknesses.filter(m => m.sets > 0)[0]?.sets || 0;
    if (topSets > 0 && botSets > 0 && topSets / botSets > 3) {
      advice.push({
        type: 'focus', title: 'Your Training Is Lopsided',
        body: `You're doing ${Math.round(topSets / botSets * 100)}% more volume on ${strengths[0].name} than ${weaknesses.filter(m => m.sets > 0)[0].name}. This creates imbalances that lead to injury and make you look like a cartoon character. Balance isn't boring — it's smart.`,
        action: `Equalize your volume. Every set of ${strengths[0].name.toLowerCase()} gets a matching set for ${weaknesses.filter(m => m.sets > 0)[0].name.toLowerCase()}.`
      });
    }
  }

  // --- GOAL-SPECIFIC ADVICE ---
  if (goal === 'fat-loss' || goal === 'recomp') {
    advice.push({
      type: 'tip', title: 'The Scale Is Lying to You',
      body: `Here's the truth: the scale means almost nothing. You could gain muscle and lose fat simultaneously and the scale wouldn't budge. Stop obsessing over the number and start tracking measurements and progress photos. Take a photo every 2 weeks in the same lighting, same pose. That's your real progress report.`,
      action: 'Log your measurements bi-weekly in the Measure tab. Compare photos side-by-side. The mirror and tape measure don\'t lie.'
    });
  }

  if (goal === 'strength') {
    if (analysis.strengthTrend === 'declining') {
      advice.push({
        type: 'urgent', title: 'Your Strength Is DROPPING',
        body: `Your numbers are going down. That's either overtraining, under-eating, or both. You can't pour from an empty cup. If you're not eating enough protein (0.8-1g per pound of bodyweight), you're literally starving your muscles. Fix the nutrition before you add more weight.`,
        action: 'Calculate your TDEE, eat at a slight surplus for 2 weeks, and prioritize 150g+ protein daily. Then test your maxes again.'
      });
    } else {
      advice.push({
        type: 'tip', title: 'Progressive Overload Is Everything',
        body: `You want to get strong? You need to add weight or reps EVERY session. Not "sometimes." Every. Single. Time. If you benched 135 for 8 last week, you do 140 for 8 or 135 for 9 this week. No exceptions. Track every set.`,
        action: 'Use the "Add 2.5lbs per week" rule for upper body and "5lbs per week" for lower body. Write it down.'
      });
    }
  }

  if (goal === 'muscle') {
    advice.push({
      type: 'tip', title: 'Volume Is King for Growth',
      body: `Research shows 10-20 sets per muscle group per week is the sweet spot for hypertrophy. Most people do 6-8 and wonder why they're not growing. You need to train with PURPOSE. Every set should be within 2-3 reps of failure. If you could've done 5 more reps, you wasted that set.`,
      action: `Aim for 12-16 sets per muscle group per week. Track your total volume in the Workouts tab and make sure it's climbing week over week.`
    });
  }

  if (goal === 'general') {
    advice.push({
      type: 'tip', title: 'Consistency Beats Intensity Every Time',
      body: `You don't need to destroy yourself in the gym. You need to show up 3-4 times a week, move heavy things, and eat like an adult. That's literally it. Stop looking for the perfect program — the best program is the one you'll actually do.`,
      action: 'Pick 3 days, stick to compound movements (squat, bench, row, deadlift), and do that for 12 weeks. Then come back and tell me it didn\'t work.'
    });
  }

  // --- DIET ADVICE ---
  if (diet === 'terrible' || diet === 'messy') {
    advice.push({
      type: 'urgent', title: 'You Can\'t Out-Train a Bad Diet',
      body: `I don't care how hard you train. If your nutrition is garbage, you're spinning your wheels. You don't need a "diet" — you need to eat like a functioning adult. Protein at every meal. Vegetables exist. Water is not optional. This is not complicated.`,
      action: `Start with ONE change: eat 1g of protein per pound of bodyweight every day. That's it. Do that for 2 weeks, then we'll talk about the rest.`
    });
  } else if (diet === 'track') {
    advice.push({
      type: 'win', title: 'Your Nutrition Game Is Solid',
      body: `Tracking your food puts you ahead of 90% of people. Most folks have no idea what they're eating. You do. That's power. Keep doing what you're doing and make small adjustments based on results.`,
      action: 'Review your macros weekly. If you\'re not seeing changes, adjust by 100-200 calories. Small tweaks, big results.'
    });
  }

  // --- PRE/POST WORKOUT NUTRITION (Goal-based) ---
  if (goal === 'muscle' || goal === 'strength') {
    advice.push({
      type: 'tip', title: 'Fuel Your Training, Don\'t Just Show Up',
      body: `Pre-workout carbs aren't optional — they're fuel. A sweet potato or oatmeal 90 minutes before training gives you the glycogen your muscles need to push hard. Post-workout protein within 2 hours isn't a suggestion; it's when your muscles are screaming for amino acids. 30-40g of whey or a solid chicken breast meal. Every. Single. Session.`,
      action: 'Check the 🍽️ Food button when you start a workout — it\'s customized for that specific body part.'
    });
  }
  if (goal === 'fat-loss' || goal === 'recomp') {
    advice.push({
      type: 'tip', title: 'Eat Around Your Workouts, Not Through Them',
      body: `A big pre-workout meal while cutting can backfire — you feel sluggish and the calories add up. Use pre-workout carbs sparingly (half a banana or rice cakes) and get your protein post-workout. The real calorie burn happens in the 24 hours after lifting due to EPOC, not during the session itself.`,
      action: 'Try fasted morning training with just black coffee, then your first meal post-workout. It works.'
    });
  }

  // --- BODY-SPECIFIC ADVICE ---
  if (body === 'belly') {
    advice.push({
      type: 'focus', title: 'Belly Fat Is the Last to Go — And the First to Come Back',
      body: `Visceral fat is stubborn because it's hormonally driven. You can't spot-reduce it with crunches — that's a lie sold by supplement companies. The ONLY way to lose belly fat is to be in a consistent caloric deficit while lifting heavy. Your abs are already under there. You just need to reveal them.`,
      action: `Focus on compound lifts (squats, deadlifts, rows) and a 300-500 calorie daily deficit. No "ab workouts" needed — they're a waste of time.`
    });
  }

  // --- PLATEAU ADVICE ---
  if (obstacle === 'plateau') {
    advice.push({
      type: 'urgent', title: 'You\'re Not Stuck — You\'re Comfortable',
      body: `A plateau means your body adapted to what you're doing. That's not failure — that's a signal. You need to change something: more volume, more intensity, different exercises, or better recovery. Doing the same thing and expecting different results is the definition of insanity.`,
      action: 'Deload for one week (reduce weight by 40%), then come back and add 10% more volume. Your body needs a shock, not a vacation.'
    });
  }

  // --- KNOWLEDGE GAP ---
  if (obstacle === 'knowledge') {
    advice.push({
      type: 'tip', title: 'Stop Researching, Start Training',
      body: `You don't need to read another article. You don't need another YouTube video. You need to pick up heavy things and put them down. The fundamentals haven't changed in 100 years: progressive overload, adequate protein, enough sleep. Everything else is marketing.`,
      action: `Use the Template Wizard to build a Push/Pull/Legs split. Start light. Add weight each week. That's your program for the next 12 weeks. Done.`
    });
  }

  // --- MOTIVATION ---
  if (obstacle === 'motivation') {
    advice.push({
      type: 'focus', title: 'Motivation Is Garbage. Discipline Is Everything.',
      body: `You know what motivation does? It gets you to the gym on day one. Discipline gets you there on day 200. You will NEVER feel like training every day. Nobody does. The difference between people who achieve their goals and people who don't is that the first group trains when they don't feel like it. Period.`,
      action: `Commit to a "no zero days" policy: even on bad days, do ONE set. Just one. You'll almost always end up doing the full workout. The hardest part is starting.`
    });
  }

  // --- TIME ---
  if (obstacle === 'time') {
    advice.push({
      type: 'tip', title: 'You Have Time. You\'re Just Not Using It.',
      body: `You scroll your phone for 2 hours a day. You have time. A full-body workout takes 45 minutes. Three times a week. That's 2.25 hours out of 168. That's 1.3% of your week. You can't spare 1.3%? Stop making excuses and start making time.`,
      action: `Try 3x/week full-body workouts. 45 minutes max. Compound movements only. No rest between sets longer than 90 seconds. In and out.`
    });
  }

  // --- EXPERIENCE-BASED TIPS ---
  if (experience === 'beginner' && analysis.hasData) {
    advice.push({
      type: 'tip', title: 'Newbie Gains Are Real — Don\'t Waste Them',
      body: `As a beginner, your body is primed to grow. You'll add muscle and lose fat simultaneously if you eat right and train consistently. This window doesn't last forever — it's maybe 6-12 months. Maximize it. Don't waste time on fancy isolation work. Hit the big compounds.`,
      action: `Squat, bench, deadlift, overhead press, barbell row. 3x/week. Add 5lbs each session. This is your entire program for the next 3 months.`
    });
  }

  if (experience === 'advanced' && analysis.hasData && analysis.strengthTrend === 'stable') {
    advice.push({
      type: 'focus', title: 'You\'ve Plateaued Because You\'re Afraid to Change',
      body: `You've been lifting long enough that your body needs a real challenge. Same rep ranges, same exercises, same intensity = same results. You need periodization. Cycle between strength (3-5 reps), hypertrophy (8-12 reps), and endurance (15-20 reps) phases.`,
      action: `Switch to a 4-week strength block (heavy, low reps), then 4-week hypertrophy block (moderate, higher volume). Track everything.`
    });
  }

  // Always end with something motivational
  advice.push({
    type: 'win', title: 'The Fact That You\'re Here Means You\'re Serious',
    body: `Most people never even think about their fitness. They just exist and hope for the best. You're different. You're tracking your workouts, measuring your body, and seeking feedback. That puts you in the top 5% of people who actually care about their health. Now prove it with action.`,
    action: `Open your next workout, train like you mean it, and check back here in 2 weeks. I'll be watching.`
  });

  return advice;
}

// ============================================================
// RENDER PROFILE
// ============================================================

function renderProfile() {
  const container = document.getElementById('profile-content');
  if (!state.profile) {
    container.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:800;margin-bottom:16px">Your Profile</h2>
      <div class="card text-center" style="padding:40px 20px">
        <div style="font-size:3rem;margin-bottom:16px">🏋️</div>
        <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:8px">Welcome, Athlete</h3>
        <p style="color:var(--text2);font-size:0.9rem;margin-bottom:20px;max-width:360px;margin-left:auto;margin-right:auto">
          Take a quick assessment so I can analyze your training, identify weak points, and give you a personalized action plan.
        </p>
        <button class="btn btn-primary" onclick="openSurvey()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Start Assessment
        </button>
      </div>
    `;
    return;
  }

  const analysis = computeAnalysis();
  const advice = generateAdvice(state.profile, analysis);
  const p = state.profile;
  const goalLabels = {'fat-loss':'Lose Fat','muscle':'Build Muscle','strength':'Get Stronger','general':'General Fitness','recomp':'Body Recomposition'};
  const levelLabels = {'beginner':'Beginner (0-6 months)','intermediate':'Intermediate (6mo-2yr)','advanced':'Advanced (2+ years)'};
  const freqLabels = {'2':'2x/week','3':'3x/week','4':'4x/week','5':'5+ days/week'};

  const maxMuscleSets = Math.max(...analysis.muscleScores.map(m => m.sets), 1);

  container.innerHTML = `
    <div class="profile-hero">
      <div class="ph-avatar">${(p.goal || 'G')[0].toUpperCase()}</div>
      <div class="ph-name">Your Fitness Profile</div>
      <div class="ph-goal">${goalLabels[p.goal] || p.goal}</div>
      <div class="ph-level">${levelLabels[p.experience] || ''} • ${freqLabels[p.frequency] || ''}</div>
    </div>

    <!-- Quick Stats -->
    <div class="stat-grid" style="margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-value">${analysis.totalWorkoutsAllTime}</div>
        <div class="stat-label">Total Workouts</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${analysis.workoutsLast30}</div>
        <div class="stat-label">Last 30 Days</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${analysis.totalVolume > 0 ? (analysis.totalVolume >= 1000 ? (analysis.totalVolume/1000).toFixed(1)+'k' : analysis.totalVolume) : '—'}</div>
        <div class="stat-label">Volume (lbs)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${analysis.strengthTrend === 'improving' ? '↑' : analysis.strengthTrend === 'declining' ? '↓' : '→'}</div>
        <div class="stat-label">Strength Trend</div>
      </div>
    </div>

    <!-- Muscle Balance -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-header">
        <div class="card-title">Muscle Balance (30 Days)</div>
        <div class="text-xs text-muted">${analysis.totalSets} total sets</div>
      </div>
      ${analysis.hasData ? analysis.muscleScores.filter(m => m.sets > 0).map(m => {
        const pct = Math.round((m.sets / maxMuscleSets) * 100);
        const color = m.pct > 25 ? 'var(--green)' : m.pct > 15 ? 'var(--blue)' : m.pct > 8 ? 'var(--orange)' : 'var(--red)';
        return `
          <div class="muscle-bar-row">
            <div class="mb-label">${m.name}</div>
            <div class="mb-track"><div class="mb-fill" style="width:${pct}%;background:${color}"></div></div>
            <div class="mb-value">${m.sets}s</div>
          </div>
        `;
      }).join('') : '<p class="text-sm text-muted" style="padding:12px 0">No workout data yet. Start training to see your muscle balance.</p>'}
    </div>

    <!-- Measurement Trends -->
    ${(analysis.weightTrend || analysis.bodyFatTrend) ? `
    <div class="card" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:10px">Body Trends</div>
      ${analysis.weightTrend ? `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span class="text-sm">Weight</span>
          <span class="trend-badge ${parseFloat(analysis.weightTrend.diff) < 0 ? 'up' : parseFloat(analysis.weightTrend.diff) > 0 ? 'down' : 'flat'}">
            ${analysis.weightTrend.from} → ${analysis.weightTrend.to} lbs
            (${parseFloat(analysis.weightTrend.diff) > 0 ? '+' : ''}${analysis.weightTrend.diff})
          </span>
        </div>
      ` : ''}
      ${analysis.bodyFatTrend ? `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0">
          <span class="text-sm">Body Fat</span>
          <span class="trend-badge ${parseFloat(analysis.bodyFatTrend.diff) < 0 ? 'up' : parseFloat(analysis.bodyFatTrend.diff) > 0 ? 'down' : 'flat'}">
            ${analysis.bodyFatTrend.from}% → ${analysis.bodyFatTrend.to}%
            (${parseFloat(analysis.bodyFatTrend.diff) > 0 ? '+' : ''}${analysis.bodyFatTrend.diff}%)
          </span>
        </div>
      ` : ''}
    </div>
    ` : ''}

    <!-- Coach Advice -->
    <div style="margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <h3 style="font-size:1rem;font-weight:700">Coach's Analysis</h3>
        <button class="btn btn-secondary btn-sm" onclick="openSurvey()">Retake Quiz</button>
      </div>
      ${advice.map(a => `
        <div class="coach-card ${a.type}">
          <div class="cc-badge">${a.type === 'urgent' ? '⚠️ Urgent' : a.type === 'focus' ? '🎯 Focus' : a.type === 'win' ? '✅ Win' : '💡 Tip'}</div>
          <div class="cc-title">${a.title}</div>
          <div class="cc-body">${a.body}</div>
          <div class="cc-action">→ ${a.action}</div>
        </div>
      `).join('')}
    </div>
  `;
}
