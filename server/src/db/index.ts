import dotenv from 'dotenv';
import mysql, { Pool } from 'mysql2/promise';

dotenv.config();

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'algorithm_demo';
const DB_CONNECTION_LIMIT = Number(process.env.DB_CONNECTION_LIMIT || 10);

if (!/^[a-zA-Z0-9_]+$/.test(DB_NAME)) {
    throw new Error('Invalid DB_NAME. Use only letters, numbers, and underscores.');
}

const bootstrapDb: Pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: DB_CONNECTION_LIMIT,
    queueLimit: 0,
    charset: 'utf8mb4',
});

let initialized = false;
let db: Pool | null = null;

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    createdAt: number;
}

export interface UserProgress {
    userId: string;
    algorithmId: string;
    completed: boolean;
    score: number;
    lastVisit: number;
}

export async function initDb(): Promise<void> {
    if (initialized) return;

    await bootstrapDb.execute(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    db = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: DB_CONNECTION_LIMIT,
        queueLimit: 0,
        charset: 'utf8mb4',
    });

    const activeDb = getDb();

    await activeDb.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            username VARCHAR(64) NOT NULL UNIQUE,
            passwordHash VARCHAR(255) NOT NULL,
            createdAt BIGINT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await activeDb.execute(`
        CREATE TABLE IF NOT EXISTS progress (
            userId VARCHAR(64) NOT NULL,
            algorithmId VARCHAR(64) NOT NULL,
            completed TINYINT(1) NOT NULL DEFAULT 0,
            score INT NOT NULL DEFAULT 0,
            lastVisit BIGINT NOT NULL,
            PRIMARY KEY (userId, algorithmId),
            CONSTRAINT fk_progress_user
                FOREIGN KEY (userId) REFERENCES users(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    initialized = true;
}

export async function queryAll<T>(sql: string, params: any[] = []): Promise<T[]> {
    const [rows] = await getDb().query(sql, params);
    return rows as T[];
}

export async function queryOne<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    const rows = await queryAll<T>(sql, params);
    return rows[0];
}

export async function execute(sql: string, params: any[] = []): Promise<void> {
    await getDb().execute(sql, params);
}

export async function closeDb(): Promise<void> {
    if (db) {
        await db.end();
        db = null;
    }

    await bootstrapDb.end();
    initialized = false;
}

export const getDb = () => {
    if (!db) {
        throw new Error('Database is not initialized. Call initDb() first.');
    }

    return db;
};
