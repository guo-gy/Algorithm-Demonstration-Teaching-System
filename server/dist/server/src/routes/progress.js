"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, async (req, res) => {
    const db = await (0, db_1.getDb)();
    const userProgress = db.data.progress.filter(p => p.userId === req.userId);
    res.json(userProgress);
});
router.post('/:algorithmId', auth_1.authMiddleware, async (req, res) => {
    const algorithmId = req.params.algorithmId;
    const { completed, score } = req.body;
    const db = await (0, db_1.getDb)();
    const userId = req.userId;
    let progress = db.data.progress.find(p => p.userId === userId && p.algorithmId === algorithmId);
    if (progress) {
        progress.completed = completed;
        progress.score = score;
        progress.lastVisit = Date.now();
    }
    else {
        const newProgress = {
            userId,
            algorithmId,
            completed,
            score,
            lastVisit: Date.now()
        };
        db.data.progress.push(newProgress);
        progress = newProgress;
    }
    await db.write();
    res.json(progress);
});
exports.default = router;
