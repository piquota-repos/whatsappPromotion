const cron = require('node-cron');
const sendPromotionalMessages = require('./messageService');


cron.schedule(' 45 09 * * *', async () => {
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
// const cron = require("node-cron");
// const fs = require("fs");
// const path = require("path");
// const sendMessage = require('./utils/sendMessage')
// const users = require('./users.json');
// //const sendMessage = require("./messageService");

// // Load recipients
// const recipientsPath = path.join(__dirname, "recipients.json");
// let recipients = JSON.parse(fs.readFileSync(recipientsPath, "utf8"));

// // Track current index
// const progressPath = path.join(__dirname, "progress.json");
// if (!fs.existsSync(progressPath)) {
//   fs.writeFileSync(progressPath, JSON.stringify({ index: 0 }, null, 2));
// }
// let progress = JSON.parse(fs.readFileSync(progressPath, "utf8"));

// /**
//  * Sends the next batch of recipients
//  */
// async function sendBatch() {
//   const start = progress.index;
//   const end = Math.min(start + 20, recipients.length);
//   const batch = recipients.slice(start, end);

//   console.log(`⏰ Sending batch: ${start + 1} - ${end} of ${recipients.length}`);
// const user = users[0];
//   for (const r of batch) {
//     try {
//       await sendMessage({
//         phone: r.phone,
//         name: r.name,
//         user: {
//           META_URL: user.META_URL,
//           template_name: user.template_name,
//           language: "en_US",
//           image_url: user.image_url
//         }
//       });
//     } catch (err) {
//       console.error(`❌ Error sending to ${r.name} (${r.phone}):`, err.message);
//     }
//   }

//   // Save progress
//   progress.index = end;
//   fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));

//   if (end >= recipients.length) {
//     console.log("🎉 All recipients have been processed!");
//   }
// }
// sendBatch();
// // Run every hour
// cron.schedule("0 * * * *", () => {
//   console.log("🚀 Running hourly batch job...");
//   sendBatch();
// }, {
//   timezone: "Asia/Kolkata"
// });

// console.log("📲 WhatsApp Batch Scheduler started...");
