import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./src/utils/database/userData.db')

db.run(`CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    puuid TEXT,
    username TEXT,
    tag TEXT,
    region TEXT,
    account_level INTEGER,
    large_card TEXT
)`)

export async function writeUserData(discord_id, data) {
    const query = `INSERT OR REPLACE INTO users (discord_id, puuid, username, tag, region, account_level, large_card) VALUES (?, ?, ?, ?, ?, ?, ?)`

    db.run(query, [discord_id, data.puuid, data.name, data.tag, data.region, data.account_level, data.card.large], (err) => {
        if (err) {
            return console.error('Error storing data:', err.message);
        }
        //console.log(`User data stored for Discord ID: ${discord_id}`);
    })
}

export async function checkUser(discord_id) {
    const query = `SELECT * FROM users WHERE discord_id = ?`;

    return new Promise((resolve, reject) => {
        db.get(query, [discord_id], (err, row) => {
            if (err) {
                console.error('Database query error:', err.message);  // Log actual error
                return reject(err);  // Reject on error
            }

            if (row) {
                //console.log('User exists');  // Log if a row was found
                resolve(row);  // Resolve with user data if found
            } else {
                //console.log('User does not exist');  // Log if no row was found
                resolve(null);  // Resolve with null if no user is found
            }
        });
    });
}

export async function getUserData(discord_id) {
    return new Promise((resolve, reject) => {
        checkUser(discord_id).then((row) => {
            if (row) {
                resolve(row);
            } else {
                return
                reject('User not found');
            }
        }).catch((err) => {
            reject(err);
        });
    });
}