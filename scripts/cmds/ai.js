const fetch = require('node-fetch');

module.exports = {
  config: {
    name: "ai",
    version: "1.0",
    author: "Prince",
    countDown: 5,
    role: 0,
    description: "AI chat",
    category: "chat",
    guide: "{pn} <question>",
  },

  onStart: async function ({ message, args }) {
    const query = args.join(' ');
    if (!query) return message.reply("Please enter a question.");

    try {
      const url = `https://betadash-api-swordslush-production.up.railway.app/you?chat=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      const answer = data.response;
      return message.reply(answer);
    } catch (err) {
      return message.reply("An error occurred.");
    }
  }
};
    
