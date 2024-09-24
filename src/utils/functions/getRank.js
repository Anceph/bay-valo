import axios from "axios";
import 'dotenv/config'

export async function getRank(puuid) {
    const url = `https://api.henrikdev.xyz/valorant/v3/by-puuid/mmr/eu/pc/${puuid}?api_key=${process.env.API_KEY}`
    return await axios.get(url)
        .then(function (response) {
            if (response.status != 200) {
                return 0
            }
            const jsonData = response.data
            let data = jsonData.data
            let seasonalData = data.seasonal
            let lastSeason = seasonalData[seasonalData.length - 1]
            return {
                peak: {
                    season: data.peak.season.short,
                    id: data.peak.tier.id,
                    name: data.peak.tier.name,
                },
                current_rank: {
                    id: data.current.tier.id,
                    name: data.current.tier.name,
                },
                current_rr: data.current.rr,
                lastSeason: {
                    wins: lastSeason.wins,
                    games: lastSeason.games,
                    winrate: ( lastSeason.wins / lastSeason.games ) * 100,
                }
            }
        })
        .catch(function (error) {
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Status code:", error.response.status);
            } else if (error.request) {
                console.error("No response received");
            } else {
                console.error("Error setting up the request:", error.message);
            }
        });
}