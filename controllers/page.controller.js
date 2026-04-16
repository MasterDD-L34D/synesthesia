// controllers/page.controller.js
class PageController {
    constructor(entryService, challengeService, profileService, userService, zenService) {
        this.entryService = entryService;
        this.challengeService = challengeService;
        this.profileService = profileService;
        this.userService = userService;
        this.zenService = zenService;
    }

    // Fase 8 — Feed personalizzato
    async renderFeedPage(req, res, next) {
        try {
            const profile = await this.profileService.getProfileByUserId(req.user.id);
            const dominant = profile ? profile.dominant_type : null;

            const entries = await this.entryService.getFeedEntries(dominant, 12);
            const challenges = await this.challengeService.getActiveChallenges();
            const tasks = await this.zenService.getRecommendedTasks(req.user.id);

            // Decora ogni entry con caption deterministica basata sul tipo dell'autore
            const decoratedEntries = entries.map((e) => ({
                ...e,
                auto_caption: this.zenService.generateCaption(
                    e.author_dominant_type,
                    e.id,
                    e.media_type
                ),
            }));

            res.render('pages/feed', {
                title: 'Il tuo Feed',
                user: req.user,
                profile,
                entries: decoratedEntries,
                challenges,
                tasks,
                hasProfile: Boolean(dominant),
            });
        } catch (error) {
            console.error('Error rendering feed page:', error);
            next(error);
        }
    }

    async renderHomePage(req, res, next) {
        try {
            const activeChallenges = await this.challengeService.getActiveChallenges();
            const recentEntries = await this.entryService.getRecentPublishedEntries(8);
            res.render('pages/home', {
                title: 'Benvenuto su Synesthesia',
                user: req.user,
                activeChallenges,
                recentEntries,
            });
        } catch (error) {
            console.error('Error rendering home page:', error);
            next(error);
        }
    }

    renderLoginPage(req, res) {
        res.render('pages/login', { title: 'Login' });
    }

    renderRegisterPage(req, res) {
        res.render('pages/register', { title: 'Registrati' });
    }

    // Fase 3 — Onboarding: carica dinamicamente le domande dal DB.
    async renderOnboardingPage(req, res, next) {
        try {
            const questions = await this.profileService.getAllQuestions();
            const profile = await this.profileService.getProfileByUserId(req.user.id);
            res.render('pages/onboarding', {
                title: 'Questionario di Profilazione',
                user: req.user,
                questions,
                alreadyCompleted: Boolean(profile && profile.onboarding_completed),
            });
        } catch (error) {
            console.error('Error rendering onboarding page:', error);
            next(error);
        }
    }

    // Fase 3 + Batch D 4.1 — Submit del questionario con flash descrittivo.
    static FACET_NAMES = {
        1: 'Cesellatore', 2: 'Donatore', 3: 'Faro', 4: 'Lirico', 5: 'Cartografo',
        6: 'Custode', 7: 'Viandante', 8: 'Titano', 9: 'Orizzonte',
    };

    async submitOnboarding(req, res, next) {
        try {
            const profile = await this.profileService.submitOnboardingAnswers(
                req.user.id,
                req.body
            );
            const t = profile.dominant_type;
            const name = PageController.FACET_NAMES[t] || '';
            req.flash(
                'success_msg',
                `Mappatura completata! La tua sfaccettatura dominante è ${name} (${t}). Scopri cosa significa nel tuo profilo.`
            );
            res.redirect(`/profile/${req.user.username}`);
        } catch (error) {
            console.error('Error submitting onboarding:', error);
            req.flash('error_msg', 'Errore durante il calcolo del profilo.');
            res.redirect('/onboarding');
        }
    }

    async renderChallengeListPage(req, res, next) {
        try {
            const allChallenges = await this.challengeService.getAllChallenges();
            res.render('pages/challenge-list', {
                title: 'Tutte le Challenge',
                user: req.user,
                challenges: allChallenges,
            });
        } catch (error) {
            console.error('Error rendering challenge list page:', error);
            next(error);
        }
    }

