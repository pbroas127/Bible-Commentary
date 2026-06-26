/**
 * HTML Generator: converts structured commentary data into mobile-optimized HTML
 * 
 * Usage:
 *   const html = generateCommentaryHTML(commentaryData)
 *   fs.writeFileSync(`${book}-${chapter}.html`, html)
 */

import { ChapterCommentary, VerseGroup, GreekWord, ReflectionQuestion } from './types'
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
    ${data.groups.map((g, i) => generateGroupCard(g, i)).join('')}
    ${generateChapterLevelExtras(data)}
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
 
function generateChapterLevelExtras(data: ChapterCommentary): string {
  const crossRefs = data.crossReferences || []
  const people = data.keyPeople || []

  return `
    ${crossRefs.length > 0 ? `
      <div class="overview-card">
        <h3>Cross References</h3>
        ${crossRefs.map(cr => generateCrossRef(cr)).join('')}
      </div>
    ` : ''}

    ${people.length > 0 ? `
      <div class="overview-card">
        <h3>Key People</h3>
        ${people.map(p => generatePersonBio(p)).join('')}
      </div>
    ` : ''}
  `.trim()
}

function generateGroupCard(group: VerseGroup, index: number): string {
  const themesStr = group.themes.join('|')

  return `
    <div class="verse-card" data-themes="${themesStr}" id="group-${index}">
      <details class="verse-details" open>
        <summary class="verse-card-header">
          <div class="verse-number">${group.verses}</div>
          <div class="verse-text">"${group.text}"</div>
        </summary>

        <div class="verse-card-content">
          <table class="group-table">
            <tbody>
              <tr>
                <th>Commentary</th>
                <td><div class="section-content"><p>${group.commentary}</p></div></td>
              </tr>
              <tr>
                <th>Deeper Meaning</th>
                <td><div class="section-content"><p>${group.deeperMeaning}</p></div></td>
              </tr>
              <tr>
                <th>Greek Words</th>
                <td>
                  <div class="section-content">
                    ${group.greekWords && group.greekWords.length > 0 ? group.greekWords.map(w => generateGreekWord(w)).join('') : '<em>—</em>'}
                  </div>
                </td>
              </tr>
              <tr>
                <th>Lessons</th>
                <td>
                  <div class="section-content">
                    <ul class="lessons-list">
                      ${group.lessons.map(l => `<li>${l}</li>`).join('')}
                    </ul>
                  </div>
                </td>
              </tr>
              <tr>
                <th>Cool Points</th>
                <td>
                  <div class="section-content">
                    ${group.coolPoints && group.coolPoints.length > 0 ? `<ul class="coolpoints-list">${group.coolPoints.map(cp => `<li>${cp}</li>`).join('')}</ul>` : '<em>—</em>'}
                  </div>
                </td>
              </tr>
              ${group.questions && group.questions.length > 0 ? `
              <tr>
                <th>Reflection</th>
                <td>
                  <div class="section-content">
                    ${group.questions.map((q, qi) => generateQuestion(q, `${index}-q-${qi}`)).join('')}
                  </div>
                </td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          ${group.crossReferences && group.crossReferences.length > 0 ? `
            <div class="group-crossrefs">
              <h4>Cross References</h4>
              ${group.crossReferences.map(cr => generateCrossRef(cr)).join('')}
            </div>
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
