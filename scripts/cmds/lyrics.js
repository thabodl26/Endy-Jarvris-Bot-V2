const lyricsFinder = require("lyrics-finder");
const axios = require("axios");

module.exports = {
  config: {
    name: "lyrics",
    aliases: ["ly"],
    version: "1.1",
    author: "Danny",
    countDown: 5,
    role: 0,
    shortDescription: "Get song lyrics",
    longDescription: "Fetch lyrics using lyrics-finder, fallback to lyricstx API",
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
      // First try with lyrics-finder
      let lyrics = await lyricsFinder(artist, title);

      if (!lyrics) {
        // fallback: lyricstx API
        const { data } = await axios.get(
          `https://lyricstx.vercel.app/youtube/lyrics?title=${encodeURIComponent(
            `${title} ${artist}`
          )}`
        );

        if (data?.lyrics) {
          lyrics = `🎵 ${data.track_name}\n👤 ${data.artist_name}\n\n${data.lyrics}`;
        }
      }

      if (!lyrics) {
        return api.sendMessage(
          "❌ Lyrics not found. Try another song.",
          event.threadID,
          event.messageID
        );
      }

      // Split long lyrics
      const chunks = lyrics.match(/[\s\S]{1,1800}/g);
      for (const chunk of chunks) {
        await api.sendMessage(chunk, event.threadID);
      }
    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ Error fetching lyrics. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
