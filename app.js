// app.js
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import flash from 'connect-flash';
import bcrypt from 'bcrypt'; // Per l'autenticazione

// --- Import Database Configuration ---
import { Database } from './config/db.js';

// --- Import Passport Configuration ---
import setupPassport from './config/passport.js';

// --- Import Services ---
import UserService from './services/user.service.js';
import ProfileService from './services/profile.service.js';
import EntryService from './services/entry.service.js';
import ChallengeService from './services/challenge.service.js';
import ZenService from './services/zen.service.js';
import SearchService from './services/search.service.js';
import NotificationService from './services/notification.service.js';

// --- Import Controllers ---
import AuthController from './controllers/auth.controller.js';
import PageController from './controllers/page.controller.js';
import CreatorController from './controllers/creator.controller.js';
import AdminController from './controllers/admin.controller.js';
import SearchController from './controllers/search.controller.js';
import EntryApiController from './controllers/entry.controller.js'; // Per API di gestione entry (like/commenti, etc.)

// --- Import Routes ---
import authRoutes from './routes/auth.routes.js';
import pageRoutes from './routes/page.routes.js';
import apiRoutes from './routes/api.routes.js';
import creatorRoutes from './routes/creator.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Fase 13 — Dietro il reverse proxy di Render/Railway/Fly serve trust proxy
// per far funzionare secure cookies e X-Forwarded-For. Innocuo in dev.
app.set('trust proxy', 1);

// --- Configuration for ES6 Modules and __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Database Initialization ---
// Il server viene avviato dentro il then() per evitare che accetti richieste
// prima che schema e seed siano stati applicati. Vedi Fase 1 del piano.
const db = new Database();

// --- Dependency Injection for Services ---
const userService = new UserService(db);
const profileService = new ProfileService(db); // Minimal implementation for demo
const entryService = new EntryService(db);
const challengeService = new ChallengeService(db);
const zenService = new ZenService(db);
const searchService = new SearchService(db);
const notificationService = new NotificationService(db);

// --- Passport Configuration ---
setupPassport(passport, userService, profileService); // Passa passport, userService e profileService

// --- View Engine Setup ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Static Files & Uploads ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Per servire i file caricati

// --- Middleware ---
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_super_secret_session_key_fallback',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevent client-side JS from accessing the cookie
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Connect-flash middleware
app.use(flash());

// Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables for EJS views + notification badge count
app.use(async (req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    // Batch D 4.3: conteggio notifiche non lette per badge navbar
    res.locals.unreadNotifications = 0;
    if (req.user) {
        try {
            res.locals.unreadNotifications = await notificationService.getUnreadCount(req.user.id);
        } catch (e) { /* ignore */ }
    }
    next();
});

// --- Dependency Injection for Controllers ---
const authController = new AuthController(userService, profileService, bcrypt);
const pageController = new PageController(entryService, challengeService, profileService, userService, zenService);
const creatorController = new CreatorController(entryService, zenService);
const adminController = new AdminController(entryService, challengeService, userService); // Pass userService for potential user management
const searchController = new SearchController(searchService);
const entryApiController = new EntryApiController(entryService, profileService, notificationService);

// --- Route Registration ---
app.use('/auth', authRoutes(authController, passport)); // Pass controller and passport to auth routes
app.use('/', pageRoutes(pageController, entryService)); // Pass controller and services to page routes
app.use('/api', apiRoutes(entryApiController, searchController, zenService, profileService, notificationService));
app.use('/creator', creatorRoutes(creatorController));
app.use('/admin', adminRoutes(adminController));
app.use('/search', pageRoutes(pageController, entryService)); // Register /search for the EJS page

// --- Error Handling ---
// 404 - Not Found
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Pagina non trovata', user: req.user });
});

// 500 - Internal Server Error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', { title: 'Errore interno del server', error: err.message, user: req.user });
});

// --- Server Start ---
// Avvio ritardato: prima schema+seed, poi app.listen.
const PORT = process.env.PORT || 3000;
db.connect()
    .then(() => {
        console.log('Database connected and schema/seed applied.');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to database or apply schema/seed:', err);
        process.exit(1);
    });