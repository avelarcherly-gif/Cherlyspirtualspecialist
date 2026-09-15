// netlify/functions/send-telegram.js
exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "Missing Telegram config" }) };
  }

  try {
    const { name, contact, service, message, website } = JSON.parse(event.body);

    // Honeypot: if the hidden "website" field is filled, it's a bot — silently drop it
    if (website) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // Basic validation
    if (!name || !contact || !service || !message) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "All fields are required." }) };
    }

    const clean = (s) => String(s).replace(/[<>]/g, "").trim().slice(0, 1000);

    const text =
      `🔮 *New Booking Request*\n` +
      `*Cheryl Spiritual Guidance*\n\n` +
      `👤 *Name:* ${clean(name)}\n` +
      `📞 *Contact:* ${clean(contact)}\n` +
      `✨ *Service:* ${clean(service)}\n` +
      `💬 *Message:* ${clean(message)}\n\n` +
      `🕒 ${new Date().toLocaleString("en-US", { timeZone: "America/Vancouver" })} (PT)`;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown" }),
    });

    const result = await res.json();

    if (!result.ok) throw new Error(result.description || "Telegram error");

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
