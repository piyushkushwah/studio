export const MOTIVATIONAL_QUOTES = [
  "25 minutes of pure focus can change your entire day. Trust the timer.",
  "A checkmark on your list is a win for your future self.",
  "Your streak is more than a number; it's a habit of excellence.",
  "The calendar doesn't lie. Make today a masterpiece.",
  "High priority tasks deserve your highest energy.",
  "Clear your mind, clear your list.",
  "Focus is a choice. Choose to be productive today.",
  "Small tasks are the building blocks of great achievements.",
  "Don't just track time—make time count.",
  "Your future is written in your daily task list.",
  "Consistency beats intensity every single time.",
  "The best way to finish is to simply start the next Pomodoro.",
  "Labels help organize your world. Focus helps you conquer it.",
  "Every task completed is a step closer to your dream.",
  "Focus on progress, not perfection.",
  "Action is the foundational key to all success.",
  "Deep work is the superpower of the 21st century.",
  "Manage your energy, not just your time.",
  "Big goals are just a series of small, well-executed tasks.",
  "Productivity is never an accident; it is a commitment to excellence.",
  "Let the Focus Radio drown out the noise while you conquer your list.",
  "Your productivity heatmap looks better with every finished task.",
  "One focus session at a time, you are rewriting your potential.",
  "Organize with labels, execute with focus, celebrate with checkmarks."
];

export function getDailyQuote() {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

/**
 * Returns a relevant motivational quote from the local library.
 * Prioritizes app-specific context over generic external quotes.
 */
export async function getRandomQuote(): Promise<string> {
  // We prioritize the local, relevant library for this app's context
  const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[randomIndex];
}
