const axios = require("axios");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("ffmpeg-static");
const { spawn } = require("child_process");

module.exports = {
  config: {
    name: "music",
    aliases: ["song", "mp3"],
    version: "1.0",
    author: "Danny",
    countDown: 10,
    role: 0,
    shortDescription: "Download music as mp3",
    longDescription: "Search YouTube and download the audio as an MP3 file to play in Messenger.",
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
      // Step 1: Search YouTube using Piped API (no key needed)
      const searchUrl = `https://piped.video/api/v1/search?q=${encodeURIComponent(query)}`;
      const searchRes = await axios.get(searchUrl);
      const video = searchRes.data?.items?.[0];
      if (!video) {
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }

      const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;
      const title = video.title.replace(/[^\w\s]/gi, "").substring(0, 50); // clean + limit filename
      const tempPath = path.join(__dirname, `${title}.mp3`);

      // Step 2: Download audio stream
      const audioStream = ytdl(videoUrl, { filter: "audioonly", quality: "highestaudio" });

      // Step 3: Convert to MP3 using ffmpeg
      const ffmpegProcess = spawn(ffmpeg, [
        "-i", "pipe:3",
        "-f", "mp3",
        "-ab", "192k",
        "-vn",
        tempPath
      ], {
        stdio: ["inherit", "inherit", "inherit", "pipe"]
      });

      audioStream.pipe(ffmpegProcess.stdio[3]);

      ffmpegProcess.on("close", async () => {
        // Step 4: Send MP3 file
        api.sendMessage(
          {
            body: `🎶 Now playing: ${video.title}`,
            attachment: fs.createReadStream(tempPath)
          },
          event.threadID,
          () => {
            fs.unlinkSync(tempPath); // delete after sending
          },
          event.messageID
        );
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Error: Could not download music.", event.threadID, event.messageID);
    }
  }
};
