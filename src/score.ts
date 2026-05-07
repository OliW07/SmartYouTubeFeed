import data from "../data/keywords.json";

const { keywords, channels } = data;

export function score(title: string, channel: string): number {
  const lowerTitle = title.toLowerCase();
  const lowerChannel = channel.toLowerCase();
  let totalScore = 0;

  for (const [keyword, weight] of Object.entries(keywords)) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      totalScore += weight;
    }
  }

  for (const [ch, weight] of Object.entries(channels)) {
    if (lowerChannel.includes(ch.toLowerCase())) {
      totalScore += weight;
    }
  }

  return totalScore;
}
