// config/passport.js
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

const setupPassport = (passport, userService, profileService) => {

    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const user = await userService.findByUsername(username);
            if (!user) {
                return done(null, false, { message: 'Username non trovato.' });
            }
            
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return done(null, false, { message: 'Password errata.' });
            }

            // Carica il profilo dell'utente e allega all'oggetto utente
            const userProfile = await profileService.getProfileByUserId(user.id);
            user.profile = userProfile;

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userService.findById(id);
            if (!user) {
                return done(null, false);
            }
            // Carica il profilo dell'utente e allega all'oggetto utente
            const userProfile = await profileService.getProfileByUserId(user.id);
            user.profile = userProfile;

            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};

export default setupPassport;