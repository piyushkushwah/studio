export const MOTIVATIONAL_QUOTES = [
  "Timer started. Time to focus.",
  "One task at a time. Finish strong.",
  "Check it off. You've got this.",
  "Focus Radio on. Distractions off.",
  "Keep the streak alive.",
  "High priority first.",
  "Small wins lead to big goals.",
  "Your future self will thank you.",
  "Stay in the flow.",
  "One Pomodoro closer.",
  "Organize. Focus. Conquer.",
  "Beat the clock. Finish the task.",
  "Consistency is your superpower.",
  "Deep work starts now.",
  "Master your day.",
  "Make every minute count.",
  "Focus is a choice.",
  "Progress over perfection.",
  "Labels set. Mind clear.",
  "Start your next sprint."
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
