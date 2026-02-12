"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const db_1 = require("../db");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }
        const db = await (0, db_1.getDb)();
        const existingUser = db.data.users.find(u => u.username === username);
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const newUser = {
            id: (0, uuid_1.v4)(),
            username,
            passwordHash,
            createdAt: Date.now(),
        };
        db.data.users.push(newUser);
        await db.write();
        const token = (0, auth_1.generateToken)(newUser.id);
        res.status(201).json({ token, user: { id: newUser.id, username: newUser.username } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = await (0, db_1.getDb)();
        const user = db.data.users.find(u => u.username === username);
        if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        const token = (0, auth_1.generateToken)(user.id);
        res.json({ token, user: { id: user.id, username: user.username } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
