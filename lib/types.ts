/**
 * Type definitions for Bible Commentary data structures
 * Used to pass structured content to the HTML generator
 */

export interface VerseCommentary {
  verse: string; // "1", "2:1-3", etc.
  text: string; // The actual verse text
  commentary: string; // What's happening in context
  deeperMeaning: string; // Theological/symbolic meaning
  wowBox?: string; // Vivid analogy or insight
  greekWords: GreekWord[];
  coolPoints: string[]; // Array of surprising details
  lesson: string; // One actionable takeaway
  questions: ReflectionQuestion[];
  crossReferences: CrossReference[];
  people?: PersonBio[];
  themes: Theme[]; // e.g., ["Gospel", "Grace", "Identity"]
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
  verses: VerseCommentary[];
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
