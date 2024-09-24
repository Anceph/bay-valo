import axios from "axios";
import { writeUserData } from "./database.js";
import 'dotenv/config'

export async function getMatch(match_id) {
    const url = `https://api.henrikdev.xyz/valorant/v4/match/eu/${match_id}?api_key=${process.env.API_KEY}`
    return await axios.get(url)
        .then(function (response) {
            if (response.status != 200) {
                return 0
            }
            const jsonData = response.data
            let data = jsonData.data

            let dateString = data.metadata.started_at
            let date = new Date(dateString)
            let epochDate = Math.floor(date.getTime() / 1000)

            const players = data.players.map(player => ({
                name: player.name,
                tag: player.tag,
                agent: player.agent.name,
                score: player.stats.score,
                kills: player.stats.kills,
                deaths: player.stats.deaths,
                assists: player.stats.assists,
                rank: player.tier.id
            }));

            const teams = data.teams.map(team => ({
                team_id: team.team_id,
                rounds_won: team.rounds.won,
                rounds_lost: team.rounds.lost,
                has_won: team.won
            })
            )

            return {
                match_id: data.metadata.match_id,
                map: data.metadata.map.name,
                length: data.metadata.game_length_in_ms,
                date: epochDate,
                mode: data.metadata.queue.name,
                cluster: data.metadata.cluster,
                players,
                teams
            }

        })
        .catch(function (error) {
            if (error.response) {
                return 0
                console.error("Response data:", error.response.data);
                console.error("Status code:", error.response.status);
            } else if (error.request) {
                console.error("No response received");
            } else {
                console.error("Error setting up the request:", error.message);
            }
        });
}