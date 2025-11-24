export const translations = {
    it: {
        nav: {
            about: "Chi Sono",
            work: "Progetti",
            contact: "Contatti",
        },
        hero: {
            role: "Web Developer",
            roleSuffix: "& Analyst.",
            headline: "Data-Driven",
            description: "Specializzato in strategie di data collection e soluzioni tecniche efficienti. Colmo il divario tra sviluppo e business insights.",
            ctaWork: "Progetti Selezionati",
            ctaContact: "Contattami",
        },
        about: {
            title: "Chi Sono",
            headline: "Professionista IT focalizzato su",
            headlineSuffix: "dati & sviluppo",
            bio1: "Sono un Web Analyst e Developer con 5 anni di esperienza e una laurea in Informatica. Mi specializzo nello sviluppo software orientato ai dati, utilizzando le mie competenze analitiche per comprendere l'impatto del software.",
            bio2: "Attualmente lavoro in BitBang, dove progetto e implemento strategie di data collection enterprise. Il mio background include sviluppo full-stack con Python e JavaScript, ed esperienza specifica in Intelligenza Artificiale (Reti Neurali).",
            techStack: "Competenze Chiave",
            imageAlt: "Ritratto di Francesco Mollica",
        },
        projects: {
            sectionTitle: "Progetti Recenti",
            sectionSubtitle: "Lavori Selezionati",
            preview: "Anteprima Progetto",
            demo: "Demo Live",
            code: "Codice",
            items: [
                {
                    title: "Web Analyst @ BitBang",
                    description: "Progettazione e implementazione di strategie di data collection enterprise usando Google Tag Manager e Adobe Analytics. Garanzia dell'integrità dei dati per il tracciamento del comportamento utente.",
                },
                {
                    title: "Sviluppatore Web Freelance",
                    description: "Sviluppo di applicazioni web scalabili con React e Next.js. Focus sulla strict type safety con TypeScript e architettura del codice robusta.",
                },
                {
                    title: "Frontend Developer @ Strixia",
                    description: "Progettazione e deployment di web application complesse. Guida allo sviluppo di soluzioni e-commerce e mentorship di sviluppatori junior.",
                },
                {
                    title: "Ricerca AI @ ENEA",
                    description: "Sviluppo di algoritmi Python per il training di reti neurali (TensorFlow, Keras) applicati alla ricerca scientifica. Gestione ambienti di sviluppo AI su infrastruttura HPC.",
                },
            ],
        },
        contact: {
            sectionTitle: "Iniziamo una",
            sectionTitleSuffix: "conversazione.",
            subtitle: "Contatti",
            description: "Interessato a lavorare insieme? Compila il form o mandami una email direttamente a",
            name: "Nome",
            email: "Email",
            message: "Messaggio",
            send: "Invia Messaggio",
            placeholderName: "Mario Rossi",
            placeholderEmail: "m@esempio.com",
            placeholderMessage: "Il tuo messaggio...",
        },
    },
    en: {
        nav: {
            about: "About",
            work: "Work",
            contact: "Contact",
        },
        hero: {
            role: "Web Developer",
            roleSuffix: "& Analyst.",
            headline: "Data-Driven",
            description: "Specialized in data collection strategies and building efficient technical solutions. Bridging the gap between development and business insights.",
            ctaWork: "Selected Works",
            ctaContact: "Contact Me",
        },
        about: {
            title: "About",
            headline: "IT Professional with a focus on",
            headlineSuffix: "data & development",
            bio1: "I am a Web Analyst and Developer with 5 years of experience and a degree in Computer Science. I specialize in data-oriented software development, using my analytical skills to understand software impact.",
            bio2: "Currently working at BitBang, I design and implement enterprise data collection strategies. My background includes full-stack development with Python and JavaScript, and specific experience in Artificial Intelligence (Neural Networks).",
            techStack: "Core Competencies",
            imageAlt: "Francesco Mollica Portrait",
        },
        projects: {
            sectionTitle: "Recent Projects",
            sectionSubtitle: "Selected Works",
            preview: "Project Preview",
            demo: "Live Demo",
            code: "View Code",
            items: [
                {
                    title: "Web Analyst @ BitBang",
                    description: "Designing and implementing enterprise data collection strategies using Google Tag Manager and Adobe Analytics. Ensuring data integrity for user behavior tracking.",
                },
                {
                    title: "Freelance Web Developer",
                    description: "Developing scalable web applications with React and Next.js. Focusing on strict type safety with TypeScript and robust code architecture.",
                },
                {
                    title: "Frontend Developer @ Strixia",
                    description: "Architected and deployed complex web applications. Spearheaded e-commerce solutions and mentored junior developers.",
                },
                {
                    title: "AI Research @ ENEA",
                    description: "Developed Python algorithms for neural network training (TensorFlow, Keras) applied to scientific research. Managed AI development environments on HPC infrastructure.",
                },
            ],
        },
        contact: {
            sectionTitle: "Let's start a",
            sectionTitleSuffix: "conversation.",
            subtitle: "Contact",
            description: "Interested in working together? Fill out the form or send me an email directly at",
            name: "Name",
            email: "Email",
            message: "Message",
            send: "Send Message",
            placeholderName: "John Doe",
            placeholderEmail: "m@example.com",
            placeholderMessage: "Your message...",
        },
    },
};

export type Language = "it" | "en";
export type Translation = typeof translations.it;
