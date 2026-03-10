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
