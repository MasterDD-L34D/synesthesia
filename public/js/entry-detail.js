// public/js/entry-detail.js
//
// Fase 6 — Modulo ES6 per le interazioni sulla pagina di dettaglio opera:
// toggle like, toggle save (bookmark), invio commento, invio risposta.
// Nessun JavaScript inline nella vista: questo file sostituisce l'ex <script> in entry-detail.ejs.

class EntryDetailInteractions {
    constructor(rootEl) {
        this.root = rootEl;
        this.entryId = rootEl.dataset.entryId;
        if (!this.entryId) return;

        this.likeButton = document.getElementById('likeButton');
        this.likesCountText = document.getElementById('likesCountText');
        this.saveButton = document.getElementById('saveButton');
        this.savesCountText = document.getElementById('savesCountText');
        this.commentForm = document.getElementById('commentForm');
        this.commentsList = document.getElementById('commentsList');

        this.bindLike();
        this.bindSave();
        this.bindComment();
        this.bindReplies();
    }

    async postJson(url, body = {}) {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    }

    bindLike() {
        if (!this.likeButton) return;
        this.likeButton.addEventListener('click', async () => {
            try {
                const data = await this.postJson(`/api/entries/${this.entryId}/like`);
                if (!data.success) {
                    console.warn('like fail:', data.error);
                    return;
                }
                this.likesCountText.textContent = data.likesCount;
                const icon = this.likeButton.querySelector('i');
                if (data.liked) {
                    this.likeButton.classList.remove('btn-outline-danger');
                    this.likeButton.classList.add('btn-danger');
                    icon.classList.remove('bi-heart');
                    icon.classList.add('bi-heart-fill');
                } else {
                    this.likeButton.classList.remove('btn-danger');
                    this.likeButton.classList.add('btn-outline-danger');
                    icon.classList.remove('bi-heart-fill');
                    icon.classList.add('bi-heart');
                }
            } catch (err) {
                console.error('like error:', err);
            }
        });
    }

    bindSave() {
        if (!this.saveButton) return;
        this.saveButton.addEventListener('click', async () => {
            try {
                const data = await this.postJson(`/api/entries/${this.entryId}/save`);
                if (!data.success) {
                    console.warn('save fail:', data.error);
                    return;
                }
                if (this.savesCountText) {
                    this.savesCountText.textContent = data.savesCount;
                }
                const icon = this.saveButton.querySelector('i');
                if (data.saved) {
                    this.saveButton.classList.remove('btn-outline-secondary');
                    this.saveButton.classList.add('btn-secondary');
                    icon.classList.remove('bi-bookmark');
                    icon.classList.add('bi-bookmark-fill');
                } else {
                    this.saveButton.classList.remove('btn-secondary');
                    this.saveButton.classList.add('btn-outline-secondary');
                    icon.classList.remove('bi-bookmark-fill');
                    icon.classList.add('bi-bookmark');
                }
            } catch (err) {
                console.error('save error:', err);
            }
        });
    }

    bindComment() {
        if (!this.commentForm) return;
        this.commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const textarea = document.getElementById('commentContent');
            const content = textarea.value.trim();
            if (!content) return;
            try {
                const data = await this.postJson(`/api/entries/${this.entryId}/comments`, { content });
                if (data.success) {
                    window.location.reload();
                } else {
                    console.warn('comment fail:', data.error);
                }
            } catch (err) {
                console.error('comment error:', err);
            }
        });
    }

    bindReplies() {
        if (!this.commentsList) return;
        this.commentsList.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('reply-button')) {
                const commentId = target.dataset.commentId;
                const replyFormContainer = document.getElementById(`replyForm-${commentId}`);
                if (replyFormContainer) {
                    replyFormContainer.classList.remove('d-none');
                    replyFormContainer.querySelector('textarea').focus();
                }
            } else if (target.classList.contains('cancel-reply-button')) {
                const replyFormContainer = target.closest('[id^="replyForm-"]');
                if (replyFormContainer) {
                    replyFormContainer.classList.add('d-none');
                    replyFormContainer.querySelector('form').reset();
                }
            }
        });

        this.commentsList.addEventListener('submit', async (e) => {
            if (!e.target.classList.contains('reply-form')) return;
            e.preventDefault();
            const parentCommentId = e.target.dataset.parentId;
            const content = e.target.querySelector('textarea').value.trim();
            if (!content) return;
            try {
                const data = await this.postJson(`/api/entries/${this.entryId}/comments`, {
                    content,
                    parentCommentId,
                });
                if (data.success) {
                    window.location.reload();
                } else {
                    console.warn('reply fail:', data.error);
                }
            } catch (err) {
                console.error('reply error:', err);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-entry-id]');
    if (root) new EntryDetailInteractions(root);
});
