// routes/admin.routes.js
import express from 'express';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

export default (adminController) => {
    // Tutte le rotte admin devono essere protette da isAuthenticated e isAdmin
    router.use(isAuthenticated, isAdmin);

    router.get('/', adminController.renderAdminDashboard.bind(adminController));
    router.post('/entries/:id/moderate', adminController.moderateEntry.bind(adminController));
    router.post('/challenges', adminController.createChallenge.bind(adminController));
    router.post('/challenges/:id', adminController.updateChallenge.bind(adminController)); // Usa POST per simulare PATCH con form HTML
    router.post('/challenges/:id/toggle-status', adminController.toggleChallengeStatus.bind(adminController));

    return router;
};