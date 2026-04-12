import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, execute, queryOne } from '../db';
import { generateToken } from '../utils/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }

        const existingUser = await queryOne<User>('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser: User = {
            id: uuidv4(),
            username,
            passwordHash,
            createdAt: Date.now(),
        };

        await execute('INSERT INTO users (id, username, passwordHash, createdAt) VALUES (?, ?, ?, ?)', [
            newUser.id,
            newUser.username,
            newUser.passwordHash,
            newUser.createdAt
        ]);

        const token = generateToken(newUser.id);
        res.status(201).json({ token, user: { id: newUser.id, username: newUser.username } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        const user = await queryOne<User>('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
