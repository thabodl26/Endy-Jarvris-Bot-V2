const ytdl = require("@distube/ytdl-core");
const yts = require("yt-search");
const ffmpegPath = require("ffmpeg-static");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "music",
    version: "1.0",
    author: "Danny Codex",
    countDown: 10,
    role: 0,
    shortDescription: "Download and play music",
    longDescription: "Search YouTube and play audio as MP3 directly in chat.",
    category: "music",
    guide: {
      en: "{pn} <song name>\nExample: {pn} one dance drake"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage(
        "⚠️ Please provide a song name!\nExample: music one dance drake",
        event.threadID,
        event.messageID
      );
    }

    try {
      // 1. Search YouTube
      const r = await yts(query);
      if (!r.videos.length) {
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }
      const video = r.videos[0];

      const filePath = path.join(__dirname, `music-${Date.now()}.mp3`);

      // 2. Stream + convert with ffmpeg
      const stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" });
      const ffmpeg = cp.spawn(ffmpegPath, [
        "-i", "pipe:0",
        "-vn",
        "-ar", "44100",
        "-ac", "2",
        "-b:a", "192k",
        "-f", "mp3",
        "pipe:1"
      ]);

      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(ffmpeg.stdin);
      ffmpeg.stdout.pipe(writeStream);

      ffmpeg.on("close", async () => {
        api.sendMessage(
          {
            body: `🎶 Now playing: ${video.title}\n👤 ${video.author.name}\n⏱️ ${video.timestamp}\n📺 ${video.url}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error fetching music. Please try again later.", event.threadID, event.messageID);
    }
  }
};
