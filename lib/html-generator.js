/**
 * HTML Generator: converts structured commentary data into mobile-optimized HTML
 *
 * Usage:
 *   const html = generateCommentaryHTML(commentaryData)
 *   fs.writeFileSync(`${book}-${chapter}.html`, html)
 */
import { DESIGN_SYSTEM, generateCSSVariables, GLOBAL_CSS, THEME_CSS } from './design-system';
export function generateCommentaryHTML(data) {
    const config = DESIGN_SYSTEM[data.bookType];
    const cssVars = generateCSSVariables(config);
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
      ${(data.groups ? data.groups.map((g, i) => generateGroupCard(g, i)) : data.verses.map((v, i) => generateVerseCard(v, i))).join('')}
    ${generateFooter(data)}
    </div>
  <script>
    window.switchTab = function(event, blockId, tabId) {
      event.preventDefault();
      event.stopPropagation();
      const block = document.getElementById(blockId);
      if (!block) return;
      const contents = block.querySelectorAll('.tab-content');
      contents.forEach(c => c.classList.remove('active'));
      const buttons = block.querySelectorAll('.tab-button');
      buttons.forEach(b => b.classList.remove('active'));
      const selectedContent = block.querySelector('#' + blockId + '-tab-' + tabId);
      if (selectedContent) selectedContent.classList.add('active');
      event.target.classList.add('active');
    };
  </script>
</body>
</html>
  `.trim();
    return html;
}
function generateHero(data) {
    return `
    <div class="hero">
      <h1>${data.book}</h1>
      <div class="chapter">Chapter ${data.chapter}</div>
      <div class="key-verse">"${data.keyVerse}"</div>
    </div>
  `.trim();
}
function generateOverview(data) {
    return `
    <div class="overview-card">
      <h3>Overview</h3>
      <p>${data.overview}</p>
    </div>
  `.trim();
}
function generateGroupCard(group, index) {
    const themesStr = (group.themes || []).join('|');
    // Build tabs array
    const tabs = [
      { id: 'commentary', label: '💬 Commentary', content: group.commentary ? [group.commentary] : [], show: !!group.commentary },
      { id: 'deeper', label: '🔍 Deeper Meaning', content: group.deeperMeaning ? [group.deeperMeaning] : [], show: !!group.deeperMeaning },
      { id: 'greek', label: '🏛️ Greek Words', content: group.greekWords || [], show: (group.greekWords && group.greekWords.length > 0) },
      { id: 'lessons', label: '📖 Lessons', content: group.lessons || [], show: (group.lessons && group.lessons.length > 0) },
      { id: 'reflection', label: '❓ Reflection', content: group.questions || [], show: (group.questions && group.questions.length > 0) },
    ].filter(t => t.show);

    return `
    <div class="verse-card" data-themes="${themesStr}" id="group-${index}">
      <div class="verse-card-header">
        <div class="verse-number">${group.verses}</div>
        <div class="verse-text">"${group.text}"</div>
      </div>

      ${tabs.length > 0 ? `
        <div class="verse-tabs">
          ${tabs.map((tab, idx) => `
            <button class="tab-button ${idx === 0 ? 'active' : ''}" onclick="(function(btn,e){e&&e.preventDefault&&e.preventDefault();e&&e.stopPropagation&&e.stopPropagation();var block=document.getElementById('group-${index}');if(!block)return;block.querySelectorAll('.tab-content').forEach(function(c){c.classList.remove('active');});block.querySelectorAll('.tab-button').forEach(function(b){b.classList.remove('active');});var sel=block.querySelector('#group-${index}-tab-${tab.id}');if(sel)sel.classList.add('active');btn.classList.add('active');})(this,event)">${tab.label}</button>
          `).join('')}
        </div>

        <div class="verse-tab-content">
          ${tabs.map((tab, idx) => `
            <div id="group-${index}-tab-${tab.id}" class="tab-content ${idx === 0 ? 'active' : ''}">
              ${generateTabContent(tab.id, tab.content, group)}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${group.crossReferences && group.crossReferences.length > 0 ? `
        <div class="group-crossrefs">
          <h4>Cross References</h4>
          ${group.crossReferences.map(cr => generateCrossRef(cr)).join('')}
        </div>
      ` : ''}
    </div>
  `.trim();
}

function generateTabContent(tabId, content, group) {
  switch (tabId) {
    case 'commentary':
      return content.map((c, i) => `<div class="content-block"><p>${c}</p></div>`).join('');
    case 'deeper':
      return content.map((c, i) => `<div class="content-block"><p>${c}</p></div>`).join('');
    case 'greek':
      return (content || []).map(w => generateGreekWord(w)).join('');
    case 'lessons':
      return `<ul class="lessons-list">${(content || []).map(l => `<li>${l}</li>`).join('')}</ul>`;
    case 'reflection':
      return (content || []).map((q, qi) => generateQuestion(q, `r-${qi}`)).join('');
    default:
      return '';
  }
}
function generateVerseCard(verse, index) {
    const themesStr = verse.themes.join('|');
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
  `.trim();
}
function generateGreekWord(word) {
    return `
    <div class="greek-word">
      <div class="greek-char">${word.word}</div>
      <div class="greek-info">
        <strong>${word.transliteration}</strong> · "${word.gloss}"
      </div>
      <div class="greek-info"><strong>Definition:</strong> ${word.definition}</div>
      <p><strong>Why it matters:</strong> ${word.insight}</p>
    </div>
  `.trim();
}
function generateQuestion(q, _id) {
    return `
    <details class="question-item">
      <summary class="question-header">${q.question}</summary>
      <div class="question-content">
        <p>${q.answer}</p>
      </div>
    </details>
  `.trim();
}
function generateCrossRef(cr) {
    return `
    <div class="cross-ref">
      <div class="cross-ref-passage">${cr.passage}</div>
      <div class="cross-ref-explanation">${cr.explanation}</div>
    </div>
  `.trim();
}
function generatePersonBio(p) {
    return `
    <div class="person-bio">
      <div class="person-avatar">${p.name.split(' ').map((n) => n[0]).join('')}</div>
      <div class="person-info">
        <div class="person-name">${p.name}</div>
        <div class="person-role">${p.role}</div>
        <div class="person-bio-text">${p.relationshipToPassage}</div>
        ${p.keyTexts ? `<div class="person-key-texts">Key texts: ${p.keyTexts.join(', ')}</div>` : ''}
      </div>
    </div>
  `.trim();
}
function generateFooter(data) {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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
  `.trim();
}
export default generateCommentaryHTML;
//# sourceMappingURL=html-generator.js.map