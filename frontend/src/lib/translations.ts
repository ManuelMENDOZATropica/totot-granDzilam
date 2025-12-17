export type Language = 'es' | 'en' | 'fr';

type ContactInfo = {
  emailLabel: string;
  phoneLabel: string;
  emailValue: string;
  phoneValue: string;
  helper: { idle: string; submitted: string };
  fields: {
    name: string;
    email: string;
    phone: string;
    interest: string;
    errors: {
      name: string;
      email: string;
      emailInvalid: string;
      phone: string;
      interest: string;
      submit: string;
    };
  };
  actions: { submit: string; submitting: string };
};

type CookieCopy = {
  title: string;
  description: string;
  actions: { essential: string; all: string };
  linkLabel: string;
};

type InfoSection = {
  id: string;
  label: string;
  iconPath: string;
  title: string;
  highlight: string;
  paragraphs?: string[];
  mapTitle?: string;
  galleryEmpty?: string;
  specs?: { title: string; description: string }[];
};

type ChatbotCopy = {
  intro: { greeting: string; question: string };
  suggestions: string[];
  placeholder: string;
  aria: { open: string; close: string; send: string };
  errors: {
    generic: string;
    quota: string;
    rateLimited: string;
    timeout: string;
    invalidPrompt: string;
  };
};

type MacroEstimator = {
  toggle: string;
  disclaimer: string;
  loading: string;
  empty: string;
  error: string;
};

type PanelEstimator = {
  title: string;
  measures: string;
  total: string;
  estimation: string;
  subtotal: string;
  discount: string;
  totalWithDiscount: string;
  downPayment: string;
  balance: string;
  monthly: string;
  personalize: string;
  downPaymentLabel: string;
  monthsLabel: string;
  actions: {
    clear: string;
    contact: string;
    download: string;
    close: string;
    downloading: string;
  };
};

type ImagineCopy = {
  titleLine1: string;
  titleLine2: string;
  placeholder: string;
  action: string;
  inspirationLabel: string;
  inspirationItems: string[];
  status: { ready: string; loading: string };
};

type HomeCopy = {
  meta: { title: string; description: string };
  actions: {
    interest: string;
    brochure: string;
    brochureNewTab: string;
    adminAccess: string;
  };
  interestModal: { title: string; description: string; close: string; openNew: string };
  footer: {
    title: string;
    description: string;
    preference: string;
    privacy: string;
    cookies: string;
  };
};

export type TranslationSchema = {
  languageNames: Record<Language, string>;
  home: HomeCopy;
  cookies: CookieCopy;
  admin: { panel: string };
  infoPanel: { sections: InfoSection[]; viewLarge: string };
  macro: MacroEstimator;
  panel: PanelEstimator;
  imagine: ImagineCopy;
  contact: ContactInfo;
  chatbot: ChatbotCopy;
};

