import keywords from "../data/keywords.json";

export function score(title: string, channel: string): number {
  const lowerTitle = title.toLowerCase();
  let totalScore = 0;

  for (const [keyword, weight] of Object.entries(keywords.positive)) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      totalScore += weight;
    }
  }

  for (const [keyword, weight] of Object.entries(keywords.negative)) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      totalScore += weight;
    }
  }

  return totalScore;
}
