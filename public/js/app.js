// public/js/app.js
import page from 'page';

// Funzione helper per creare le card delle opere
function createEntryCard(entry) {
    const defaultThumbnail = '/img/default-thumbnail.png'; // Assicurati di avere un'immagine di fallback
    return `
        <article class="col">
            <div class="card h-100 shadow-sm">
                <img src="${entry.thumbnail_path || defaultThumbnail}" class="card-img-top entry-card-img-top" alt="${entry.title}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${entry.title}</h5>
                    <p class="card-text text-muted small mb-2">di <a href="/profile/${entry.author_username}">${entry.author_username}</a> (Enneatipo ${entry.author_enneagram_type || 'N/A'})</p>
                    <p class="card-text">${entry.description.substring(0, 100)}...</p>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="badge bg-secondary"><i class="bi bi-heart-fill"></i> ${entry.likes_count || 0}</span>
                        <a href="/entries/${entry.id}" class="btn btn-sm btn-outline-primary">Vedi opera</a>
                    </div>
                </div>
            </div>
        </article>
    `;
}

// Funzione per caricare e renderizzare i risultati di ricerca
async function loadSearchResults(ctx) {
    const mainContent = document.getElementById('searchResults');
    const initialMessage = document.getElementById('initialMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const paginationControls = document.getElementById('paginationControls');
    const resultsCountBadge = document.getElementById('resultsCount');

    if (!mainContent) return; // Non siamo sulla pagina di ricerca

    // Mostra un loader durante il caricamento (opzionale)
    mainContent.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Caricamento...</span>
            </div>
            <p class="mt-3 text-muted">Caricamento risultati...</p>
        </div>
    `;
    // Nasconde tutti i messaggi e la paginazione prima di caricare
    initialMessage.classList.add('d-none');
    noResultsMessage.classList.add('d-none');
    paginationControls.classList.add('d-none');
    resultsCountBadge.classList.add('d-none');


    const queryParams = new URLSearchParams(ctx.querystring);
    const apiEndpoint = queryParams.get('affinitySearch') === 'true' ? '/api/search/affinity' : '/api/search';
    queryParams.delete('affinitySearch'); // Rimuove il flag per non passarlo all'API

    try {
        const response = await fetch(`${apiEndpoint}?${queryParams.toString()}`);
        if (!response.ok) {
            if (response.status === 401) {
                 // Utente non autorizzato per affinity search
                 mainContent.innerHTML = `
                    <div class="col-12 text-center py-5 text-warning">
                        <i class="bi bi-person-fill-lock fs-1 d-block mb-3"></i>
                        <p class="lead">Devi essere loggato per vedere le opere affini al tuo profilo Enneagrammatico.</p>
                        <a href="/login" class="btn btn-primary mt-3">Accedi ora</a>
                    </div>
                 `;
                 return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            mainContent.innerHTML = data.data.map(createEntryCard).join('');
            resultsCountBadge.textContent = data.meta.total;
            resultsCountBadge.classList.remove('d-none'); // Mostra il conteggio

            // Aggiorna e mostra i controlli di paginazione
            paginationControls.classList.remove('d-none');
            document.getElementById('currentPageInfo').textContent = `Pagina ${data.meta.page} di ${Math.ceil(data.meta.total / data.meta.pageSize)}`;

            const prevLink = document.getElementById('prevPageLink').querySelector('a');
            const nextLink = document.getElementById('nextPageLink').querySelector('a');
            const currentPage = data.meta.page;
            const newQueryParams = new URLSearchParams(queryParams); // Copia i parametri

            if (currentPage > 1) {
                newQueryParams.set('page', currentPage - 1);
                prevLink.href = `/search?${newQueryParams.toString()}`;
                document.getElementById('prevPageLink').classList.remove('disabled');
            } else {
                document.getElementById('prevPageLink').classList.add('disabled');
            }

            if (data.meta.hasNext) {
                newQueryParams.set('page', currentPage + 1);
                nextLink.href = `/search?${newQueryParams.toString()}`;
                document.getElementById('nextPageLink').classList.remove('disabled');
            } else {
                document.getElementById('nextPageLink').classList.add('disabled');
            }

        } else {
            mainContent.innerHTML = '';
            noResultsMessage.classList.remove('d-none');
            resultsCountBadge.classList.add('d-none'); // Nasconde il conteggio
        }
        
    } catch (error) {
        console.error("Failed to load search results:", error);
        mainContent.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
                <i class="bi bi-x-circle fs-1 d-block mb-3"></i>
                <p class="lead">Si è verificato un errore durante il caricamento dei risultati.</p>
                <p class="text-muted">Riprova più tardi.</p>
            </div>
        `;
        resultsCountBadge.classList.add('d-none');
    }
}

