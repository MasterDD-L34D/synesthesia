// routes/api.routes.js
import express from 'express';
import { isAuthenticated, isCreator } from '../middlewares/auth.middleware.js';
import { uploadSingleEntry } from '../middlewares/upload.middleware.js';

const router = express.Router();

export default (entryApiController, searchController, zenService, profileService, notificationService) => {
    // --- Entry API (Likes & Comments) ---
    router.post('/entries/:id/like', isAuthenticated, entryApiController.likeEntry.bind(entryApiController));
    router.post('/entries/:id/comments', isAuthenticated, entryApiController.addComment.bind(entryApiController));
    router.post('/entries/:id/save', isAuthenticated, entryApiController.toggleSave.bind(entryApiController));
    // Fase 5 — Upload opera (solo creator/admin, form multipart)
    router.post(
        '/entries',
        isAuthenticated,
        isCreator,
        uploadSingleEntry,
        entryApiController.createEntry.bind(entryApiController)
    );
    // Aggiungi qui le API per modificare/eliminare commenti/like se implementate

    // --- Search API ---
    router.get('/search', searchController.searchEntries.bind(searchController));
    router.get('/search/affinity', isAuthenticated, searchController.searchAffinity.bind(searchController));

    // --- User Profile API (placeholder for future implementation) ---
    router.get('/me', isAuthenticated, (req, res) => res.json({ success: true, data: req.user }));
    router.get('/profile', isAuthenticated, async (req, res, next) => {
        try {
            const userProfile = await profileService.getProfileByUserId(req.user.id);
            res.json({ success: true, data: { user: req.user, profile: userProfile } });
        } catch (error) {
            next(error);
        }
    });
    // PATCH /api/profile
    // POST /api/profile/onboarding
    // POST /api/profile/recalculate

    // --- Challenge API (Public access, admin handles CRUD in /admin) ---
    // router.get('/challenges', challengeService.getPublicChallenges.bind(challengeService));
    // router.get('/challenges/:id', challengeService.getChallengeDetail.bind(challengeService));

    // --- Task API ---
    router.get('/tasks', isAuthenticated, async (req, res, next) => {
        try {
            const tasks = await zenService.getRecommendedTasks(req.user.id);
            res.json({ success: true, data: tasks });
        } catch (error) {
            next(error);
        }
    });

    // --- Notifications API (Batch D 4.3) ---
    router.get('/notifications', isAuthenticated, async (req, res, next) => {
        try {
            const notifications = await notificationService.getRecent(req.user.id, 20);
            const unread = await notificationService.getUnreadCount(req.user.id);
            res.json({ success: true, data: notifications, unread });
        } catch (error) { next(error); }
    });

    router.post('/notifications/read-all', isAuthenticated, async (req, res, next) => {
        try {
            const changed = await notificationService.markAllRead(req.user.id);
            res.json({ success: true, marked: changed });
        } catch (error) { next(error); }
    });

    return router;
};