/* ============================================
   AI Chatbot — Smart Knowledge-Base
   No API key exposed client-side
   Keyword matching + predefined knowledge
   ============================================ */

(function () {
  'use strict';

  const toggle = document.getElementById('chatbotToggle');
  const chatWindow = document.getElementById('chatbotWindow');
  const messagesEl = document.getElementById('chatMessages');
  const suggestionsEl = document.getElementById('chatSuggestions');
  const inputEl = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');

  if (!toggle || !chatWindow) return;

  let isOpen = false;
  let hasGreeted = false;

  // ---- Knowledge Base (multi-language) ----
  function getKnowledge(lang) {
    const kb = {
      en: {
        greeting: "Hello! 👋 I am Xurshidbek's AI assistant. You can ask about his skills, experience, and projects. What would you like to know?",
suggestions: ["Who is Xurshidbek?", "Technologies", "Work Experience", "Contact", "Education"],
fallback: "I can't give an exact answer about that. Please ask about Xurshidbek's skills, experience, or projects! 😊",
entries: [
  {
    keywords: ["who", "about", "Xurshidbek", "what", "introduce"],
    answer: "Xurshidbek Tuychiyev is an AI Automation Developer and Programming Instructor based in Tashkent. He develops AI-powered Telegram bots and automation systems. He has 5+ years of programming experience and 4+ years of teaching experience. 🚀"
  },
  {
    keywords: ["skill", "technology", "programming", "language", "knowledge", "stack"],
    answer: "Xurshidbek's technologies:\n\n🐍 **Python** (main)\n⚡ **C++** (algorithms)\n🤖 **Telegram Bot API**\n🌐 **Django REST Framework**\n📊 **Data Analytics**\n🐘 **PostgreSQL**\n🐳 **Docker**\n☁️ **AWS**\n🔧 **Git, Linux, Nginx**"
  },
  {
    keywords: ["experience", "work", "career", "job"],
    answer: "Xurshidbek's work experience:\n\n🏛️ **University of World Economy and Diplomacy** — Lecturer (2026–present)\n🏫 **Renaissance University** — Senior Lecturer (2023-2025)\n🎓 **International Islamic Academy of Uzbekistan** — Teacher (2023-2026), Laboratory Assistant (2022-2023)\n💼 **Texnomart** — PHP Backend Developer (2021-2022)\n🏢 **ITeachSoft** — Backend Developer (2020-2021)"
  },
  {
    keywords: ["education", "university", "school", "degree", "master", "bachelor"],
    answer: "🎓 **Master's Degree** — Information Security, International Islamic Academy of Uzbekistan (2021-2023)\n\n🎓 **Bachelor's Degree** — Software Engineering, TUIT Fergana branch (2017-2021)"
  },
  {
    keywords: ["contact", "email", "phone", "hire", "reach"],
    answer: "Contact Xurshidbek:\n\n📧 Xurshidbek2797@gmail.com\n📱 +99893 373 32 00\n💬 Telegram: @Xurshidbek_Tuychiyev\n💼 LinkedIn: /in/Xurshidbek97\n\nOr use the contact form on the website! 📩"
  },
  {
    keywords: ["hello", "hey", "hi", "assalamu"],
    answer: "Hello! 👋 Welcome to Xurshidbek's virtual assistant! Feel free to ask about his skills, experience, or projects!"
  }]
      },
      uz: {
        greeting: "Salom! 👋 Men Xurshidbekning AI yordamchisiman. Uning ko'nikmalari, tajribasi, loyihalari haqida savol berishingiz mumkin. Nima bilmoqchisiz?",
        suggestions: ["Xurshidbek  kim?", "Texnologiyalari", "Ish tajribasi", "Bog'lanish", "Ta'lim"],
        fallback: "Bu haqda aniq javob bera olmayman. Xurshidbek ning ko'nikmalari, tajribasi yoki loyihalari haqida so'rang! 😊",
        entries: [
          {
            keywords: ["kim", "haqida", "Xurshidbek ", "nima", "tanishtir"],
            answer: "Xurshidbek Tuychiyev — AI Automation Developer va Dasturlash O'qituvchisi, Toshkentda istiqomat qiladi. U AI asosidagi Telegram botlar va avtomatlashtirish tizimlarini yaratadi. 5+ yillik dasturlash va 4+ yillik o'qituvchilik tajribasiga ega. 🚀"
          },
          {
            keywords: ["skill", "texnologiya", "dasturlash", "til", "bilim", "stack"],
            answer: "Xurshidbek ning texnologiyalari:\n\n🐍 **Python** (asosiy)\n⚡ **C++** (algoritmlar)\n🤖 **Telegram Bot API**\n🌐 **Django REST Framework**\n📊 **Data Analytics**\n🐘 **PostgreSQL**\n🐳 **Docker**\n☁️ **AWS**\n🔧 **Git, Linux, Nginx**"
          },
          {
            keywords: ["tajriba", "ish", "karera", "kasb"],
            answer: "Xurshidbek ning ish tajribasi:\n\n🏛️ **Jahon iqtisodiyoti va diplomatiya universiteti** — O'qituvchi (2026–hozirgacha)\n🏫 **Renessans ta'lim universiteti** — Katta o'qituvchi (2023-2025)\n🎓 **O'zbekiston xalqaro islom akademiyasi** — O'qituvchi (2023-2026), Laborant (2022-2023)\n💼 **Texnomart** — PHP Backend dasturchi (2021-2022)\n🏢 **ITeachSoft** — Backend dasturchi (2020-2021)"
          },
          {
            keywords: ["talim", "universit", "maktab", "daraja", "magistr", "bakalavr"],
            answer: "🎓 **Magistratura** — Axborot xavfsizligi, O'zbekiston xalqaro islom akademiyasi (2021-2023)\n\n🎓 **Bakalavr** — Dasturiy injiniring, TATU Farg'ona filiali (2017-2021)"
          },
          {
            keywords: ["aloqa", "email", "telefon", "boglanish", "yollash"],
            answer: "Xurshidbek  bilan bog'lanish:\n\n📧 Xurshidbek2797@gmail.com\n📱 +99893 373 32 00\n💬 Telegram: @Xurshidbek_Tuychiyev\n💼 LinkedIn: /in/Xurshidbek97 n\n\nYoki sahifadagi kontakt formasidan foydalaning! 📩"
          },
          {
            keywords: ["salom", "hey", "assalomu"],
            answer: "Salom! 👋 Xurshidbek ning virtual yordamchisiga xush kelibsiz! Ko'nikmalari, tajribasi yoki loyihalari haqida savol bering!"
          }
        ]
      },
      ru: {
        greeting: "Здравствуйте! 👋 Я AI-помощник Хуршидбека. Вы можете спросить о его навыках, опыте и проектах. Что вас интересует?",
suggestions: ["Кто такой Хуршидбек?", "Технологии", "Опыт работы", "Контакты", "Образование"],
fallback: "Я не могу дать точный ответ на это. Пожалуйста, спросите о навыках, опыте или проектах Хуршидбека! 😊",
entries: [
  {
    keywords: ["кто", "о", "Хуршидбек", "что", "представь"],
    answer: "Хуршидбек Туйчиев — AI Automation Developer и преподаватель программирования, проживает в Ташкенте. Он разрабатывает Telegram-ботов и системы автоматизации на основе ИИ. Имеет более 5 лет опыта в программировании и более 4 лет преподавательского опыта. 🚀"
  },
  {
    keywords: ["навыки", "технологии", "программирование", "язык", "знания", "stack"],
    answer: "Технологии Хуршидбека:\n\n🐍 **Python** (основной)\n⚡ **C++** (алгоритмы)\n🤖 **Telegram Bot API**\n🌐 **Django REST Framework**\n📊 **Data Analytics**\n🐘 **PostgreSQL**\n🐳 **Docker**\n☁️ **AWS**\n🔧 **Git, Linux, Nginx**"
  },
  {
    keywords: ["опыт", "работа", "карьера", "должность"],
    answer: "Опыт работы Хуршидбека:\n\n🏛️ **Университет мировой экономики и дипломатии** — Преподаватель (2026–н.в.)\n🏫 **Университет «Ренессанс»** — Старший преподаватель (2023-2025)\n🎓 **Международная исламская академия Узбекистана** — Преподаватель (2023-2026), Лаборант (2022-2023)\n💼 **Texnomart** — PHP Backend-разработчик (2021-2022)\n🏢 **ITeachSoft** — Backend-разработчик (2020-2021)"
  },
  {
    keywords: ["образование", "университет", "школа", "степень", "магистр", "бакалавр"],
    answer: "🎓 **Магистратура** — Информационная безопасность, Международная исламская академия Узбекистана (2021-2023)\n\n🎓 **Бакалавриат** — Программная инженерия, Ферганский филиал ТУИТ (2017-2021)"
  },
  {
    keywords: ["контакт", "email", "телефон", "связь", "нанять"],
    answer: "Связаться с Хуршидбеком:\n\n📧 Xurshidbek2797@gmail.com\n📱 +99893 373 32 00\n💬 Telegram: @Xurshidbek_Tuychiyev\n💼 LinkedIn: /in/Xurshidbek97\n\nИли воспользуйтесь контактной формой на сайте! 📩"
  },
  {
    keywords: ["привет", "здравствуйте", "hey"],
    answer: "Здравствуйте! 👋 Добро пожаловать к виртуальному помощнику Хуршидбека! Спрашивайте о его навыках, опыте или проектах!"
  }
]},
      ar: {
        greeting: "مرحبًا! 👋 أنا المساعد الذكي الخاص بخورشيدبيك. يمكنك السؤال عن مهاراته وخبراته ومشاريعه. ماذا تريد أن تعرف؟",
suggestions: ["من هو خورشيدبيك؟", "التقنيات", "الخبرة العملية", "التواصل", "التعليم"],
fallback: "لا أستطيع تقديم إجابة دقيقة حول ذلك. يرجى السؤال عن مهارات أو خبرات أو مشاريع خورشيدبيك! 😊",
entries: [
  {
    keywords: ["من", "حول", "خورشيدبيك", "تعريف", "ماذا"],
    answer: "خورشيدبيك تويشييف هو مطور أتمتة بالذكاء الاصطناعي ومدرس برمجة يقيم في طشقند. يقوم بتطوير بوتات تيليجرام وأنظمة الأتمتة المعتمدة على الذكاء الاصطناعي. لديه أكثر من 5 سنوات من الخبرة في البرمجة وأكثر من 4 سنوات في التدريس. 🚀"
  },
  {
    keywords: ["مهارات", "تقنيات", "برمجة", "لغات", "معرفة", "stack"],
    answer: "تقنيات خورشيدبيك:\n\n🐍 **Python** (الأساسي)\n⚡ **C++** (الخوارزميات)\n🤖 **Telegram Bot API**\n🌐 **Django REST Framework**\n📊 **تحليل البيانات**\n🐘 **PostgreSQL**\n🐳 **Docker**\n☁️ **AWS**\n🔧 **Git, Linux, Nginx**"
  },
  {
    keywords: ["خبرة", "عمل", "وظيفة", "مهنة"],
    answer: "الخبرة العملية لخورشيدبيك:\n\n🏛️ **جامعة الاقتصاد العالمي والدبلوماسية** — محاضر (2026–الآن)\n🏫 **جامعة رينيسانس** — محاضر أول (2023-2025)\n🎓 **الأكاديمية الإسلامية الدولية في أوزبكستان** — مدرس (2023-2026)، مساعد مختبر (2022-2023)\n💼 **Texnomart** — مطور Backend بلغة PHP (2021-2022)\n🏢 **ITeachSoft** — مطور Backend (2020-2021)"
  },
  {
    keywords: ["تعليم", "جامعة", "مدرسة", "درجة", "ماجستير", "بكالوريوس"],
    answer: "🎓 **ماجستير** — أمن المعلومات، الأكاديمية الإسلامية الدولية في أوزبكستان (2021-2023)\n\n🎓 **بكالوريوس** — هندسة البرمجيات، فرع فرغانة لـ TUIT (2017-2021)"
  },
  {
    keywords: ["تواصل", "ايميل", "هاتف", "توظيف", "اتصال"],
    answer: "التواصل مع خورشيدبيك:\n\n📧 Xurshidbek2797@gmail.com\n📱 +99893 373 32 00\n💬 Telegram: @Xurshidbek_Tuychiyev\n💼 LinkedIn: /in/Xurshidbek97\n\nأو استخدم نموذج التواصل في الموقع! 📩"
  },
  {
    keywords: ["مرحبا", "اهلا", "السلام"],
    answer: "مرحبًا! 👋 أهلاً بك في المساعد الافتراضي الخاص بخورشيدبيك! اسأل عن مهاراته أو خبراته أو مشاريعه!"
    }
        ]
      }
    };
    return kb[lang] || kb.en;
  }

  // ---- Chat Logic ----
  function findAnswer(question, lang) {
    const kb = getKnowledge(lang);
    const q = question.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of kb.entries) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw.toLowerCase())) {
          score += kw.length; // longer keyword matches score higher
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    return bestMatch ? bestMatch.answer : kb.fallback;
  }

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg--${type}`;
    // Support **bold** markdown
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    msg.innerHTML = formatted;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'typing-indicator';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  function showSuggestions(lang) {
    const kb = getKnowledge(lang);
    suggestionsEl.innerHTML = '';
    kb.suggestions.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'chat-suggestion';
      btn.textContent = text;
      btn.addEventListener('click', () => {
        handleUserMessage(text);
      });
      suggestionsEl.appendChild(btn);
    });
  }

  function handleUserMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    inputEl.value = '';
    suggestionsEl.innerHTML = '';

    // Simulate typing delay
    showTyping();
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      hideTyping();
      const lang = document.documentElement.lang || 'en';
      const answer = findAnswer(text, lang);
      addMessage(answer, 'bot');
      // Show suggestions again after answer
      setTimeout(() => showSuggestions(lang), 300);
    }, delay);
  }

  // ---- Toggle Chat Window ----
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    toggle.classList.toggle('active', isOpen);
    chatWindow.classList.toggle('open', isOpen);

    if (isOpen && !hasGreeted) {
      hasGreeted = true;
      const lang = document.documentElement.lang || 'en';
      const kb = getKnowledge(lang);
      setTimeout(() => {
        addMessage(kb.greeting, 'bot');
        showSuggestions(lang);
      }, 500);
    }

    if (isOpen) {
      setTimeout(() => inputEl.focus(), 400);
    }
  });

  // ---- Send Message ----
  sendBtn.addEventListener('click', () => {
    handleUserMessage(inputEl.value);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserMessage(inputEl.value);
    }
  });

  // ---- Language Change Handler ----
  window.addEventListener('languageChanged', (e) => {
    if (hasGreeted) {
      messagesEl.innerHTML = '';
      hasGreeted = false;
      if (isOpen) {
        hasGreeted = true;
        const lang = e.detail.lang;
        const kb = getKnowledge(lang);
        addMessage(kb.greeting, 'bot');
        showSuggestions(lang);
      }
    }
  });

})();
