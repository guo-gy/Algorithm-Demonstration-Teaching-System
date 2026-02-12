import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.sqlite');
const db = new Database(DB_PATH);

// Initialize database schema
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        passwordHash TEXT,
        createdAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS progress (
        userId TEXT,
        algorithmId TEXT,
        completed INTEGER,
        score INTEGER,
        lastVisit INTEGER,
        PRIMARY KEY (userId, algorithmId),
        FOREIGN KEY (userId) REFERENCES users(id)
    );
`);

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

export const getDb = () => db;

export default db;
