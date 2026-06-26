/**
 * Type definitions for Bible Commentary data structures
 * Used to pass structured content to the HTML generator
 */

/**
 * A verse group represents a logical section within a chapter that may
 * span one or more verse numbers (e.g. "1", "6-7", "18-19"). Each group
 * contains the named content blocks required by the UI.
 */
export interface VerseGroup {
  id?: string; // optional stable id
  verses: string; // e.g. "1", "6-7", "18-19"
  text: string; // Combined verse text for the group
  commentary: string; // Commentary block
  deeperMeaning: string; // Deeper meaning block
  greekWords: GreekWord[]; // Greek words relevant to the group
  lessons: string[]; // One or more short lessons/takeaways
  coolPoints?: string[]; // Optional interesting/cool facts or points
  questions: ReflectionQuestion[]; // Reflection questions for the group
  crossReferences?: CrossReference[]; // Optional cross-refs specific to this group
  themes: Theme[];
}

export interface GreekWord {
  word: string; // Greek characters
  transliteration: string; // Romanized form
  gloss: string; // English gloss
  definition: string; // Full definition
  insight: string; // Why this word matters in this passage
}

export interface ReflectionQuestion {
  question: string;
  answer: string; // Substantive 3-5 sentence answer
}

export interface CrossReference {
  passage: string; // e.g., "Romans 6:1-10"
  explanation: string; // Why it connects
}

export interface PersonBio {
  name: string;
  role: string; // e.g., "Apostle", "Pharisee"
  background: string;
  keyMoments: string[];
  relationshipToPassage: string;
  legacy: string;
  keyTexts?: string[]; // e.g., ["Galatians 1:1", "1 Corinthians 9:1"]
  characterType?: 'apostle' | 'disciple' | 'opponent' | 'supporter' | 'named-person';
}

export type Theme = 
  | 'Gospel'
  | 'Grace'
  | 'Identity'
  | 'Authority'
  | 'Faith'
  | 'Knowledge'
  | 'Calling'
  | 'Scripture'
  | 'Virtue'
  | 'Transformation'
  | 'False Teaching'
  | 'Unity'
  | 'Suffering'
  | 'Hope'
  | 'Prayer'
  | 'Love'
  | 'Wisdom';

export interface ChapterCommentary {
  book: string; // "Galatians", "2 Peter", etc.
  chapter: number;
  translation?: string; // "ESV", "NIV", etc. — defaults to "ESV"
  overview: string; // One paragraph explaining the chapter context
  keyVerse: string; // Verse to highlight in hero section
  groups: VerseGroup[]; // Logical verse groups for the chapter
  crossReferences?: CrossReference[]; // Chapter-level cross references
  keyPeople?: PersonBio[]; // Chapter-level notable people
  bookType: BookType;
  generatedAt?: Date;
  generatedBy?: string; // e.g., "Claude 3.5 Sonnet"
}

export type BookType =
  | 'pauline'      // Romans, Galatians, Corinthians, Ephesians, Philippians, Colossians, Thessalonians, Timothy, Titus, Philemon
  | 'peter'        // 1 Peter, 2 Peter
  | 'john'         // 1 John, 2 John, 3 John
  | 'gospel'       // Matthew, Mark, Luke, John
  | 'acts'         // Acts
  | 'hebrews'      // Hebrews
  | 'james'        // James
  | 'jude'         // Jude
  | 'revelation'   // Revelation
  | 'wisdom'       // Psalms, Proverbs, Ecclesiastes, Song of Solomon
  | 'prophets';    // Isaiah, Jeremiah, Lamentations, Ezekiel, Daniel, Hosea, Joel, Amos, Obadiah, Jonah, Micah, Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi

export interface DesignConfig {
  bookType: BookType;
  accentColor: string; // e.g., "#c8a45a" for Pauline
  backgroundColor?: string; // e.g., "#0c0b09"
  fontSerif?: string; // e.g., "Playfair Display"
  fontSans?: string; // e.g., "DM Sans"
}
