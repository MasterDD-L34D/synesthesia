// middlewares/auth.middleware.js

export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Accedi per visualizzare questa risorsa.');
    res.redirect('/login');
};

export const isCreator = (req, res, next) => {
    // Un admin può anche essere considerato un creator per accedere alle sue dashboard
    if (req.isAuthenticated() && (req.user.role === 'creator' || req.user.role === 'admin')) {
        return next();
    }
    req.flash('error_msg', 'Non hai i permessi di Creator per accedere a questa risorsa.');
    res.redirect('/login'); // O una pagina di errore 403
};

export const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Non hai i permessi di Amministratore per accedere a questa risorsa.');
    res.redirect('/login'); // O una pagina di errore 403
};

// Middleware per garantire che l'utente sia l'autore di una risorsa o un admin
export const isOwnerOrAdmin = async (req, res, next) => {
    // Questo middleware richiede che l'ID della risorsa sia in req.params.id e che tu possa recuperare l'autore della risorsa.
    // Per Entry, devi recuperare l'entry e confrontare user_id.
    const resourceId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    // Esempio generico. Dovrebbe essere specifico per ogni tipo di risorsa (Entry, Commento, etc.)
    // Ad esempio, per Entry:
    // const entry = await entryService.getEntryById(resourceId);
    // if (!entry) { return res.status(404).send('Resource not found'); }
    // if (entry.user_id === userId || req.user.role === 'admin') {
    //     return next();
    // }

    // Placeholder: per la demo, assumeremo che sia gestito dai controller specifici o che l'admin possa fare tutto
    if (req.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Non hai i permessi per modificare questa risorsa.');
    res.redirect('back'); // Torna alla pagina precedente
};