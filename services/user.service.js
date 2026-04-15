// services/user.service.js
import { Database } from '../config/db.js';

class UserService {
    constructor(dbInstance) {
        this.db = dbInstance;
    }

    async createUser(username, email, passwordHash, role = 'registered', isCreatorUnlocked = 0) {
        const result = await this.db.run(
            `INSERT INTO users (username, email, password_hash, role, is_creator_unlocked, created_at, updated_at) VALUES (?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))`,
            [username, email, passwordHash, role, isCreatorUnlocked]
        );
        return { id: result.lastID, username, email, role };
    }

    async findByUsername(username) {
        return this.db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    }

    async findByEmail(email) {
        return this.db.get(`SELECT * FROM users WHERE email = ?`, [email]);
    }

    async findByUsernameOrEmail(username, email) {
        return this.db.get(`SELECT * FROM users WHERE username = ? OR email = ?`, [username, email]);
    }

    async findById(id) {
        return this.db.get(`SELECT * FROM users WHERE id = ?`, [id]);
    }

    async getAllUsers() {
        return this.db.all(`SELECT id, username, email, role, is_creator_unlocked, created_at FROM users ORDER BY username ASC`);
    }

    // Aggiungi qui altri metodi per la gestione utenti (es. update, delete)
}

export default UserService;