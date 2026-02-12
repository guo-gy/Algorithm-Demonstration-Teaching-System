"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const auth_1 = require("../utils/auth");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    req.userId = decoded.userId;
    next();
};
exports.authMiddleware = authMiddleware;
