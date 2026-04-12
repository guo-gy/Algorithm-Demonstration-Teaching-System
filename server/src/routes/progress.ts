import { Router, Response } from 'express';
import { execute, queryAll } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const userProgress = await queryAll<any>('SELECT * FROM progress WHERE userId = ?', [userId]);

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

        await execute(
            `INSERT INTO progress (userId, algorithmId, completed, score, lastVisit)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                completed = VALUES(completed),
                score = VALUES(score),
                lastVisit = VALUES(lastVisit)`,
            [
                userId,
                algorithmId,
                completed ? 1 : 0,
                score ?? 0,
                lastVisit,
            ]
        );

        const updatedProgress = {
            userId,
            algorithmId,
            completed: !!completed,
            score: score ?? 0,
            lastVisit
        };

        res.json(updatedProgress);
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