export const translations: Record<Language, TranslationSchema> = {
  es: {
    languageNames: { es: 'Español', en: 'Inglés', fr: 'Francés' },
    home: {
      meta: {
        title: 'Gran Dzilam · Cotizador de lotes',
        description:
          'Selecciona tus lotes y simula la mensualidad en segundos con el cotizador interactivo de Gran Dzilam.',
      },
      actions: {
        interest: 'Sitios de interés',
        brochure: 'Brochure',
        brochureNewTab: 'Abrir en nueva pestaña',
        adminAccess: 'Acceso administrativo',
      },
      interestModal: {
        title: 'Sitios de interés',
        description: 'Sitios de interés de la zona',
        close: 'Cerrar',
        openNew: 'Abrir en nueva pestaña',
      },
      footer: {
        title: 'Gran Dzilam',
        description: 'Tu espacio para visualizar y cotizar con confianza.',
        preference: 'Preferencia actual',
        privacy: 'Aviso de privacidad',
        cookies: 'Preferencias de cookies',
      },
    },
    cookies: {
      title: 'Uso de cookies',
      description:
        'Utilizamos cookies para mejorar tu experiencia y analizar la interacción con nuestro sitio. Puedes aceptar todas o quedarte solo con las esenciales para el correcto funcionamiento de la página.',
      actions: { essential: 'Aceptar solo esenciales', all: 'Aceptar todas' },
      linkLabel: 'aviso de privacidad',
    },
    admin: { panel: 'Panel admin' },
    infoPanel: {
      viewLarge: 'Click para ver en grande',
      sections: [
        {
          id: 'sobre',
          label: 'Sobre Gran Dzilam',
          iconPath: '/assets/iconos/sobre gran dzilam.png',
          title: 'Sobre Gran Dzilam',
          highlight: 'Macroterrenos de inversión',
          paragraphs: [
            'Gran Dzilam es un conjunto de macroterrenos ubicado en Dzilam de Bravo, Yucatán.',
            'Son terrenos de propiedad privada listos para escriturar, ubicados sobre carretera con terreno plano y suelo de piedra. Ideales para inversionistas que buscan propiedades de oportunidad.',
            'Rodeado de más de 10 proyectos en preventa en la misma vialidad, y más de 30 en sus alrededores, incluyendo residenciales y un club de golf a la orilla de la playa.',
            'A 2.2 horas de Chichen Itza, XX minutos de la playa y 1.3 horas de Mérida, Gran Dzilam es una inversión emergente inteligente para quienes buscan desarrollar un proyecto con crecimiento exponencial en las próximas décadas.',
            'Su comercialización es a través de Eslabón Inmobiliario, una inmobiliaria con XX años de experiencia en la venta de terrenos y desarrollos residenciales en la zona de Yucatán.',
            'Si quieres conocer más información sobre Gran Dzilam consulta nuestro Blog informativo.',
          ],
        },
        {
          id: 'ubicacion',
          label: 'Ubicación',
          iconPath: '/assets/iconos/Ubicación.png',
          title: 'Ubicación',
          highlight: 'Entorno de alta plusvalía',
          paragraphs: [
            'Se encuentra en la costa norte del estado de Yucatán, es una de las pocas zonas vírgenes que quedan en Yucatán y una auténtica joya escondida que esta en la mira de inversionistas y desarrolladores.',
            'Cuenta con acceso desde vialidad pavimentada con más de 100m lineales de frente. Se encuentra a 5 minutos de la carretera El Tajo.',
            'Si quieres conocer más información sobre la zona en la cual se encuentra Gran Dzilam, y zonas de interés cercanas, visita nuestro Blog informativo.',
          ],
          mapTitle: 'Ubicación Gran Dzilam',
        },
        {
          id: 'fotos',
          label: 'Fotografías',
          iconPath: '/assets/iconos/fotografias.png',
          title: 'Fotografías',
          highlight: 'Vistas del master plan',
          galleryEmpty: 'Próximamente imágenes de avance de obra.',
        },
        {
          id: 'especificaciones',
          label: 'Especificaciones',
          iconPath: '/assets/iconos/especificaciones.png',
          title: 'Especificaciones',
          highlight: 'Listo para desarrollar',
          specs: [
            { title: 'Propiedad privada', description: 'Terrenos seguros, listos para escriturar.' },
            { title: 'Acceso pavimentado', description: 'Terrenos a pie de pavimento, ubicados sobre carretera.' },
            { title: 'Dimensiones', description: 'Desde 8 hasta 17 hectáreas, dividido con mojoneras.' },
            { title: 'Acceso a agua', description: 'Pozo de agua con infraestructura para instalar tubería.' },
            { title: 'Gran plusvalía', description: 'Zona con proyectos residenciales, comerciales y de golf.' },
            { title: 'Conexión', description: 'A minutos de la playa, Mérida y Chichén Itzá.' },
          ],
        },
      ],
    },
    chatbot: {
      intro: {
        greeting:
          'Hola, soy tu asistente virtual y puedo ayudarte con todo lo relacionado con tu inversión en Gran Dzilam.',
        question: '¿Tienes alguna pregunta?',
      },
      suggestions: [
        '¿Puedo personalizar mi financiamiento?',
        '¿Puedo personalizar la superficie?',
        '¿Qué proyectos hay en la zona?',
      ],
      placeholder: 'Escribe aquí tu pregunta...',
      aria: { open: 'Abrir asistente virtual', close: 'Cerrar asistente virtual', send: 'Enviar' },
      errors: {
        generic: 'No pude responder en este momento. Intenta de nuevo más tarde.',
        quota: 'Se alcanzó el límite de uso. Intenta más tarde.',
        rateLimited: 'Has superado el límite de solicitudes. Intenta de nuevo en unos minutos.',
        timeout: 'El servicio tardó demasiado. Intenta nuevamente.',
        invalidPrompt: 'No pudimos procesar tu mensaje. Ajusta el texto e inténtalo de nuevo.',
      },
    },
    macro: {
      toggle: 'Cotizar macro terreno',
      disclaimer: 'Esta herramienta es una representación ilustrativa y no constituye una oferta oficial ni legal.',
      loading: 'Cargando...',
      empty: 'No hay lotes disponibles',
      error: 'No se pudo cargar la información',
    },
    panel: {
      title: 'Genera tu estimación',
      measures: 'Medidas',
      total: 'TOTAL',
      estimation: 'Estimación de costo',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      totalWithDiscount: 'Total con descuento',
      downPayment: 'Enganche',
      balance: 'Saldo',
      monthly: 'Mensualidad',
      personalize: 'Personaliza tu cotización',
      downPaymentLabel: 'Enganche',
      monthsLabel: 'Meses',
      actions: {
        clear: 'Limpiar selección',
        contact: 'Hablar con un asesor',
        download: 'Descargar pdf',
        close: 'Cerrar',
        downloading: 'Descargando...',
      },
    },
    imagine: {
      titleLine1: 'Imagina tu',
      titleLine2: 'proyecto ideal',
      placeholder: 'Escribe aquí tu proyecto...',
      action: 'Imaginar proyecto',
      inspirationLabel: '¿Sin ideas? Inspírate, cualquier cosa es posible:',
      inspirationItems: ['Un hotel ecológico', 'Un jungle gym', 'Un desarrollo mixto'],
      status: { ready: 'Inspiración lista', loading: 'Generando idea…' },
    },
    contact: {
      emailLabel: 'Correo electrónico',
      phoneLabel: 'Teléfono',
      emailValue: 'grandzilam@info.com',
      phoneValue: '+00 00 000 000',
      helper: {
        idle: 'Deja tu información y nos pondremos en contacto:',
        submitted: '¡Gracias! Nos pondremos en contacto contigo.',
      },
      fields: {
        name: 'Nombre',
        email: 'Correo',
        phone: 'Teléfono',
        interest: 'Interés',
        errors: {
          name: 'Ingresa tu nombre',
          email: 'Ingresa tu correo',
          emailInvalid: 'Ingresa un correo válido',
          phone: 'Ingresa tu teléfono',
          interest: 'Cuéntanos tu interés',
          submit: 'No se pudo enviar tu información',
        },
      },
      actions: { submit: 'Enviar información', submitting: 'Enviando…' },
    },
  },
  en: {
    languageNames: { es: 'Spanish', en: 'English', fr: 'French' },
    home: {
      meta: {
        title: 'Gran Dzilam · Lot estimator',
        description: 'Select your lots and simulate payments in seconds with Gran Dzilam’s interactive estimator.',
      },
      actions: {
        interest: 'Points of interest',
        brochure: 'Brochure',
        brochureNewTab: 'Open in new tab',
        adminAccess: 'Admin access',
      },
      interestModal: {
        title: 'Points of interest',
        description: 'Nearby points of interest',
        close: 'Close',
        openNew: 'Open in new tab',
      },
      footer: {
        title: 'Gran Dzilam',
        description: 'Your space to explore and quote with confidence.',
        preference: 'Current preference',
        privacy: 'Privacy notice',
        cookies: 'Cookie preferences',
      },
    },
    cookies: {
      title: 'Cookie usage',
      description:
        'We use cookies to improve your experience and analyze how you interact with our site. You can accept all cookies or keep only the essential ones needed for the site to work properly.',
      actions: { essential: 'Accept essential only', all: 'Accept all' },
      linkLabel: 'privacy notice',
    },
    admin: { panel: 'Admin panel' },
    infoPanel: {
      viewLarge: 'Click to enlarge',
      sections: [
        {
          id: 'sobre',
          label: 'About Gran Dzilam',
          iconPath: '/assets/iconos/sobre gran dzilam.png',
          title: 'About Gran Dzilam',
          highlight: 'Investment macrolots',
          paragraphs: [
            'Gran Dzilam is a collection of macrolots located in Dzilam de Bravo, Yucatán.',
            'These are privately owned parcels ready for title deeds, located on a main road with flat terrain and stone soil—ideal for investors seeking opportunity properties.',
            'Surrounded by more than 10 presale projects on the same road and over 30 in the area, including residential projects and a beachfront golf club.',
            'Just 2.2 hours from Chichen Itza, minutes from the beach, and 1.3 hours from Mérida, Gran Dzilam is a smart emerging investment for developing projects with long-term growth.',
            'Marketed through Eslabón Inmobiliario, a real estate firm with decades of experience selling land and residential developments in Yucatán.',
            'Visit our blog to learn more about Gran Dzilam.',
          ],
        },
        {
          id: 'ubicacion',
          label: 'Location',
          iconPath: '/assets/iconos/Ubicación.png',
          title: 'Location',
          highlight: 'High appreciation area',
          paragraphs: [
            'Located on the northern coast of Yucatán, one of the few untouched areas left in the state and a true hidden gem for investors and developers.',
            'Direct access from a paved road with more than 100 meters of frontage and just 5 minutes from the El Tajo highway.',
            'Visit our blog to learn more about the area around Gran Dzilam and the nearby attractions.',
          ],
          mapTitle: 'Gran Dzilam location',
        },
        {
          id: 'fotos',
          label: 'Photography',
          iconPath: '/assets/iconos/fotografias.png',
          title: 'Photography',
          highlight: 'Master plan views',
          galleryEmpty: 'Progress photos coming soon.',
        },
        {
          id: 'especificaciones',
          label: 'Specifications',
          iconPath: '/assets/iconos/especificaciones.png',
          title: 'Specifications',
          highlight: 'Ready to develop',
          specs: [
            { title: 'Private property', description: 'Secure land, ready for title deeds.' },
            { title: 'Paved access', description: 'Roadside lots located directly on the highway.' },
            { title: 'Dimensions', description: 'From 8 to 17 hectares, divided with markers.' },
            { title: 'Water access', description: 'Water well with infrastructure ready for piping.' },
            { title: 'Great appreciation', description: 'Area with residential, commercial, and golf projects.' },
            { title: 'Connection', description: 'Minutes from the beach, Mérida, and Chichén Itzá.' },
          ],
        },
      ],
    },
    chatbot: {
      intro: {
        greeting: 'Hi, I am your virtual assistant. I can help with anything related to your investment in Gran Dzilam.',
        question: 'Do you have any questions?',
      },
      suggestions: ['Can I customize my financing?', 'Can I customize the surface area?', 'What projects are nearby?'],
      placeholder: 'Type your question here...',
      aria: { open: 'Open virtual assistant', close: 'Close virtual assistant', send: 'Send' },
      errors: {
        generic: 'I could not reply right now. Please try again later.',
        quota: 'Usage limit reached. Please try again later.',
        rateLimited: 'You have exceeded the request limit. Try again in a few minutes.',
        timeout: 'The service took too long. Please try again.',
        invalidPrompt: 'We could not process your message. Adjust the text and try again.',
      },
    },
    macro: {
      toggle: 'Quote macrolot',
      disclaimer: 'This tool is for illustrative purposes and does not represent an official or legal offer.',
      loading: 'Loading...',
      empty: 'No lots available',
      error: 'Information could not be loaded',
    },
    panel: {
      title: 'Create your estimate',
      measures: 'Measurements',
      total: 'TOTAL',
      estimation: 'Cost estimate',
      subtotal: 'Subtotal',
      discount: 'Discount',
      totalWithDiscount: 'Total with discount',
      downPayment: 'Down payment',
      balance: 'Balance',
      monthly: 'Monthly payment',
      personalize: 'Personalize your quote',
      downPaymentLabel: 'Down payment',
      monthsLabel: 'Months',
      actions: {
        clear: 'Clear selection',
        contact: 'Talk to an advisor',
        download: 'Download PDF',
        close: 'Close',
        downloading: 'Downloading...',
      },
    },
    imagine: {
      titleLine1: 'Imagine your',
      titleLine2: 'ideal project',
      placeholder: 'Describe your project here...',
      action: 'Imagine project',
      inspirationLabel: 'Need ideas? Get inspired—anything is possible:',
      inspirationItems: ['An eco-friendly hotel', 'A jungle gym', 'A mixed-use project'],
      status: { ready: 'Inspiration ready', loading: 'Generating idea…' },
    },
    contact: {
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      emailValue: 'grandzilam@info.com',
      phoneValue: '+00 00 000 000',
      helper: {
        idle: 'Leave your info and we will get in touch:',
        submitted: 'Thank you! We will contact you shortly.',
      },
      fields: {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        interest: 'Interest',
        errors: {
          name: 'Enter your name',
          email: 'Enter your email',
          emailInvalid: 'Enter a valid email',
          phone: 'Enter your phone number',
          interest: 'Tell us your interest',
          submit: 'We could not send your information',
        },
      },
      actions: { submit: 'Send information', submitting: 'Sending…' },
    },
  },
  fr: {
    languageNames: { es: 'Espagnol', en: 'Anglais', fr: 'Français' },
    home: {
      meta: {
        title: 'Gran Dzilam · Estimation de lots',
        description: 'Sélectionnez vos lots et simulez les paiements en quelques secondes avec le simulateur interactif de Gran Dzilam.',
      },
      actions: {
        interest: 'Points d’intérêt',
        brochure: 'Brochure',
        brochureNewTab: 'Ouvrir dans un nouvel onglet',
        adminAccess: 'Accès administrateur',
      },
      interestModal: {
        title: 'Points d’intérêt',
        description: 'Points d’intérêt à proximité',
        close: 'Fermer',
        openNew: 'Ouvrir dans un nouvel onglet',
      },
      footer: {
        title: 'Gran Dzilam',
        description: 'Votre espace pour visualiser et estimer en toute confiance.',
        preference: 'Préférence actuelle',
        privacy: 'Avis de confidentialité',
        cookies: 'Préférences de cookies',
      },
    },
    cookies: {
      title: 'Utilisation des cookies',
      description:
        'Nous utilisons des cookies pour améliorer votre expérience et analyser votre interaction avec notre site. Vous pouvez accepter tous les cookies ou ne conserver que ceux qui sont essentiels au bon fonctionnement du site.',
      actions: { essential: 'Accepter seulement l’essentiel', all: 'Tout accepter' },
      linkLabel: 'avis de confidentialité',
    },
    admin: { panel: 'Panneau admin' },
    infoPanel: {
      viewLarge: 'Cliquer pour agrandir',
      sections: [
        {
          id: 'sobre',
          label: 'À propos de Gran Dzilam',
          iconPath: '/assets/iconos/sobre gran dzilam.png',
          title: 'À propos de Gran Dzilam',
          highlight: 'Macrolots d’investissement',
          paragraphs: [
            'Gran Dzilam est un ensemble de macrolots situé à Dzilam de Bravo, au Yucatán.',
            'Des terrains privés prêts à être notariés, en bord de route avec un terrain plat et pierreux, idéals pour les investisseurs à la recherche d’opportunités.',
            'Entouré de plus de 10 projets en prévente sur la même voie et de plus de 30 dans les environs, dont des résidences et un club de golf en bord de mer.',
            'À 2,2 heures de Chichén Itzá, à quelques minutes de la plage et à 1,3 heure de Mérida, Gran Dzilam est un investissement émergent intelligent pour développer un projet à forte croissance.',
            'Commercialisé par Eslabón Inmobiliario, une agence immobilière avec des décennies d’expérience dans la vente de terrains et de développements résidentiels au Yucatán.',
            'Consultez notre blog pour en savoir plus sur Gran Dzilam.',
          ],
        },
        {
          id: 'ubicacion',
          label: 'Localisation',
          iconPath: '/assets/iconos/Ubicación.png',
          title: 'Localisation',
          highlight: 'Zone à forte valeur',
          paragraphs: [
            'Situé sur la côte nord du Yucatán, l’une des rares zones encore vierges et un véritable trésor pour les investisseurs et les promoteurs.',
            'Accès direct depuis une route pavée avec plus de 100 mètres de façade et à seulement 5 minutes de la route El Tajo.',
            'Visitez notre blog pour connaître la zone autour de Gran Dzilam et les points d’intérêt à proximité.',
          ],
          mapTitle: 'Localisation Gran Dzilam',
        },
        {
          id: 'fotos',
          label: 'Photographies',
          iconPath: '/assets/iconos/fotografias.png',
          title: 'Photographies',
          highlight: 'Vues du plan directeur',
          galleryEmpty: 'Photos d’avancement à venir.',
        },
        {
          id: 'especificaciones',
          label: 'Spécifications',
          iconPath: '/assets/iconos/especificaciones.png',
          title: 'Spécifications',
          highlight: 'Prêt à développer',
          specs: [
            { title: 'Propriété privée', description: 'Terrains sécurisés, prêts pour l’acte notarié.' },
            { title: 'Accès pavé', description: 'Terrains en bord de route, directement sur la chaussée.' },
            { title: 'Dimensions', description: 'De 8 à 17 hectares, délimités par des bornes.' },
            { title: 'Accès à l’eau', description: 'Puits d’eau avec infrastructure prête pour les tuyaux.' },
            { title: 'Forte valorisation', description: 'Zone avec des projets résidentiels, commerciaux et un golf.' },
            { title: 'Connexion', description: 'À quelques minutes de la plage, de Mérida et de Chichén Itzá.' },
          ],
        },
      ],
    },
    chatbot: {
      intro: {
        greeting:
          'Bonjour, je suis votre assistant virtuel. Je peux vous aider pour tout ce qui concerne votre investissement à Gran Dzilam.',
        question: 'Avez-vous des questions ?',
      },
      suggestions: [
        'Puis-je personnaliser mon financement ?',
        'Puis-je personnaliser la surface ?',
        'Quels projets se trouvent dans la zone ?',
      ],
      placeholder: 'Écrivez votre question ici...',
      aria: { open: 'Ouvrir l’assistant virtuel', close: 'Fermer l’assistant virtuel', send: 'Envoyer' },
      errors: {
        generic: 'Je ne peux pas répondre pour le moment. Réessayez plus tard.',
        quota: "Limite d’utilisation atteinte. Réessayez plus tard.",
        rateLimited: 'Vous avez dépassé la limite de requêtes. Réessayez dans quelques minutes.',
        timeout: 'Le service a mis trop de temps à répondre. Veuillez réessayer.',
        invalidPrompt: 'Nous n’avons pas pu traiter votre message. Modifiez le texte et réessayez.',
      },
    },
    macro: {
      toggle: 'Estimer un macrolot',
      disclaimer: 'Cet outil est illustratif et ne constitue pas une offre officielle ou légale.',
      loading: 'Chargement…',
      empty: 'Aucun lot disponible',
      error: 'Impossible de charger les informations',
    },
    panel: {
      title: 'Générez votre estimation',
      measures: 'Mesures',
      total: 'TOTAL',
      estimation: 'Estimation des coûts',
      subtotal: 'Sous-total',
      discount: 'Remise',
      totalWithDiscount: 'Total avec remise',
      downPayment: 'Acompte',
      balance: 'Solde',
      monthly: 'Mensualité',
      personalize: 'Personnalisez votre devis',
      downPaymentLabel: 'Acompte',
      monthsLabel: 'Mois',
      actions: {
        clear: 'Effacer la sélection',
        contact: 'Parler à un conseiller',
        download: 'Télécharger le PDF',
        close: 'Fermer',
        downloading: 'Téléchargement…',
      },
    },
    imagine: {
      titleLine1: 'Imaginez votre',
      titleLine2: 'projet idéal',
      placeholder: 'Décrivez votre projet ici…',
      action: 'Imaginer le projet',
      inspirationLabel: 'Pas d’idées ? Inspirez-vous :',
      inspirationItems: ['Un hôtel écologique', 'Un parcours aventure', 'Un projet mixte'],
      status: { ready: 'Inspiration prête', loading: 'Génération de l’idée…' },
    },
    contact: {
      emailLabel: 'Courriel',
      phoneLabel: 'Téléphone',
      emailValue: 'grandzilam@info.com',
      phoneValue: '+00 00 000 000',
      helper: {
        idle: 'Laissez vos informations et nous vous contacterons :',
        submitted: 'Merci ! Nous vous contacterons bientôt.',
      },
      fields: {
        name: 'Nom',
        email: 'Courriel',
        phone: 'Téléphone',
        interest: 'Intérêt',
        errors: {
          name: 'Saisissez votre nom',
          email: 'Saisissez votre courriel',
          emailInvalid: 'Saisissez un courriel valide',
          phone: 'Saisissez votre téléphone',
          interest: 'Parlez-nous de votre intérêt',
          submit: 'Impossible d’envoyer vos informations',
        },
      },
      actions: { submit: 'Envoyer les informations', submitting: 'Envoi…' },
    },
  },
};

export const fallbackLanguage: Language = 'es';
