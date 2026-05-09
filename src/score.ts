import data from "../data/keywords.json";

const { keywords, channels } = data;

export function score(
  title: string,
  channel: string,
  customKeywords?: Record<string, number>,
  customChannels?: Record<string, number>,
): number {
  const lowerTitle = title.toLowerCase();
  const lowerChannel = channel.toLowerCase();
  let totalScore = 0;

  for (const [keyword, weight] of Object.entries(keywords)) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      totalScore += weight;
    }
  }
  if (customKeywords) {
    for (const [keyword, weight] of Object.entries(customKeywords)) {
      if (lowerTitle.includes(keyword.toLowerCase())) {
        totalScore += weight;
      }
    }
  }

  for (const [ch, weight] of Object.entries(channels)) {
    if (lowerChannel.includes(ch.toLowerCase())) {
      totalScore += weight;
    }
  }
  if (customChannels) {
    for (const [ch, weight] of Object.entries(customChannels)) {
      if (lowerChannel.includes(ch.toLowerCase())) {
        totalScore += weight;
      }
    }
  }

  return totalScore;
}
