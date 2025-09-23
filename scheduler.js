const cron = require('node-cron');
const sendPromotionalMessages = require('./messageService');


cron.schedule(' 45 13 * * *', async () => {
  console.log("⏰Running scheduled WhatsApp promotional messages...");
  try {
    await sendPromotionalMessages();
    console.log("✅ Messages sent successfully");
  } catch (err) {
    console.error("❌ Error in scheduled message:", err);
  }
}, {
  timezone: "Asia/Kolkata"
});
