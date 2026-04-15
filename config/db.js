// config/db.js
//
// Classe Database per la connessione SQLite.
// Fase 13 — Modifiche deploy:
//  • mkdirSync della directory genitore (necessario per disk persistente /data)
//  • Seed iniziale applicato anche in production se la tabella users è vuota
//    (first boot su fresh disk). Seed idempotente grazie ai DELETE FROM in testa.

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

export class Database {
    constructor() {
        this.db = null;
        this.dbPath = process.env.DB_PATH || './database/synesthesia.sqlite';
        this.schemaPath = './database/schema.sql';
        this.seedPath = './database/seeds.sql';

        // Assicura che la directory contenitore esista.
        const parent = path.dirname(this.dbPath);
        if (parent && !fsSync.existsSync(parent)) {
            fsSync.mkdirSync(parent, { recursive: true });
        }
    }

    async connect() {
        if (this.db) return this.db;

        try {
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.Database,
            });
            await this.db.run('PRAGMA foreign_keys = ON;');

            await this.applySchema();

            // First-boot seed: applica il seed se la tabella users è vuota,
            // in qualunque ambiente. In dev il seed viene riapplicato dopo un rm.
            const userCount = await this.db.get('SELECT COUNT(*) as count FROM users');
            if (userCount && userCount.count === 0) {
                console.log('Database is empty, applying seed data...');
                await this.seed();
                console.log('Seed data applied.');
            }

            console.log('SQLite database connected.');
            return this.db;
        } catch (error) {
            console.error('Error connecting to SQLite database:', error);
            throw error;
        }
    }

    async applySchema() {
        try {
            const schemaSql = await fs.readFile(this.schemaPath, 'utf8');
            await this.db.exec(schemaSql);
            console.log('Database schema applied.');
        } catch (error) {
            console.error('Error applying database schema:', error);
            throw error;
        }
    }

    async seed() {
        try {
            const seedSql = await fs.readFile(this.seedPath, 'utf8');
            await this.db.exec(seedSql);
            console.log('Seed data applied successfully.');
        } catch (error) {
            console.error('Error applying seed data:', error);
            throw error;
        }
    }

    async run(sql, params = []) {
        return this.db.run(sql, params);
    }

    async get(sql, params = []) {
        return this.db.get(sql, params);
    }

    async all(sql, params = []) {
        return this.db.all(sql, params);
    }
}
