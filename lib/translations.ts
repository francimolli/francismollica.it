export const translations = {
    it: {
        universe: {
            planets: {
                casa: "Casa",
                officina: "Officina",
                galleria: "Galleria",
                faro: "Faro",
                giardino: "Giardino Sonoro",
                osservatorio: "Osservatorio",
                cantiere: "Cantiere",
                segreto: "???",
            },
            hint: "WASD o frecce per volare · clicca un pianetino per visitarlo",
            eggMessage: "Le creaturine ti vogliono bene: un pianeta segreto si è svelato!",
            guide: {
                title: "La Lucciola Guardiana",
                found: "Una lucciola ti ha trovato: oltre questo buio non c'è più niente…",
                escort: "La lucciola ti fa strada: si torna verso i pianetini ✦",
            },
            tour: {
                stop: "tappa",
                land: "Atterra ✦",
                paused: "tour in pausa — riprendo tra un attimo",
                finaleTitle: "Fine del viaggio",
                finaleText: "Grazie di aver volato con me tra i pianetini. Se qualcosa ti è rimasto in tasca, scrivimi: il Faro è sempre acceso.",
                finaleCta: "Scrivimi ✦",
                captions: {
                    casa: "Tutto comincia qui: una casetta, un lampione e la calma di un piccolo pianeta. È dove abito io.",
                    officina: "Ingranaggi, scintille e una gru instancabile: il mio sentiero professionale, un bullone alla volta.",
                    galleria: "Quadri che orbitano piano: le creazioni di cui vado più fiero, in mostra permanente.",
                    giardino: "Piante che suonano e funghi che brillano: qui coltivo la musica, l'altra mia metà.",
                    osservatorio: "Un telescopio puntato sui mercati: numeri che danzano come costellazioni, nella Bottega.",
                    cantiere: "Travi, gru e idee in costruzione: l'Oracolo custodisce quello che verrà.",
                    faro: "Il Faro resta acceso per ogni viaggiatore: se ti va di parlarmi, atterra qui.",
                    segreto: "Shhh. Questo posto non esiste sulle mappe: te lo sei guadagnato tu.",
                },
            },
            phrases: [
                "Ciao! Che bello vederti da queste parti!",
                "Francesco ha costruito tutto questo con le sue mani!",
                "Si dice che programmi anche in sogno…",
                "Qui il tempo scorre come decidi tu.",
                "Francesco fa anche musica, lo sapevi?",
                "Pare che tre strani oggetti vaghino tra i pianeti…",
            ],
        },
        nav: {
            home: "Home",
            about: "Chi sono",
            timeline: "Sentiero",
            portfolio: "Creazioni",
            contact: "Contatti",
            music: "Musica",
            market: "Bottega",
            roadmap: "Oracolo",
        },
        hero: {
            role: "Web",
            roleSuffix: "Engineer",
            headline: "Arte-|-Codice",
            description: "Architetture incantate per il web. Magia, performance, esperienza.",
            ctaWork: "Sentiero delle Esperienze",
            ctaContact: "Invia un Messaggio",
        },
        about: {
            title: "Chi sono",
            headline: "Appassionato di",
            headlineSuffix: "Software Engineer - Appassionato di Making (Hardware)",
            bio1: "Dal design architetturale allo sviluppo software. Batterista e grande appassionato di musica, per molti anni membro della Banda Musicale di Baveno.",
            bio2: "Il mio obiettivo è costruire ponti tra ingegneria e business. Organizzo jam session e sperimento nuove sonorità su [jamsession.me](https://jamsession.me).",
            techStack: "Strumenti Magici",
            techStackLoading: "INVENTARIO STRUMENTI...",
            ageLabel: "anni",
            imageAlt: "Francesco Mollica",
        },
        projects: {
            sectionTitle: "Sentiero Professionale",
            sectionSubtitle: "Esperienza",
            preview: "Ruolo",
            demo: "Azienda",
            code: "Dettagli",
            totalObjects: "Progetti Totali",
            items: [
                {
                    title: "Senior Web Analyst",
                    company: "BitBang",
                    period: "Gen 2024 - Presente",
                    description: "Progetto e implemento strategie enterprise di raccolta dati con Google Tag Manager e Adobe Analytics per clienti su larga scala. Script di tracking avanzati (JavaScript, DOM) con rigorosa integrità del dato, utility Python per estrazione automatica, audit e monitoraggio delle pipeline analytics, su ambienti virtualizzati e cloud (VMware, Azure, AWS).",
                    tags: ["Google Tag Manager", "Adobe Analytics", "JavaScript", "Python", "Data Integrity", "Azure", "AWS"],
                    url: "https://bitbang.com/",
                },
                {
                    title: "Full-Stack & Backend Engineer",
                    company: "Freelance",
                    period: "Feb 2021 - Presente",
                    description: "Architetto applicazioni full-stack con backend Python robusti (FastAPI, Flask, Django) su PostgreSQL: REST API, code di task in background e utility di data processing. Frontend React/Next.js con TypeScript strict su tutto il codebase. Gestione autonoma dell'intero ciclo di vita: dai requisiti alla containerizzazione Docker e al rilascio in cloud.",
                    tags: ["Python", "FastAPI", "Django", "PostgreSQL", "React", "Next.js", "TypeScript", "Docker"],
                    url: "https://github.com/francimolli",
                },
                {
                    title: "Front-end & Backend Web Developer",
                    company: "Strixia",
                    period: "Nov 2021 - Dic 2023",
                    description: "Servizi backend Python e utility di automazione (CLI, web scraping, parser, scheduler cron) per flussi interni e integrazioni API. Web app complesse in React/Next.js/TypeScript con ottimizzazione SEO e Core Web Vitals end-to-end, ambienti Docker e release versionate su stack eterogenei (Laravel, WordPress). Mentoring di sviluppatori junior con percorsi strutturati e pair programming.",
                    tags: ["Python", "React", "Next.js", "TypeScript", "SEO", "Core Web Vitals", "Docker", "Mentoring"],
                    url: "",
                },
                {
                    title: "Software Developer",
                    company: "Altea Federation",
                    period: "Apr 2021 - Set 2021",
                    description: "Utility di automazione PowerShell per la sincronizzazione dati ERP tra sistemi, batch processing e automazione dei workflow su infrastruttura Microsoft, ottimizzando l'efficienza operativa.",
                    tags: ["PowerShell", "ERP", "Batch Processing", "Microsoft", "Workflow Automation"],
                    url: "https://alteafederation.it/",
                },
                {
                    title: "AI Research Intern",
                    company: "ENEA",
                    period: "Ott 2020 - Mar 2021",
                    description: "Utility Python di calcolo scientifico e AI per training, valutazione e deploy di reti neurali (TensorFlow, Keras, NumPy, Pandas) applicate alla ricerca. Configurazione e gestione di un ambiente di sviluppo AI end-to-end (VM Linux) sull'infrastruttura HPC CRESCO di ENEA.",
                    tags: ["Python", "TensorFlow", "Keras", "NumPy", "Pandas", "Linux", "HPC"],
                    url: "https://enea.it/",
                },
                {
                    title: "Service Desk Specialist",
                    company: "KPMG",
                    period: "Nov 2016 - Apr 2017",
                    description: "Contributo a una web app interna .NET e script di automazione Python e PowerShell per routing dei ticket, log parsing e risoluzione degli incident.",
                    tags: [".NET", "Python", "PowerShell", "Workflow Automation"],
                    url: "https://kpmg.it/",
                }
            ],
        },
        portfolio: {
            sectionTitle: "Galleria delle Creazioni",
            sectionSubtitle: "Showcase",
            viewProject: "VEDI PROGETTO",
            viewCode: "CODICE SORGENTE",
            items: [
                {
                    title: "Portfolio",
                    description: "Un universo interattivo 3D costruito con Three.js e React. Esplorazione cosmica, reliquie nascoste e menu del grimorio.",
                    tags: ["Three.js", "React", "Next.js", "Framer Motion"],
                    image: "/projects/orbit.png",
                    url: "https://github.com/francimolli",
                    repo: "https://github.com/francimolli/"
                },
                {
                    title: "MR Real Estate",
                    description: "Web App per un'agenzia immobiliare sul Lago Maggiore. Sviluppato con Next.js, offre ricerca avanzata, integrazione virtual tour 3D e design minimale ed elegante.",
                    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Real Estate", "3D Virtual Tour"],
                    image: "/projects/orbit.png",
                    url: "https://www.mrealestate.it/",
                    repo: "https://github.com/francimolli/"
                },
                {
                    title: "Jam Session",
                    description: "Piattaforma web per musicisti che vogliono organizzare o partecipare a jam session. Ricerca, prenotazione e gestione eventi musicali.",
                    tags: ["Next.js", "React", "Node.js", "Express", "MongoDB", "Socket.io"],
                    image: "/projects/jam_session.png",
                    url: "https://jamsession.me/",
                    repo: "https://github.com/francimolli/"
                },
                {
                    title: "Tre Gocce d'Oro - Valutazione",
                    description: "Piattaforma Next.js per la valutazione sensoriale dei mieli. Progettata per l'Osservatorio Nazionale Miele con interfaccia tecnica real-time.",
                    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Shadcn UI"],
                    image: "/projects/miele_valutazione.png",
                    url: "https://giurie-valutazione.sistematregoccedoro.it/login",
                    repo: "https://giurie-valutazione.sistematregoccedoro.it/login"
                },
                {
                    title: "Il Gioco dell'Oca Matta",
                    description: "Realizzato in C++ per il primo anno della laurea in Informatica, con regole insolite. Codice semplice ideale per principianti curiosi.",
                    tags: ["C++", "OpenGL", "Game Development"],
                    image: "/projects/oca.png",
                    url: "https://github.com/francimolli/GameOfTheMadGoose/blob/master/README.md",
                    repo: "https://github.com/francimolli/GameOfTheMadGoose/blob/master/README.md"
                },
                {
                    title: "Tre Gocce d'Oro - Giuria",
                    description: "Dashboard di visualizzazione real-time risultati e analisi statistica per il concorso nazionale Grandi Mieli d'Italia.",
                    tags: ["Next.js", "Typescript", "Load Balancing", "Laravel", "Tailwind CSS", "Real-time Data"],
                    image: "/projects/miele_risultati.png",
                    url: "https://giurie-risultati.sistematregoccedoro.it/login",
                    repo: "https://giurie-risultati.sistematregoccedoro.it/login"
                },
                {
                    title: "Miss Convenienza 3D",
                    description: "Applicazione PWA per la visualizzazione e il render grafico 3D di elettrodomestici in ambienti domestici personalizzabili.",
                    tags: ["React", "Three.js", "PWA", "3D Rendering"],
                    image: "/projects/miss_convenienza.png",
                    url: "http://miss-convenienza-3d-pwa.vercel.app/",
                    repo: "https://github.com/francimolli"
                },
                {
                    title: "L'Hobbysta Verbania",
                    description: "Sito e catalogo digitale per lo storico negozio di hobbistica, belle arti e modellismo di Verbania.",
                    tags: ["Next.js", "E-commerce", "Local Marketing", "SEO"],
                    image: "/projects/hobbysta.jpeg",
                    url: "https://www.hobbystaverbania.it/",
                    repo: "https://www.hobbystaverbania.it/"
                },
                {
                    title: "Stissi Studio",
                    description: "Sito web professionale con ottimizzazione SEO, hosting dedicato e sviluppo custom in HTML/SCSS/PHP.",
                    tags: ["WORDPRESS", "HTML", "SCSS", "PHP", "SEO", "JS"],
                    image: "/projects/stissi.jpg",
                    url: "https://stissistudio.it/",
                    repo: "https://stissistudio.it/"
                },
                {
                    title: "Ristorante Italia",
                    description: "Sito web elegante per lo storico ristorante dell'Isola dei Pescatori. Ottimizzazione SEO locale e gestione della presenza digitale.",
                    tags: ["HTML", "SCSS", "JS", "SEO", "Local Marketing", "WORDPRESS"],
                    image: "/projects/italia.jpg",
                    url: "https://www.ristoranteitalia.eu/",
                    repo: "https://www.ristoranteitalia.eu/"
                },
                {
                    title: "Motorlaghi",
                    description: "Showroom digitale e piattaforma di vendita per auto di lusso e prestazione.",
                    tags: ["Next.js", "Tailwind CSS", "Automotive", "Showroom"],
                    image: "/projects/motorlaghi.avif",
                    url: "https://www.motorlaghi.com/",
                    repo: "https://www.motorlaghi.com/"
                },
                {
                    title: "56MX",
                    description: "Piattaforma e-commerce per componenti e accessori moto da cross. Design moderno e funzionalità avanzate di ricerca e filtro.",
                    tags: ["Next.js", "React", "Node.js", "Express", "MongoDB", "Socket.io"],
                    image: "/projects/56mx.png",
                    url: "https://www.56mx.it/",
                    repo: "https://github.com/francimolli/56mx-ecommerce"
                }
            ]
        },
        contact: {
            labelCTA: "INVIA UN MESSAGGIO",
            sectionTitle: "Dall'idea nasce",
            sectionTitleSuffix: "la magia.",
            subtitle: "Contatti",
            description: "Scrivimi direttamente.",
            openForOpportunities: "IN ASCOLTO",
            lets: "Tessere insieme",
            initialize: "il tuo incantesimo.",
            directUplink: "Scrivi un messaggio",
            primaryEmail: "Email",
            instantMessaging: "Scrivimi qui, potrei risponderti prima del previsto",
            publicNodes: "Altri canali",
            followUpdates: "Instagram",
            location: "Vivo in Italia",
            systemStatus: "ARALDO IN ASCOLTO",
            processingData: "STUDIANDO GLI ASTRI",
            name: "Nome",
            email: "Email",
            message: "Messaggio",
            send: "Invia Messaggio",
            placeholderName: "Il tuo nome",
            placeholderEmail: "tua@email.com",
            placeholderMessage: "Raccontami della tua idea...",
        },
        music: {
            sectionTitle: "QUALCHE ARTISTA CHE ASCOLTO",
            items: [
                {
                    name: "Caparezza",
                    genre: "Alternative Hip Hop / Rock",
                    description: "Un visionario della scena italiana, noto per i suoi testi colti e uno stile eclettico che unisce rap, rock e teatro."
                },
                {
                    name: "Bassi Maestro",
                    genre: "Hip Hop / Lo-Fi",
                    description: "Una leggenda del rap italiano. Rapper, DJ e produttore che ha plasmato il suono dell'underground per decenni, ora anche esploratore di sonorità Lo-Fi."
                },
                {
                    name: "System of a Down",
                    genre: "Alternative Metal",
                    description: "La band che ha ridefinito il metal. Energia caotica, testi visionari e un mix unico di riff potenti e melodie tradizionali armene."
                },
                {
                    name: "The Beatles",
                    genre: "Rock / Pop",
                    description: "I pionieri che hanno cambiato la storia della musica moderna, portando l'innovazione in studio e melodie immortali alla cultura pop."
                },
                {
                    name: "Ludwig van Beethoven",
                    genre: "Musica Classica / Romantica",
                    description: "La forza della natura fatta musica. Un ponte tra classicismo e romanticismo, capace di esprimere eroismo e profondità umana."
                },
                {
                    name: "Johann Sebastian Bach",
                    genre: "Musica Barocca",
                    description: "L'architetto del suono. La perfezione matematica delle sue fughe e la profondità spirituale delle sue composizioni restano insuperate."
                }
            ]
        },
        header: {
            status: {
                awake: "è giorno qui",
                asleep: "è notte qui",
            },
            controls: {
                systemConfiguration: "Consiglio degli Anziani",
                restoreDefaults: "Azzera gli Incantesimi",
                cooldown: "Ricarica",
                localization: "Localizzazione",
                escapeTooltip: "Portale verso l'ignoto",
                timeOfDay: "Orario Locale",
                systemControls: "Controlli Magici",
                localTime: "Ora Locale",
                timeWarp: "Flusso del Tempo",
                traffic: "Densità",
                invertX: "Inverti Controllo X",
                invertY: "Inverti Controllo Y",
                sound: "Canto delle Sfere",
            },
        },
        hud: {
            missionTime: "Tempo di Volo",
            systemStatus: "Magia",
            statusNormal: "EQUILIBRIO",
            statusExploring: "ATTRAVERSANDO IL VELO",
            statusRebooting: "SIGILLO IN ATTIVAZIONE",
            statusBlackout: "PORTALE APERTO",
            move: "MUOVI",
            lookFly: "GUARDA/VOLA",
            initializing: "CARICAMENTO SISTEMA A0BK4TTO-14AKQO10-00G1A4D9-H1JPKF IN CORSO...",
            spaceExploration: "Viaggio Astrale",
            enjoyTheJourney: "Uno splendido cosmo ti attende. Esplora e scopri i segreti nascosti. (PER TORNARE RAPIDAMENTE AL CENTRO DEL COSMO PREMI L'ICONA DEL PORTALE VIOLA)",
            tutorial: {
                move: "USA I TASTI WASD OPPURE LE FRECCE PER MUOVERTI",
                dismiss: "PREMI SPAZIO PER CHIUDERE",
                artifacts: {
                    title: "RELIQUIE & MISTERI",
                    description: "Esplora il cosmo per trovare antiche reliquie, sbloccare poteri e ottenere favori magici."
                },
                logbook: {
                    title: "IL GRIMORIO",
                    description: "Tieni traccia delle tue scoperte e delle reliquie sbloccate nel menu del Grimorio."
                },
                continue: "CLICCA O PREMI SPAZIO"
            }
        },
        logbook: {
            title: "Il Grimorio",
            tab1: "Rotte",
            tab2: "Reliquie",
            tab3: "Incantesimi",
            copy: "INVIA PERGAMENA",
            copied: "INVIATA",
            help: {
                navTitle: "01. ROTTE DEL COSMO",
                navDesc: "Usa i portali colorati per viaggiare tra le stelle. Controlli avanzati (Tempo, Suono, Config) sono nella Header (Desktop) o nel Menu laterale (Mobile).",
                secretsTitle: "02. CACCIA ALLE RELIQUIE",
                secretsDesc: "Individua le anomalie visive nel cosmo. Avvicinati a < 15 AU per decifrare i messaggi nascosti.",
                redeemTitle: "03. RISCATTO DEL FAVORE",
                redeemDesc: "Copia il codice della reliquia e invialo per attivare i benefici nel mondo reale.",
                controlsTitle: "04. PERGAMENA DEI CONTROLLI",
                controlsDesc: "[WASD] Movimento - [SPACE] Accelerazione - [CLICK] Analizza Waypoint.",
                footer: "Archivio delle Arti Arcane v3.14 // SETTORE SOLIS // SILENZIO ASSOLUTO"
            }
        },
        onboarding: {
            loadingText: "BENVENUTO NEL COSMO DI FRANCESCO",
            creator: "su un piccolo pianeta che orbita attorno a questa giungla. Sono un ingegnere con l'anima di un esploratore. Buon viaggio!",
            immersive: {
                title: "Viaggiatore dell'Universo",
                description: "Esplora il cosmo in 3D. Scopri reliquie antiche, naviga tra le stelle e trova misteri nascosti.",
                tag: "AVVENTURA",
                recommendation: "[ MAGICO MA PIÙ MISTERIOSO ]"
            },
            classic: {
                title: "Rapido e Preciso",
                description: "Interfaccia essenziale e immediata. Vai dritto alla meta senza distrazioni.",
                tag: "ESSENZIALE",
                recommendation: "[ CHIARO E IMMEDIATO ]"
            },
            technical: {
                title: "Archivio delle Competenze",
                description: "Accesso diretto al sentiero professionale e alle arti ingegneristiche.",
                tag: "ESPERIENZA",
            },
            uplink: {
                title: "Inizia un Dialogo",
                description: "Contatto diretto. Manda un messaggio per collaborazioni e avventure creative.",
                tag: "CONTATTO",
            },
            projects: {
                title: "Galleria delle Creazioni",
                description: "Esplora la raccolta dei lavori selezionati e delle realizzazioni più significative.",
                tag: "PORTFOLIO",
            },
            footer: "mappa astrale in aggiornamento..."
        },
        secrets: {
            alert: {
                wow: "Reliquia scoperta!",
            },
            satellite: {
                title: "Cristallo di Kepler",
                description: "Vantaggio: Bonus 10% su Consulenza Tecnica. [Fai uno screenshot e invialo]",
                message: "SEGNALE DECIFRATO: BONUS 10% RILEVATO",
                copyText: "Ho trovato il Cristallo di Kepler. Richiedo Bonus Consulenza. Codice: SAT-ORBIT-77"
            },
            monolith: {
                title: "La Pietra Oscura",
                description: "Vantaggio: Sconto 15% sul primo progetto. [Fai uno screenshot e invialo]",
                message: "RELIQUIA ANALIZZATA: SCONTO 15% ATTIVATO",
                copyText: "Ho analizzato la Pietra Oscura. Richiedo Sconto 15%. Codice: MONO-ORBIT-15"
            },
            void_ship: {
                title: "Il Vascello Errante",
                description: "Vantaggio: Audit Tecnico Gratuito (SEO/Perf). [Fai uno screenshot e invialo]",
                message: "MESSAGGIO RECUPERATO: AUDIT TECNICO DISPONIBILE",
                copyText: "Ho scoperto il Vascello Errante. Richiedo Audit Gratuito. Codice: VOID-ORBIT-X"
            }
        },
        roadmap: {
            title: "PROFEZIA IN ELABORAZIONE",
            description: "Le stelle stanno rivelando il sentiero...",
        }
    },
    en: {
        universe: {
            planets: {
                casa: "Home",
                officina: "Workshop",
                galleria: "Gallery",
                faro: "Lighthouse",
                giardino: "Sound Garden",
                osservatorio: "Observatory",
                cantiere: "Worksite",
                segreto: "???",
            },
            hint: "WASD or arrows to fly · click a little planet to visit it",
            eggMessage: "The little creatures love you: a secret planet has revealed itself!",
            guide: {
                title: "The Guardian Firefly",
                found: "A firefly has found you: beyond this dark there's nothing left…",
                escort: "The firefly lights the way: back toward the little planets ✦",
            },
            tour: {
                stop: "stop",
                land: "Land ✦",
                paused: "tour paused — resuming in a moment",
                finaleTitle: "End of the journey",
                finaleText: "Thanks for flying with me among the little planets. If something stuck with you, write me: the Lighthouse is always on.",
                finaleCta: "Write me ✦",
                captions: {
                    casa: "It all starts here: a little house, a lamppost, and the calm of a small planet. This is where I live.",
                    officina: "Gears, sparks and a tireless crane: my professional path, one bolt at a time.",
                    galleria: "Paintings in slow orbit: the creations I'm proudest of, on permanent display.",
                    giardino: "Plants that play and mushrooms that glow: here I grow music, my other half.",
                    osservatorio: "A telescope aimed at the markets: numbers dancing like constellations, in the Emporium.",
                    cantiere: "Beams, cranes and ideas under construction: the Oracle keeps what comes next.",
                    faro: "The Lighthouse stays on for every traveller: if you'd like to talk, land here.",
                    segreto: "Shhh. This place isn't on any map: you earned it.",
                },
            },
            phrases: [
                "Hi! So nice to see you around here!",
                "Francesco built all of this with his own hands!",
                "They say he even codes in his dreams…",
                "Here, time flows the way you decide.",
                "Francesco makes music too, did you know?",
                "They say three strange objects drift between the planets…",
            ],
        },
        nav: {
            home: "Home",
            about: "About",
            timeline: "Path",
            portfolio: "Creations",
            contact: "Contact",
            music: "Music",
            market: "Emporium",
            roadmap: "Oracle",
        },
        hero: {
            role: "Web",
            roleSuffix: "Engineer",
            headline: "Art-|-Code",
            description: "Enchanted architectures for the web. Magic, performance, experience.",
            ctaWork: "Path of Experience",
            ctaContact: "Send a Message",
        },
        about: {
            title: "Profile",
            headline: "Passionate about",
            headlineSuffix: "Software Engineer - Passionate about Making (Hardware)",
            bio1: "From architectural design to software development. Drummer and music enthusiast, for many years a member of the Baveno Musical Band.",
            bio2: "My goal is to bridge engineering and business development. I organise jam sessions and experiment with new sounds at [jamsession.me](https://jamsession.me).",
            techStack: "Magical Tools",
            techStackLoading: "LOADING INVENTORY...",
            ageLabel: "years",
            imageAlt: "Francesco Mollica",
        },
        projects: {
            sectionTitle: "Professional Path",
            sectionSubtitle: "Experience",
            preview: "Role",
            demo: "Company",
            code: "Details",
            totalObjects: "Total Projects",
            items: [
                {
                    title: "Senior Web Analyst",
                    company: "BitBang",
                    period: "Jan 2024 - Present",
                    description: "Architect and implement enterprise data collection strategies with Google Tag Manager and Adobe Analytics for large-scale clients. Advanced tracking scripts (JavaScript, DOM) with strict data integrity, custom Python utilities for automated data extraction, audit validation and analytics pipeline monitoring, across virtualized and cloud environments (VMware, Azure, AWS).",
                    tags: ["Google Tag Manager", "Adobe Analytics", "JavaScript", "Python", "Data Integrity", "Azure", "AWS"],
                    url: "https://bitbang.com/",
                },
                {
                    title: "Full-Stack & Backend Engineer",
                    company: "Freelance",
                    period: "Feb 2021 - Present",
                    description: "Architect full-stack web applications with robust Python backends (FastAPI, Flask, Django) on PostgreSQL: REST APIs, background task queues and data processing utilities. React/Next.js frontends with strict TypeScript across full codebases. Autonomous ownership of the whole project lifecycle, from requirements to Docker containerization and cloud release.",
                    tags: ["Python", "FastAPI", "Django", "PostgreSQL", "React", "Next.js", "TypeScript", "Docker"],
                    url: "https://github.com/francimolli",
                },
                {
                    title: "Front-end & Backend Web Developer",
                    company: "Strixia",
                    period: "Nov 2021 - Dec 2023",
                    description: "Python backend services and automation utilities (CLI tools, web scraping, file parsers, cron schedulers) for internal workflows and API integrations. Complex web apps in React/Next.js/TypeScript with end-to-end SEO and Core Web Vitals optimization, Docker environments and version-controlled releases across heterogeneous stacks (Laravel, WordPress). Mentored junior developers through structured learning paths and pair programming.",
                    tags: ["Python", "React", "Next.js", "TypeScript", "SEO", "Core Web Vitals", "Docker", "Mentoring"],
                    url: "",
                },
                {
                    title: "Software Developer",
                    company: "Altea Federation",
                    period: "Apr 2021 - Sep 2021",
                    description: "Authored PowerShell automation utilities for cross-system ERP data synchronization, batch processing and Microsoft infrastructure workflow automation, optimizing operational efficiency.",
                    tags: ["PowerShell", "ERP", "Batch Processing", "Microsoft", "Workflow Automation"],
                    url: "https://alteafederation.it/",
                },
                {
                    title: "AI Research Intern",
                    company: "ENEA",
                    period: "Oct 2020 - Mar 2021",
                    description: "Engineered Python scientific computing & AI utilities for training, evaluating and deploying neural network architectures (TensorFlow, Keras, NumPy, Pandas) applied to scientific research. Configured and managed an end-to-end AI development environment (Linux VM) on the ENEA CRESCO HPC infrastructure.",
                    tags: ["Python", "TensorFlow", "Keras", "NumPy", "Pandas", "Linux", "HPC"],
                    url: "https://enea.it/",
                },
                {
                    title: "Service Desk Specialist",
                    company: "KPMG",
                    period: "Nov 2016 - Apr 2017",
                    description: "Contributed to an internal .NET web application and engineered Python & PowerShell automation scripts for ticket routing, log parsing and incident resolution workflows.",
                    tags: [".NET", "Python", "PowerShell", "Workflow Automation"],
                    url: "https://kpmg.it/",
                }
            ],
        },
        portfolio: {
            sectionTitle: "Gallery of Creations",
            sectionSubtitle: "Showcase",
            viewProject: "VIEW PROJECT",
            viewCode: "SOURCE CODE",
            items: [
                {
                    title: "Portfolio",
                    description: "An interactive 3D universe built with Three.js and React. Cosmic exploration, hidden relics, and a grimoire menu.",
                    tags: ["Three.js", "React", "Next.js", "Framer Motion"],
                    image: "/projects/orbit.png",
                    url: "https://github.com/francimolli",
                    repo: "https://github.com/francimolli/"
                },
                {
                    title: "MR Real Estate",
                    description: "Premium website and real estate platform for a luxury agency on Lake Maggiore. Built with Next.js, featuring advanced property search, 3D virtual tour integration, and a sleek, minimal design.",
                    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Real Estate", "3D Virtual Tour"],
                    image: "/projects/orbit.png",
                    url: "https://www.mrealestate.it/",
                    repo: "https://github.com/francimolli/"
                },
                {
                    title: "Jam Session",
                    description: "Web platform for musicians who want to organise or join jam sessions. Search, booking, and music event management features.",
                    tags: ["Next.js", "React", "Node.js", "Express", "MongoDB", "Socket.io"],
                    image: "/projects/jam_session.png",
                    url: "https://jamsession.me/",
                    repo: "https://github.com/francimolli/"
                },
                {
                    title: "Tre Gocce d'Oro - Evaluation",
                    description: "Next.js platform for honey sensory evaluation. Designed for the National Honey Observatory with a real-time technical interface.",
                    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Shadcn UI"],
                    image: "/projects/miele_valutazione.png",
                    url: "https://giurie-valutazione.sistematregoccedoro.it/login",
                    repo: "https://giurie-valutazione.sistematregoccedoro.it/login"
                },
                {
                    title: "Game of The Mad Goose",
                    description: "Built in C++ for the first year of a Computer Science degree, with unusual rules. Great for curious beginners looking for simple code.",
                    tags: ["C++", "OpenGL", "Game Development"],
                    image: "/projects/oca.png",
                    url: "https://github.com/francimolli/GameOfTheMadGoose/blob/master/README.md",
                    repo: "https://github.com/francimolli/GameOfTheMadGoose/blob/master/README.md"
                },
                {
                    title: "Tre Gocce d'Oro - Jury",
                    description: "Real-time results display dashboard and statistical analysis for the National 'Grandi Mieli d'Italia' competition.",
                    tags: ["Next.js", "TypeScript", "Laravel", "Load Balancing", "Tailwind CSS", "Real-time Data"],
                    image: "/projects/miele_risultati.png",
                    url: "https://giurie-risultati.sistematregoccedoro.it/login",
                    repo: "https://giurie-risultati.sistematregoccedoro.it/login"
                },
                {
                    title: "Miss Convenienza 3D",
                    description: "PWA application for 3D visualisation and graphic rendering of household appliances in customisable home environments.",
                    tags: ["React", "Three.js", "PWA", "3D Rendering"],
                    image: "/projects/miss_convenienza.png",
                    url: "http://miss-convenienza-3d-pwa.vercel.app/",
                    repo: "https://github.com/francimolli"
                },
                {
                    title: "L'Hobbysta Verbania",
                    description: "E-commerce website and digital catalogue for the historic hobby, fine arts, and modelling shop in Verbania.",
                    tags: ["WORDPRESS", "E-commerce", "Local Marketing", "SEO"],
                    image: "/projects/hobbysta.jpeg",
                    url: "https://www.hobbystaverbania.it/",
                    repo: "https://www.hobbystaverbania.it/"
                },
                {
                    title: "Stissi Studio",
                    description: "Professional website with SEO optimisation, dedicated hosting, and custom development in HTML/SCSS/PHP.",
                    tags: ["HTML", "SCSS", "PHP", "SEO"],
                    image: "/projects/stissi.jpg",
                    url: "https://stissistudio.it/",
                    repo: "https://stissistudio.it/"
                },
                {
                    title: "Ristorante Italia",
                    description: "Elegant website for the historic restaurant on Isola dei Pescatori. Local SEO optimisation and digital presence management.",
                    tags: ["HTML", "SCSS", "JS", "SEO", "Local Marketing", "WORDPRESS"],
                    image: "/projects/italia.jpg",
                    url: "https://www.ristoranteitalia.eu/",
                    repo: "https://www.ristoranteitalia.eu/"
                },
                {
                    title: "Motorlaghi",
                    description: "Digital showroom and sales platform for luxury and performance cars.",
                    tags: ["Next.js", "Tailwind CSS", "Automotive", "Showroom"],
                    image: "/projects/motorlaghi.avif",
                    url: "https://www.motorlaghi.com/",
                    repo: "https://www.motorlaghi.com/"
                },
                {
                    title: "56MX",
                    description: "E-commerce platform for selling motocross bike components and accessories. Modern design and advanced search and filter features.",
                    tags: ["Next.js", "React", "Node.js", "Express", "MongoDB", "Socket.io"],
                    image: "/projects/56mx.png",
                    url: "https://www.56mx.it/",
                    repo: "https://github.com/francimolli/56mx-ecommerce"
                }
            ]
        },
        contact: {
            labelCTA: "SEND A MESSAGE",
            sectionTitle: "From a spark",
            sectionTitleSuffix: "magic begins.",
            subtitle: "Contacts",
            description: "Write me directly.",
            openForOpportunities: "LISTENING",
            lets: "Weave together",
            initialize: "your enchantment.",
            directUplink: "Send a Message",
            primaryEmail: "Email",
            instantMessaging: "Write me here — I might reply sooner than you expect",
            publicNodes: "Other channels",
            followUpdates: "Instagram",
            location: "Based in Italy",
            name: "Name",
            email: "Email",
            message: "Message",
            send: "Send Message",
            placeholderName: "Your Name",
            placeholderEmail: "you@email.com",
            placeholderMessage: "Tell me about your idea...",
            systemStatus: "HERALD LISTENING",
            processingData: "READING THE STARS...",
        },
        music: {
            sectionTitle: "SOME ARTISTS I LISTEN TO",
            items: [
                {
                    name: "Caparezza",
                    genre: "Alternative Hip Hop / Rock",
                    description: "A visionary of the Italian scene, known for his cultured lyrics and an eclectic style that blends rap, rock, and theatre."
                },
                {
                    name: "Bassi Maestro",
                    genre: "Hip Hop / Lo-Fi",
                    description: "A legend of Italian rap. Rapper, DJ, and producer who shaped the underground sound for decades, now also an explorer of Lo-Fi sounds."
                },
                {
                    name: "System of a Down",
                    genre: "Alternative Metal",
                    description: "The band that redefined metal. Chaotic energy, visionary lyrics, and a unique mix of heavy riffs and traditional Armenian melodies."
                },
                {
                    name: "The Beatles",
                    genre: "Rock / Pop",
                    description: "The pioneers who changed the history of modern music, bringing studio innovation and immortal melodies to pop culture."
                },
                {
                    name: "Ludwig van Beethoven",
                    genre: "Classical / Romantic",
                    description: "The force of nature turned into music. A bridge between classicism and romanticism, capable of expressing human heroism and depth."
                },
                {
                    name: "Johann Sebastian Bach",
                    genre: "Baroque",
                    description: "The architect of sound. The mathematical perfection of his fugues and the spiritual depth of his compositions remain unsurpassed."
                }
            ]
        },
        header: {
            status: {
                awake: "daytime here",
                asleep: "nighttime here",
            },
            controls: {
                systemConfiguration: "Council of Elders",
                restoreDefaults: "Reset All Spells",
                cooldown: "Cooldown",
                localization: "Localization",
                escapeTooltip: "Portal to the unknown",
                timeOfDay: "Local Time",
                systemControls: "Magical Controls",
                localTime: "Local Time",
                timeWarp: "Flow of Time",
                traffic: "Density",
                invertX: "Invert Control X",
                invertY: "Invert Control Y",
                sound: "Song of the Spheres",
            },
        },
        hud: {
            missionTime: "Flight Time",
            systemStatus: "Magic",
            statusNormal: "BALANCED",
            statusExploring: "CROSSING THE VEIL",
            statusRebooting: "SEAL ACTIVATING",
            statusBlackout: "PORTAL OPEN",
            move: "MOVE",
            lookFly: "LOOK/FLY",
            initializing: "SYSTEM LOADING A0BK4TTO-14AKQO10-00G1A4D9-H1JPKF IN PROGRESS...",
            spaceExploration: "Astral Journey",
            enjoyTheJourney: "A beautiful cosmos awaits you. Explore and discover hidden secrets. (TO QUICKLY RETURN TO THE COSMOS CENTRE, PRESS THE VIOLET PORTAL ICON)",
            tutorial: {
                move: "USE WASD OR ARROW KEYS TO MOVE",
                dismiss: "PRESS SPACE TO DISMISS",
                artifacts: {
                    title: "RELICS & MYSTERIES",
                    description: "Explore the cosmos to find ancient relics, unlock powers, and receive magical favours."
                },
                logbook: {
                    title: "THE GRIMOIRE",
                    description: "Track your discoveries and unlocked relics in the Grimoire menu."
                },
                continue: "CLICK OR PRESS SPACE"
            }
        },
        logbook: {
            title: "The Grimoire",
            tab1: "Routes",
            tab2: "Relics",
            tab3: "Spells",
            copy: "SEND SCROLL",
            copied: "SENT",
            help: {
                navTitle: "01. COSMIC ROUTES",
                navDesc: "Use coloured portals to travel between the stars. Advanced controls (Time, Sound, Config) are in the Header (Desktop) or Side Menu (Mobile).",
                secretsTitle: "02. RELIC HUNT",
                secretsDesc: "Locate visual anomalies in the cosmos. Approach within < 15 AU to decipher hidden messages.",
                redeemTitle: "03. FAVOUR REDEMPTION",
                redeemDesc: "Copy the relic code and send it to activate real-world benefits.",
                controlsTitle: "04. SCROLL OF CONTROLS",
                controlsDesc: "[WASD] Movement - [SPACE] Acceleration - [CLICK] Analyse Waypoint.",
                footer: "Archive of Arcane Arts v3.14 // SOLIS SECTOR // ABSOLUTE SILENCE"
            }
        },
        onboarding: {
            loadingText: "WELCOME TO FRANCESCO'S COSMOS",
            creator: "on a small planet orbiting this jungle. I'm an engineer with the soul of an explorer. I built this portfolio as an interactive universe to discover, with hidden relics and mysteries to unveil. Enjoy the journey!",
            immersive: {
                title: "Traveller of the Universe",
                description: "Explore the cosmos in 3D. Discover ancient relics, navigate the stars, and find hidden mysteries.",
                tag: "ADVENTURE",
                recommendation: "[ MAGICAL BUT MORE MYSTERIOUS ]"
            },
            classic: {
                title: "Quick and Precise",
                description: "A clean, immediate interface. Get straight to the point without distractions.",
                tag: "ESSENTIAL",
                recommendation: "[ CLEAR AND IMMEDIATE ]"
            },
            technical: {
                title: "Archive of Skills",
                description: "Direct access to the professional path and engineering arts.",
                tag: "EXPERIENCE",
            },
            uplink: {
                title: "Start a Dialogue",
                description: "Direct contact. Send a message for collaborations and creative adventures.",
                tag: "CONTACT",
            },
            projects: {
                title: "Gallery of Creations",
                description: "Explore the collection of selected works and most meaningful achievements.",
                tag: "PORTFOLIO",
            },
            footer: "astral map updating..."
        },
        secrets: {
            alert: {
                wow: "Relic discovered!",
            },
            satellite: {
                title: "Kepler Crystal",
                description: "Perk: 10% Bonus on Technical Consulting. [Take a screenshot and send it]",
                message: "SIGNAL DECIPHERED: 10% BONUS DETECTED",
                copyText: "I found the Kepler Crystal. Requesting Consulting Bonus. Code: SAT-ORBIT-77"
            },
            monolith: {
                title: "The Dark Stone",
                description: "Perk: 15% Discount on first project. [Take a screenshot and send it]",
                message: "RELIC ANALYSED: 15% DISCOUNT ACTIVATED",
                copyText: "I analysed the Dark Stone. Requesting 15% Discount. Code: MONO-ORBIT-15"
            },
            void_ship: {
                title: "The Wandering Vessel",
                description: "Perk: Free Technical Audit (SEO/Perf). [Take a screenshot and send it]",
                message: "MESSAGE RECOVERED: TECHNICAL AUDIT AVAILABLE",
                copyText: "I discovered the Wandering Vessel. Requesting Free Audit. Code: VOID-ORBIT-X"
            }
        },
        roadmap: {
            title: "PROPHECY UNFOLDING",
            description: "The stars are revealing the path...",
        }
    },
};

export type Language = "it" | "en";
export type Translation = typeof translations.it;
