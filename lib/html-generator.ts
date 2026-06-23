/**
 * HTML Generator: converts structured commentary data into mobile-optimized HTML
 * 
 * Usage:
 *   const html = generateCommentaryHTML(commentaryData)
 *   fs.writeFileSync(`${book}-${chapter}.html`, html)
 */

import { ChapterCommentary, VerseCommentary, GreekWord, ReflectionQuestion } from './types'
import { DESIGN_SYSTEM, generateCSSVariables, GLOBAL_CSS, THEME_CSS } from './design-system'

export function generateCommentaryHTML(data: ChapterCommentary): string {
  const config = DESIGN_SYSTEM[data.bookType]
  const cssVars = generateCSSVariables(config)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.book} ${data.chapter} — Bible Commentary</title>
  <link href="https://fonts.googleapis.com/css2?family=${config.fontSerif?.replace(' ', '+')}&family=${config.fontSans?.replace(' ', '+')}&display=swap" rel="stylesheet">
  <style>
    ${cssVars}

    ${GLOBAL_CSS}

    ${THEME_CSS}
  </style>
</head>
<body>
  <div class="container">
    ${generateHero(data)}
    ${generateOverview(data)}
    ${data.verses.map((v, i) => generateVerseCard(v, i)).join('')}
    ${generateFooter(data)}
  </div>
</body>
</html>
  `.trim()

  return html
}

function generateHero(data: ChapterCommentary): string {
  return `
    <div class="hero">
      <h1>${data.book}</h1>
      <div class="chapter">Chapter ${data.chapter}</div>
      <div class="key-verse">"${data.keyVerse}"</div>
    </div>
  `.trim()
}

function generateOverview(data: ChapterCommentary): string {
  return `
    <div class="overview-card">
      <h3>Overview</h3>
      <p>${data.overview}</p>
    </div>
  `.trim()
}

function generateVerseCard(verse: VerseCommentary, index: number): string {
  const themesStr = verse.themes.join('|')

  return `
    <div class="verse-card" data-themes="${themesStr}" id="verse-${index}">
      <details class="verse-details" open>
        <summary class="verse-card-header">
          <div class="verse-number">Verse ${verse.verse}</div>
          <div class="verse-text">"${verse.text}"</div>
        </summary>
        
        <div class="verse-card-content">
          <details class="section-detail">
            <summary class="section-title">💬 Commentary</summary>
            <div class="section-content">
              <p>${verse.commentary}</p>
            </div>
          </details>

          <details class="section-detail" open>
            <summary class="section-title">🔍 Deeper Meaning</summary>
            <div class="section-content">
              <p>${verse.deeperMeaning}</p>
              ${verse.wowBox ? `<div class="wow-box">✨ ${verse.wowBox}</div>` : ''}
            </div>
          </details>

          ${verse.greekWords.length > 0 ? `
            <details class="section-detail">
              <summary class="section-title">🏛️ Greek Words</summary>
              <div class="section-content">
                ${verse.greekWords.map(w => generateGreekWord(w)).join('')}
              </div>
            </details>
          ` : ''}

          ${verse.coolPoints.length > 0 ? `
            <details class="section-detail">
              <summary class="section-title">⚡ Cool Points</summary>
              <div class="section-content">
                <ul class="cool-points">
                  ${verse.coolPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
              </div>
            </details>
          ` : ''}

          <details class="section-detail">
            <summary class="section-title">📖 Lesson</summary>
            <div class="section-content">
              <p>${verse.lesson}</p>
            </div>
          </details>

          ${verse.questions.length > 0 ? `
            <details class="section-detail">
              <summary class="section-title">❓ Reflection Questions</summary>
              <div class="section-content">
                <div class="questions-accordion">
                  ${verse.questions.map((q, qi) => generateQuestion(q, `${index}-${qi}`)).join('')}
                </div>
              </div>
            </details>
          ` : ''}

          ${verse.crossReferences.length > 0 ? `
            <details class="section-detail">
              <summary class="section-title">🔗 Cross References</summary>
              <div class="section-content">
                ${verse.crossReferences.map(cr => generateCrossRef(cr)).join('')}
              </div>
            </details>
          ` : ''}

          ${verse.people && verse.people.length > 0 ? `
            <details class="section-detail">
              <summary class="section-title">👤 Key People</summary>
              <div class="section-content">
                ${verse.people.map(p => generatePersonBio(p)).join('')}
              </div>
            </details>
          ` : ''}
        </div>
      </details>
    </div>
  `.trim()
}

function generateGreekWord(word: GreekWord): string {
  return `
    <div class="greek-word">
      <div class="greek-char">${word.word}</div>
      <div class="greek-info">
        <strong>${word.transliteration}</strong> · "${word.gloss}"
      </div>
      <div class="greek-info"><strong>Definition:</strong> ${word.definition}</div>
      <p><strong>Why it matters:</strong> ${word.insight}</p>
    </div>
  `.trim()
}

function generateQuestion(q: ReflectionQuestion, _id: string): string {
  return `
    <details class="question-item">
      <summary class="question-header">${q.question}</summary>
      <div class="question-content">
        <p>${q.answer}</p>
      </div>
    </details>
  `.trim()
}

function generateCrossRef(cr: any): string {
  return `
    <div class="cross-ref">
      <div class="cross-ref-passage">${cr.passage}</div>
      <div class="cross-ref-explanation">${cr.explanation}</div>
    </div>
  `.trim()
}

function generatePersonBio(p: any): string {
  return `
    <div class="person-bio">
      <div class="person-avatar">${p.name.split(' ').map((n: string) => n[0]).join('')}</div>
      <div class="person-info">
        <div class="person-name">${p.name}</div>
        <div class="person-role">${p.role}</div>
        <div class="person-bio-text">${p.relationshipToPassage}</div>
        ${p.keyTexts ? `<div class="person-key-texts">Key texts: ${p.keyTexts.join(', ')}</div>` : ''}
      </div>
    </div>
  `.trim()
}

function generateFooter(data: ChapterCommentary): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return `
    <div class="footer">
      <p>${data.book} Chapter ${data.chapter}</p>
      <div class="footer-metadata">
        <span>Generated: ${today}</span>
        <span>Translation: ${data.translation || 'ESV'}</span>
        ${data.generatedBy ? `<span>By: ${data.generatedBy}</span>` : ''}
      </div>
      <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--muted);">
        Scripture taken from the ESV® Bible (The Holy Bible, English Standard Version®),
        copyright © 2001 by Crossway Bibles
      </p>
    </div>
  `.trim()
}

export default generateCommentaryHTML
