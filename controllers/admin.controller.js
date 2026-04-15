// controllers/admin.controller.js
import EntryService from '../services/entry.service.js';
import ChallengeService from '../services/challenge.service.js';
import UserService from '../services/user.service.js'; // Assumi che UserService sia disponibile

class AdminController {
    constructor(entryService, challengeService, userService) {
        this.entryService = entryService;
        this.challengeService = challengeService;
        this.userService = userService;
    }

    async renderAdminDashboard(req, res, next) {
        try {
            const pendingEntries = await this.entryService.getPendingEntries();
            const allChallenges = await this.challengeService.getAllChallenges();
            const allUsers = await this.userService.getAllUsers(); // Per mostrare una lista utenti base

            res.render('pages/admin-dashboard', {
                title: 'Dashboard Amministratore',
                user: req.user,
                pendingEntries,
                allChallenges,
                allUsers,
                currentDate: new Date().toISOString().slice(0, 10) // Per il campo data nel form di creazione challenge
            });
        } catch (error) {
            console.error('Error rendering admin dashboard:', error);
            next(error);
        }
    }

    async moderateEntry(req, res, next) {
        const { id } = req.params;
        const { status } = req.body; // 'published' o 'rejected'

        try {
            const success = await this.entryService.updateEntryStatus(parseInt(id, 10), status);
            if (success) {
                req.flash('success_msg', `Opera ${id} moderata con successo a ${status}.`);
            } else {
                req.flash('error_msg', 'Impossibile moderare l\'opera.');
            }
            res.redirect('/admin');
        } catch (error) {
            console.error('Error moderating entry:', error);
            req.flash('error_msg', 'Errore durante la moderazione dell\'opera.');
            res.redirect('/admin');
        }
    }

    async createChallenge(req, res, next) {
        const { title, description, startDate, endDate, isActive } = req.body;
        const isActiveBool = isActive === 'on' ? 1 : 0;

        try {
            const challengeId = await this.challengeService.createChallenge({
                title,
                description,
                startDate,
                endDate,
                isActive: isActiveBool
            });
            req.flash('success_msg', `Challenge "${title}" creata con successo (ID: ${challengeId}).`);
            res.redirect('/admin');
        } catch (error) {
            console.error('Error creating challenge:', error);
            req.flash('error_msg', 'Errore durante la creazione della challenge.');
            res.redirect('/admin');
        }
    }

    async updateChallenge(req, res, next) {
        const { id } = req.params;
        const { title, description, startDate, endDate, isActive } = req.body;
        const isActiveBool = isActive === 'on' ? 1 : 0;

        try {
            const success = await this.challengeService.updateChallenge(parseInt(id, 10), {
                title,
                description,
                start_date: startDate,
                end_date: endDate,
                is_active: isActiveBool
            });
            if (success) {
                req.flash('success_msg', `Challenge ${id} aggiornata con successo.`);
            } else {
                req.flash('error_msg', 'Impossibile aggiornare la challenge.');
            }
            res.redirect('/admin');
        } catch (error) {
            console.error('Error updating challenge:', error);
            req.flash('error_msg', 'Errore durante l\'aggiornamento della challenge.');
            res.redirect('/admin');
        }
    }

    async toggleChallengeStatus(req, res, next) {
        const { id } = req.params;
        const { isActive } = req.body; // 'true' o 'false' come stringa

        try {
            const success = await this.challengeService.toggleChallengeStatus(parseInt(id, 10), isActive === 'true');
            if (success) {
                req.flash('success_msg', `Stato della challenge ${id} aggiornato.`);
            } else {
                req.flash('error_msg', 'Impossibile aggiornare lo stato della challenge.');
            }
            res.redirect('/admin');
        } catch (error) {
            console.error('Error toggling challenge status:', error);
            req.flash('error_msg', 'Errore durante l\'aggiornamento dello stato della challenge.');
            res.redirect('/admin');
        }
    }
}

export default AdminController;