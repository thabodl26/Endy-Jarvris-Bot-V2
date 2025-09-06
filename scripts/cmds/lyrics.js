const lyricsFinder = require("lyrics-finder");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["ly"],
    version: "1.0",
    author: "Danny",
    countDown: 5,
    role: 0,
    shortDescription: "Get song lyrics",
    longDescription: "Fetch lyrics using lyrics-finder package",
    category: "music",
    guide: "{pn} <song title> - <artist>\nExample: {pn} hello - adele"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query.includes("-")) {
      return api.sendMessage(
        "⚠️ Please use format: <title> - <artist>\nExample: hello - adele",
        event.threadID,
        event.messageID
      );
    }

    const [title, artist] = query.split("-").map(s => s.trim());

    try {
      let lyrics = await lyricsFinder(artist, title);

      if (!lyrics) {
        return api.sendMessage("❌ Lyrics not found. Try another song.", event.threadID, event.messageID);
      }

      // split into chunks (Messenger max ~2000 chars)
      const chunks = lyrics.match(/[\s\S]{1,1800}/g);
      for (const chunk of chunks) {
        await api.sendMessage(chunk, event.threadID);
      }
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error fetching lyrics. Try again later.", event.threadID, event.messageID);
    }
  }
};
