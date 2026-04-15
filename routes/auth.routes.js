// routes/auth.routes.js
import express from 'express';

const router = express.Router();

export default (authController, passport) => {
    router.get('/register', authController.renderRegisterPage.bind(authController));
    router.post('/register', authController.registerUser.bind(authController));

    router.get('/login', authController.renderLoginPage.bind(authController));
    router.post('/login', passport.authenticate('local', {
        successRedirect: '/', // Redirect alla home in caso di successo
        failureRedirect: '/login', // Redirect al login in caso di fallimento
        failureFlash: true // Abilita i messaggi flash di Passport
    }));

    router.post('/logout', authController.logoutUser.bind(authController));

    return router;
};