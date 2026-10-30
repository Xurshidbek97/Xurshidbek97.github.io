/* ============================================
   Projects — data + renderer
   Add a project by adding an object to PROJECTS:
   {
     title: "Project name",
     icon: "🤖",                // or logo: "assets/img/x.png" to show an image
     desc: { uz: "...", ru: "...", en: "...", ar: "..." },  // en is the fallback
     tags: ["Python", "Django"],
     url: "https://...",        // the whole card opens this link
     type: "telegram",          // optional: changes the button text
     soon: true                 // optional: "coming soon" card, not clickable, no url needed
   }
   title may also be per-language: { uz: "...", ru: "...", en: "...", ar: "..." }
   ============================================ */

const PROJECTS = [
    {
        title: "Dinshunoslik.uz",
        icon: "🕌",
        desc: {
            uz: "Dinshunoslik sohasiga oid ilmiy-ma'rifiy veb-sayt.",
            ru: "Научно-просветительский веб-сайт в области религиоведения.",
            en: "An educational and scientific website on religious studies.",
            ar: "موقع علمي تثقيفي في مجال الدراسات الدينية."
        },
        tags: ["Web"],
        url: "https://dinshunoslik.uz"
    },
    {
        title: "HiBooks",
        icon: "🧸",
        desc: {
            uz: "Kichkintoylar uchun o'yin platformasi.",
            ru: "Игровая платформа для малышей.",
            en: "A game platform for little kids.",
            ar: "منصة ألعاب للأطفال الصغار."
        },
        tags: ["Web", "Netlify"],
        url: "https://hibooks.netlify.app/"
    },
    {
        title: "HiBook",
        icon: "📖",
        desc: {
            uz: "GitHub Pages'da joylashgan onlayn kitob platformasi.",
            ru: "Онлайн-платформа для книг на GitHub Pages.",
            en: "An online book platform hosted on GitHub Pages.",
            ar: "منصة كتب إلكترونية مستضافة على GitHub Pages."
        },
        tags: ["Web", "GitHub Pages"],
        url: "https://xurshidbek97.github.io/hibook/"
    },
    {
        title: "Choyxona AI",
        icon: "🤖",
        type: "telegram",
        desc: {
            uz: "Sun'iy intellekt haqidagi yangiliklar va foydali materiallar ulashiladigan Telegram kanal.",
            ru: "Telegram-канал о новостях и полезных материалах по искусственному интеллекту.",
            en: "A Telegram channel sharing AI news and useful resources.",
            ar: "قناة تيليجرام لأخبار الذكاء الاصطناعي والموارد المفيدة."
        },
        tags: ["Telegram", "AI"],
        url: "https://t.me/choyxona_ai"
    },
    {
        title: "R tili",
        icon: "📊",
        desc: {
            uz: "R dasturlash tilini o'rganish uchun onlayn ta'lim platformasi.",
            ru: "Онлайн-платформа для изучения языка программирования R.",
            en: "An online learning platform for the R programming language.",
            ar: "منصة تعليمية إلكترونية لتعلم لغة البرمجة R."
        },
        tags: ["R", "Cloudflare Workers"],
        url: "https://r-tili.khurshidbek.workers.dev/"
    },
    {
        title: "FikrLab",
        logo: "assets/img/fikrlab-logo.png",
        icon: "📝",
        desc: {
            uz: "Onlayn so'rovnomalar yaratish va natijalarni tahlil qilish platformasi.",
            ru: "Платформа для создания онлайн-опросов и анализа результатов.",
            en: "A platform for creating online surveys and analysing the results.",
            ar: "منصة لإنشاء الاستبيانات الإلكترونية وتحليل نتائجها."
        },
        tags: ["Web", "Cloudflare Workers"],
        url: "https://surveyhub.khurshidbek.workers.dev/"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    function hostOf(url) {
        try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
    }

    function render(lang) {
        const t = (typeof translations !== 'undefined' && translations[lang]) || translations.en;

        if (!PROJECTS.length) {
            grid.innerHTML = `<div class="project-card project-card--empty">${escapeHtml(t.proj_soon)}</div>`;
            return;
        }

        grid.innerHTML = PROJECTS.map((p, i) => {
            const pick = (v) => (v && typeof v === 'object') ? (v[lang] || v.en || '') : (v || '');
            const desc = pick(p.desc);
            const tags = (p.tags || []).map(tag => `<span class="project-card__tag">${escapeHtml(tag)}</span>`).join('');
            const typeClass = p.type ? ` project-card--${escapeHtml(p.type)}` : '';
            const body = `
                    <div class="project-card__glow"></div>
                    <div class="project-card__top">
                        <span class="project-card__icon">${p.logo
                            ? `<img src="${escapeHtml(p.logo)}" alt="" width="36" height="36" loading="lazy">`
                            : escapeHtml(p.icon || '🚀')}</span>
                        ${p.url ? `<span class="project-card__host">${escapeHtml(hostOf(p.url))}</span>` : ''}
                    </div>
                    <h3 class="project-card__title">${escapeHtml(pick(p.title))}</h3>
                    ${desc ? `<p class="project-card__desc">${escapeHtml(desc)}</p>` : ''}
                    ${tags ? `<div class="project-card__tags">${tags}</div>` : ''}`;

            if (p.soon) {
                return `
                <div class="project-card project-card--soon${typeClass}" style="--i:${i}">${body}
                    <span class="project-card__soon">⏳ ${escapeHtml(t.proj_soon_badge)}</span>
                </div>`;
            }

            const cta = p.type === 'telegram' ? t.proj_channel : t.proj_live;
            return `
                <a class="project-card${typeClass}" style="--i:${i}" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${body}
                    <span class="project-card__cta">${escapeHtml(cta)} <span class="project-card__arrow">→</span></span>
                </a>`;
        }).join('');

        window.dispatchEvent(new CustomEvent('projectsRendered'));
    }

    window.addEventListener('languageChanged', (e) => render(e.detail.lang));
});
