import { SlashCommandBuilder } from "@discordjs/builders";
import { getUserData } from "../../utils/functions/database.js";
import { getRank } from "../../utils/functions/getRank.js";
import { EmbedBuilder } from "discord.js";
import { emojiList } from "../../../app.js";
import ranks from '../../utils/ranks.json' assert { type: "json" }

export default {
    data: new SlashCommandBuilder()
        .setName("profil")
        .setDescription("Profilini gösterir"),
    run: async (client, interaction) => {
        await interaction.deferReply()
        const user = interaction.member.user

        let userInfo = await getUserData(user.id)
        let rankInfo = await getRank(userInfo.puuid)
        const embed = new EmbedBuilder()
            .setTitle(`${userInfo.username}#${userInfo.tag}`)
            .setDescription(`Seviye: **${userInfo.account_level}**\n\n**Rütbe**\nGüncel: ${emojiList[ranks[rankInfo.current_rank.id]]} (${rankInfo.current_rr} rr)\nEn Yüksek: ${emojiList[ranks[rankInfo.peak.id]]}\n\n**Bu Sezon**\nKazanılan Oyunlar: ${rankInfo.lastSeason.wins}\nOynanan Oyunlar: ${rankInfo.lastSeason.games}\nKazanma Oranı: ${rankInfo.lastSeason.winrate.toFixed(2)}%`)
            .setThumbnail(userInfo.large_card)
            .setColor('#ff4654')
        return interaction.editReply({ content:'', embeds: [embed] })
    }
};
