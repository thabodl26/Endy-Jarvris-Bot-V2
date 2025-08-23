const fs = require('fs');

module.exports = {
  config: {
    name: "leaveall",
    version: "1.0",
    author: "NZ R",
    countdown: 5,
    role: 2,
    category: "owner"
  },
  onStart: async function ({ api, args, message, event }) {
    try {
      const approvedThreads = JSON.parse(fs.readFileSync('threads.json', 'utf8'));
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      const botUserID = api.getCurrentUserID();

      const leftThreads = [];
      const notificationTimeout = 5000;

      for (const threadInfo of threadList) {
        if (threadInfo.isGroup && threadInfo.threadID !== event.threadID && !approvedThreads.includes(threadInfo.threadID)) {
          leftThreads.push({
            name: threadInfo.name || "Unnamed Group",
            id: threadInfo.threadID
          });

          setTimeout(async () => {
            const notificationMessage = `⚠ This Thread\n(${threadInfo.name || "Unnamed Group"}) isn't approved ⚠\n\nFor Approval..\n\nCo
