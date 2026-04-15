-- database/seeds.sql
-- Script robusto per popolare il database Synesthesia con dati di esempio per la demo.
-- Questo file dovrebbe essere eseguito DOPO che lo schema del database (schema.sql) è stato creato.

-- Attiva il supporto per le chiavi esterne per garantire l'integrità referenziale.
PRAGMA foreign_keys = ON;

-- ! ATTENZIONE: Questo script cancellerà TUTTI i dati esistenti dalle tabelle elencate.
-- ! Usare con cautela in ambienti di produzione o con dati importanti.

-- ----------------------------------------------------
-- 1. Pulizia delle Tabelle (in ordine inverso di dipendenza)
-- ----------------------------------------------------
DELETE FROM saved_entries;
DELETE FROM interactions;
DELETE FROM recommended_tasks;
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM entry_tags;
DELETE FROM tags;
DELETE FROM entry_files;
DELETE FROM entries;
DELETE FROM challenges;
DELETE FROM prompts;
DELETE FROM questionnaire_answers;
DELETE FROM questionnaire_questions;
DELETE FROM profiles;
DELETE FROM users;

-- Reset degli auto-increment ID per garantire che gli ID inizino da 1
DELETE FROM sqlite_sequence WHERE name = 'users';
DELETE FROM sqlite_sequence WHERE name = 'profiles';
DELETE FROM sqlite_sequence WHERE name = 'questionnaire_questions';
DELETE FROM sqlite_sequence WHERE name = 'questionnaire_answers';
DELETE FROM sqlite_sequence WHERE name = 'prompts';
DELETE FROM sqlite_sequence WHERE name = 'challenges';
DELETE FROM sqlite_sequence WHERE name = 'entries';
DELETE FROM sqlite_sequence WHERE name = 'entry_files';
DELETE FROM sqlite_sequence WHERE name = 'tags';
DELETE FROM sqlite_sequence WHERE name = 'likes';
DELETE FROM sqlite_sequence WHERE name = 'comments';
DELETE FROM sqlite_sequence WHERE name = 'recommended_tasks';


-- ----------------------------------------------------
-- 2. Utenti di Test (con ruoli e profili distinti)
-- ----------------------------------------------------
-- Tutte le password hashate qui corrispondono alla stringa 'password'.
-- Si consiglia di generare hash unici con bcrypt per ogni utente in produzione.
-- Hash per 'password': $2b$10$9EZb8bgqWK23NLYOsYfwQebZItkPSNRLoYUCllsqBoX19y3T7qjki
-- (Questo hash è un placeholder dimostrativo. Un hash reale per 'password' è
-- ad esempio: $2b$10$9EZb8bgqWK23NLYOsYfwQebZItkPSNRLoYUCllsqBoX19y3T7qjki)

-- Utente Amministratore (ID 1)
INSERT INTO users (username, email, password_hash, role, is_creator_unlocked, created_at, updated_at) VALUES
('adminuser', 'admin@synesthesia.com', '$2b$10$9EZb8bgqWK23NLYOsYfwQebZItkPSNRLoYUCllsqBoX19y3T7qjki', 'admin', 1, DATETIME('now', '-3 months'), DATETIME('now', '-3 months'));

-- Utente Creator (ID 2) - Sfaccettatura 4 (L'Individualista, l'Artista)
INSERT INTO users (username, email, password_hash, role, is_creator_unlocked, created_at, updated_at) VALUES
('creative_soul', 'creator@synesthesia.com', '$2b$10$9EZb8bgqWK23NLYOsYfwQebZItkPSNRLoYUCllsqBoX19y3T7qjki', 'creator', 1, DATETIME('now', '-2 months'), DATETIME('now', '-2 months'));

