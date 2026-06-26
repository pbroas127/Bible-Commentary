export function filterVersesToRange(verses: Array<{ verse?: number | string }>, startVerse: number, endVerse: number) {
  return (verses || []).filter((verseEntry) => {
    const verseNumber = Number(verseEntry?.verse);
    return Number.isFinite(verseNumber) && verseNumber >= startVerse && verseNumber <= endVerse;
  });
}

export function normalizeVersesToSequentialRange(
  verses: Array<{ verse?: number | string; [key: string]: any }>,
  startVerse: number,
  endVerse: number,
) {
  const verseEntries = (verses || []).filter((verseEntry) => {
    const verseNumber = Number(verseEntry?.verse);
    return Number.isFinite(verseNumber) && verseNumber >= startVerse;
  });

  const verseMap = new Map<string, any>();
  for (const verseEntry of verseEntries) {
    const verseNumber = Number(verseEntry.verse);
    if (!Number.isFinite(verseNumber)) continue;
    verseMap.set(String(verseNumber), verseEntry);
  }

  const normalized: Array<{ verse: number; [key: string]: any }> = [];
  const maxVerse = Number.isFinite(endVerse) ? endVerse : Math.max(...Array.from(verseMap.keys(), (key) => Number(key)), startVerse);

  for (let verseNumber = startVerse; verseNumber <= maxVerse; verseNumber += 1) {
    const existing = verseMap.get(String(verseNumber));
    if (existing) {
      normalized.push({ ...existing, verse: verseNumber });
      continue;
    }

    normalized.push({
      verse: verseNumber,
      text: `Summary for verse ${verseNumber} is not available from the model yet.`,
      commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.',
      deeperMeaning: '',
      greekWords: [],
      coolPoints: [],
      questions: [],
      crossReferences: [],
      people: [],
      themes: [],
    });
  }

  return normalized;
}
