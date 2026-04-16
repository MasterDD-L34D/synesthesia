// config/multer.js
//
// Fase 5 — Multer storage configurato per:
//  • immagini  → public/uploads/images/
//  • audio     → public/uploads/audio/
//  • testo     → public/uploads/text/
// Nome file: <timestamp>-<random>-<origName>, estensione preservata.
// Limite 10MB per immagini/testo, 20MB per audio.

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const IMAGE_MIME = /^image\/(jpeg|png|gif|webp)$/;
const AUDIO_MIME = /^audio\/(mpeg|mp3|wav|x-wav|ogg)$/;
const TEXT_MIME = /^text\/plain$/;

function pickSubdir(mimetype) {
    if (IMAGE_MIME.test(mimetype)) return 'images';
    if (AUDIO_MIME.test(mimetype)) return 'audio';
    if (TEXT_MIME.test(mimetype)) return 'text';
    return null;
}

function mapMediaType(mimetype) {
    if (IMAGE_MIME.test(mimetype)) return 'image';
    if (AUDIO_MIME.test(mimetype)) return 'audio';
    if (TEXT_MIME.test(mimetype)) return 'text';
    return null;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const sub = pickSubdir(file.mimetype);
        if (!sub) return cb(new Error('MIME non supportato: ' + file.mimetype));
        const dest = path.join(ROOT, 'public', 'uploads', sub);
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ts = Date.now();
        const rnd = crypto.randomBytes(4).toString('hex');
        const safeBase = file.originalname
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 60);
        cb(null, `${ts}-${rnd}-${safeBase}`);
    },
});

function fileFilter(req, file, cb) {
    const ok =
        IMAGE_MIME.test(file.mimetype) ||
        AUDIO_MIME.test(file.mimetype) ||
        TEXT_MIME.test(file.mimetype);
    if (!ok) {
        return cb(new Error('Tipo file non consentito: ' + file.mimetype));
    }
    cb(null, true);
}

// Limite dinamico: 20MB per audio, 10MB per immagini/testo.
// Multer non supporta limiti per-type; impostiamo 20MB come tetto globale
// e verifichiamo il limite inferiore nel controller se serve.
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 },
});

// Avatar upload: destinazione fissa public/uploads/avatars/, max 2MB, solo immagini.
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(ROOT, 'public', 'uploads', 'avatars');
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ts = Date.now();
        const rnd = crypto.randomBytes(4).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `avatar-${ts}-${rnd}${ext}`);
    },
});

function avatarFilter(req, file, cb) {
    if (!IMAGE_MIME.test(file.mimetype)) {
        return cb(new Error('Solo immagini (JPG, PNG, GIF, WebP) per l\'avatar.'));
    }
    cb(null, true);
}

const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: avatarFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});

export { upload, avatarUpload, mapMediaType };
export default upload;
