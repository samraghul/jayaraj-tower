const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fs = require('fs');
const Fuse = require('fuse.js');

// Load tower data
const data = JSON.parse(fs.readFileSync('towers.json', 'utf-8'));

// Fuse.js config
const fuse = new Fuse(data, {
  keys: ['tower'],
  threshold: 0.4,  // Adjust sensitivity (0.0 = exact, 1.0 = very fuzzy)
});

// Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

function cleanPhoneForWhatsApp(phone) {
    return phone.replace(/[^0-9]/g, ''); // removes +, -, spaces etc.
  }

  function escapeMarkdown(text) {
    return text.replace(/([_*[\]()~`>#+=|{}.!\\-])/g, '\\$1');
  }

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const input = msg.text.trim();

  const results = fuse.search(input);

  if (results.length > 0) {
    const { tower, technician, phone, location } = results[0].item;
    const cleanedPhone = cleanPhoneForWhatsApp(phone);
const whatsappLink = `https://wa.me/${cleanedPhone}`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
    bot.sendMessage(chatId, `📡 *Tower:* ${escapeMarkdown(tower)}
        👷 *Technician:* ${escapeMarkdown(technician)}
        
        📞 *Phone:* [${phone}](tel:${phone})
        
        💬 *WhatsApp:* [Chat on WhatsApp](${whatsappLink})

        📍 *Location:* [Open in Google Maps](${mapsLink})`, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, "❌ Couldn't find a technician for that tower name.");
  }
});
