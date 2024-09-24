import getUser from "../../utils/functions/getUser.js";
import { checkUser, getUserData } from "../../utils/functions/database.js";
import { emojiList } from "../../../app.js";

export default {
    name: "test",
    aliases: [],
    cooldown: 0,
    run: async (client, message, args) => {
        return message.reply("pong")
        let naber = await getUserData(args[0])
        return message.reply(`${naber.username}#${naber.tag} (${naber.puuid})`)
        // return getUser(message.author.id, args[0], args[1])
    }
};
