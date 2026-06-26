import { describe, expect, it } from 'vitest';
import { filterVersesToRange, normalizeVersesToSequentialRange } from '../services/verse-range-utils';

describe('filterVersesToRange', () => {
  it('keeps only verses that fall inside the requested range', () => {
    const verses = [
      { verse: 11, text: 'verse 11' },
      { verse: 1, text: 'verse 1' },
      { verse: 2, text: 'verse 2' },
      { verse: 12, text: 'verse 12' },
    ];

    expect(filterVersesToRange(verses, 1, 2)).toEqual([
      { verse: 1, text: 'verse 1' },
      { verse: 2, text: 'verse 2' },
    ]);
  });

  it('returns an empty array when no verses match the requested range', () => {
    const verses = [{ verse: 11, text: 'verse 11' }];

    expect(filterVersesToRange(verses, 1, 2)).toEqual([]);
  });

  it('fills any missing opening verses so the response still begins at verse 1', () => {
    const verses = [
      { verse: 11, text: 'verse 11', commentary: 'Later verse content' },
      { verse: 12, text: 'verse 12', commentary: 'Later verse content' },
    ];

    expect(normalizeVersesToSequentialRange(verses, 1, 12)).toEqual([
      { verse: 1, text: 'Summary for verse 1 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 2, text: 'Summary for verse 2 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 3, text: 'Summary for verse 3 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 4, text: 'Summary for verse 4 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 5, text: 'Summary for verse 5 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 6, text: 'Summary for verse 6 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 7, text: 'Summary for verse 7 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 8, text: 'Summary for verse 8 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 9, text: 'Summary for verse 9 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 10, text: 'Summary for verse 10 is not available from the model yet.', commentary: 'The model did not return a verse-specific entry for this passage, so a concise placeholder summary is being used.', deeperMeaning: '', greekWords: [], coolPoints: [], questions: [], crossReferences: [], people: [], themes: [] },
      { verse: 11, text: 'verse 11', commentary: 'Later verse content' },
      { verse: 12, text: 'verse 12', commentary: 'Later verse content' },
    ]);
  });
});
