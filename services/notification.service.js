// services/notification.service.js
//
// Batch D 4.3 — Servizio notifiche.
// Crea, legge e marca come lette le notifiche utente.

class NotificationService {
    constructor(dbInstance) {
        this.db = dbInstance;
    }

    // Crea una notifica per un utente.
    async create({ userId, actorId, type, entryId = null, commentId = null, message }) {
        // Non notificare se l'utente notifica sé stesso.
        if (userId === actorId) return null;

        const result = await this.db.run(
            `INSERT INTO notifications (user_id, actor_id, type, entry_id, comment_id, message)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, actorId, type, entryId, commentId, message]
        );
        return result.lastID;
    }

    // Conta le notifiche non lette di un utente.
    async getUnreadCount(userId) {
        const row = await this.db.get(
            `SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0`,
            [userId]
        );
        return row ? row.c : 0;
    }

    // Recupera le ultime N notifiche (lette e non) ordinate per data desc.
    async getRecent(userId, limit = 20) {
        return this.db.all(
            `SELECT n.*, u.username AS actor_username
             FROM notifications n
             JOIN users u ON u.id = n.actor_id
             WHERE n.user_id = ?
             ORDER BY n.created_at DESC
             LIMIT ?`,
            [userId, limit]
        );
    }

    // Marca tutte come lette.
    async markAllRead(userId) {
        const result = await this.db.run(
            `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
            [userId]
        );
        return result.changes;
    }

    // Marca una singola come letta.
    async markRead(notificationId, userId) {
        const result = await this.db.run(
            `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
            [notificationId, userId]
        );
        return result.changes > 0;
    }
}

export default NotificationService;
