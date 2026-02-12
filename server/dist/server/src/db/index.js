"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(process.cwd(), 'db.json');
const defaultData = { users: [], progress: [] };
class SimpleDb {
    _data = null;
    async read() {
        if (this._data)
            return this._data;
        if (!fs_1.default.existsSync(DB_PATH)) {
            this._data = defaultData;
            await this.write();
            return this._data;
        }
        const content = fs_1.default.readFileSync(DB_PATH, 'utf-8');
        this._data = JSON.parse(content);
        return this._data;
    }
    async write() {
        if (!this._data)
            return;
        fs_1.default.writeFileSync(DB_PATH, JSON.stringify(this._data, null, 2), 'utf-8');
    }
    get data() {
        if (!this._data)
            throw new Error('Database not initialized. Call read() first.');
        return this._data;
    }
}
const db = new SimpleDb();
const getDb = async () => {
    await db.read();
    return db;
};
exports.getDb = getDb;
