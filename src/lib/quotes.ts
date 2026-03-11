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
  "Productivity is never an accident; it is a commitment to excellence."
];

export function getDailyQuote() {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

/**
 * Fetches a random quote from a public API with local fallback
 */
export async function getRandomQuote(): Promise<string> {
  try {
    const response = await fetch('https://dummyjson.com/quotes/random', {
      next: { revalidate: 0 } // Ensure we don't cache stale quotes
    });
    if (!response.ok) throw new Error('API limit or network error');
    const data = await response.json();
    return data.quote;
  } catch (error) {
    console.error('Quote API failed, using fallback:', error);
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  }
}
