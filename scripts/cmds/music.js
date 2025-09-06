const fs = require("fs");
const path = require("path");
const ytdl = require("@distube/ytdl-core");
const yts = require("yt-search");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  config: {
    name: "music",
    version: "1.1",
    author: "Danny",
    countDown: 5,
    role: 0,
    shortDescription: "Download MP3 from YouTube",
    longDescription: "Search YouTube and download music as MP3 to play directly in Messenger.",
    category: "music",
    guide: {
      en: "{pn} <song name>\nExample: {pn} hope xxxtentacion"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("⚠️ Please provide a song name!\nExample: music hope xxxtentacion", event.threadID, event.messageID);
    }

    try {
      // 1. Search on YouTube
      const search = await yts(query);
      if (!search.videos.length) {
        return api.sendMessage("❌ No results found on YouTube.", event.threadID, event.messageID);
      }

      const song = search.videos[0]; // first result
      const filePath = path.join(__dirname, "music.mp3");

      // 2. Download + Convert
      const stream = ytdl(song.url, { filter: "audioonly", quality: "highestaudio" });

      ffmpeg(stream)
        .audioBitrate(128)
        .toFormat("mp3")
        .save(filePath)
        .on("end", () => {
          api.sendMessage(
            {
              body: `🎵 ${song.title}\n👤 ${song.author.name}\n⏱️ ${song.timestamp}`,
              attachment: fs.createReadStream(filePath)
            },
            event.threadID,
            () => {
              fs.unlinkSync(filePath); // cleanup
            },
            event.messageID
          );
        })
        .on("error", (err) => {
          console.error("❌ FFmpeg error:", err);
          api.sendMessage("❌ Error converting audio.", event.threadID, event.messageID);
        });

    } catch (err) {
      console.error("❌ Music command failed:", err);
      api.sendMessage("❌ Error fetching music. Try again later.", event.threadID, event.messageID);
    }
  }
};
