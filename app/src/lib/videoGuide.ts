// Same construction the classic app used on its exercise detail screen:
// a YouTube search for the exercise's form tutorial, top result first.
export function videoGuideUrl(exerciseName: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exerciseName} exercise form tutorial`)}`;
}
