export type HomepageLang = 'en' | 'fr';

export interface HomepageCopy {
  nav: { home: string; about: string; contact: string; login: string };
  hero: {
    titleLine1: string;
    titleHighlight: string;
    desc: string;
    statStudents: string;
    statPrograms: string;
    statPartnerships: string;
    statEmployment: string;
    scroll: string;
  };
  numbers: { label: string; title: string; stats: { title: string; subtitle: string }[] };
  why: {
    badge: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    intro: string;
    features: { title: string; text: string }[];
  };
  stories: { label: string; title: string };
  partners: {
    label: string;
    title: string;
    desc: string;
    corporate: string;
    academic: string;
  };
  footer: {
    about: string;
    quickLinks: string;
    resources: string;
    newsletter: string;
    newsletterDesc: string;
    emailPlaceholder: string;
    subscribe: string;
    links: {
      about: string;
      research: string;
      alumni: string;
      calendar: string;
      portal: string;
      library: string;
      career: string;
      international: string;
      it: string;
    };
    copyright: string;
    privacy: string;
    terms: string;
    accessibility: string;
    sitemap: string;
  };
  testimonials: {
    quote: string;
    name: string;
    role: string;
    education: string;
    initials: string;
  }[];
}

export const HOMEPAGE_I18N: Record<HomepageLang, HomepageCopy> = {
  en: {
    nav: { home: 'Home', about: 'About Us', contact: 'Contact', login: 'Log In' },
    hero: {
      titleLine1: 'Shape the Future',
      titleHighlight: 'with ESPRIT',
      desc:
        "Join Tunisia's leading engineering & technology university. Innovate, collaborate, and build the future with cutting-edge programs, international partnerships, and world-class facilities.",
      statStudents: 'Students',
      statPrograms: 'Programs',
      statPartnerships: 'Partnerships',
      statEmployment: 'Employment Rate',
      scroll: 'SCROLL'
    },
    numbers: {
      label: 'BY THE NUMBERS',
      title: 'ESPRIT in Numbers',
      stats: [
        { title: 'Students Enrolled', subtitle: 'Across all programs' },
        { title: 'Academic Programs', subtitle: 'Engineering & business' },
        { title: 'International Partners', subtitle: 'Universities & companies' },
        { title: 'Graduate Employment', subtitle: 'Within 6 months' },
        { title: 'Years of Excellence', subtitle: 'Founded in 1999' }
      ]
    },
    why: {
      badge: 'WHY CHOOSE US',
      titleBefore: 'Education That ',
      titleHighlight: 'Transforms',
      titleAfter: ' Careers',
      intro:
        "At ESPRIT, we combine rigorous academic standards with real-world experience. Our students graduate ready to lead innovation in Tunisia and across the globe. Here's what sets us apart.",
      features: [
        {
          title: 'International Education',
          text: 'Double degrees and exchange programs with partner universities in France, Germany, Canada, and the USA.'
        },
        {
          title: 'Innovation Labs',
          text: 'State-of-the-art research labs, Fab Labs, and maker spaces equipped with the latest technology.'
        },
        {
          title: 'Industry Partnerships',
          text: 'Direct connections with 200+ companies for internships, projects, and employment opportunities.'
        },
        {
          title: 'Career Excellence',
          text: 'Dedicated career center with 94% graduate employment rate within 6 months of graduation.'
        }
      ]
    },
    stories: { label: 'STUDENT STORIES', title: 'What Our Alumni Say' },
    partners: {
      label: 'OUR NETWORK',
      title: 'Industry & Academic Partners',
      desc: 'Building bridges between academia and industry to create real-world impact.',
      corporate: 'CORPORATE PARTNERS',
      academic: 'ACADEMIC PARTNERSHIPS'
    },
    footer: {
      about:
        "ESPRIT – École Supérieure Privée d'Ingénierie et de Technologies. Tunisia's leading private engineering and technology school.",
      quickLinks: 'QUICK LINKS',
      resources: 'RESOURCES',
      newsletter: 'NEWSLETTER',
      newsletterDesc: 'Stay updated on events and university news.',
      emailPlaceholder: 'your@email.com',
      subscribe: 'Subscribe',
      links: {
        about: 'About ESPRIT',
        research: 'Research',
        alumni: 'Alumni Network',
        calendar: 'Academic Calendar',
        portal: 'Student Portal',
        library: 'E-Library',
        career: 'Career Center',
        international: 'International Office',
        it: 'IT Support'
      },
      copyright:
        "© 2025 ESPRIT – École Supérieure Privée d'Ingénierie et de Technologies. All rights reserved.",
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      accessibility: 'Accessibility',
      sitemap: 'Sitemap'
    },
    testimonials: [
      {
        quote:
          'ESPRIT gave me the technical foundation and soft skills to land my dream job at Microsoft. The project-based learning approach and strong industry connections made all the difference.',
        name: 'Sarra Mansouri',
        role: 'Software Engineer at Microsoft Tunisia',
        education: 'Computer Science, Class of 2023',
        initials: 'SM'
      },
      {
        quote:
          'The international exchange program opened doors I never imagined. ESPRIT prepared me to work across cultures and technologies with confidence.',
        name: 'Ahmed Ben Salah',
        role: 'Embedded Systems Engineer at Airbus',
        education: 'Electrical Engineering, Class of 2022',
        initials: 'AB'
      },
      {
        quote:
          'From day one, ESPRIT connected me with industry mentors and real projects. That experience was invaluable when launching my own startup.',
        name: 'Leila Trabelsi',
        role: 'Founder, TechStart Tunisia',
        education: 'Computer Science, Class of 2021',
        initials: 'LT'
      }
    ]
  },
  fr: {
    nav: { home: 'Accueil', about: 'À propos', contact: 'Contact', login: 'Connexion' },
    hero: {
      titleLine1: "Façonnez l'avenir",
      titleHighlight: 'avec ESPRIT',
      desc:
        "Rejoignez la première université privée d'ingénierie et de technologies en Tunisie. Innovez, collaborez et construisez l'avenir grâce à des programmes de pointe, des partenariats internationaux et des infrastructures de classe mondiale.",
      statStudents: 'Étudiants',
      statPrograms: 'Programmes',
      statPartnerships: 'Partenariats',
      statEmployment: "Taux d'emploi",
      scroll: 'DÉFILER'
    },
    numbers: {
      label: 'EN CHIFFRES',
      title: 'ESPRIT en chiffres',
      stats: [
        { title: 'Étudiants inscrits', subtitle: 'Tous programmes confondus' },
        { title: 'Programmes académiques', subtitle: 'Ingénierie & business' },
        { title: 'Partenaires internationaux', subtitle: 'Universités & entreprises' },
        { title: 'Insertion professionnelle', subtitle: 'Dans les 6 mois' },
        { title: "Années d'excellence", subtitle: 'Fondée en 1999' }
      ]
    },
    why: {
      badge: 'POURQUOI NOUS CHOISIR',
      titleBefore: 'Une formation qui ',
      titleHighlight: 'transforme',
      titleAfter: ' les carrières',
      intro:
        "À ESPRIT, nous allions exigence académique et expérience terrain. Nos diplômés sont prêts à innover en Tunisie et dans le monde. Voici ce qui nous distingue.",
      features: [
        {
          title: 'Formation internationale',
          text: 'Double diplômes et programmes d\'échange avec des universités partenaires en France, Allemagne, Canada et aux États-Unis.'
        },
        {
          title: "Laboratoires d'innovation",
          text: 'Laboratoires de recherche, Fab Labs et espaces makers équipés des dernières technologies.'
        },
        {
          title: 'Partenariats industriels',
          text: 'Liens directs avec plus de 200 entreprises pour stages, projets et opportunités d\'emploi.'
        },
        {
          title: 'Excellence professionnelle',
          text: "Centre de carrières dédié avec 94 % d'insertion des diplômés dans les 6 mois suivant l'obtention du diplôme."
        }
      ]
    },
    stories: { label: 'TÉMOIGNAGES', title: 'Ce que disent nos alumni' },
    partners: {
      label: 'NOTRE RÉSEAU',
      title: 'Partenaires industriels & académiques',
      desc: 'Créer des ponts entre le monde académique et l\'industrie pour un impact concret.',
      corporate: 'PARTENAIRES ENTREPRISES',
      academic: 'PARTENARIATS ACADÉMIQUES'
    },
    footer: {
      about:
        "ESPRIT – École Supérieure Privée d'Ingénierie et de Technologies. Leader tunisien de la formation en ingénierie et technologies.",
      quickLinks: 'LIENS RAPIDES',
      resources: 'RESSOURCES',
      newsletter: 'NEWSLETTER',
      newsletterDesc: 'Restez informé des événements et actualités de l\'université.',
      emailPlaceholder: 'votre@email.com',
      subscribe: "S'abonner",
      links: {
        about: 'À propos d\'ESPRIT',
        research: 'Recherche',
        alumni: 'Réseau alumni',
        calendar: 'Calendrier académique',
        portal: 'Portail étudiant',
        library: 'Bibliothèque numérique',
        career: 'Centre de carrières',
        international: 'Bureau international',
        it: 'Support informatique'
      },
      copyright:
        "© 2025 ESPRIT – École Supérieure Privée d'Ingénierie et de Technologies. Tous droits réservés.",
      privacy: 'Politique de confidentialité',
      terms: "Conditions d'utilisation",
      accessibility: 'Accessibilité',
      sitemap: 'Plan du site'
    },
    testimonials: [
      {
        quote:
          "ESPRIT m'a donné les bases techniques et les soft skills pour décrocher mon poste de rêve chez Microsoft. L'approche par projets et les liens avec l'industrie ont fait toute la différence.",
        name: 'Sarra Mansouri',
        role: 'Ingénieure logiciel chez Microsoft Tunisie',
        education: 'Informatique, promotion 2023',
        initials: 'SM'
      },
      {
        quote:
          "Le programme d'échange international m'a ouvert des portes insoupçonnées. ESPRIT m'a préparé à travailler dans des environnements multiculturels et technologiques.",
        name: 'Ahmed Ben Salah',
        role: 'Ingénieur systèmes embarqués chez Airbus',
        education: 'Génie électrique, promotion 2022',
        initials: 'AB'
      },
      {
        quote:
          "Dès le départ, ESPRIT m'a mis en relation avec des mentors et des projets réels. Cette expérience a été précieuse pour lancer ma startup.",
        name: 'Leila Trabelsi',
        role: 'Fondatrice, TechStart Tunisia',
        education: 'Informatique, promotion 2021',
        initials: 'LT'
      }
    ]
  }
};

export const FEATURE_ICONS = ['bi-globe2', 'bi-microscope', 'bi-handshake', 'bi-graph-up-arrow'];

export const STAT_ICONS = ['bi-people', 'bi-book', 'bi-globe2', 'bi-briefcase', 'bi-award'];
