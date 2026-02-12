import { Router, Response } from 'express';
import db from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { UserProgress } from '@shared/types';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const userProgress = db.prepare('SELECT * FROM progress WHERE userId = ?').all(userId) as any[];

        // Convert integer 0/1 to boolean for completed
        const formattedProgress = userProgress.map(p => ({
            ...p,
            completed: !!p.completed
        }));

        res.json(formattedProgress);
    } catch (error) {
        console.error('Fetch progress error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:algorithmId', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const algorithmId = req.params.algorithmId as string;
        const { completed, score } = req.body;
        const userId = req.userId as string;
        const lastVisit = Date.now();

        const progress = db.prepare('SELECT * FROM progress WHERE userId = ? AND algorithmId = ?').get(userId, algorithmId) as any;

        if (progress) {
            db.prepare('UPDATE progress SET completed = ?, score = ?, lastVisit = ? WHERE userId = ? AND algorithmId = ?').run(
                completed ? 1 : 0,
                score,
                lastVisit,
                userId,
                algorithmId
            );
        } else {
            db.prepare('INSERT INTO progress (userId, algorithmId, completed, score, lastVisit) VALUES (?, ?, ?, ?, ?)').run(
                userId,
                algorithmId,
                completed ? 1 : 0,
                score,
                lastVisit
            );
        }

        const updatedProgress = {
            userId,
            algorithmId,
            completed,
            score,
            lastVisit
        };

        res.json(updatedProgress);
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
