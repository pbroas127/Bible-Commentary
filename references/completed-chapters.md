# Bible Commentary — Reference

## Completed Chapters

These chapters already have full HTML files built. Do not rebuild them unless the user asks for an update.

| File | Book | Chapter | Accent Color | Notes |
|------|------|---------|-------------|-------|
| `1cor1.html` | 1 Corinthians | 1 | Purple `#a48ec4` | Divisions, foolishness of cross, God chose weak |
| `galatians1.html` | Galatians | 1 | Gold `#c8a45a` | No other gospel, Paul's Damascus conversion, bios: Paul/Gamaliel/Peter/James |
| `galatians2.html` | Galatians | 2 | Gold `#c8a45a` | Jerusalem visit, Paul vs Peter in Antioch, justification by faith, crucified with Christ, bios: Barnabas/Titus/John |
| `2peter1.html` | 2 Peter | 1 | Teal `#5bb8a0` | Divine power, ladder of virtue, Transfiguration, Scripture inspiration |

---

## HTML Shell Template

Use this as the structural skeleton. Replace `[ACCENT]`, `[ACCENT-DIM]`, `[ACCENT-BG]`, `[BOOK]`, `[CHAPTER]`, `[KEY-VERSE]`, and content sections.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>[BOOK] [CHAPTER] — Commentary</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#0c0b09;--surface:#161412;--surface2:#1e1b17;--surface3:#252118;
  --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
  --accent:[ACCENT];--accent-dim:[ACCENT-DIM];--accent-bg:[ACCENT-BG];
  --text:#ede8df;--muted:#7d7568;--muted2:#a09488;
  --blue:#6fa8d4;--blue-bg:rgba(111,168,212,0.08);
  --purple:#a48ec4;--purple-bg:rgba(164,142,196,0.08);
  --green:#6dba8a;--green-bg:rgba(109,186,138,0.08);
  --coral:#d4896a;--coral-bg:rgba(212,137,106,0.08);
  --rose:#c47a8a;--rose-bg:rgba(196,122,138,0.08);
  --gray-tag:#888780;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-weight:300;line-height:1.7;padding-bottom:80px}

