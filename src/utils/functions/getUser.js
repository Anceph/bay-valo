import axios from "axios";
import { writeUserData } from "./database.js";
import 'dotenv/config'

export default async function getUser(discord_id, username, tag) {
    const url = `https://api.henrikdev.xyz/valorant/v1/account/${username}/${tag}?api_key=${process.env.API_KEY}`
    return await axios.get(url)
        .then(function (response) {
            if (response.status != 200) {
                return 0
            }
            const jsonData = response.data;
            writeUserData(discord_id, jsonData.data)
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