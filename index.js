
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



require("dotenv").config();
const { Bot } = require("grammy");
const express = require("express");

// Создаем бота
const bot = new Bot(process.env.BOT_TOKEN);

// Храним капчи для пользователей
const captchaData = new Map();

// Генерация случайных чисел для капчи
const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 10; // от 10 до 59
  const num2 = Math.floor(Math.random() * 10) + 10; // от 10 до 59
  return { question: `${num1} + ${num2}`, answer: num1 + num2 };
};

// Функция удаления сообщений через 20 секунд
const deleteMessageAfterDelay = async (chatId, messageId, delay = 10000) => {
  setTimeout(async () => {
    try {
      await bot.api.deleteMessage(chatId, messageId);
    } catch (error) {
      console.error("Ошибка при удалении сообщения:", error);
    }
  }, delay);
};

// Проверка новых участников (включая вступление по ссылке)
bot.on("chat_member", async (ctx) => {
  const member = ctx.chatMember.new_chat_member;
  const chatId = ctx.chat.id;
  
  if (member.status === "member") {
    await handleNewMember(chatId, member.user);
  }
});

// Проверка вступления через пригласительную ссылку
bot.on("message", async (ctx) => {
  if (ctx.message.new_chat_members) {
    for (const user of ctx.message.new_chat_members) {
      await handleNewMember(ctx.chat.id, user);
    }
  }
});

// Функция обработки нового участника
const handleNewMember = async (chatId, user) => {
  const userId = user.id;
  const { question, answer } = generateCaptcha();
  
  captchaData.set(userId, { answer, chatId });

  const msg = await bot.api.sendMessage(
    chatId,
    `👋 Привет, ${user.first_name}!\n\nПеред тем как писать в чат, реши капчу:\n\n*Сколько будет ${question}?* (Ответь числом)`,
    { parse_mode: "Markdown" }
  );

  deleteMessageAfterDelay(chatId, msg.message_id); // Удаляем капчу через 10 секунд

  // Удаление пользователя через 10 секунд, если не прошел капчу
  setTimeout(async () => {
    console.log('captchaData', captchaData)
    console.log('captchaData', captchaData.has(userId))
    if (!captchaData.has(userId)) {
      try {
        await bot.api.banChatMember(chatId, userId);
        const kickMsg = await bot.api.sendMessage(chatId, `🚨 ${user.first_name} был удален за непрохождение капчи.`);
        deleteMessageAfterDelay(chatId, kickMsg.message_id); // Удаляем сообщение о бане
        captchaData.delete(userId);
      } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
      }
    } else{
      const successMsg = await bot.api.sendMessage(
    chatId,"✅ Верно! Добро пожаловать!");
      deleteMessageAfterDelay(chatId, successMsg.message_id); // Удаляем сообщение "верно"
      captchaData.delete(userId);
    }

  }, 20000);
};


/// НЕ ПОПАДАЕТ СЮДА
// // Обработка ответов пользователей
bot.on("message:text", async (ctx) => {
  const userId = ctx.message.from.id;
  const chatId = ctx.chat.id;
  const messageId = ctx.message.message_id;
  const userAnswer = parseInt(ctx.message.text.trim(), 10);
  const correctAnswer = captchaData.get(userId).answer;
 
  console.log('userId', userId, ' --- ', 'userAnswer', userAnswer)
  console.log('chatId', chatId, ' --- ', 'correctAnswer', correctAnswer)

  if (captchaData.has(userId)) {
    

    if (userAnswer === correctAnswer) {
      const successMsg = await ctx.reply("✅ Верно! Добро пожаловать!");
      deleteMessageAfterDelay(chatId, successMsg.message_id); // Удаляем сообщение "верно"
      captchaData.delete(userId);
    } else {
      const failMsg = await ctx.reply("❌ Неверный ответ! Попробуй снова.");
      deleteMessageAfterDelay(chatId, failMsg.message_id); // Удаляем сообщение "неверно"
    }
  }

  deleteMessageAfterDelay(chatId, messageId); // Удаляем сообщение пользователя
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
