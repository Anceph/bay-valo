import { SlashCommandBuilder } from "@discordjs/builders";
import { getUserData } from "../../utils/functions/database.js";
import { getRank } from "../../utils/functions/getRank.js";
import { EmbedBuilder } from "discord.js";
import { emojiList } from "../../../app.js";
import agents from '../../utils/agents.json' assert { type: "json" }
import ranks from '../../utils/ranks.json' assert { type: "json" }
import { getMatches } from "../../utils/functions/getMatches.js";
import { getMatch } from "../../utils/functions/getMatch.js";

export default {
    data: new SlashCommandBuilder()
        .setName("mac")
        .setDescription("Son maçlarını kontrol et ya da istediğin bir maçı detaylıca incele")
        .addStringOption(option =>
            option
                .setName('sorgu')
                .setDescription('Sorgu türü seç')
                .setRequired(true)
                .addChoices(
                    { name: 'Son Maçlar', value: 'matchlist' },
                    { name: 'Maç Sorgu', value: 'match' },
                ))
        .addStringOption(option =>
            option
                .setName('match_id')
                .setDescription('Maç ID giriniz (Sadece Maç Sorgu seçildiğinde gerekli)')
                .setRequired(false)
        ),
    run: async (client, interaction) => {
        await interaction.deferReply()
        const user = interaction.member.user
        const sorgu = interaction.options.getString('sorgu');
        const matchId = interaction.options.getString('match_id');

        const errorEmbed = new EmbedBuilder().setTitle('Hata').setColor('Red')
        const successEmbed = new EmbedBuilder().setTitle('Başarılı').setColor('Green')

        if (sorgu === 'match') {
            if (!matchId) {
                errorEmbed.setDescription(`Bir maç ID'si giriniz. Eğer maç ID'sini bilmiyorsanız "Son Maçlar" seçeneğini kullanabilirsiniz.`)
                return interaction.editReply({ content: '', embeds: [errorEmbed] })
            }

            let userInfo = await getUserData(user.id);
            let match = await getMatch(matchId);

            if (!match) {
                errorEmbed.setDescription(`Maç bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.`)
                return interaction.editReply({ content: '', embeds: [errorEmbed] })
            }

            let playerStatsMessage = ""
            let teamMessage = ""

            match.players.sort((a, b) => b.score - a.score);

            match.players.forEach(player => {
                playerStatsMessage += `${emojiList[agents[player.agent]]} **${player.name}#${player.tag}** ${emojiList[ranks[player.rank]]}\n` +
                    `KDA: ${player.kills}/${player.deaths}/${player.assists}\n\n`
            })

            match.teams.forEach(team => {
                if (team.team_id === 'Red') {
                    teamMessage += `**Kırmızı Takım:** ${team.rounds_won} - ${team.rounds_lost} ${team.has_won ? ' 🏆' : ''}\n`
                } else {
                    teamMessage += `**Mavi Takım:** ${team.rounds_won} - ${team.rounds_lost} ${team.has_won ? ' 🏆' : ''}`
                }
            })

            const playerStatsEmbed = new EmbedBuilder()
                .setTitle(`Detay: ${match.mode} - ${match.map} (${match.cluster})`)
                .setColor('#ff4654')
                .setDescription(`${playerStatsMessage}\n${teamMessage}`)
                .setFooter({ text: `Maç ID: ${match.match_id}` });

            return interaction.editReply({ content: '', embeds: [playerStatsEmbed] });

        } else if (sorgu === 'matchlist') {
            let userInfo = await getUserData(user.id);
            let matches = await getMatches(userInfo.puuid);

            if (!matches || matches.length === 0) {
                errorEmbed.setDescription(`Maç bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.`);
                return interaction.editReply({ content: '', embeds: [errorEmbed] });
            }

            const itemsPerPage = 1;
            let currentPage = 0;

            // Function to create the embeds for the current page
            const createEmbeds = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const totalPages = Math.ceil(matches.length / itemsPerPage);
                const matchEmbeds = matches.slice(start, end).map(match => {
                    const redTeam = match.teams.red;
                    const blueTeam = match.teams.blue;
                    let playerStats = match.players.find(player => player.puuid === userInfo.puuid);

                    const redResult = `${redTeam.has_won ? "W" : "L"} | ${redTeam.rounds_won} - ${redTeam.rounds_lost}`;
                    const blueResult = `${blueTeam.has_won ? "W" : "L"} | ${blueTeam.rounds_won} - ${blueTeam.rounds_lost}`;

                    return new EmbedBuilder()
                        .setTitle(`${match.mode} - ${match.map} (${match.cluster})`)
                        .setColor('#ff4654')
                        .addFields(
                            { name: 'Harita', value: match.map, inline: true },
                            { name: 'Oyun Süresi', value: `${Math.floor(match.gameLength / 60)} dakika`, inline: true },
                            { name: 'Tarih', value: `<t:${match.gameStart}:f>`, inline: false },
                            { name: 'Sonuç', value: `KDA: ${playerStats.stats.kills}/${playerStats.stats.deaths}/${playerStats.stats.assists}\nKırmızı Takım: ${redResult}\nMavi Takım: ${blueResult}`, inline: false }
                        )
                        .setFooter({ text: `Maç ID: ${match.matchId} | Sayfa ${page + 1} / ${totalPages}` });
                });
                return matchEmbeds;
            };

            // Send the initial page of embeds
            let embeds = createEmbeds(currentPage);
            let reply = await interaction.editReply({ content: 'Son Maçların:', embeds });

            // Add pagination buttons
            const totalPages = Math.ceil(matches.length / itemsPerPage);
            if (totalPages > 1) {
                await reply.react('◀️'); // Back button
                await reply.react('▶️'); // Next button

                const filter = (reaction, user) => {
                    return ['◀️', '▶️'].includes(reaction.emoji.name) && !user.bot;
                };

                const collector = reply.createReactionCollector({ filter, time: 60000 });

                collector.on('collect', async (reaction, user) => {
                    if (reaction.emoji.name === '◀️') {
                        if (currentPage > 0) {
                            currentPage--;
                        }
                    } else if (reaction.emoji.name === '▶️') {
                        if (currentPage < totalPages - 1) {
                            currentPage++;
                        }
                    }

                    embeds = createEmbeds(currentPage);
                    await reply.edit({ embeds });
                    await reaction.users.remove(user.id);
                });

                collector.on('end', () => {
                    reply.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
                });
            }
        }
    }
};