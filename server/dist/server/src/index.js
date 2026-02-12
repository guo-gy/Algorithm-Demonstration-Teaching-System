"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const algorithms_1 = __importDefault(require("./routes/algorithms"));
const progress_1 = __importDefault(require("./routes/progress"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/algorithms', algorithms_1.default);
app.use('/api/progress', progress_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Algorithm Demonstration Teaching System API is running' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
