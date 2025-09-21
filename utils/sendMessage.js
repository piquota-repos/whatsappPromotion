const axios = require('axios');
require('dotenv').config();
// Serve static files
const express = require('express');
const path = require('path');
const app = express();
 const https = require("https");

const agent = new https.Agent({  
  rejectUnauthorized: false  // ⚠️ disables SSL check
});
const fs = require('fs');
 
app.use('/images', express.static(path.join(__dirname, '../public/images')));
 
// Define file paths
const sentLogPath = path.join(__dirname, '../sentMessages.json');
const failedLogPath = path.join(__dirname, '../failedMessages.json');
 
// Helper functions
const loadJson = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err);
  }
  return [];
};
 
const saveJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error saving to ${filePath}:`, err);
  }
};
 
// Initialize files if not present
if (!fs.existsSync(sentLogPath)) saveJson(sentLogPath, []);
if (!fs.existsSync(failedLogPath)) saveJson(failedLogPath, []);
 
const sendMessage = async ({ phone, name, user }) => {
  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    "template": {
      "name": user.template_name,
      "language": { "code": user.language },
      "components": [
        {
          "type": "header",
          "parameters": [
            {
              "type": "image",
              "image": {
                "link": user.image_url
              }
            }
          ]
        }
      ]
    }
  };
 
  try {
    const response = await axios.post(user.META_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
        httpsAgent: agent
    });
 
    const log = {
      to: phone,
      name,
      timestamp: new Date().toISOString(),
      message_id: response.data.messages?.[0]?.id || "unknown",
      message_status: response.data.messages?.[0].message_status
    };
 
    const sentMessages = loadJson(sentLogPath);
    sentMessages.push(log);
    saveJson(sentLogPath, sentMessages);
 
    console.log(`✅ Message sent to ${name} (${phone})`, response.data);
  } catch (error) {
    const errData = error.response?.data || error.message;
    console.error(`❌ Failed to send message to ${name} (${phone}):`, errData);
 
    const log = {
      to: phone,
      name,
      timestamp: new Date().toISOString(),
      error: errData
    };
 
    const failedMessages = loadJson(failedLogPath);
    failedMessages.push(log);
    saveJson(failedLogPath, failedMessages);
  }
};
app.listen(3000, () => {
  console.log('✅ Static server running on http://localhost:3000');
});
module.exports = sendMessage;
 