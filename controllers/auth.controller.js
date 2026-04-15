// controllers/auth.controller.js
class AuthController {
    constructor(userService, profileService, bcrypt) {
        this.userService = userService;
        this.profileService = profileService;
        this.bcrypt = bcrypt;
    }

    renderRegisterPage(req, res) {
        res.render('pages/register', { title: 'Registrati' });
    }

    async registerUser(req, res, next) {
        const { username, email, password, password2 } = req.body;
        let errors = [];

        if (!username || !email || !password || !password2) {
            errors.push({ msg: 'Per favore, compila tutti i campi.' });
        }
        if (password !== password2) {
            errors.push({ msg: 'Le password non corrispondono.' });
        }
        if (password.length < 6) {
            errors.push({ msg: 'La password deve contenere almeno 6 caratteri.' });
        }

        if (errors.length > 0) {
            res.render('pages/register', {
                title: 'Registrati',
                errors,
                username,
                email,
                password,
                password2
            });
        } else {
            try {
                const existingUser = await this.userService.findByUsernameOrEmail(username, email);
                if (existingUser) {
                    errors.push({ msg: 'Username o Email già in uso.' });
                    return res.render('pages/register', {
                        title: 'Registrati',
                        errors,
                        username,
                        email,
                        password,
                        password2
                    });
                }

                const hashedPassword = await this.bcrypt.hash(password, 10);
                const newUser = await this.userService.createUser(username, email, hashedPassword);
                
                // Crea il profilo base per il nuovo utente
                await this.profileService.createProfile(newUser.id);

                req.flash('success_msg', 'Registrazione completata! Ora puoi effettuare il login.');
                res.redirect('/login');
            } catch (err) {
                console.error('Error registering user:', err);
                next(err);
            }
        }
    }

    renderLoginPage(req, res) {
        res.render('pages/login', { title: 'Login' });
    }

    logoutUser(req, res, next) {
        req.logout((err) => {
            if (err) { return next(err); }
            req.flash('success_msg', 'Sei stato disconnesso.');
            res.redirect('/login');
        });
    }
}

export default AuthController;