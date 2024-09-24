import { SlashCommandBuilder } from "@discordjs/builders";
import getUser from "../../utils/functions/getUser.js";
import { EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ayarla")
        .setDescription("Sorgulama yapmak için profili ayarla")
        .addStringOption(option =>
            option
                .setName('isim')
                .setDescription('Oyundaki ismin')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('tag')
                .setDescription('Oyundaki etiketin')
                .setRequired(true)
        ),
    run: async (client, interaction) => {
        await interaction.deferReply()
        const username = interaction.options.getString('isim')
        const tag = interaction.options.getString('tag')
        const user = interaction.member.user

        const errorEmbed = new EmbedBuilder().setTitle('Hata').setColor('Red')
        const successEmbed = new EmbedBuilder().setTitle('Başarılı').setColor('Green')

        let userInfo = await getUser(user.id, username, tag)
        if (userInfo === 0) {
            errorEmbed.setDescription(`Kullanıcı adını veya etiketi doğru yazdığından emin ol. Eğer hala hata alıyorsan, oyuna girip bir maç at.`)
            return interaction.editReply({ content:'', embeds: [errorEmbed] })
        } else {
            successEmbed.setDescription(`Profilin başarıyla ayarlandı. Artık sorgulama yapabilirsin.`)
            return interaction.editReply({ content:'', embeds: [successEmbed] })
        }
    }
};
