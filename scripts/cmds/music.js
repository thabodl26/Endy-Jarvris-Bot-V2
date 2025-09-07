const ytdlp = require("yt-dlp-exec");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "music",
    aliases: ["song", "mp3"],
    version: "1.8",
    author: "Danny",
    countDown: 10,
    role: 0,
    shortDescription: "Download MP3 from YouTube",
    longDescription: "Search YouTube and download audio as MP3",
    category: "music",
    guide: "{pn} <song name>\nExample: {pn} ayala xxxtentacion"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "⚠️ Please type a song name!\nExample: -music ayala xxxtentacion",
        event.threadID,
        event.messageID
      );
    }

    // Unique file per request
    const filePath = path.join(__dirname, `music_${Date.now()}.mp3`);

    try {
      // Step 1: Search YouTube
      const info = await ytdlp(query, {
        dumpSingleJson: true,
        defaultSearch: "ytsearch",
        noPlaylist: true
      });

      const entries = info.entries || [info];
      if (!entries.length) {
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }

      const song = entries[0];
      const title = song.title || "Unknown Title";
      const durationSeconds = song.duration || 0;
      const durationFormatted = durationSeconds
        ? `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")}`
        : "Unknown";

      // Restrict to 15 minutes
      if (durationSeconds > 900) {
        return api.sendMessage(
          `⚠️ The song **${title}** is too long (${durationFormatted}). I can only fetch tracks under 15 minutes.`,
          event.threadID,
          event.messageID
        );
      }

      // Notify user
      api.sendMessage(
        `🎶 Downloading: ${title}\n⏱ Duration: ${durationFormatted}`,
        event.threadID,
        event.messageID
      );

      // Step 2: Download audio
      await ytdlp(song.webpage_url, {
        extractAudio: true,
        audioFormat: "mp3",
        audioQuality: 0,
        output: filePath,
        ffmpegLocation: ffmpegPath
      });

      if (!fs.existsSync(filePath)) {
        return api.sendMessage("❌ Failed to download audio.", event.threadID, event.messageID);
      }

      // Step 3: Send file
      api.sendMessage(
        {
          body: `🎼 ${title}\n✅ Here's your song!`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => {
          try {
            fs.unlinkSync(filePath); // cleanup
          } catch (e) {
            console.error("Cleanup failed:", e);
          }
        },
        event.messageID
      );
    } catch (err) {
      console.error("Music error:", err);
      api.sendMessage("❌ Error fetching music. Try another song.", event.threadID, event.messageID);
    }
  }
};
