const fs = require("fs");

module.exports.config = {
    name: "night",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️", 
    description: "hihihihi",
    commandCategory: "no prefix",
    usages: "night",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event }) {
    const { threadID, messageID, body } = event;
    if (!body) return;

    const lowerBody = body.toLowerCase();
    const triggers = ["good night", "gud night", "gud nini"];

    if (triggers.some(t => lowerBody.startsWith(t))) {
        const imagePath = __dirname + "/cache/night.jpg";
        let msg = {
            body: "Good night 🌉✨ Bye tc 💫🥀 Sweet dreams 😴"
        };
        if (fs.existsSync(imagePath)) {
            msg.attachment = fs.createReadStream(imagePath);
        }
        api.sendMessage(msg, threadID, messageID);
        api.setMessageReaction("😴", event.messageID, () => {}, true);
    }
};

module.exports.run = function({ api, event }) {};
