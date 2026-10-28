/* ============================================
   Contact Form → Telegram
   Posts to a Cloudflare Worker (worker/telegram-contact.js),
   which holds the bot token and forwards the message to Telegram.
   ============================================ */

(function () {
  'use strict';

  // Paste your Worker URL here after deploying it (see worker/README.md)
  const CONTACT_ENDPOINT = '';

  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('contactSubmitBtn');
  const successMsg = document.getElementById('contactSuccess');
  const errorMsg = document.getElementById('contactError');

  if (!form) return;

  // Rate limiting (per browser tab; the Worker limits per IP too)
  const RATE_LIMIT = 3;
  const RATE_WINDOW = 3600000; // 1 hour in ms

  function readSubmissions() {
    try { return JSON.parse(sessionStorage.getItem('cf_submissions') || '[]'); } catch { return []; }
  }

  function saveSubmissions(list) {
    try { sessionStorage.setItem('cf_submissions', JSON.stringify(list)); } catch { /* storage blocked */ }
  }

  let submissions = readSubmissions();

  function isRateLimited() {
    const now = Date.now();
    submissions = submissions.filter(t => now - t < RATE_WINDOW);
    saveSubmissions(submissions);
    return submissions.length >= RATE_LIMIT;
  }

  function t(key, fallback) {
    return translations[document.documentElement.lang]?.[key] || fallback;
  }

  function showMessage(el, duration) {
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), duration || 5000);
  }

  function showError(key, fallback) {
    errorMsg.textContent = t(key, fallback);
    showMessage(errorMsg);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('#contactName').value.trim();
    const email = form.querySelector('#contactEmail').value.trim();
    const message = form.querySelector('#contactMessage').value.trim();
    const website = form.querySelector('#contactWebsite')?.value || ''; // honeypot

    if (!name || !email || !message) return showError('contact_error_required', 'Please fill in all fields.');
    if (!validateEmail(email)) return showError('contact_error_email', 'Please enter a valid email.');
    if (message.length < 10) return showError('contact_error_short', 'Message is too short.');
    if (isRateLimited()) return showError('contact_error_rate', 'Too many messages. Please try again later.');
    if (!CONTACT_ENDPOINT) return showError('contact_error_general', 'Something went wrong. Please try again.');

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website, lang: document.documentElement.lang || 'en' })
      });

      if (res.status === 429) return showError('contact_error_rate', 'Too many messages. Please try again later.');
      if (!res.ok) throw new Error('HTTP ' + res.status);

      submissions.push(Date.now());
      saveSubmissions(submissions);

      form.reset();
      showMessage(successMsg, 6000);
    } catch (err) {
      console.error('Contact form error:', err);
      showError('contact_error_general', 'Something went wrong. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });

})();