-- Utente Registrato (ID 3) - Sfaccettatura 7 (L'Entusiasta) - Dimostra il profilo iniziale da questionario
INSERT INTO users (username, email, password_hash, role, is_creator_unlocked, created_at, updated_at) VALUES
('explorer_user', 'user1@synesthesia.com', '$2b$10$9EZb8bgqWK23NLYOsYfwQebZItkPSNRLoYUCllsqBoX19y3T7qjki', 'registered', 0, DATETIME('now', '-1 months'), DATETIME('now', '-1 months'));

-- Utente Registrato (ID 4) - Sfaccettatura 9 (Il Pacificatore)
INSERT INTO users (username, email, password_hash, role, is_creator_unlocked, created_at, updated_at) VALUES
('zen_seeker', 'user2@synesthesia.com', '$2b$10$9EZb8bgqWK23NLYOsYfwQebZItkPSNRLoYUCllsqBoX19y3T7qjki', 'registered', 0, DATETIME('now', '-21 days'), DATETIME('now', '-21 days'));

-- Utente Registrato (ID 5) - Sfaccettatura 2 (L'Aiutante)
INSERT INTO users (username, email, password_hash, role, is_creator_unlocked, created_at, updated_at) VALUES
('helper_artist', 'user3@synesthesia.com', '$2b$10$9EZb8bgqWK23NLYOsYfwQebZItkPSNRLoYUCllsqBoX19y3T7qjki', 'registered', 0, DATETIME('now', '-14 days'), DATETIME('now', '-14 days'));

-- Utente Creator (ID 6) - Sfaccettatura 6 (Il Leale) - Carica opere in stato 'pending' per moderazione
INSERT INTO users (username, email, password_hash, role, is_creator_unlocked, created_at, updated_at) VALUES
('pending_creator', 'pending@synesthesia.com', '$2b$10$9EZb8bgqWK23NLYOsYfwQebZItkPSNRLoYUCllsqBoX19y3T7qjki', 'creator', 1, DATETIME('now', '-7 days'), DATETIME('now', '-7 days'));


-- ----------------------------------------------------
-- 3. Profili Psicologici (Prisma Interiora)
-- ----------------------------------------------------
-- Punteggi Prisma Interioratici iniziali che riflettono il tipo dominante.
INSERT INTO profiles (user_id, dominant_type, wing, description, score_type_1, score_type_2, score_type_3, score_type_4, score_type_5, score_type_6, score_type_7, score_type_8, score_type_9) VALUES
(1, 8, '7', 'Un leader nato, forte e determinato. Guida con visione e coraggio.', 5, 6, 7, 6, 7, 7, 8, 9, 6), -- adminuser (Type 8)
(2, 4, '5', 'Un artista sensibile e profondo, alla ricerca della propria unicità e autenticità.', 6, 7, 6, 9, 8, 6, 5, 7, 6), -- creative_soul (Type 4)
(3, 7, '6', 'Sempre alla ricerca di nuove esperienze e gioie, evita il dolore e la noia, con un lato leale.', 6, 7, 8, 7, 6, 6, 9, 7, 7), -- explorer_user (Type 7)
(4, 9, '1', 'Pacifico e accomodante, cerca armonia e stabilità, con un desiderio di perfezione interiore.', 7, 8, 7, 6, 6, 7, 7, 6, 9), -- zen_seeker (Type 9)
(5, 2, '3', 'Generoso e altruista, motivato dal desiderio di essere amato e apprezzato, con un tocco di esibizionismo.', 6, 9, 8, 7, 6, 7, 7, 6, 7), -- helper_artist (Type 2)
(6, 6, '5', 'Leale e responsabile, attento ai dettagli e alla sicurezza, con un lato di osservazione distaccata.', 7, 6, 7, 7, 8, 9, 7, 6, 6); -- pending_creator (Type 6)


-- ----------------------------------------------------
-- 4. Domande e Risposte del Questionario (per onboarding)
-- ----------------------------------------------------
-- Domande predefinite per il questionario di onboarding.
INSERT INTO questionnaire_questions (question_text, question_type, options_json, enneagram_influence_json) VALUES
('Quando prendi decisioni importanti, cosa ti guida principalmente?', 'multiple_choice', '[{"text": "Logica e analisi", "value": "1"}, {"text": "Sentimenti e relazioni", "value": "2"}, {"text": "Impulso e opportunità", "value": "3"}]', '{"1": {"5": 2, "6": 1}, "2": {"2": 2, "4": 1, "9": 1}, "3": {"7": 2, "8": 1}}'),
('Come reagisci allo stress?', 'multiple_choice', '[{"text": "Mi ritiro e rifletto", "value": "1"}, {"text": "Mi attivo e agisco", "value": "2"}, {"text": "Cerco armonia e conforto", "value": "3"}]', '{"1": {"5": 2, "9": 1}, "2": {"3": 2, "7": 1, "8": 1}, "3": {"2": 1, "4": 1, "6": 1}}'),
('Qual è la tua paura più grande?', 'multiple_choice', '[{"text": "Essere controllato o ferito", "value": "1"}, {"text": "Non essere degno o amato", "value": "2"}, {"text": "Perdere la libertà o opportunità", "value": "3"}]', '{"1": {"8": 2, "6": 1}, "2": {"2": 2, "3": 1, "4": 1}, "3": {"7": 2, "1": 1}}'),
('Qual è il tuo desiderio più profondo?', 'multiple_choice', '[{"text": "Essere competente e capace", "value": "1"}, {"text": "Sentirmi speciale e significativo", "value": "2"}, {"text": "Vivere in pace e tranquillità", "value": "3"}]', '{"1": {"1": 1, "3": 1, "5": 2}, "2": {"4": 2, "2": 1}, "3": {"9": 2}}'),
('In gruppo, qual è il tuo ruolo naturale?', 'multiple_choice', '[{"text": "Organizzo e fisso le regole", "value": "1"}, {"text": "Ascolto e medio i conflitti", "value": "2"}, {"text": "Propongo idee nuove e audaci", "value": "3"}]', '{"1": {"1": 2, "3": 1}, "2": {"9": 2, "2": 1}, "3": {"7": 2, "8": 1}}'),
('Di fronte a un errore che hai commesso, come reagisci?', 'multiple_choice', '[{"text": "Mi colpevolizzo e cerco di rimediare subito", "value": "1"}, {"text": "Lo nascondo per non sembrare incapace", "value": "2"}, {"text": "Lo trasformo in lezione e vado avanti", "value": "3"}]', '{"1": {"1": 2, "6": 1}, "2": {"3": 2, "4": 1}, "3": {"7": 1, "9": 2}}'),
('Come vivi le relazioni con le persone care?', 'multiple_choice', '[{"text": "Do molto e cerco di farle sentire speciali", "value": "1"}, {"text": "Osservo e mantengo la mia autonomia", "value": "2"}, {"text": "Le proteggo con forza e lealtà", "value": "3"}]', '{"1": {"2": 2, "4": 1}, "2": {"5": 2, "1": 1}, "3": {"8": 2, "6": 1}}'),
('Qual è il tuo approccio al lavoro?', 'multiple_choice', '[{"text": "Preciso, metodico, orientato al dettaglio", "value": "1"}, {"text": "Strategico, focalizzato sul risultato", "value": "2"}, {"text": "Creativo, seguo ispirazione e intuito", "value": "3"}]', '{"1": {"1": 2, "5": 1}, "2": {"3": 2, "8": 1}, "3": {"4": 2, "7": 1}}'),
('Cosa ti fa sentire davvero vivo?', 'multiple_choice', '[{"text": "Un ambiente sicuro e prevedibile", "value": "1"}, {"text": "Intensità emotiva e profondità", "value": "2"}, {"text": "Avventure e stimoli continui", "value": "3"}]', '{"1": {"6": 2, "9": 1}, "2": {"4": 2, "2": 1}, "3": {"7": 2, "8": 1}}'),
('Quando qualcuno ti critica, il tuo primo istinto è:', 'multiple_choice', '[{"text": "Valutare se ha ragione e correggermi", "value": "1"}, {"text": "Difendermi e contrattaccare", "value": "2"}, {"text": "Sentirmi ferito e chiudermi", "value": "3"}]', '{"1": {"1": 2, "5": 1}, "2": {"8": 2, "6": 1}, "3": {"4": 2, "9": 1}}'),
('Come passi il tempo libero ideale?', 'multiple_choice', '[{"text": "Leggendo o studiando qualcosa di complesso", "value": "1"}, {"text": "Aiutando o stando con le persone", "value": "2"}, {"text": "Esplorando posti o attività nuove", "value": "3"}]', '{"1": {"5": 2, "1": 1}, "2": {"2": 2, "6": 1}, "3": {"7": 2, "3": 1}}'),
('Qual è la tua relazione con le regole?', 'multiple_choice', '[{"text": "Le rispetto, servono a mantenere ordine", "value": "1"}, {"text": "Le seguo se sono utili, altrimenti no", "value": "2"}, {"text": "Le sfido se limitano la libertà", "value": "3"}]', '{"1": {"1": 2, "6": 2}, "2": {"3": 1, "5": 1, "9": 1}, "3": {"7": 1, "8": 2, "4": 1}}'),
('Cosa ti spaventa di più in una nuova situazione?', 'multiple_choice', '[{"text": "Non essere all''altezza", "value": "1"}, {"text": "Essere solo o abbandonato", "value": "2"}, {"text": "Essere bloccato o senza via d''uscita", "value": "3"}]', '{"1": {"3": 2, "1": 1}, "2": {"2": 2, "4": 1, "9": 1}, "3": {"7": 2, "8": 1, "6": 1}}'),
('Il complimento che più ti fa piacere è:', 'multiple_choice', '[{"text": "Sei affidabile e preciso", "value": "1"}, {"text": "Sei unico e profondo", "value": "2"}, {"text": "Sei forte e coraggioso", "value": "3"}]', '{"1": {"1": 2, "6": 1}, "2": {"4": 2, "5": 1}, "3": {"8": 2, "3": 1}}'),
('Quando fai una cosa nuova, che sensazione cerchi?', 'multiple_choice', '[{"text": "Sentirmi sicuro di aver fatto la cosa giusta", "value": "1"}, {"text": "Sentirmi connesso con chi mi sta intorno", "value": "2"}, {"text": "Sentirmi libero di essere me stesso", "value": "3"}]', '{"1": {"1": 2, "6": 1}, "2": {"2": 2, "9": 1}, "3": {"4": 2, "7": 1}}');

-- Risposte per 'explorer_user' (ID 3) per simulare un onboarding iniziale che lo porta al Tipo 7.
INSERT INTO questionnaire_answers (user_id, question_id, answer_value) VALUES
(3, 1, '3'), -- Impulso e opportunità -> rafforza Tipo 7
(3, 2, '2'), -- Mi attivo e agisco -> rafforza Tipo 7
(3, 3, '3'), -- Perdere la libertà o opportunità -> rafforza Tipo 7
(3, 4, '1'); -- Essere competente e capace -> leggermente devia verso Tipo 3/5 per complessità


-- ----------------------------------------------------
-- 5. Prompts creativi
-- ----------------------------------------------------
INSERT INTO prompts (content, created_at) VALUES
('Esplora il tema del "contrasto armonioso" in un''opera d''arte.', DATETIME('now', '-4 months')),
('Crea un paesaggio sonoro che evochi un senso di calma e introspezione.', DATETIME('now', '-3 months')),
('Scrivi un racconto breve sulla riscoperta di un oggetto dimenticato.', DATETIME('now', '-2 months')),
('Rappresenta la complessità delle emozioni umane in un ritratto o illustrazione.', DATETIME('now', '-1 months'));


-- ----------------------------------------------------
-- 6. Challenge (attive e inattive)
-- ----------------------------------------------------
INSERT INTO challenges (title, description, start_date, end_date, is_active, prompt_id, created_at, updated_at) VALUES
('Il Silenzio Visibile', 'Crea un''opera visiva o sonora che catturi l''essenza del silenzio e della quiete interiore.', DATETIME('now', '-2 months'), DATETIME('now', '+1 months'), 1, 1, DATETIME('now', '-2 months'), DATETIME('now', '-2 months')),
('Melodie dell''Anima', 'Componi un brano musicale o un testo poetico che esprima un''emozione profonda e personale.', DATETIME('now', '-1 months'), DATETIME('now', '+2 months'), 1, 2, DATETIME('now', '-1 months'), DATETIME('now', '-1 months')),
('Storie Perdute', 'Inventa una storia breve ispirata a un vecchio oggetto o un ricordo d''infanzia, con un tocco di mistero.', DATETIME('now', '-6 months'), DATETIME('now', '-5 months'), 0, 3, DATETIME('now', '-6 months'), DATETIME('now', '-6 months')),
('Emozioni in Colore', 'Esprimi un''emozione complessa usando solo colori e forme astratte, senza figure riconoscibili.', DATETIME('now', '+1 months'), DATETIME('now', '+2 months'), 0, 4, DATETIME('now', '+1 months'), DATETIME('now', '+1 months'));


-- ----------------------------------------------------
-- 7. Opere Caricate (Entries) e File Associati
-- ----------------------------------------------------

-- Opere di 'creative_soul' (ID 2, Sfaccettatura 4) - Artista sensibile e profondo
INSERT INTO entries (user_id, challenge_id, title, description, media_type, status, created_at, updated_at) VALUES
(2, 1, 'Echi Lontani', 'Un dipinto digitale che esplora la malinconia dei ricordi sbiaditi, con tonalità fredde e forme eteree. Un richiamo al passato.', 'image', 'published', DATETIME('now', '-5 days', '-1 hours'), DATETIME('now', '-5 days', '-1 hours')), -- Entry ID 1
(2, 2, 'Sogno Liquido', 'Un brano musicale ambient, pensato per indurre uno stato di profondo relax e riflessione interiore. Suoni della natura e synth.', 'audio', 'published', DATETIME('now', '-4 days'), DATETIME('now', '-4 days')), -- Entry ID 2
(2, NULL, 'L''Ultimo Sospetto', 'Un racconto breve noir, intriso di mistero e introspezione psicologica. La verità è sempre più oscura.', 'text', 'published', DATETIME('now', '-3 days', '+2 hours'), DATETIME('now', '-3 days', '+2 hours')), -- Entry ID 3
(2, 1, 'Armonia Silente', 'Una fotografia minimalista che cattura la bellezza di un paesaggio innevato al tramonto, evocando pace e isolamento.', 'image', 'published', DATETIME('now', '-2 days', '-3 hours'), DATETIME('now', '-2 days', '-3 hours')); -- Entry ID 4

-- Opere di 'explorer_user' (ID 3, Sfaccettatura 7) - Entusiasta e avventuroso
INSERT INTO entries (user_id, challenge_id, title, description, media_type, status, created_at, updated_at) VALUES
(3, 2, 'Ritmo della Gioia', 'Una composizione upbeat con percussioni vivaci e melodie accattivanti, pensata per celebrare la vita e l''energia positiva.', 'audio', 'published', DATETIME('now', '-1 days', '-1 hours'), DATETIME('now', '-1 days', '-1 hours')), -- Entry ID 5
(3, NULL, 'Fuga Tropicale', 'Un''illustrazione digitale vibrante e colorata, che raffigura un paradiso esotico pieno di energia e avventura.', 'image', 'published', DATETIME('now', '-1 days', '+1 hours'), DATETIME('now', '-1 days', '+1 hours')); -- Entry ID 6

-- Opere di 'helper_artist' (ID 5, Sfaccettatura 2) - Generoso e altruista
INSERT INTO entries (user_id, challenge_id, title, description, media_type, status, created_at, updated_at) VALUES
(5, NULL, 'Mani che Aiutano', 'Un ritratto ad acquerello che celebra la generosità e l''atto di dare, con colori caldi e morbidi. Un omaggio all''altruismo.', 'image', 'published', DATETIME('now', '-2 days', '-2 hours'), DATETIME('now', '-2 days', '-2 hours')), -- Entry ID 7
(5, 2, 'Il Canto dell''Empatia', 'Una poesia che esplora la connessione umana e l''importanza del supporto reciproco. Parole che uniscono.', 'text', 'published', DATETIME('now', '-1 days', '+2 hours'), DATETIME('now', '-1 days', '+2 hours')), -- Entry ID 8
(5, NULL, 'Sguardi Condivisi', 'Una serie di ritratti fotografici che catturano la diversità e l''universalità delle emozioni umane.', 'image', 'published', DATETIME('now', '-1 days', '+3 hours'), DATETIME('now', '-1 days', '+3 hours')); -- Entry ID 9

-- Opere di 'pending_creator' (ID 6, Sfaccettatura 6) - Opere in stato 'pending' per moderazione admin
INSERT INTO entries (user_id, challenge_id, title, description, media_type, status, created_at, updated_at) VALUES
(6, NULL, 'Cattedrale Sotterranea', 'Un disegno tecnico dettagliato di un complesso architettonico immaginario, con un''atmosfera oscura e misteriosa. In attesa di approvazione.', 'image', 'pending', DATETIME('now', '-1 days', '-2 hours'), DATETIME('now', '-1 days', '-2 hours')), -- Entry ID 10
(6, 1, 'Ritratto di Eroe Silente', 'Un racconto di fantasia su un personaggio che trova forza nella solitudine e nella lealtà. In attesa di revisione.', 'text', 'pending', DATETIME('now', '-1 days', '-1 hours'), DATETIME('now', '-1 days', '-1 hours')); -- Entry ID 11

-- Entry Files — Fase 12b punto 4
-- URL esterne per demo convincente senza committare binari.
-- Immagini: Picsum Photos seeded (deterministico). Audio: SoundHelix free samples.
-- Per entry text il campo path contiene la prosa inline (compromesso demo —
-- entry-detail.ejs la renderizza già via <pre><%= entry.main_file_path %></pre>).
INSERT INTO entry_files (entry_id, path, mime_type, size, type, created_at) VALUES
-- Entry 1 — Echi Lontani (image)
(1, 'https://picsum.photos/seed/echi-lontani/900/600', 'image/jpeg', 123456, 'main', DATETIME('now')),
(1, 'https://picsum.photos/seed/echi-lontani/400/300', 'image/jpeg', 12345, 'thumbnail', DATETIME('now')),
-- Entry 2 — Sogno Liquido (audio)
(2, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'audio/mpeg', 2345678, 'main', DATETIME('now')),
(2, 'https://picsum.photos/seed/sogno-liquido/400/300', 'image/jpeg', 23456, 'thumbnail', DATETIME('now')),
-- Entry 3 — L'Ultimo Sospetto (text — prosa inline)
(3, 'La pioggia batteva leggera sui vetri del vecchio studio, un ritmo monotono che sembrava accompagnare i pensieri del detective Morandi. Fissava la fotografia sbiadita sulla scrivania, cercando un indizio tra le pieghe del passato. Il nome Eleonora tornava come un''eco. Ogni indizio raccolto puntava a una verità che nessuno voleva ammettere: il colpevole era già nel quadro, nascosto in piena vista. Spense la lampada e uscì nella notte — la città aveva ancora molte storie da raccontare.', 'text/plain', 512, 'main', DATETIME('now')),
(3, 'https://picsum.photos/seed/ultimo-sospetto/400/300', 'image/jpeg', 34567, 'thumbnail', DATETIME('now')),
-- Entry 4 — Armonia Silente (image)
(4, 'https://picsum.photos/seed/armonia-silente/900/600', 'image/jpeg', 456789, 'main', DATETIME('now')),
(4, 'https://picsum.photos/seed/armonia-silente/400/300', 'image/jpeg', 45678, 'thumbnail', DATETIME('now')),
-- Entry 5 — Ritmo della Gioia (audio)
(5, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'audio/mpeg', 567890, 'main', DATETIME('now')),
(5, 'https://picsum.photos/seed/ritmo-gioia/400/300', 'image/jpeg', 56789, 'thumbnail', DATETIME('now')),
-- Entry 6 — Fuga Tropicale (image)
(6, 'https://picsum.photos/seed/fuga-tropicale/900/600', 'image/jpeg', 678901, 'main', DATETIME('now')),
(6, 'https://picsum.photos/seed/fuga-tropicale/400/300', 'image/jpeg', 67890, 'thumbnail', DATETIME('now')),
-- Entry 7 — Mani che Aiutano (image)
(7, 'https://picsum.photos/seed/mani-aiutano/900/600', 'image/jpeg', 789012, 'main', DATETIME('now')),
(7, 'https://picsum.photos/seed/mani-aiutano/400/300', 'image/jpeg', 78901, 'thumbnail', DATETIME('now')),
-- Entry 8 — Il Canto dell'Empatia (text — prosa inline)
(8, 'Nelle pieghe del silenzio vibra una mano tesa,\nun filo che unisce cuori lontani.\nChi ascolta diventa casa, chi parla diventa ponte.\n\nNon servono parole grandi per curare una ferita:\nbasta il gesto di guardare davvero negli occhi,\nbasta restare quando il mondo vuole correre.\n\nIl canto dell''empatia non ha spartito:\nè ritmo condiviso, è luce che si riflette tra persone\nche scelgono di essere, insieme, meno sole.', 'text/plain', 512, 'main', DATETIME('now')),
(8, 'https://picsum.photos/seed/canto-empatia/400/300', 'image/jpeg', 89012, 'thumbnail', DATETIME('now')),
-- Entry 9 — Sguardi Condivisi (image)
(9, 'https://picsum.photos/seed/sguardi-condivisi/900/600', 'image/jpeg', 890123, 'main', DATETIME('now')),
(9, 'https://picsum.photos/seed/sguardi-condivisi/400/300', 'image/jpeg', 89012, 'thumbnail', DATETIME('now')),
-- Entry 10 — Cattedrale Sotterranea (image, pending)
(10, 'https://picsum.photos/seed/cattedrale/900/600', 'image/jpeg', 987654, 'main', DATETIME('now')),
(10, 'https://picsum.photos/seed/cattedrale/400/300', 'image/jpeg', 98765, 'thumbnail', DATETIME('now')),
-- Entry 11 — Ritratto di Eroe Silente (text — prosa inline, pending)
(11, 'Kaelen cavalcava solo nella steppa ghiacciata. Non era un re, né un guerriero leggendario. Era soltanto un uomo che aveva fatto una promessa e intendeva mantenerla. Gli altri lo chiamavano stolto per aver rifiutato l''esercito, la gloria, il titolo. Ma lui sapeva una cosa che loro ignoravano: la vera forza non si misura dalle battaglie vinte, ma dalle parole mantenute quando costa tutto. Il suo nome non sarebbe stato scritto nei libri — e questo era giusto così.', 'text/plain', 512, 'main', DATETIME('now')),
(11, 'https://picsum.photos/seed/eroe-silente/400/300', 'image/jpeg', 54321, 'thumbnail', DATETIME('now'));


-- ----------------------------------------------------
-- 8. Tag e Associazioni (per la ricerca per keyword)
-- ----------------------------------------------------
INSERT INTO tags (name) VALUES
('astratto'), ('malinconia'), ('digitale'), ('ambient'), ('relax'), ('narrativa'),
('noir'), ('fotografia'), ('minimalista'), ('vivace'), ('tropicale'), ('poesia'),
('empatia'), ('architettura'), ('fantasia'), ('solitudine');

INSERT INTO entry_tags (entry_id, tag_id) VALUES
(1, (SELECT id FROM tags WHERE name = 'astratto')),
(1, (SELECT id FROM tags WHERE name = 'malinconia')),
(1, (SELECT id FROM tags WHERE name = 'digitale')),
(2, (SELECT id FROM tags WHERE name = 'ambient')),
(2, (SELECT id FROM tags WHERE name = 'relax')),
(3, (SELECT id FROM tags WHERE name = 'narrativa')),
(3, (SELECT id FROM tags WHERE name = 'noir')),
(4, (SELECT id FROM tags WHERE name = 'fotografia')),
(4, (SELECT id FROM tags WHERE name = 'minimalista')),
(5, (SELECT id FROM tags WHERE name = 'ambient')),
(5, (SELECT id FROM tags WHERE name = 'vivace')),
(6, (SELECT id FROM tags WHERE name = 'digitale')),
(6, (SELECT id FROM tags WHERE name = 'tropicale')),
(7, (SELECT id FROM tags WHERE name = 'empatia')),
(7, (SELECT id FROM tags WHERE name = 'astratto')), -- per dimostrare combinazioni
(8, (SELECT id FROM tags WHERE name = 'poesia')),
(8, (SELECT id FROM tags WHERE name = 'empatia')),
(9, (SELECT id FROM tags WHERE name = 'fotografia')),
(9, (SELECT id FROM tags WHERE name = 'empatia')),
(10, (SELECT id FROM tags WHERE name = 'architettura')),
(10, (SELECT id FROM tags WHERE name = 'fantasia')),
(11, (SELECT id FROM tags WHERE name = 'narrativa')),
(11, (SELECT id FROM tags WHERE name = 'solitudine'));


-- ----------------------------------------------------
-- 9. Interazioni (Likes e Commenti)
-- ----------------------------------------------------

-- 'explorer_user' (ID 3, Sfaccettatura 7) mette like a opere di 'creative_soul' (ID 2, Sfaccettatura 4)
INSERT INTO likes (user_id, entry_id, created_at) VALUES
(3, 1, DATETIME('now', '-2 hours', '+10 minutes')), -- explorer_user likes 'Echi Lontani' (Type 4 author)
(3, 2, DATETIME('now', '-1 hours', '+5 minutes'));   -- explorer_user likes 'Sogno Liquido' (Type 4 author)

-- 'zen_seeker' (ID 4, Sfaccettatura 9) mette like a opere di 'creative_soul' (ID 2, Sfaccettatura 4) e 'helper_artist' (ID 5, Sfaccettatura 2)
INSERT INTO likes (user_id, entry_id, created_at) VALUES
(4, 1, DATETIME('now', '-3 hours', '+20 minutes')), -- zen_seeker likes 'Echi Lontani' (Type 4 author)
(4, 7, DATETIME('now', '-30 minute', '+15 minutes')); -- zen_seeker likes 'Mani che Aiutano' (Type 2 author)

-- 'adminuser' (ID 1) mette like a opere di 'explorer_user' (ID 3, Sfaccettatura 7)
INSERT INTO likes (user_id, entry_id, created_at) VALUES
(1, 5, DATETIME('now', '-1 hours', '+30 minutes')); -- adminuser likes 'Ritmo della Gioia' (Type 7 author)


-- Commenti (incluse risposte per dimostrare nidificazione base)
INSERT INTO comments (user_id, entry_id, parent_comment_id, content, created_at, status) VALUES
(3, 1, NULL, 'Opera bellissima, cattura davvero la malinconia con maestria.', DATETIME('now', '-1 hours', '+15 minutes'), 'approved'), -- Comment ID 1
(4, 1, NULL, 'Condivido pienamente! Un lavoro molto evocativo che tocca l''anima.', DATETIME('now', '-1 hours', '+25 minutes'), 'approved'), -- Comment ID 2
(2, 1, 1, 'Grazie mille per le tue parole! Sono felice che risuoni con te.', DATETIME('now', '-50 minutes', '+5 minutes'), 'approved'), -- Comment ID 3 (Risposta del creator a Comment ID 1)
(3, 2, NULL, 'Musica perfetta per rilassarsi dopo una giornata intensa. Un vero balsamo per l''anima.', DATETIME('now', '-40 minutes', '+10 minutes'), 'approved'), -- Comment ID 4
(5, 7, NULL, 'Un messaggio molto potente, ben espresso con i colori e la sensibilità dell''artista.', DATETIME('now', '-20 minutes', '+20 minutes'), 'approved'), -- Comment ID 5
(1, 5, NULL, 'Energia pura! Mi piace molto il ritmo e l''allegria che trasmette.', DATETIME('now', '-25 minutes', '+10 minutes'), 'approved'); -- Comment ID 6


-- ----------------------------------------------------
-- 10. Task Raccomandate (per dimostrare ZenService)
-- ----------------------------------------------------
-- Task persistenti per 'creative_soul' (ID 2, Sfaccettatura 4)
INSERT INTO recommended_tasks (user_id, content, created_at, completed) VALUES
(2, 'Dedica del tempo alla riflessione interiore per attingere a nuove profondità emotive per la tua prossima opera.', DATETIME('now', '-1 days', '-5 hours'), 0),
(2, 'Non temere di mostrare la tua autenticità. La tua unicità è la tua forza più grande. Crea senza compromessi.', DATETIME('now', '-8 hours', '-1 hours'), 0);

-- Task persistenti per 'explorer_user' (ID 3, Sfaccettatura 7) - una completata
INSERT INTO recommended_tasks (user_id, content, created_at, completed) VALUES
(3, 'Esplora nuove forme d''arte per mantenere viva la tua sete di scoperta. Prova un nuovo strumento musicale o tecnica di pittura.', DATETIME('now', '-1 days', '-2 hours'), 0),
(3, 'Cerca l''ispirazione in un luogo inaspettata oggi. Una passeggiata nel parco o la visita a un mercato locale potrebbe accendere una scintilla creativa.', DATETIME('now', '-6 hours', '-3 hours'), 1);

-- Task persistenti per 'zen_seeker' (ID 4, Sfaccettatura 9)
INSERT INTO recommended_tasks (user_id, content, created_at, completed) VALUES
(4, 'Trova un momento di quiete per meditare e centrare la tua energia creativa. L''armonia interiore nutre l''arte.', DATETIME('now', '-1 days', '-1 hours'), 0),
(4, 'Collabora con altri artisti per creare qualcosa di bello insieme, fondendo le vostre visioni in un''unica armonia.', DATETIME('now', '-5 hours', '-2 hours'), 0);


-- ----------------------------------------------------
-- 11. Log Interazioni (per scoring prisma-interioratico e analytics) — Fase 1
-- ----------------------------------------------------
-- Una traccia di eventi realistica copre: view, like, comment, search, save,
-- open_profile, challenge_click, upload, complete_onboarding.
INSERT INTO interactions (user_id, entry_id, challenge_id, interaction_type, interaction_value, created_at) VALUES
(3, 1,    NULL, 'view',                NULL,                             DATETIME('now', '-2 hours', '+8 minutes')),
(3, 1,    NULL, 'like',                NULL,                             DATETIME('now', '-2 hours', '+10 minutes')),
(3, 2,    NULL, 'view',                NULL,                             DATETIME('now', '-1 hours', '+2 minutes')),
(3, 2,    NULL, 'like',                NULL,                             DATETIME('now', '-1 hours', '+5 minutes')),
(4, 1,    NULL, 'like',                NULL,                             DATETIME('now', '-3 hours', '+20 minutes')),
(4, 7,    NULL, 'like',                NULL,                             DATETIME('now', '-30 minute', '+15 minutes')),
(3, 1,    NULL, 'comment',             '1',                              DATETIME('now', '-1 hours', '+15 minutes')),
(5, 7,    NULL, 'comment',             '5',                              DATETIME('now', '-20 minutes', '+20 minutes')),
(3, NULL, NULL, 'search',              'tramonto',                       DATETIME('now', '-45 minutes')),
(4, NULL, NULL, 'search',              'malinconia',                     DATETIME('now', '-40 minutes')),
(3, NULL, 1,    'challenge_click',     NULL,                             DATETIME('now', '-55 minutes')),
(2, NULL, NULL, 'complete_onboarding', NULL,                             DATETIME('now', '-7 days')),
(3, NULL, NULL, 'complete_onboarding', NULL,                             DATETIME('now', '-6 days')),
(2, 1,    NULL, 'upload',              NULL,                             DATETIME('now', '-5 days', '-1 hours')),
(2, 2,    NULL, 'upload',              NULL,                             DATETIME('now', '-4 days')),
(4, 2,    NULL, 'view',                NULL,                             DATETIME('now', '-35 minutes')),
(1, NULL, NULL, 'open_profile',        'creative_soul',                  DATETIME('now', '-25 minutes'));

-- Salvataggi (bookmark) — Fase 1
INSERT INTO saved_entries (user_id, entry_id, created_at) VALUES
(3, 1, DATETIME('now', '-1 hours', '+12 minutes')),
(4, 2, DATETIME('now', '-55 minutes')),
(3, 7, DATETIME('now', '-30 minutes'));