// middlewares/upload.middleware.js
//
// Wrapper attorno a multer.single('mediaFile') che trasforma gli errori
// Multer in flash + redirect al form invece di 500.

import { upload } from '../config/multer.js';

export const uploadSingleEntry = (req, res, next) => {
    const handler = upload.single('mediaFile');
    handler(req, res, (err) => {
        if (err) {
            const msg = err.code === 'LIMIT_FILE_SIZE'
                ? 'File troppo grande. Limite: 20MB.'
                : (err.message || 'Errore nel caricamento del file.');
            req.flash('error_msg', msg);
            return res.redirect('/upload');
        }
        if (!req.file) {
            req.flash('error_msg', 'Devi caricare un file.');
            return res.redirect('/upload');
        }
        next();
    });
};
