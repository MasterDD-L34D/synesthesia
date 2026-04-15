// routes/page.routes.js
import express from 'express';
import { isAuthenticated, isCreator } from '../middlewares/auth.middleware.js';

const router = express.Router();

export default (pageController, entryService) => { // Passa EntryService per entry-detail
    router.get('/', pageController.renderHomePage.bind(pageController));

    // Auth pages (handled by authController for POST, but pageController for GET)
    router.get('/login', pageController.renderLoginPage.bind(pageController));
    router.get('/register', pageController.renderRegisterPage.bind(pageController));

    // Onboarding (requires authentication)
    router.get('/onboarding', isAuthenticated, pageController.renderOnboardingPage.bind(pageController));
    router.post('/onboarding', isAuthenticated, pageController.submitOnboarding.bind(pageController));

    // Fase 8 — Feed personalizzato
    router.get('/feed', isAuthenticated, pageController.renderFeedPage.bind(pageController));

    // Challenge pages
    router.get('/challenges', pageController.renderChallengeListPage.bind(pageController));
    router.get('/challenges/:id', pageController.renderChallengeDetailPage.bind(pageController));

    // Entry detail page
    router.get('/entries/:id', pageController.renderEntryDetailPage.bind(pageController));

    // User Profile page
    router.get('/profile/:username', pageController.renderProfilePage.bind(pageController));
    // For the currently logged-in user's profile, maybe redirect /profile to /profile/:username
    router.get('/profile', isAuthenticated, (req, res) => res.redirect(`/profile/${req.user.username}`));

    // Creator Upload page (requires Creator role)
    router.get('/upload', isAuthenticated, isCreator, pageController.renderUploadEntryPage.bind(pageController));

    // Search page
    router.get('/search', pageController.renderSearchPage.bind(pageController));


    return router;
};