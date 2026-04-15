// routes/creator.routes.js
import express from 'express';
import { isAuthenticated, isCreator } from '../middlewares/auth.middleware.js';

const router = express.Router();

export default (creatorController) => {
    // Tutte le rotte creator devono essere protette da isAuthenticated e isCreator
    router.use(isAuthenticated, isCreator);

    router.get('/dashboard', creatorController.renderCreatorDashboard.bind(creatorController));
    // Aggiungi qui altre rotte specifiche per i Creator (es. /creator/upload, /creator/archive)
    // router.get('/upload', creatorController.renderUploadPage.bind(creatorController));
    // router.post('/upload', upload.single('mediaFile'), creatorController.handleUpload.bind(creatorController));

    return router;
};