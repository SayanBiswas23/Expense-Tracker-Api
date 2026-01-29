import pg from 'pg';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'node:url';

//config
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
};
export const pool = new pg.Pool(clientOptions);

export const initDB = async () => {
    try {
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');

        await pool.query(schema);
        console.log(' 🟢 🟢 🟢 database initialized successfully');
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

export default pool;
// const pool = new Pool(clientOptions);

// pool.on("connect", () => {
//     console.log("connected to database");
// });

// pool.on("error", () => {
//     console.log("error connecting to database");
// });
// //db connect
