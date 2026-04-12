import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ALGORITHMS } from '../routes/algorithms';
import { User, execute, initDb, queryOne } from '../db';

dotenv.config();

interface InitOptions {
    reset: boolean;
    seedProgress: boolean;
    username: string;
    password: string;
}

function parseArgs(argv: string[]): InitOptions {
    const options: InitOptions = {
        reset: false,
        seedProgress: true,
        username: process.env.INIT_ADMIN_USERNAME || 'admin',
        password: process.env.INIT_ADMIN_PASSWORD || 'admin123456',
    };

    for (const arg of argv) {
        if (arg === '--reset') {
            options.reset = true;
            continue;
        }

        if (arg === '--skip-progress') {
            options.seedProgress = false;
            continue;
        }

        if (arg.startsWith('--username=')) {
            options.username = arg.slice('--username='.length);
            continue;
        }

        if (arg.startsWith('--password=')) {
            options.password = arg.slice('--password='.length);
            continue;
        }
    }

    return options;
}

async function resetTables() {
    await execute('SET FOREIGN_KEY_CHECKS = 0');
    await execute('TRUNCATE TABLE progress');
    await execute('TRUNCATE TABLE users');
    await execute('SET FOREIGN_KEY_CHECKS = 1');
}

async function ensureUser(username: string, password: string): Promise<User> {
    const existingUser = await queryOne<User>('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    if (existingUser) return existingUser;

    const newUser: User = {
        id: uuidv4(),
        username,
        passwordHash: await bcrypt.hash(password, 10),
        createdAt: Date.now(),
    };

    await execute(
        'INSERT INTO users (id, username, passwordHash, createdAt) VALUES (?, ?, ?, ?)',
        [newUser.id, newUser.username, newUser.passwordHash, newUser.createdAt]
    );

    return newUser;
}

async function seedProgress(userId: string) {
    const now = Date.now();

    for (const algorithm of ALGORITHMS) {
        await execute(
            `INSERT INTO progress (userId, algorithmId, completed, score, lastVisit)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                completed = VALUES(completed),
                score = VALUES(score),
                lastVisit = VALUES(lastVisit)`,
            [userId, algorithm.id, 0, 0, now]
        );
    }
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    await initDb();

    if (options.reset) {
        await resetTables();
        console.log('Database tables reset completed.');
    }

    const user = await ensureUser(options.username, options.password);
    console.log(`Admin user ready: ${user.username}`);

    if (options.seedProgress) {
        await seedProgress(user.id);
        console.log('Initial progress data seeded.');
    } else {
        console.log('Skipped initial progress seeding.');
    }
}

main().catch((error) => {
    console.error('Failed to init data:', error);
    process.exit(1);
});
