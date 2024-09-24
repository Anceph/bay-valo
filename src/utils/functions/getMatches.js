import axios from "axios";
import { writeUserData } from "./database.js";
import 'dotenv/config'

export async function getMatches(puuid) {
    const url = `https://api.henrikdev.xyz/valorant/v3/by-puuid/matches/eu/${puuid}?api_key=${process.env.API_KEY}`
    return await axios.get(url)
        .then(function (response) {
            if (response.status != 200) {
                return 0
            }
            const jsonData = response.data
            let data = jsonData.data
            const matches = data.map(match => ({
                map: match.metadata.map,
                gameLength: match.metadata.game_length, // in seconds
                gameStart: match.metadata.game_start, // <t:${gameStart}> -> September 21, 2024 11:02 PM
                mode: match.metadata.mode,
                matchId: match.metadata.matchid,
                cluster: match.metadata.cluster,
                players: match.players.all_players,
                red_team: match.players.red,
                blue_team: match.players.blue,
                teams: match.teams
            }))

            return matches
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