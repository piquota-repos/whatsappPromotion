require('dotenv').config();
require('./scheduler');
//const { appendToSheet } = require("./writetosheet");
const express = require('express');
const path = require('path');
const fs = require('fs');
 
const app = express();
const VERIFY_TOKEN = "MY_SECRET_TOKEN";
 
app.use(express.json());
app.use(express.static("public"));
 
console.log("📲 WhatsApp Promo Scheduler Running...");
 
// ✅ Static file serving (e.g., for WhatsApp header images)
app.use('/images', express.static(path.join(__dirname, 'public/images')));
 
// ✅ File paths for persistent logs
const receivedFilePath = path.join(__dirname, 'receivedMessages.json');
const errorFilePath = path.join(__dirname, 'errorMessages.json');
const statusLogPath = path.join(__dirname, 'messageStatus.json');
// ✅ Helper functions
const loadJson = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (e) {
    console.error(`❌ Failed to load ${filePath}:`, e);
  }
  return [];
};
 
const saveJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`❌ Failed to save to ${filePath}:`, e);
  }
};
 
// ✅ Initialize logs
if (!fs.existsSync(receivedFilePath)) saveJson(receivedFilePath, []);
if (!fs.existsSync(errorFilePath)) saveJson(errorFilePath, []);
if (!fs.existsSync(statusLogPath)) saveJson(statusLogPath, []);
 
let receivedMessages = loadJson(receivedFilePath);
let errorMessages = loadJson(errorFilePath);
 
// ✅ Root route
app.get('/', (req, res) => {
  res.send('🚀 WhatsApp Promo Scheduler is live!');
});
 
// ✅ Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
 
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!');
      res.status(200).send(challenge);
    } else {
      console.warn('❌ Webhook verification failed.');
      res.sendStatus(403);
    }
  } else {
    res.status(400).send('Missing mode or token');
  }
});
 
// ✅ Webhook event handler
app.post("/webhook", async (req, res) => {
  console.log("Webhook Received...")
  const body = req.body;
  console.log(body)
  if (body.object) {
    console.log(body.entry)
    body.entry.forEach(entry => {
      const changes = entry.changes || [];
      changes.forEach(async (change) => {
        const value = change.value;
 
        // 📥 Received user message
        if (value.messages) {
          value.messages.forEach(async (msg) => {
            const log = {
              from: msg.from,
              text: msg.text?.body || "",
              type: msg.type,
              timestamp: msg.timestamp,
              id: msg.id
            };
            receivedMessages.push(log);
            // saveJson(receivedFilePath, receivedMessages);
            console.log("reached webhook");
            // await appendToSheet({
            //   name: 'Webhook Event',
            //   mobile: msg.from || 'Unknown',
            //   message: JSON.stringify(log)
            // });
            console.log("📥 Received Message:", log);
          });
        }
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
 
        if (changes?.field === 'messages') {
          const statuses = changes.value?.statuses;
 
          if (statuses && statuses.length > 0) {
            const statusData = statuses.map(status => ({
              message_id: status.id,
              status: status.status,
              timestamp: new Date(Number(status.timestamp) * 1000).toISOString(),
              recipient_id: status.recipient_id,
              conversation: status.conversation,
              pricing: status.pricing
            }));
 
            const currentLog = loadJson(statusLogPath);
            const updatedLog = currentLog.concat(statusData);
            // saveJson(statusLogPath, updatedLog);
            console.log("reached webhook");
            // await appendToSheet({
            //   name: 'Webhook Event',
            //   mobile: msg.from || 'Unknown',
            //   message: JSON.stringify(updatedLog)
            // });
            console.log("📥 Received Message:", updatedLog);
            console.log(`📩 Status update received:`, statusData);
          }
        }
        // ❌ Delivery failures
        if (value.statuses) {
          value.statuses.forEach(async (status) => {
            if (["failed", "error"].includes(status.status)) {
              const error = {
                id: status.id,
                recipient_id: status.recipient_id,
                status: status.status,
                error: status.errors,
                timestamp: status.timestamp
              };
              errorMessages.push(error);
              //saveJson(errorFilePath, errorMessages);
               console.log("reached webhook");
              // await appendToSheet({
              //   name: 'Webhook Event',
              //   mobile: msg.from || 'Unknown',
              //   message: JSON.stringify(error)
              // });
              console.log("📥 Received Message:", error);
              console.log("❌ Message Error:", error);
            }
          });
        }
      });
    });
 
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});
 
// ✅ View logs via browser
app.get("/messages", (req, res) => {
  res.json(receivedMessages);
});
 
app.get("/errors", (req, res) => {
  res.json(errorMessages);
});
 
// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});