// public/js/notifications.js
//
// Batch D 4.3 — Modulo notifiche per navbar dropdown.
// Fetch /api/notifications al click della campana → render lista.
// "Segna tutte lette" → POST /api/notifications/read-all → update badge.

class NotificationPanel {
    constructor() {
        this.bell = document.getElementById('notifBell');
        this.panel = document.getElementById('notifPanel');
        this.list = document.getElementById('notifList');
        this.markAllBtn = document.getElementById('markAllRead');
        this.badge = this.bell ? this.bell.querySelector('.notif-badge') : null;

        if (!this.bell || !this.panel) return;

        this.loaded = false;

        // Fetch al primo open del dropdown
        this.bell.addEventListener('click', () => {
            if (!this.loaded) this.fetchNotifications();
        });

        // Mark all read
        if (this.markAllBtn) {
            this.markAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.markAllRead();
            });
        }
    }

    async fetchNotifications() {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (!data.success) return;
            this.loaded = true;
            this.render(data.data);
        } catch (err) {
            this.list.innerHTML = '<p class="dropdown-item text-danger small">Errore caricamento</p>';
        }
    }

    render(notifications) {
        if (!notifications || notifications.length === 0) {
            this.list.innerHTML = '<p class="dropdown-item text-muted small">Nessuna notifica</p>';
            return;
        }

        this.list.innerHTML = notifications.map((n) => {
            const unreadClass = n.is_read ? '' : 'notif-unread';
            const icon = n.type === 'comment_reply' ? 'bi-reply-fill'
                : n.type === 'comment_on_entry' ? 'bi-chat-dots-fill'
                : n.type === 'like' ? 'bi-heart-fill'
                : 'bi-bell-fill';
            const link = n.entry_id ? `/entries/${n.entry_id}` : '#';
            const ago = this.timeAgo(n.created_at);

            return `<a href="${link}" class="dropdown-item notif-item ${unreadClass}">
                <div class="d-flex align-items-start gap-2">
                    <i class="bi ${icon} notif-icon mt-1"></i>
                    <div class="flex-grow-1">
                        <p class="mb-0 small">${this.escapeHtml(n.message)}</p>
                        <small class="text-muted">${ago}</small>
                    </div>
                </div>
            </a>`;
        }).join('');
    }

    async markAllRead() {
        try {
            const res = await fetch('/api/notifications/read-all', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                // Remove badge
                if (this.badge) this.badge.remove();
                // Update bell icon
                const icon = this.bell.querySelector('i');
                if (icon) {
                    icon.classList.remove('bi-bell-fill');
                    icon.classList.add('bi-bell');
                }
                // Remove unread styling
                this.list.querySelectorAll('.notif-unread').forEach((el) => {
                    el.classList.remove('notif-unread');
                });
            }
        } catch (err) {
            console.error('markAllRead fail:', err);
        }
    }

    timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'adesso';
        if (mins < 60) return `${mins}m fa`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h fa`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}g fa`;
        return new Date(dateStr).toLocaleDateString();
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NotificationPanel();
});
