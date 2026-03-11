export const MOTIVATIONAL_QUOTES = [
  "Action is the foundational key to all success.",
  "Your only limit is your mind.",
  "Don't stop until you're proud.",
  "Focus on being productive instead of busy.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Discipline is choosing between what you want now and what you want most.",
  "The way to get started is to quit talking and begin doing.",
  "Efficiency is doing things right; effectiveness is doing the right things.",
  "Your future is created by what you do today, not tomorrow.",
  "Productivity is never an accident. It is always the result of a commitment to excellence.",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
  "The most effective way to do it, is to do it.",
  "Either you run the day or the day runs you.",
  "Done is better than perfect."
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
