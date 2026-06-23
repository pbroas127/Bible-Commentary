/**
 * Type definitions for Bible Commentary data structures
 * Used to pass structured content to the HTML generator
 */
export interface VerseCommentary {
    verse: string;
    text: string;
    commentary: string;
    deeperMeaning: string;
    wowBox?: string;
    greekWords: GreekWord[];
    coolPoints: string[];
    lesson: string;
    questions: ReflectionQuestion[];
    crossReferences: CrossReference[];
    people?: PersonBio[];
    themes: Theme[];
}
export interface GreekWord {
    word: string;
    transliteration: string;
    gloss: string;
    definition: string;
    insight: string;
}
export interface ReflectionQuestion {
    question: string;
    answer: string;
}
export interface CrossReference {
    passage: string;
    explanation: string;
}
export interface PersonBio {
    name: string;
    role: string;
    background: string;
    keyMoments: string[];
    relationshipToPassage: string;
    legacy: string;
    keyTexts?: string[];
    characterType?: 'apostle' | 'disciple' | 'opponent' | 'supporter' | 'named-person';
}
export type Theme = 'Gospel' | 'Grace' | 'Identity' | 'Authority' | 'Faith' | 'Knowledge' | 'Calling' | 'Scripture' | 'Virtue' | 'Transformation' | 'False Teaching' | 'Unity' | 'Suffering' | 'Hope' | 'Prayer' | 'Love' | 'Wisdom';
export interface ChapterCommentary {
    book: string;
    chapter: number;
    translation?: string;
    overview: string;
    keyVerse: string;
    verses: VerseCommentary[];
    bookType: BookType;
    generatedAt?: Date;
    generatedBy?: string;
}
export type BookType = 'pauline' | 'peter' | 'john' | 'gospel' | 'acts' | 'hebrews' | 'james' | 'jude' | 'revelation' | 'wisdom' | 'prophets';
export interface DesignConfig {
    bookType: BookType;
    accentColor: string;
    backgroundColor?: string;
    fontSerif?: string;
    fontSans?: string;
}
//# sourceMappingURL=types.d.ts.map