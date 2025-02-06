
// ____________________Версия бота без капчи с поиском по ключевым словам_______________________________

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

// // Храним последние 10 сообщений для каждого чата
// const recentMessages = {};

// // Функция проверки на запрещённые слова
// const containsScamWords = (text) => {
//   return scamKeywords.some(word => text.includes(word.toLowerCase()));
// };

// // Обработка новых сообщений
// bot.on("message", async (ctx) => {
//   const text = ctx.message.text?.toLowerCase();
//   const chatId = ctx.chat.id;
//   const messageId = ctx.message.message_id;

//   // Инициализируем массив для хранения сообщений, если его нет
//   if (!recentMessages[chatId]) {
//     recentMessages[chatId] = [];
//   }

//   // Сохраняем сообщение
//   recentMessages[chatId].push({ messageId, text });
  
//   // Храним только последние 10 сообщений
//   if (recentMessages[chatId].length > 10) {
//     recentMessages[chatId].shift();
//   }

//   if (text && containsScamWords(text)) {
//     const warningMessage = await ctx.reply(
//       "⚠️ Ваше сообщение содержит запрещенные слова и будет удалено через 10 секунд."
//     );

//     setTimeout(async () => {
//       try {
//         await ctx.api.deleteMessage(chatId, messageId);
//         await ctx.api.deleteMessage(chatId, warningMessage.message_id);
//       } catch (error) {
//         console.error("Ошибка удаления сообщения:", error);
//       }
//     }, 10000);
//   }
// });

// // Обработка отредактированных сообщений
// bot.on("edited_message", async (ctx) => {
//   const text = ctx.editedMessage.text?.toLowerCase();
//   const chatId = ctx.chat.id;
//   const messageId = ctx.editedMessage.message_id;

//   if (text && containsScamWords(text)) {
//     try {
//       await ctx.api.deleteMessage(chatId, messageId);
//       console.log("Отредактированное сообщение удалено:", messageId);
//     } catch (error) {
//       console.error("Ошибка удаления отредактированного сообщения:", error);
//     }
//   }
// });

// // Запуск Express-сервера
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//   res.send("Бот работает!");
// });

// // Запускаем бота
// bot.start();
// app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

// ____________________Версия бота без капчи с поиском по ключевым словам_______________________________



// бот с ИИ 


require("dotenv").config();
const { Bot } = require("grammy");
const { OpenAI } = require("openai");

const bot = new Bot(process.env.BOT_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Функция проверки на рекламу/скам через OpenAI
const isSuspiciousMessage = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Ты анализатор спама в Telegram-чате. Если сообщение содержит рекламу, мошенничество или скам, ответь 'Да'. Иначе ответь 'Нет'." },
        { role: "developer", content: `Это реклама или скам? Сообщение: "${text}"` },
      ],
      temperature: 0.2,
    });

    const result = response.choices[0]?.message?.content?.trim().toLowerCase();
    return result === "да";
  } catch (error) {
    console.error("Ошибка при проверке текста:", error.message);
    return false;
  }
};

// Обработка всех сообщений в чате
bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat.id;
  const messageId = ctx.message.message_id;
  const text = ctx.message.text;

  // Проверяем сообщение через OpenAI
  const isSuspicious = await isSuspiciousMessage(text);

  if (isSuspicious) {
    const warnMsg = await ctx.reply("⚠️ Это сообщение похоже на рекламу или мошенничество. Оно будет удалено через 20 секунд.");

    // Удаляем сообщение пользователя и предупреждение бота через 20 секунд
    setTimeout(async () => {
      try {
        await ctx.api.deleteMessage(chatId, messageId); // Удаляем сообщение пользователя
        await ctx.api.deleteMessage(chatId, warnMsg.message_id); // Удаляем предупреждение
      } catch (error) {
        console.error("Ошибка при удалении сообщений:", error.message);
      }
    }, 20000);
  }
});

// Запуск бота
bot.start();
console.log("🚀 Бот запущен!");






