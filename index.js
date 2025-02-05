// require("dotenv").config();
// const { Bot } = require("grammy");
// const express = require("express");

// // Задаем токен бота
// const bot = new Bot(process.env.BOT_TOKEN);

// // Список запрещенных слов
// const scamKeywords = [
//   "Бонус", "Фриспины", "Кэшбек", "Джекпот", "Выигрыш", "Лудоман", "Депозит",
//   "Вывод (денег)", "Ставки", "Казино", "Букмекер", "Легкий заработок",
//   "Без вложений", "Криптоказино", "Раздача денег", "Промокод",
//   "Гарантия 100%", "Легкие деньги", "Бесплатно", "Секретный метод", "Взлом",
//   "Без риска", "Выведи деньги", "Проверенная схема", "Работа на дому",
//   "Автозаработок", "Легкие бабки", "Доход без усилий", "Рабочая схема",
//   "Быстрое обогащение", "Инвестиции", "Хайп", "Умножь деньги",
//   "Заработай за 5 минут", "Доход на пассиве", "Быстрый вывод",
//   "Удвоение депозита", "Вложи 100₽ – получи 1000₽", "Автоматический заработок",
//   "Уникальная стратегия", "Топовые сигналы", "Бинарные опционы",
//   "Финансовая независимость", "Airdrop", "Раздача", "Крипта бесплатно",
//   "Биткоин", "ETH (Ethereum)", "NFT-розыгрыш", "Смарт-контракт",
//   "Блокчейн-платформа", "Инвестируй в крипту", "Гарантированный профит"
// ];

// // Проверяем сообщения пользователей
// bot.on("message", async (ctx) => {
//     const text = ctx.message.text?.toLowerCase();
//     const chatId = ctx.chat.id;
//     const messageId = ctx.message.message_id;
  
//     if (text && scamKeywords.some(word => text.includes(word.toLowerCase()))) {
//      const warningMessage =  await ctx.reply("⚠️ Ваше сообщение содержит запрещенные слова и будет удалено через 5 секунд.");
      
//       setTimeout(async () => {
//         try {
//           await ctx.api.deleteMessage(chatId, messageId);
//           await ctx.api.deleteMessage(chatId, warningMessage.message_id);
//         } catch (error) {
//           console.error("Ошибка удаления сообщения:", error);
//         }
//       }, 5000);
//     }
//   });



// // Обработка отредактированных сообщений
// bot.on("edited_message", async (ctx) => {
//     const text = ctx.editedMessage.text?.toLowerCase();
//     const chatId = ctx.chat.id;
//     const messageId = ctx.editedMessage.message_id;
  
//     if (text && scamKeywords.some(word => text.includes(word.toLowerCase()))) {
//         const warningMessage =  await ctx.reply("⚠️ Ваше сообщение содержит запрещенные слова и будет удалено через 5 секунд.");
         
//          setTimeout(async () => {
//            try {
//              await ctx.api.deleteMessage(chatId, messageId);
//              await ctx.api.deleteMessage(chatId, warningMessage.message_id);
//            } catch (error) {
//              console.error("Ошибка удаления сообщения:", error);
//            }
//          }, 5000);
//        }
//   });

// // Запуск Express-сервера
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//   res.send("Бот работает!");
// });

// // Запускаем бота
// bot.start();
// app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));


require("dotenv").config();
const { Bot } = require("grammy");
const express = require("express");

// Задаем токен бота
const bot = new Bot(process.env.BOT_TOKEN);

// Список запрещенных слов
const scamKeywords = [
  "Бонус", "Фриспины", "Кэшбек", "Джекпот", "Выигрыш", "Лудоман", "Депозит",
  "Вывод (денег)", "Ставки", "Казино", "Букмекер", "Легкий заработок",
  "Без вложений", "Криптоказино", "Раздача денег", "Промокод",
  "Гарантия 100%", "Легкие деньги", "Бесплатно", "Секретный метод", "Взлом",
  "Без риска", "Выведи деньги", "Проверенная схема", "Работа на дому",
  "Автозаработок", "Легкие бабки", "Доход без усилий", "Рабочая схема",
  "Быстрое обогащение", "Инвестиции", "Хайп", "Умножь деньги",
  "Заработай за 5 минут", "Доход на пассиве", "Быстрый вывод",
  "Удвоение депозита", "Вложи 100₽ – получи 1000₽", "Автоматический заработок",
  "Уникальная стратегия", "Топовые сигналы", "Бинарные опционы",
  "Финансовая независимость", "Airdrop", "Раздача", "Крипта бесплатно",
  "Биткоин", "ETH (Ethereum)", "NFT-розыгрыш", "Смарт-контракт",
  "Блокчейн-платформа", "Инвестируй в крипту", "Гарантированный профит"
];

// Храним последние 10 сообщений для каждого чата
const recentMessages = {};

// Функция проверки на запрещённые слова
const containsScamWords = (text) => {
  return scamKeywords.some(word => text.includes(word.toLowerCase()));
};

// Обработка новых сообщений
bot.on("message", async (ctx) => {
  const text = ctx.message.text?.toLowerCase();
  const chatId = ctx.chat.id;
  const messageId = ctx.message.message_id;

  // Инициализируем массив для хранения сообщений, если его нет
  if (!recentMessages[chatId]) {
    recentMessages[chatId] = [];
  }

  // Сохраняем сообщение
  recentMessages[chatId].push({ messageId, text });
  
  // Храним только последние 10 сообщений
  if (recentMessages[chatId].length > 10) {
    recentMessages[chatId].shift();
  }

  if (text && containsScamWords(text)) {
    const warningMessage = await ctx.reply(
      "⚠️ Ваше сообщение содержит запрещенные слова и будет удалено через 10 секунд."
    );

    setTimeout(async () => {
      try {
        await ctx.api.deleteMessage(chatId, messageId);
        await ctx.api.deleteMessage(chatId, warningMessage.message_id);
      } catch (error) {
        console.error("Ошибка удаления сообщения:", error);
      }
    }, 10000);
  }
});

// Обработка отредактированных сообщений
bot.on("edited_message", async (ctx) => {
  const text = ctx.editedMessage.text?.toLowerCase();
  const chatId = ctx.chat.id;
  const messageId = ctx.editedMessage.message_id;

  if (text && containsScamWords(text)) {
    try {
      await ctx.api.deleteMessage(chatId, messageId);
      console.log("Отредактированное сообщение удалено:", messageId);
    } catch (error) {
      console.error("Ошибка удаления отредактированного сообщения:", error);
    }
  }
});

// Запуск Express-сервера
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Бот работает!");
});

// Запускаем бота
bot.start();
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
