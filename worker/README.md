# Aloqa formasi → Telegram

Saytdagi "Aloqa" formasi xabarni shu Cloudflare Worker'ga yuboradi, Worker esa
uni Telegram botingiz orqali sizga jo'natadi. Bot tokeni faqat Worker ichida
(yashirin o'zgaruvchi sifatida) saqlanadi — sayt kodida ko'rinmaydi.

## 1. Telegram bot yaratish

1. Telegram'da **@BotFather** ga yozing → `/newbot` → botga nom bering.
2. BotFather bergan **tokenni** saqlab qo'ying (`123456:ABC...` ko'rinishida).
3. Yangi botingizni oching va **Start** tugmasini bosing (aks holda bot sizga yoza olmaydi).
4. **@userinfobot** ga yozing — u sizning **chat ID** raqamingizni beradi.

## 2. Worker'ni joylash (Cloudflare dashboard)

1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Create Worker**.
2. Nom bering (masalan `portfolio-contact`) → **Deploy**.
3. **Edit code** → `telegram-contact.js` faylining butun matnini qo'ying → **Deploy**.
4. Worker → **Settings** → **Variables and Secrets** → quyidagilarni qo'shing:

| Nomi | Turi | Qiymati |
|---|---|---|
| `BOT_TOKEN` | Secret | BotFather bergan token |
| `CHAT_ID` | Secret | @userinfobot bergan raqam |
| `ALLOWED_ORIGINS` | Text | `https://xurshidbek97.github.io` |

5. Worker manzilini nusxalang (masalan `https://portfolio-contact.khurshidbek.workers.dev`).

## 3. Saytga ulash

`js/contact.js` faylida:

```js
const CONTACT_ENDPOINT = 'https://portfolio-contact.khurshidbek.workers.dev';
```

Shundan so'ng formadan yuborilgan har bir xabar Telegram'ingizga keladi.
