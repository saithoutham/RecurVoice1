export const SENTENCE_POOL = [
  "The north wind and the sun were both very strong",
  "She sells seashells by the seashore every summer",
  "How much wood would a woodchuck chuck if it could",
  "The weather is warm and wonderful in the morning",
  "Peter walked slowly through the peaceful garden path",
  "The cat sat quietly beside the warm fireplace",
  "Birds sang softly in the tall oak tree outside",
  "Mary carried fresh flowers through the open field",
  "The old dog slept peacefully by the back door",
  "Six smooth stones sat beside the shallow stream",
  "Thomas spoke clearly to the group of children",
  "The brown bread was warm and fresh from the oven",
  "Helen walked carefully down the long garden path",
  "Four fat frogs sat on flat floating logs today",
  "The purple flowers bloomed beside the stone wall",
  "Robert read the paper slowly each Sunday morning",
  "The gray clouds moved quietly across the open sky",
  "Susan poured warm tea into the blue ceramic cup",
  "The green leaves rustled softly in the gentle breeze",
  "Charlie called his sister every single Sunday evening",
  "The tall lighthouse stood at the edge of the shore",
  "Dorothy fed the birds every morning without fail",
  "The small brown rabbit sat still in the tall grass",
  "William wrote long letters to his family each week",
  "The yellow butterfly landed on the pink garden rose",
  "Frank drove slowly down the quiet country road",
  "The river flowed smoothly between the mossy stones",
  "Clara hummed softly while she folded the clean laundry",
  "The wooden chair creaked gently in the warm breeze",
  "George planted tomatoes along the sunny garden wall"
] as const;

export function sentenceForToday(date = new Date()) {
  return SENTENCE_POOL[date.getDate() % SENTENCE_POOL.length];
}

export function interpretHnr(value: number) {
  if (value > 15) return { label: "Normal", tone: "text-green-700" };
  if (value >= 10) return { label: "Slightly reduced", tone: "text-yellow-700" };
  return { label: "Reduced", tone: "text-red-700" };
}

export function interpretJitter(value: number) {
  if (value < 1) return { label: "Normal", tone: "text-green-700" };
  if (value <= 2) return { label: "Slightly elevated", tone: "text-yellow-700" };
  return { label: "Elevated", tone: "text-red-700" };
}

export function interpretShimmer(value: number) {
  if (value < 3) return { label: "Normal", tone: "text-green-700" };
  if (value <= 5) return { label: "Slightly elevated", tone: "text-yellow-700" };
  return { label: "Elevated", tone: "text-red-700" };
}
