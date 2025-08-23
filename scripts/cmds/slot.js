const config = {
    name: "slot",
    aliases: ["lucky7", "7slot"],
    description: "Play the lucky 7 slot machine betting game.\n🎰[𝐋𝐮𝐜𝐤𝐲𝟕]🎰\n━━━━━━━━━━━━━━\n7⃣7⃣7⃣ = 100x bet\n🍒🍉🍎🍌🍋🍓🍇 = 2x/4x bet\n❎ = lose",
    usage: "<bet>",
    cooldown: 8,
    credits: "Duke Agustin",
    extra: {
        minbet: 50
    }
}

const langData = {
    "en_US": {
        "slot.userNoData": "Your data is not ready yet.",
        "slot.notEnoughMoney": "You don't have enough money to place this bet.",
        "slot.minMoney": "Minimum bet is ${min} 💸.",
        "slot.win2x": "🎰[ {symbols} ]🎰\n𝚈𝚘𝚞 𝚠𝚒𝚗 𝟸𝚡 𝚢𝚘𝚞𝚛 𝚋𝚎𝚝! 𝚈𝚘𝚞 𝚐𝚎𝚝 ${money} 💵.",
        "slot.win4x": "🎰[ {symbols} ]🎰\n𝚈𝚘𝚞 𝚠𝚒𝚗 𝟺𝚡 𝚢𝚘𝚞𝚛 𝚋𝚎𝚝! 𝚈𝚘𝚞 𝚐𝚎𝚝 ${money} 💵.",
        "slot.win100x": "🎰[ {symbols} ]🎰\n𝐉𝐚𝐜𝐤𝐩𝐨𝐭! 𝗬𝗼𝘂 𝘄𝗶𝗻 𝟭𝟬𝟬𝘅 𝘆𝗼𝘂𝗿 𝗯𝗲𝘁! 𝗬𝗼𝘂 𝗴𝗲𝘁 ${money} 💵.",
        "slot.lose": "🎰[ {symbols} ]🎰\nYou lose ${money} 💸.",
        "any.error": "An error has occurred. Please try again later."
    }
}

const symbols = ["🍒", "🍉", "🍎", "🍌", "🍓", "🍇", "7⃣", "❎", "❎"];

async function onCall({ message, args, extra, getLang }) {
    const { Users } = global.controllers;
    const bet = BigInt(args[0] || extra.minbet);

    try {
        const userMoney = await Users.getMoney(message.senderID) || null;
        if (userMoney === null) return message.reply(getLang("slot.userNoData"));
        if (BigInt(userMoney) < bet) return message.reply(getLang("slot.notEnoughMoney"));
        if (bet < BigInt(extra.minbet)) return message.reply(getLang("slot.minMoney", { min: extra.minbet }));

        await Users.decreaseMoney(message.senderID, bet);

        
        const result = [];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * symbols.length);
            result.push(symbols[randomIndex]);
        }

        const uniqueSymbols = [...new Set(result)]; 
        const symbolCount = uniqueSymbols.length;

        if (!uniqueSymbols.includes("❎")) {
           
            const winAmount = bet * BigInt(2);
            message.reply(getLang("slot.win2x", { symbols: result.join(" | "), money: String(winAmount) }));
            await Users.increaseMoney(message.senderID, winAmount);
        } else if (uniqueSymbols.includes("❎")) {
            
            message.reply(getLang("slot.lose", { symbols: result.join(" | "), money: String(bet) }));
        } else if (symbolCount === 1) {
            
            const winAmount = bet * BigInt(4);
            message.reply(getLang("slot.win4x", { symbols: result.join(" | "), money: String(winAmount) }));
            await Users.increaseMoney(message.senderID, winAmount);
        } else if (symbolCount === 2 && uniqueSymbols.includes("7⃣")) {
           
            const winAmount = bet * BigInt(4);
            message.reply(getLang("slot.win4x", { symbols: result.join(" | "), money: String(winAmount) }));
            await Users.increaseMoney(message.senderID, winAmount);
        } else if (symbolCount === 3 && !uniqueSymbols.includes("7⃣")) {
           
            const winAmount = bet * BigInt(2);
            message.reply(getLang("slot.win2x", { symbols: result.join(" | "), money: String(winAmount) }));
            await Users.increaseMoney(message.senderID, winAmount);
        } else if (symbolCount === 3 && uniqueSymbols.every(symbol => symbol === "7⃣")) {
            
            const winAmount = bet * BigInt(100);
            message.reply(getLang("slot.win100x", { symbols: result.join(" | "), money: String(winAmount) }));
            await Users.increaseMoney(message.senderID, winAmount);
        } else {
            
            message.reply(getLang("slot.lose", { symbols: result.join(" | "), money: String(bet) }));
        }
    } catch (error) {
        console.error(error);
        return message.reply(getLang("any.error"));
    }
}

export default {
    config,
    langData,
    onCall
}
