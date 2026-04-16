// controllers/entry.controller.js
import EntryService from '../services/entry.service.js';
import ProfileService from '../services/profile.service.js'; // Per l'aggiornamento dinamico del profilo
import { mapMediaType } from '../config/multer.js';

class EntryApiController {
    constructor(entryService, profileService, notificationService) {
        this.entryService = entryService;
        this.profileService = profileService;
        this.notificationService = notificationService;
    }

    // Fase 5 — POST /api/entries (multipart). Multer middleware ha già
    // popolato req.file con path relativo al disco.
    async createEntry(req, res, next) {
        try {
            const { title, description, challengeId } = req.body;
            if (!title || !description) {
                req.flash('error_msg', 'Titolo e descrizione obbligatori.');
                return res.redirect('/upload');
            }

            const mediaType = mapMediaType(req.file.mimetype);
            if (!mediaType) {
                req.flash('error_msg', 'Tipo di media non riconosciuto.');
                return res.redirect('/upload');
            }

            // Path servito pubblicamente (relativo a /public/uploads/...).
            const publicPath =
                '/uploads/' +
                req.file.destination.split(/[\\/]uploads[\\/]/)[1].replace(/\\/g, '/') +
                '/' +
                req.file.filename;

            const entryId = await this.entryService.createEntry({
                userId: req.user.id,
                title: title.trim(),
                description: description.trim(),
                mediaType,
                challengeId: challengeId ? parseInt(challengeId, 10) : null,
                filePath: publicPath,
                mimeType: req.file.mimetype,
                fileSize: req.file.size,
            });

            req.flash(
                'success_msg',
                `Opera "${title}" caricata (ID ${entryId}). In attesa di moderazione.`
            );
            res.redirect(`/profile/${req.user.username}`);
        } catch (error) {
            console.error('Error creating entry:', error);
            req.flash('error_msg', 'Errore durante il caricamento.');
            res.redirect('/upload');
        }
    }

    async likeEntry(req, res, next) {
        const { id } = req.params;
        const userId = req.user.id;

        try {
            const entry = await this.entryService.getEntryById(parseInt(id, 10));
            if (!entry) {
                return res.status(404).json({ success: false, error: 'Opera non trovata.' });
            }

            const isLiked = await this.entryService.isEntryLikedByUser(parseInt(id, 10), userId);
            let actionMessage;

            if (isLiked) {
                await this.entryService.removeLike(parseInt(id, 10), userId);
                actionMessage = 'Like rimosso.';
            } else {
                await this.entryService.addLike(parseInt(id, 10), userId);
                actionMessage = 'Like aggiunto.';

                // Log interaction
                await this.entryService.db.run(
                    `INSERT INTO interactions (user_id, entry_id, interaction_type) VALUES (?, ?, 'like')`,
                    [userId, parseInt(id, 10)]
                );

                // Fase 7 — scoring + promo (service guardano input nulli)
                const authorProfile = await this.profileService.getProfileByUserId(entry.user_id);
                await this.profileService.updateProfileScores(
                    userId,
                    authorProfile ? authorProfile.dominant_type : null,
                    'like'
                );
            }
            
            const newLikesCount = await this.entryService.getLikesCount(parseInt(id, 10));
            res.json({ success: true, message: actionMessage, likesCount: newLikesCount, liked: !isLiked });

        } catch (error) {
            console.error('Error toggling like:', error);
            next(error);
        }
    }

    // Fase 6 — toggle save/bookmark
    async toggleSave(req, res, next) {
        const id = parseInt(req.params.id, 10);
        const userId = req.user.id;
        try {
            const entry = await this.entryService.getEntryById(id);
            if (!entry) {
                return res.status(404).json({ success: false, error: 'Opera non trovata.' });
            }
            const already = await this.entryService.isEntrySavedByUser(id, userId);
            if (already) {
                await this.entryService.removeSave(id, userId);
            } else {
                await this.entryService.addSave(id, userId);
                await this.entryService.db.run(
                    `INSERT INTO interactions (user_id, entry_id, interaction_type) VALUES (?, ?, 'save')`,
                    [userId, id]
                );
                // Fase 7 — scoring + promo
                const authorProfile = await this.profileService.getProfileByUserId(entry.user_id);
                await this.profileService.updateProfileScores(
                    userId,
                    authorProfile ? authorProfile.dominant_type : null,
                    'save'
                );
            }
            const count = await this.entryService.getSavesCount(id);
            res.json({
                success: true,
                saved: !already,
                savesCount: count,
                message: already ? 'Rimosso dai salvati.' : 'Salvato.',
            });
        } catch (error) {
            console.error('Error toggling save:', error);
            next(error);
        }
    }

    async addComment(req, res, next) {
        const { id } = req.params;
        const { content, parentCommentId } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Il contenuto del commento non può essere vuoto.' });
        }

        try {
            const entry = await this.entryService.getEntryById(parseInt(id, 10));
            if (!entry) {
                return res.status(404).json({ success: false, error: 'Opera non trovata.' });
            }

            const commentId = await this.entryService.addComment(parseInt(id, 10), userId, content, parentCommentId ? parseInt(parentCommentId, 10) : null);

            // Log interaction
            await this.entryService.db.run(
                `INSERT INTO interactions (user_id, entry_id, interaction_type, interaction_value) VALUES (?, ?, 'comment', ?)`,
                [userId, parseInt(id, 10), String(commentId)]
            );

            // Fase 7 — scoring + promo
            const authorProfile = await this.profileService.getProfileByUserId(entry.user_id);
            await this.profileService.updateProfileScores(
                userId,
                authorProfile ? authorProfile.dominant_type : null,
                'comment'
            );

            // Recupera il commento completo per la risposta, incluso username autore
            const newComment = await this.entryService.getCommentById(commentId);

            // Batch D 4.3 — Notifica autore opera + autore commento parent
            if (this.notificationService) {
                // Notifica all'autore dell'opera (se non è chi commenta)
                if (entry.user_id !== userId) {
                    await this.notificationService.create({
                        userId: entry.user_id,
                        actorId: userId,
                        type: 'comment_on_entry',
                        entryId: parseInt(id, 10),
                        commentId,
                        message: `${req.user.username} ha commentato la tua opera "${entry.title}"`,
                    }).catch((e) => console.error('notif fail:', e));
                }
                // Notifica all'autore del commento parent (se reply)
                if (parentCommentId) {
                    const parentComment = await this.entryService.getCommentById(parseInt(parentCommentId, 10));
                    if (parentComment) {
                        const parentUserId = await this.entryService.db.get(
                            `SELECT user_id FROM comments WHERE id = ?`,
                            [parseInt(parentCommentId, 10)]
                        );
                        if (parentUserId && parentUserId.user_id !== userId) {
                            await this.notificationService.create({
                                userId: parentUserId.user_id,
                                actorId: userId,
                                type: 'comment_reply',
                                entryId: parseInt(id, 10),
                                commentId,
                                message: `${req.user.username} ha risposto al tuo commento su "${entry.title}"`,
                            }).catch((e) => console.error('notif fail:', e));
                        }
                    }
                }
            }

            res.status(201).json({ success: true, message: 'Commento aggiunto con successo.', comment: newComment });
        } catch (error) {
            console.error('Error adding comment:', error);
            next(error);
        }
    }

    // Aggiungi altri metodi API per entry (es. update, delete, get comments)
}

export default EntryApiController;