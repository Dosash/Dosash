require('dotenv').config(); // Подключаем dotenv
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error('❌ BOT_TOKEN не найден в .env');
  process.exit(1);
}

// Инициализация бота
const bot = new TelegramBot(TOKEN, { polling: true });

// Загрузка ключей из файла
function loadKeys() {
  const raw = fs.readFileSync('./keys.json', 'utf-8');
  return JSON.parse(raw);
}

// Команда /key
bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id.toString();
  const keys = loadKeys();

  if (keys[userId]) {
    // Отправка всех ключей пользователя
    keys[userId].forEach((key, index) => {
      bot.sendMessage(msg.chat.id, `🔑 Ваш ключ №${index + 1}:\n\`${key}\``, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {
              text: 'Сказать спасибо!',
              url: `https://www.cropty.io/ru/@dosash`
            }
          ]]
        }
      });
    });
  } else {
    bot.sendMessage(msg.chat.id, '🚫 У вас нет доступа к ключам.');
  }
});

