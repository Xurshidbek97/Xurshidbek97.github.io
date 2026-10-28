/* ============================================
   3D Menu — tilt, depth, flip-in, ripple
   Also tilts publication & project cards
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const navList = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links__item');
    const navPanel = document.getElementById('navPanel');
    const hamburger = document.getElementById('hamburgerBtn');

    if (!navList) return;

    // Move each item's content into an inner "face" that does the 3D motion.
    // The <a> itself never transforms, so its click area never shifts.
    navItems.forEach((item, i) => {
        const face = document.createElement('span');
        face.className = 'nav-links__face';
        face.style.setProperty('--i', i);
        while (item.firstChild) face.appendChild(item.firstChild);
        const glare = document.createElement('span');
        glare.className = 'nav-links__glare';
        face.appendChild(glare);
        item.appendChild(face);
        item.classList.add('has-face');
    });

    if (reduceMotion) return;

    // ---- Staggered 3D flip-in ----
    function playEntrance() {
        navList.classList.remove('nav-3d-enter');
        void navList.offsetWidth; // restart the animation
        navList.classList.add('nav-3d-enter');
    }
    playEntrance();

    // Replay when the mobile menu opens
    if (hamburger && navPanel) {
        hamburger.addEventListener('click', () => {
            if (navPanel.classList.contains('open')) playEntrance();
        });
    }

    // ---- Tilt toward the cursor ----
    function attachTilt(el, maxDeg, target = el) {
        let frame = null;

        el.addEventListener('pointermove', (e) => {
            if (e.pointerType === 'touch') return;
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;   // 0..1
            const y = (e.clientY - rect.top) / rect.height;   // 0..1
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                target.style.setProperty('--ry', `${(x - 0.5) * maxDeg * 2}deg`);
                target.style.setProperty('--rx', `${(0.5 - y) * maxDeg * 2}deg`);
                target.style.setProperty('--mx', `${x * 100}%`);
                target.style.setProperty('--my', `${y * 100}%`);
                el.classList.add('is-tilting');
            });
        });

        el.addEventListener('pointerleave', () => {
            cancelAnimationFrame(frame);
            target.style.setProperty('--rx', '0deg');
            target.style.setProperty('--ry', '0deg');
            el.classList.remove('is-tilting');
        });
    }

    navItems.forEach(item => attachTilt(item, 12, item.querySelector('.nav-links__face')));

    // ---- Press-in depth + ripple on click ----
    navItems.forEach(item => {
        item.addEventListener('pointerdown', (e) => {
            const rect = item.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'nav-links__ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            item.querySelector('.nav-links__face').appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());

            item.classList.add('is-pressed');
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt =>
            item.addEventListener(evt, () => item.classList.remove('is-pressed'))
        );
    });

    // ---- Cards: publications + projects ----
    document.querySelectorAll('.pub-card:not(.pub-card--empty)').forEach(card => attachTilt(card, 6));

    window.addEventListener('projectsRendered', () => {
        document.querySelectorAll('.project-card:not(.project-card--empty)').forEach(card => attachTilt(card, 8));
    });
    // Projects may have rendered before this script ran
    document.querySelectorAll('.project-card:not(.project-card--empty)').forEach(card => attachTilt(card, 8));
});