/* HERO */
.hero{padding:52px 20px 36px;background:linear-gradient(180deg,#1a1508 0%,var(--bg) 100%);border-bottom:1px solid var(--border)}
.hero-eyebrow{font-size:10px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.hero-title{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;line-height:1.1;margin-bottom:6px}
.hero-title em{font-style:italic;color:var(--accent)}
.hero-verse{font-family:'Playfair Display',serif;font-style:italic;font-size:14px;color:var(--muted2);margin-top:12px;line-height:1.65;border-left:2px solid var(--accent-dim);padding-left:12px;max-width:480px}

/* FILTER BAR */
.filter-bar{padding:11px 14px;border-bottom:1px solid var(--border);background:var(--surface);overflow-x:auto;display:flex;gap:7px;scrollbar-width:none}
.filter-bar::-webkit-scrollbar{display:none}
.filter-label{font-size:10px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);align-self:center;white-space:nowrap;margin-right:4px;flex-shrink:0}
.theme-chip{font-size:11px;font-weight:500;padding:5px 12px;border-radius:100px;border:1px solid var(--border2);color:var(--muted2);cursor:pointer;white-space:nowrap;background:transparent;transition:all 0.18s;flex-shrink:0}
.theme-chip.active{color:#0c0b09;background:var(--accent);border-color:var(--accent)}

/* NAV */
.nav-scroll{overflow-x:auto;display:flex;gap:8px;padding:11px 14px;scrollbar-width:none;border-bottom:1px solid var(--border);background:var(--surface2);position:sticky;top:0;z-index:100}
.nav-scroll::-webkit-scrollbar{display:none}
.nav-pill{white-space:nowrap;font-size:11px;font-weight:500;padding:6px 13px;border-radius:100px;border:1px solid var(--border);color:var(--muted);cursor:pointer;background:transparent;text-decoration:none;transition:all 0.18s}
.nav-pill:active{background:var(--accent);color:#0c0b09;border-color:var(--accent)}

/* SECTION LABEL */
.section-label{font-size:10px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;color:var(--accent-dim);padding:26px 16px 10px}

/* OVERVIEW */
.overview{margin:0 12px 8px;background:var(--accent-bg);border:1px solid rgba(200,164,90,0.18);border-radius:16px;padding:18px}
.overview-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:500;color:var(--accent);margin-bottom:8px}
.overview-text{font-size:13px;color:var(--muted2);line-height:1.7}

/* VERSE CARDS */
.verse-card{margin:0 12px 12px;background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:border-color 0.2s}
.verse-card.open{border-color:var(--border2)}
.verse-card.hidden{display:none}
.verse-header{display:flex;align-items:flex-start;gap:12px;padding:16px;cursor:pointer;user-select:none}
.verse-num{background:rgba(200,164,90,0.1);color:var(--accent);font-size:11px;font-weight:500;padding:4px 10px;border-radius:100px;white-space:nowrap;flex-shrink:0;border:1px solid rgba(200,164,90,0.18);margin-top:1px}
.verse-meta{flex:1;min-width:0}
.verse-preview{font-size:13px;color:var(--muted2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.verse-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.vtag{font-size:10px;font-weight:500;padding:3px 8px;border-radius:100px;border:1px solid transparent}
.verse-chevron{color:var(--muted);font-size:11px;flex-shrink:0;transition:transform 0.22s;margin-top:2px}
.verse-card.open .verse-chevron{transform:rotate(90deg)}
.verse-body{display:none;border-top:1px solid var(--border)}
.verse-card.open .verse-body{display:block}

/* TABS */
.tab-scroll{overflow-x:auto;display:flex;gap:6px;padding:11px 13px;scrollbar-width:none;border-bottom:1px solid var(--border);background:var(--surface2)}
.tab-scroll::-webkit-scrollbar{display:none}
.tab-btn{white-space:nowrap;font-size:11px;font-weight:500;padding:6px 13px;border-radius:100px;border:1px solid var(--border);color:var(--muted);cursor:pointer;background:transparent;transition:all 0.18s}
.tab-btn.active{color:#0c0b09;border-color:transparent}
.tab-btn.t-commentary.active{background:var(--blue)}
.tab-btn.t-meaning.active{background:var(--purple)}
.tab-btn.t-greek.active{background:var(--accent)}
.tab-btn.t-cool.active{background:var(--green)}
.tab-btn.t-lesson.active{background:var(--coral)}
.tab-btn.t-questions.active{background:var(--rose)}
.tab-btn.t-crossref.active{background:var(--gray-tag)}
.tab-btn.t-bios.active{background:var(--accent)}
.tab-panel{display:none;padding:16px}
.tab-panel.active{display:block}

/* CONTENT */
.block-label{font-size:10px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
.block-text{font-size:14px;color:var(--text);line-height:1.75;margin-bottom:14px}
.meaning-box{border-left:3px solid var(--purple);padding:12px 14px;background:var(--purple-bg);border-radius:0 10px 10px 0;margin-bottom:13px}
.meaning-box .block-label{color:var(--purple)}
.wow-box{background:var(--accent-bg);border:1px solid rgba(200,164,90,0.15);border-radius:12px;padding:14px;margin-bottom:13px}
.wow-box .block-label{color:var(--accent)}

/* GREEK CARDS */
.greek-card{background:var(--surface3);border:1px solid var(--border2);border-radius:12px;padding:14px;margin-bottom:12px}
.greek-word{font-family:'Playfair Display',serif;font-size:23px;font-style:italic;color:var(--accent);margin-bottom:2px}
.greek-transliteration{font-size:11px;color:var(--muted);letter-spacing:0.06em;margin-bottom:8px}
.greek-def{font-size:13px;color:var(--muted2);line-height:1.65;margin-bottom:8px}
.greek-insight{font-size:13px;color:var(--text);line-height:1.7;border-top:1px solid var(--border);padding-top:9px}
.greek-insight strong{color:var(--accent);font-weight:500}

/* QUESTIONS */
.q-item{border:1px solid var(--border);border-radius:12px;margin-bottom:10px;overflow:hidden;cursor:pointer}
.q-question{font-size:14px;font-weight:400;color:var(--text);padding:13px 14px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;line-height:1.5;user-select:none;background:var(--surface2)}
.q-arrow{color:var(--rose);font-size:11px;flex-shrink:0;margin-top:3px;transition:transform 0.2s}
.q-item.open .q-arrow{transform:rotate(90deg)}
.q-answer{display:none;padding:12px 14px;font-size:13px;color:var(--muted2);line-height:1.7;border-top:1px solid var(--border)}
.q-item.open .q-answer{display:block}

/* CROSS REFS */
.ref-item{display:flex;gap:10px;margin-bottom:11px;align-items:flex-start}
.ref-badge{background:rgba(136,135,128,0.12);color:var(--gray-tag);border:1px solid rgba(136,135,128,0.2);font-size:10px;font-weight:500;padding:4px 9px;border-radius:100px;white-space:nowrap;flex-shrink:0}
.ref-text{font-size:13px;color:var(--muted2);line-height:1.65}

/* BIO CARDS */
.bio-card{background:var(--surface3);border:1px solid var(--border2);border-radius:14px;padding:15px;margin-bottom:12px}
.bio-header{display:flex;align-items:center;gap:12px;margin-bottom:11px}
.bio-avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:15px;font-weight:700;flex-shrink:0;border:1px solid rgba(255,255,255,0.1)}
.bio-name{font-size:15px;font-weight:500;color:var(--text);margin-bottom:2px}
.bio-role{font-size:11px;color:var(--muted);letter-spacing:0.03em}
.bio-text{font-size:13px;color:var(--muted2);line-height:1.7;border-top:1px solid var(--border);padding-top:10px}
.bio-ref{display:block;font-size:10px;font-weight:500;margin-top:8px;color:var(--accent);letter-spacing:0.04em}

.footer{text-align:center;padding:48px 20px 20px;font-size:11px;color:var(--muted);opacity:0.35}
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="hero-eyebrow">Bible Study · [SERIES]</div>
  <div class="hero-title">[BOOK]<br><em>[CHAPTER NAME]</em></div>
  <div class="hero-verse">"[KEY VERSE TEXT]" — v.[N]</div>
</div>

<!-- THEME FILTER BAR -->
<div class="filter-bar">
  <span class="filter-label">Themes:</span>
  <!-- Add theme chips for themes present in this chapter -->
  <button class="theme-chip" data-theme="gospel" onclick="filterTheme(this)">Gospel</button>
  <!-- etc -->
</div>

<!-- NAV -->
<div class="nav-scroll">
  <a class="nav-pill" href="#s1">vv. X–X</a>
  <!-- etc -->
</div>

<!-- OVERVIEW -->
<div class="section-label">Overview</div>
<div class="overview">
  <div class="overview-title">[TITLE]</div>
  <div class="overview-text">[2–3 sentences on chapter context, who's writing, why, what's at stake]</div>
</div>

<!-- VERSE CARDS -->
<!-- Repeat this block for each verse grouping -->
<div class="section-label" id="s1">Verses X–X — [Section Title]</div>
<div class="verse-card" id="card1" data-themes="gospel grace">
  <div class="verse-header" onclick="toggleCard('card1')">
    <span class="verse-num">vv. X–X</span>
    <div class="verse-meta">
      <div class="verse-preview">"[Opening words of passage...]"</div>
      <div class="verse-tags">
        <span class="vtag" style="background:rgba(200,164,90,0.1);color:var(--accent);border-color:rgba(200,164,90,0.2)">Gospel</span>
      </div>
    </div>
    <span class="verse-chevron">▶</span>
  </div>
  <div class="verse-body">
    <div class="tab-scroll">
      <button class="tab-btn t-commentary active" onclick="switchTab(this,'c1','commentary')">Commentary</button>
      <button class="tab-btn t-meaning" onclick="switchTab(this,'c1','meaning')">Deeper Meaning</button>
      <button class="tab-btn t-greek" onclick="switchTab(this,'c1','greek')">Greek Words</button>
      <button class="tab-btn t-cool" onclick="switchTab(this,'c1','cool')">Cool Points</button>
      <button class="tab-btn t-lesson" onclick="switchTab(this,'c1','lesson')">Lesson</button>
      <button class="tab-btn t-questions" onclick="switchTab(this,'c1','questions')">Questions</button>
      <button class="tab-btn t-crossref" onclick="switchTab(this,'c1','crossref')">Cross-Refs</button>
      <!-- Add People tab only if bios exist: -->
      <!-- <button class="tab-btn t-bios" onclick="switchTab(this,'c1','bios')">People</button> -->
    </div>

    <div id="c1-commentary" class="tab-panel active">
      <div class="block-label">Commentary</div>
      <div class="block-text">[commentary text]</div>
    </div>

    <div id="c1-meaning" class="tab-panel">
      <div class="meaning-box">
        <div class="block-label">Deeper Meaning</div>
        <div class="block-text">[deeper meaning text]</div>
      </div>
      <div class="wow-box">
        <div class="block-label">Analogy / Think about it like this</div>
        <div class="block-text">[analogy text]</div>
      </div>
    </div>

    <div id="c1-greek" class="tab-panel">
      <div class="greek-card">
        <div class="greek-word">ἀγάπη</div>
        <div class="greek-transliteration">agapē · "love"</div>
        <div class="greek-def">[definition]</div>
        <div class="greek-insight">[insight paragraph with <strong>agapē</strong> bolded]</div>
      </div>
    </div>

    <div id="c1-cool" class="tab-panel">
      <div class="block-label">Cool Point</div>
      <div class="block-text">[cool point text]</div>
    </div>

    <div id="c1-lesson" class="tab-panel">
      <div class="block-label">Lesson</div>
      <div class="block-text">[lesson text]</div>
    </div>

    <div id="c1-questions" class="tab-panel">
      <div class="q-item" onclick="toggleQ(this)">
        <div class="q-question">[Question text?] <span class="q-arrow">▶</span></div>
        <div class="q-answer">[Answer text]</div>
      </div>
    </div>

    <div id="c1-crossref" class="tab-panel">
      <div class="ref-item">
        <span class="ref-badge">Rom 8:1</span>
        <span class="ref-text">[why this connects]</span>
      </div>
    </div>

    <!-- BIOS TAB (only include if people appear) -->
    <div id="c1-bios" class="tab-panel">
      <div class="bio-card">
        <div class="bio-header">
          <div class="bio-avatar" style="background:rgba(200,164,90,0.15);color:var(--accent)">P</div>
          <div>
            <div class="bio-name">Person Name</div>
            <div class="bio-role">Role / Title</div>
          </div>
        </div>
        <div class="bio-text">[bio text]<span class="bio-ref">Key texts: [references]</span></div>
      </div>
    </div>

  </div>
</div>

<div class="footer">[Book] [Chapter] · Bible Study</div>

<script>
function toggleCard(id){const c=document.getElementById(id);c.classList.toggle('open');if(c.classList.contains('open')){setTimeout(()=>c.scrollIntoView({behavior:'smooth',block:'nearest'}),60)}}
function switchTab(btn,prefix,tab){const body=btn.closest('.verse-body');body.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));body.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));btn.classList.add('active');const panel=document.getElementById(prefix+'-'+tab);if(panel)panel.classList.add('active')}
function toggleQ(item){item.classList.toggle('open')}
let activeTheme=null;
function filterTheme(btn){const theme=btn.dataset.theme;if(activeTheme===theme){activeTheme=null;document.querySelectorAll('.theme-chip').forEach(c=>c.classList.remove('active'));document.querySelectorAll('.verse-card').forEach(c=>c.classList.remove('hidden'));return}activeTheme=theme;document.querySelectorAll('.theme-chip').forEach(c=>c.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.verse-card').forEach(card=>{const themes=(card.dataset.themes||'').split(' ');card.classList.toggle('hidden',!themes.includes(theme))})}
</script>
</body>
</html>
```

---

## Theme Tag Color Reference

Use inline styles for vtag colors since themes vary per chapter:

```html
<!-- Gospel --> <span class="vtag" style="background:rgba(200,164,90,0.1);color:#c8a45a;border-color:rgba(200,164,90,0.2)">Gospel</span>
<!-- Grace --> <span class="vtag" style="background:rgba(164,142,196,0.1);color:#a48ec4;border-color:rgba(164,142,196,0.2)">Grace</span>
<!-- Identity --> <span class="vtag" style="background:rgba(109,186,138,0.1);color:#6dba8a;border-color:rgba(109,186,138,0.2)">Identity</span>
<!-- Authority --> <span class="vtag" style="background:rgba(111,168,212,0.1);color:#6fa8d4;border-color:rgba(111,168,212,0.2)">Authority</span>
<!-- Faith --> <span class="vtag" style="background:rgba(91,184,160,0.1);color:#5bb8a0;border-color:rgba(91,184,160,0.2)">Faith</span>
<!-- Knowledge --> <span class="vtag" style="background:rgba(111,168,212,0.1);color:#6fa8d4;border-color:rgba(111,168,212,0.2)">Knowledge</span>
<!-- Calling --> <span class="vtag" style="background:rgba(164,142,196,0.1);color:#a48ec4;border-color:rgba(164,142,196,0.2)">Calling</span>
<!-- Scripture --> <span class="vtag" style="background:rgba(200,164,90,0.1);color:#c8a45a;border-color:rgba(200,164,90,0.2)">Scripture</span>
<!-- Virtue --> <span class="vtag" style="background:rgba(109,186,138,0.1);color:#6dba8a;border-color:rgba(109,186,138,0.2)">Virtue</span>
<!-- Transformation --> <span class="vtag" style="background:rgba(212,137,106,0.1);color:#d4896a;border-color:rgba(212,137,106,0.2)">Transformation</span>
<!-- False Teaching --> <span class="vtag" style="background:rgba(196,122,138,0.1);color:#c47a8a;border-color:rgba(196,122,138,0.2)">False Teaching</span>
<!-- Unity --> <span class="vtag" style="background:rgba(91,184,160,0.1);color:#5bb8a0;border-color:rgba(91,184,160,0.2)">Unity</span>
<!-- Love --> <span class="vtag" style="background:rgba(196,122,138,0.1);color:#c47a8a;border-color:rgba(196,122,138,0.2)">Love</span>
<!-- Suffering --> <span class="vtag" style="background:rgba(196,122,106,0.1);color:#c47a6a;border-color:rgba(196,122,106,0.2)">Suffering</span>
<!-- Hope --> <span class="vtag" style="background:rgba(107,159,212,0.1);color:#6b9fd4;border-color:rgba(107,159,212,0.2)">Hope</span>
```