    async renderChallengeDetailPage(req, res, next) {
        const { id } = req.params;
        try {
            const challenge = await this.challengeService.getChallengeById(parseInt(id, 10));
            if (!challenge) {
                return res
                    .status(404)
                    .render('404', { title: 'Challenge non trovata', user: req.user });
            }
            const entriesForChallenge = await this.entryService.getEntriesByChallengeId(
                parseInt(id, 10)
            );
            res.render('pages/challenge-detail', {
                title: challenge.title,
                user: req.user,
                challenge,
                entries: entriesForChallenge,
            });
        } catch (error) {
            console.error('Error rendering challenge detail page:', error);
            next(error);
        }
    }

    async renderEntryDetailPage(req, res, next) {
        const { id } = req.params;
        try {
            const entry = await this.entryService.getEntryById(parseInt(id, 10));
            if (!entry || entry.status !== 'published') {
                return res
                    .status(404)
                    .render('404', { title: 'Opera non trovata', user: req.user });
            }
            const eid = parseInt(id, 10);
            const comments = await this.entryService.getCommentsForEntry(eid);
            const likesCount = await this.entryService.getLikesCount(eid);
            const savesCount = await this.entryService.getSavesCount(eid);
            const isLiked = req.user
                ? await this.entryService.isEntryLikedByUser(eid, req.user.id)
                : false;
            const isSaved = req.user
                ? await this.entryService.isEntrySavedByUser(eid, req.user.id)
                : false;

            // Log 'view' interaction (fire-and-forget)
            if (req.user) {
                this.entryService.db
                    .run(
                        `INSERT INTO interactions (user_id, entry_id, interaction_type) VALUES (?, ?, 'view')`,
                        [req.user.id, eid]
                    )
                    .catch((e) => console.error('view log fail:', e));
            }

            res.render('pages/entry-detail', {
                title: entry.title,
                user: req.user,
                entry,
                comments,
                likesCount,
                savesCount,
                isLiked,
                isSaved,
            });
        } catch (error) {
            console.error('Error rendering entry detail page:', error);
            next(error);
        }
    }

    // Fase 3 — Profile page: carica dati reali del target user (non del viewer).
    async renderProfilePage(req, res, next) {
        const { username } = req.params;
        try {
            const profileUser = await this.profileService.getProfileByUsername(username);
            if (!profileUser) {
                return res
                    .status(404)
                    .render('404', { title: 'Utente non trovato', user: req.user });
            }
            const profileEntries = await this.entryService.getCreatorEntriesWithStats(
                profileUser.user_id
            );
            const isOwner = Boolean(req.user && req.user.id === profileUser.user_id);
            const savedEntries = isOwner
                ? await this.entryService.getSavedEntriesByUser(profileUser.user_id)
                : [];
            res.render('pages/profile', {
                title: `Profilo di ${username}`,
                user: req.user,
                profileUser,
                profileEntries,
                savedEntries,
                isOwner,
            });
        } catch (error) {
            console.error('Error rendering profile page:', error);
            next(error);
        }
    }

    async renderUploadEntryPage(req, res, next) {
        try {
            const activeChallenges = await this.challengeService.getActiveChallenges();
            res.render('pages/upload-entry', {
                title: 'Carica Nuova Opera',
                user: req.user,
                activeChallenges,
            });
        } catch (error) {
            console.error('Error rendering upload page:', error);
            next(error);
        }
    }

    // Batch C — Avatar upload
    async uploadAvatar(req, res, next) {
        try {
            if (!req.file) {
                req.flash('error_msg', 'Seleziona un\'immagine per l\'avatar.');
                return res.redirect(`/profile/${req.user.username}`);
            }
            const publicPath =
                '/uploads/avatars/' + req.file.filename;
            await this.userService.updateAvatar(req.user.id, publicPath);
            req.flash('success_msg', 'Avatar aggiornato!');
            res.redirect(`/profile/${req.user.username}`);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            req.flash('error_msg', 'Errore durante l\'upload dell\'avatar.');
            res.redirect(`/profile/${req.user.username}`);
        }
    }

    renderSearchPage(req, res) {
        res.render('pages/search', { title: 'Ricerca Avanzata', user: req.user });
    }

    renderAboutPage(req, res) {
        res.render('pages/about', { title: 'Cos\'è Synesthesia', user: req.user });
    }
}

export default PageController;
