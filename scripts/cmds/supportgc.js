module.exports = {
  config: {
    name: "Supportgc",
    version: "1.0",
    author: "prince",
    role: 0,
    shortDescription: {
      en: "Adds the user to support group chat "
    },
    longDescription: {
      en: "Adds the user to the support group chat"
    },
    category: "box chat",
    guide: {
      en: "{pn}"
    }
  },
  onStart: async function ({ api,  event, args }) {
    const threadID = "8425919640817630"; // ID of the thread to add the user to

    try {
      await api.addUserToGroup(event.senderID, threadID);
      api.sendMessage("✅ You have been successfully added to the group chat.Check your msg requests or spam if you cannot find the chat in your inbox. After joining the group, use #rules command to view the group rules. ", event.senderID);
    } catch (error) {
      api.sendMessage("❌ Error. Either you are already in the group", event.senderID);
    }
  }
};