// Funzione per applicare i filtri
function applySearchFilters(event, isAffinitySearch = false) {
    if (event) event.preventDefault(); // Impedisce il submit di default del form

    const form = document.getElementById('searchForm');
    const formData = new FormData(form);
    const queryParams = new URLSearchParams();

    if (isAffinitySearch) {
        queryParams.set('affinitySearch', 'true');
        // Per la ricerca per affinità, non usiamo gli altri filtri del form
        // ma potremmo voler mantenere la paginazione se già presente
        const currentUrlParams = new URLSearchParams(window.location.search);
        if (currentUrlParams.has('page')) queryParams.set('page', currentUrlParams.get('page'));
        if (currentUrlParams.has('pageSize')) queryParams.set('pageSize', currentUrlParams.get('pageSize'));

    } else {
        // Raccogli i valori dal form per la ricerca generale
        const query = formData.get('query');
        if (query) queryParams.set('query', query);

        const mediaType = formData.get('mediaType');
        if (mediaType) queryParams.set('mediaType', mediaType);

        const authorEnneagramType = formData.get('authorEnneagramType');
        if (authorEnneagramType) queryParams.set('authorEnneagramType', authorEnneagramType);

        const tags = formData.get('tags');
        if (tags) queryParams.set('tags', tags);
    }
    
    // Reindirizza a /search con i nuovi parametri di query
    page.redirect(`/search?${queryParams.toString()}`);
}

// Funzione per pulire i filtri
function clearSearchFilters() {
    const form = document.getElementById('searchForm');
    form.reset(); // Resetta tutti i campi del form
    document.getElementById('mediaTypeAll').checked = true; // Assicurati che "Tutte" sia selezionato
    page.redirect('/search'); // Reindirizza alla pagina di ricerca senza filtri
}

// Inizializza i filtri quando la pagina carica per la prima volta con Page.js
function initializeFiltersFromUrl(ctx) {
    const form = document.getElementById('searchForm');
    if (!form) return;

    const queryParams = new URLSearchParams(ctx.querystring);

    document.getElementById('searchQuery').value = queryParams.get('query') || '';
    document.getElementById('searchTags').value = queryParams.get('tags') || '';
    document.getElementById('authorEnneagramType').value = queryParams.get('authorEnneagramType') || '';

    const mediaType = queryParams.get('mediaType');
    const mediaTypeRadios = document.querySelectorAll('input[name="mediaType"]');
    mediaTypeRadios.forEach(radio => {
        radio.checked = radio.value === (mediaType || '');
    });
}


// Aggiungi event listener solo se siamo sulla pagina di ricerca
// Questa parte si attiva al caricamento iniziale della pagina EJS
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', applySearchFilters);
        document.getElementById('searchButton').addEventListener('click', applySearchFilters);
        document.getElementById('clearFiltersBtn').addEventListener('click', clearSearchFilters);
        
        const searchByMyAffinityBtn = document.getElementById('searchByMyAffinityBtn');
        if (searchByMyAffinityBtn) {
            searchByMyAffinityBtn.addEventListener('click', (e) => applySearchFilters(e, true));
        }

        // Ascolta i cambiamenti nei filtri (radio, select) e applica la ricerca automaticamente
        searchForm.querySelectorAll('input[type="radio"][name="mediaType"], select[name="authorEnneagramType"]').forEach(input => {
            input.addEventListener('change', applySearchFilters);
        });

        // La logica di Page.js gestirà il caricamento dei risultati all'avvio o al cambio URL
    }
});


// Routing con Page.js
page('/', () => { /* Logica per la home page se necessaria per Page.js */ });
page('/login', () => { /* Logica per la pagina di login se necessaria per Page.js */ });
page('/register', () => { /* Logica per la pagina di registrazione se necessaria per Page.js */ });
page('/onboarding', () => { /* Logica per l'onboarding se necessaria per Page.js */ });
page('/challenges', () => { /* Logica per la lista challenge se necessaria per Page.js */ });
page('/challenges/:id', () => { /* Logica per il dettaglio challenge se necessaria per Page.js */ });
page('/entries/:id', () => { /* Logica per il dettaglio opera se necessaria per Page.js */ });
page('/profile/:username', () => { /* Logica per il profilo utente se necessaria per Page.js */ });
page('/upload', () => { /* Logica per l'upload opera se necessaria per Page.js */ });
page('/creator/dashboard', () => { /* Logica per la dashboard creator se necessaria per Page.js */ });
page('/admin', () => { /* Logica per la dashboard admin se necessaria per Page.js */ });


page('/search', (ctx) => {
    initializeFiltersFromUrl(ctx); // Inizializza i campi del form con i parametri URL
    loadSearchResults(ctx); // Carica e mostra i risultati
});

// Avvia Page.js (assicurati che sia l'unica chiamata a page() in tutta l'app)
page();