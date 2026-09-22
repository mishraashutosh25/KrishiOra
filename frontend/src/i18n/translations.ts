/* ==========================================================================
   KrishiOra — Complete Landing Page Translations
   8 languages: en, pa, hi, mr, gu, ta, te, bn
   ========================================================================== */

export type LangCode = "en" | "pa" | "hi" | "mr" | "gu" | "ta" | "te" | "bn";

export interface Translation {
  nav: {
    home: string;
    features: string;
    howItWorks: string;
    whyKrishiOra: string;
    login: string;
    getStarted: string;
    coreCapabilities: string;
    selectLanguage: string;
    featItems: {
      farmManagement: { title: string; description: string };
      cropLifecycle: { title: string; description: string };
      expenseIntelligence: { title: string; description: string };
      farmAnalytics: { title: string; description: string };
    };
  };
  hero: {
    eyebrow: string;
    line1: string;
    line2: string;
    line3: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    caps: [string, string, string, string];
  };
  stats: {
    coreAreas: { value: string; title: string; description: string };
    languages: { value: string; title: string; description: string };
    farmerFocused: { value: string; title: string; description: string };
    platform: { value: string; title: string; description: string };
  };
  problemSolution: {
    badge: string;
    headline1: string;
    headline2: string;
    subheadline: string;
    challengeLabel: string;
    challengeTitle: string;
    solutionLabel: string;
    solutionTitle: string;
    tagline: string;
    connected: string;
    problems: [
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
    ];
    solutions: [
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
    ];
  };
  features: {
    badge: string;
    headline1: string;
    headline2: string;
    subheadline: string;
    seeHow: string;
    connected: string;
    connectedSub: string;
    items: [
      { title: string; description: string; points: [string, string, string] },
      { title: string; description: string; points: [string, string, string] },
      { title: string; description: string; points: [string, string, string] },
      { title: string; description: string; points: [string, string, string] },
    ];
  };
  howItWorks: {
    badge: string;
    headline1: string;
    headline2: string;
    subheadline: string;
    step: string;
    bannerTitle: string;
    bannerDesc: string;
    getStarted: string;
    steps: [
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
    ];
  };
  expense: {
    badge: string;
    headline1: string;
    headline2: string;
    subheadline: string;
    calloutText: string;
    calloutHighlight: string;
    startTracking: string;
  };
  cta: {
    eyebrow: string;
    headline1: string;
    headline2: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    cardTitle: string;
    cardSub: string;
    cardFooter: string;
    benefits: [string, string, string];
  };
  footer: {
    description: string;
    product: string;
    company: string;
    languages: string;
    langDesc: string;
    madeFor: string;
    backToTop: string;
    privacyPolicy: string;
    termsOfUse: string;
    allRights: string;
  };
  auth: {
    visual: {
      badge: string;
      title: string;
      description: string;
      footer: string[];
    };
    login: {
      title: string;
      subtitle: string;
      emailLabel: string;
      emailPlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      forgotPassword: string;
      rememberMe: string;
      submitBtn: string;
      submitting: string;
      orContinueWith: string;
      newToPlatform: string;
      createAccount: string;
      backToHome: string;
      validation: {
        emailRequired: string;
        emailInvalid: string;
        passwordRequired: string;
        passwordShort: string;
        emailOnlyError: string;
        loginFailed: string;
      };
    };
    register: {
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      stateLabel: string;
      statePlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      confirmPasswordLabel: string;
      confirmPasswordPlaceholder: string;
      agreeTerms: string;
      submitBtn: string;
      submitting: string;
      orContinueWith: string;
      alreadyHaveAccount: string;
      loginInstead: string;
      backToHome: string;
      validation: {
        nameRequired: string;
        emailRequired: string;
        emailInvalid: string;
        phoneRequired: string;
        phoneInvalid: string;
        stateRequired: string;
        passwordRequired: string;
        passwordShort: string;
        confirmRequired: string;
        confirmMismatch: string;
        termsRequired: string;
        registerFailed: string;
      };
    };
  };
  faq?: any;
  testimonials?: any;
}

/* ──────────────────────────────────────────────────────────────────────────
   ENGLISH
   ────────────────────────────────────────────────────────────────────────── */
const en: Translation = {
  auth: {
  visual: {
    badge: "Agricultural Intelligence Platform",
    title: "Built for the growers of India's future.",
    description: "Manage farm plots, track crops, understand expenses, and make better agricultural decisions from one place.",
    footer: [
      "Field Plots",
      "Crop Tracking",
      "Expense Intelligence"
    ]
  },
  login: {
    title: "Welcome back",
    subtitle: "Enter your credentials to access your crops, fields, and expenses.",
    emailLabel: "Email or Mobile number",
    emailPlaceholder: "name@farm.com or 9876543210",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    forgotPassword: "Forgot password?",
    rememberMe: "Remember this device for 30 days",
    submitBtn: "Sign in to Dashboard",
    submitting: "Signing in...",
    orContinueWith: "or",
    newToPlatform: "New to KrishiOra?",
    createAccount: "Create free farmer account",
    backToHome: "Back to Home",
    validation: {
      emailRequired: "Please enter your email or 10-digit mobile number.",
      emailInvalid: "Please enter a valid email address or 10-digit mobile number.",
      passwordRequired: "Please enter your password.",
      passwordShort: "Password must be at least 6 characters.",
      emailOnlyError: "Account sign-in currently requires your registered email address.",
      loginFailed: "Unable to sign in. Please check your credentials and try again."
    }
  },
  register: {
    title: "Create your farm account",
    subtitle: "Join KrishiOra to manage your fields, track expenses, and grow your agricultural operations.",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. Ramesh Kumar",
    emailLabel: "Email Address",
    emailPlaceholder: "ramesh@farm.com",
    phoneLabel: "Mobile Number",
    phonePlaceholder: "10-digit mobile number",
    stateLabel: "State / Region",
    statePlaceholder: "Select your farming state",
    passwordLabel: "Password",
    passwordPlaceholder: "Create a strong password",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    agreeTerms: "I agree to the Terms of Service & Privacy Policy",
    submitBtn: "Create Free Account",
    submitting: "Creating account...",
    orContinueWith: "or",
    alreadyHaveAccount: "Already have an account?",
    loginInstead: "Sign in instead",
    backToHome: "Back to Home",
    validation: {
      nameRequired: "Full name is required",
      emailRequired: "Email is required",
      emailInvalid: "Invalid email format",
      phoneRequired: "Mobile number is required",
      phoneInvalid: "Must be a 10-digit number",
      stateRequired: "State selection is required",
      passwordRequired: "Password is required",
      passwordShort: "Must be at least 6 characters",
      confirmRequired: "Password confirmation is required",
      confirmMismatch: "Passwords do not match",
      termsRequired: "You must agree to the terms",
      registerFailed: "Registration failed. Please try again."
    }
  }
},
  nav: {
    home: "Home",
    features: "Features",
    howItWorks: "How It Works",
    whyKrishiOra: "Why KrishiOra",
    login: "Log in",
    getStarted: "Get Started",
    coreCapabilities: "Core Capabilities",
    selectLanguage: "Select Language",
    featItems: {
      farmManagement: {
        title: "Farm Management",
        description: "Organise plots, acreage, soil types, and water resources.",
      },
      cropLifecycle: {
        title: "Crop Lifecycle",
        description: "Track sowing stages, health alerts, and expected harvest.",
      },
      expenseIntelligence: {
        title: "Expense Intelligence",
        description: "Categorise inputs, fertilizer, diesel, and labour spending.",
      },
      farmAnalytics: {
        title: "Farm Analytics",
        description: "Actionable seasonal summaries and cost-per-acre metrics.",
      },
    },
  },
  hero: {
    eyebrow: "Agricultural Intelligence Platform",
    line1: "Smarter farming.",
    line2: "Better decisions.",
    line3: "Stronger harvests.",
    subheadline:
      "KrishiOra brings your farm plots, crop lifecycles, and seasonal expenses together into one simple platform — giving modern farmers the clarity to operate profitably, sustainably, and with confidence.",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "Explore KrishiOra",
    caps: ["Built for Indian Farmers", "7 Regional Languages", "Clear Expense Tracking", "Crop Lifecycle Insights"],
  },
  stats: {
    coreAreas: { value: "4", title: "Core Management Areas", description: "Farm, crops, expenses & analytics" },
    languages: { value: "7", title: "Supported Languages", description: "Built for India's diverse farmers" },
    farmerFocused: { value: "100%", title: "Farmer-Focused", description: "Designed around real farm workflows" },
    platform: { value: "1", title: "Connected Platform", description: "Your agricultural data in one place" },
  },
  problemSolution: {
    badge: "Built around real farm needs",
    headline1: "Farming is complex.",
    headline2: "Managing it shouldn't be.",
    subheadline:
      "KrishiOra brings the essential parts of farm management together so farmers can spend less time managing records and more time focusing on their farms.",
    challengeLabel: "The challenge",
    challengeTitle: "Problems farmers face",
    solutionLabel: "The solution",
    solutionTitle: "One simple platform",
    tagline: "Simple tools. Better decisions. Stronger farms.",
    connected: "Everything your farm needs, connected.",
    problems: [
      {
        title: "Scattered farm records",
        description:
          "Farm details, crop information and daily activities are often managed across notebooks and different apps.",
      },
      {
        title: "Unclear expenses",
        description:
          "Without organized expense tracking, it becomes difficult to understand where money is being spent.",
      },
      {
        title: "Limited visibility",
        description:
          "Important farm data stays unused, making it harder to understand performance and plan ahead.",
      },
    ],
    solutions: [
      {
        title: "Manage your farms",
        description: "Keep farm information, fields and crop activities organized in one place.",
      },
      {
        title: "Track every expense",
        description: "Record expenses by category and understand your farming costs clearly.",
      },
      {
        title: "Turn data into insights",
        description: "Use simple analytics to understand your farm and make better decisions.",
      },
    ],
  },
  features: {
    badge: "Everything in one place",
    headline1: "Tools that make",
    headline2: "farming simpler.",
    subheadline:
      "From managing your farms to understanding your expenses, KrishiOra gives you the essential tools to manage your agricultural journey with clarity.",
    seeHow: "See how it works",
    connected: "One connected farming workspace",
    connectedSub: "Farms, crops, expenses and insights — together.",
    items: [
      {
        title: "Farm Management",
        description: "Keep your farms, fields and essential information organized in one simple workspace.",
        points: ["Manage multiple farms", "Track farm details", "Keep records organized"],
      },
      {
        title: "Crop Management",
        description: "Track crops from planting to harvest and keep important crop information within reach.",
        points: ["Track active crops", "Monitor crop stages", "Organize crop records"],
      },
      {
        title: "Expense Management",
        description: "Record farming expenses and understand exactly where your money is going.",
        points: ["Record expenses", "Categorize spending", "Track total costs"],
      },
      {
        title: "Smart Analytics",
        description: "Turn your farm data into simple insights that help you understand performance.",
        points: ["View expense trends", "Understand farm data", "Make informed decisions"],
      },
    ],
  },
  howItWorks: {
    badge: "How it works",
    headline1: "From farm records to",
    headline2: "better decisions.",
    subheadline:
      "KrishiOra keeps the process simple. Add your farm, manage your crops, track your expenses and understand what your data is telling you.",
    step: "STEP",
    bannerTitle: "Everything starts with your farm.",
    bannerDesc:
      "Start with the basics and gradually build a complete picture of your agricultural operations.",
    getStarted: "Get Started",
    steps: [
      {
        title: "Create your farm",
        description:
          "Add your farm details and keep all your important farm information organized in one place.",
      },
      {
        title: "Add your crops",
        description:
          "Add the crops you grow and keep track of your crop-related information throughout the season.",
      },
      {
        title: "Track your expenses",
        description:
          "Record every farming expense, organize spending by category and keep your costs under control.",
      },
      {
        title: "Understand your farm",
        description:
          "Use simple analytics and expense insights to understand your data and make better decisions.",
      },
    ],
  },
  expense: {
    badge: "Expense Intelligence",
    headline1: "Know where your money",
    headline2: "is going.",
    subheadline:
      "Record your farming expenses, organize them by category and get a clearer picture of your spending — all from one simple dashboard.",
    calloutText: "Better expense visibility helps you make",
    calloutHighlight: "better farm decisions.",
    startTracking: "Start tracking",
  },
  cta: {
    eyebrow: "Start with your farm",
    headline1: "Ready to manage your farm",
    headline2: "smarter?",
    subheadline:
      "Bring your farm records, crops, expenses and insights together with KrishiOra — a simpler way to manage modern agriculture.",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "Explore Features",
    cardTitle: "Everything connected",
    cardSub: "One workspace for your farm",
    cardFooter: "Start small. Build a smarter farm.",
    benefits: [
      "Manage your farms in one place",
      "Track crops and farming expenses",
      "Understand your farm with simple insights",
    ],
  },
  footer: {
    description:
      "A simple digital platform helping farmers manage their farms, crops, expenses and agricultural data with greater clarity.",
    product: "Product",
    company: "Company",
    languages: "Languages",
    langDesc: "Built to make digital agriculture more accessible for farmers across India.",
    madeFor: "Made for farmers across India",
    backToTop: "Back to top",
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Use",
    allRights: "All rights reserved.",
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   PUNJABI (ਪੰਜਾਬੀ)
   ────────────────────────────────────────────────────────────────────────── */
const pa: Translation = {
  auth: {
  visual: {
    badge: "ਖੇਤੀਬਾੜੀ ਖੁਫੀਆ ਪਲੇਟਫਾਰਮ",
    title: "ਭਾਰਤ ਦਾ ਭਵਿੱਖ ਉਗਾਉਣ ਵਾਲਿਆਂ ਲਈ ਬਣਾਇਆ ਗਿਆ।",
    description: "ਖੇਤਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ, ਫਸਲਾਂ ਨੂੰ ਟ੍ਰੈਕ ਕਰੋ, ਖਰਚਿਆਂ ਨੂੰ ਸਮਝੋ, ਅਤੇ ਇੱਕੋ ਥਾਂ ਤੋਂ ਬਿਹਤਰ ਖੇਤੀਬਾੜੀ ਫੈਸਲੇ ਲਓ।",
    footer: [
      "ਫੀਲਡ ਪਲਾਟ",
      "ਫਸਲ ਟ੍ਰੈਕਿੰਗ",
      "ਖਰਚਾ ਖੁਫੀਆ"
    ]
  },
  login: {
    title: "ਵਾਪਸੀ 'ਤੇ ਸੁਆਗਤ ਹੈ",
    subtitle: "ਆਪਣੀਆਂ ਫਸਲਾਂ, ਖੇਤਾਂ ਅਤੇ ਖਰਚਿਆਂ ਤੱਕ ਪਹੁੰਚਣ ਲਈ ਆਪਣੇ ਵੇਰਵੇ ਦਰਜ ਕਰੋ।",
    emailLabel: "ਈਮੇਲ ਜਾਂ ਮੋਬਾਈਲ ਨੰਬਰ",
    emailPlaceholder: "name@farm.com ਜਾਂ 9876543210",
    passwordLabel: "ਪਾਸਵਰਡ",
    passwordPlaceholder: "••••••••",
    forgotPassword: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?",
    rememberMe: "ਇਸ ਡਿਵਾਈਸ ਨੂੰ 30 ਦਿਨਾਂ ਲਈ ਯਾਦ ਰੱਖੋ",
    submitBtn: "ਡੈਸ਼ਬੋਰਡ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ",
    submitting: "ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ...",
    orContinueWith: "ਜਾਂ",
    newToPlatform: "KrishiOra 'ਤੇ ਨਵੇਂ ਹੋ?",
    createAccount: "ਮੁਫਤ ਕਿਸਾਨ ਖਾਤਾ ਬਣਾਓ",
    backToHome: "ਘਰ ਵਾਪਸ ਜਾਓ",
    validation: {
      emailRequired: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਈਮੇਲ ਜਾਂ 10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।",
      emailInvalid: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਵੈਧ ਈਮੇਲ ਪਤਾ ਜਾਂ 10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।",
      passwordRequired: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ।",
      passwordShort: "ਪਾਸਵਰਡ ਘੱਟੋ-ਘੱਟ 6 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।",
      emailOnlyError: "ਖਾਤਾ ਸਾਈਨ-ਇਨ ਲਈ ਵਰਤਮਾਨ ਵਿੱਚ ਤੁਹਾਡੇ ਰਜਿਸਟਰਡ ਈਮੇਲ ਪਤੇ ਦੀ ਲੋੜ ਹੈ।",
      loginFailed: "ਸਾਈਨ ਇਨ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਵੇਰਵਿਆਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
    }
  },
  register: {
    title: "ਆਪਣਾ ਖੇਤੀ ਖਾਤਾ ਬਣਾਓ",
    subtitle: "ਆਪਣੇ ਖੇਤਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰਨ, ਖਰਚਿਆਂ ਨੂੰ ਟ੍ਰੈਕ ਕਰਨ ਅਤੇ ਆਪਣੇ ਖੇਤੀਬਾੜੀ ਕਾਰੋਬਾਰ ਨੂੰ ਵਧਾਉਣ ਲਈ KrishiOra ਨਾਲ ਜੁੜੋ।",
    nameLabel: "ਪੂਰਾ ਨਾਮ",
    namePlaceholder: "ਉਦਾਹਰਣ ਲਈ ਰਮੇਸ਼ ਕੁਮਾਰ",
    emailLabel: "ਈਮੇਲ ਪਤਾ",
    emailPlaceholder: "ramesh@farm.com",
    phoneLabel: "ਮੋਬਾਈਲ ਨੰਬਰ",
    phonePlaceholder: "10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ",
    stateLabel: "ਰਾਜ / ਖੇਤਰ",
    statePlaceholder: "ਆਪਣੇ ਖੇਤੀ ਰਾਜ ਦੀ ਚੋਣ ਕਰੋ",
    passwordLabel: "ਪਾਸਵਰਡ",
    passwordPlaceholder: "ਇੱਕ ਮਜ਼ਬੂਤ ਪਾਸਵਰਡ ਬਣਾਓ",
    confirmPasswordLabel: "ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    confirmPasswordPlaceholder: "ਆਪਣਾ ਪਾਸਵਰਡ ਦੁਬਾਰਾ ਦਰਜ ਕਰੋ",
    agreeTerms: "ਮੈਂ ਨਿਯਮਾਂ ਅਤੇ ਗੋਪਨੀਯਤਾ ਨੀਤੀ ਨਾਲ ਸਹਿਮਤ ਹਾਂ",
    submitBtn: "ਮੁਫਤ ਖਾਤਾ ਬਣਾਓ",
    submitting: "ਖਾਤਾ ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
    orContinueWith: "ਜਾਂ",
    alreadyHaveAccount: "ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ?",
    loginInstead: "ਇਸਦੀ ਬਜਾਏ ਸਾਈਨ ਇਨ ਕਰੋ",
    backToHome: "ਘਰ ਵਾਪਸ ਜਾਓ",
    validation: {
      nameRequired: "ਪੂਰਾ ਨਾਮ ਜ਼ਰੂਰੀ ਹੈ",
      emailRequired: "ਈਮੇਲ ਜ਼ਰੂਰੀ ਹੈ",
      emailInvalid: "ਅਵੈਧ ਈਮੇਲ ਫਾਰਮੈਟ",
      phoneRequired: "ਮੋਬਾਈਲ ਨੰਬਰ ਜ਼ਰੂਰੀ ਹੈ",
      phoneInvalid: "10-ਅੰਕਾਂ ਦਾ ਨੰਬਰ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ",
      stateRequired: "ਰਾਜ ਦੀ ਚੋਣ ਜ਼ਰੂਰੀ ਹੈ",
      passwordRequired: "ਪਾਸਵਰਡ ਜ਼ਰੂਰੀ ਹੈ",
      passwordShort: "ਘੱਟੋ-ਘੱਟ 6 ਅੱਖਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ",
      confirmRequired: "ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰਨਾ ਜ਼ਰੂਰੀ ਹੈ",
      confirmMismatch: "ਪਾਸਵਰਡ ਮੇਲ ਨਹੀਂ ਖਾਂਦੇ",
      termsRequired: "ਤੁਹਾਨੂੰ ਨਿਯਮਾਂ ਨਾਲ ਸਹਿਮਤ ਹੋਣਾ ਪਵੇਗਾ",
      registerFailed: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
    }
  }
},
  nav: {
    home: "ਹੋਮ",
    features: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
    howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    whyKrishiOra: "KrishiOra ਕਿਉਂ",
    login: "ਲੌਗ ਇਨ",
    getStarted: "ਸ਼ੁਰੂ ਕਰੋ",
    coreCapabilities: "ਮੁੱਖ ਸਮਰੱਥਾਵਾਂ",
    selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
    featItems: {
      farmManagement: { title: "ਖੇਤ ਪ੍ਰਬੰਧਨ", description: "ਪਲਾਟ, ਏਕੜ, ਮਿੱਟੀ ਅਤੇ ਪਾਣੀ ਸੋਮਿਆਂ ਨੂੰ ਸੰਗਠਿਤ ਕਰੋ।" },
      cropLifecycle: { title: "ਫ਼ਸਲ ਚੱਕਰ", description: "ਬਿਜਾਈ ਤੋਂ ਵਾਢੀ ਤੱਕ ਦੇ ਪੜਾਅ ਟਰੈਕ ਕਰੋ।" },
      expenseIntelligence: { title: "ਖ਼ਰਚੇ ਦੀ ਜਾਣਕਾਰੀ", description: "ਖਾਦ, ਡੀਜ਼ਲ ਅਤੇ ਮਜ਼ਦੂਰੀ ਦੇ ਖ਼ਰਚੇ ਸ਼੍ਰੇਣੀਬੱਧ ਕਰੋ।" },
      farmAnalytics: { title: "ਖੇਤ ਵਿਸ਼ਲੇਸ਼ਣ", description: "ਮੌਸਮੀ ਸਾਰ ਅਤੇ ਪ੍ਰਤੀ ਏਕੜ ਲਾਗਤ ਦੇਖੋ।" },
    },
  },
  hero: {
    eyebrow: "ਖੇਤੀਬਾੜੀ ਬੁੱਧੀਮਾਨ ਪਲੇਟਫਾਰਮ",
    line1: "ਸਮਾਰਟ ਖੇਤੀ।",
    line2: "ਬਿਹਤਰ ਫ਼ੈਸਲੇ।",
    line3: "ਮਜ਼ਬੂਤ ਫ਼ਸਲਾਂ।",
    subheadline: "KrishiOra ਤੁਹਾਡੇ ਖੇਤਾਂ, ਫ਼ਸਲਾਂ ਅਤੇ ਮੌਸਮੀ ਖ਼ਰਚਿਆਂ ਨੂੰ ਇੱਕ ਸਾਦੇ ਪਲੇਟਫਾਰਮ ਵਿੱਚ ਜੋੜਦਾ ਹੈ।",
    ctaPrimary: "ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ",
    ctaSecondary: "KrishiOra ਦੇਖੋ",
    caps: ["ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਲਈ ਬਣਿਆ", "7 ਖੇਤਰੀ ਭਾਸ਼ਾਵਾਂ", "ਸਪੱਸ਼ਟ ਖ਼ਰਚਾ ਟਰੈਕਿੰਗ", "ਫ਼ਸਲ ਚੱਕਰ ਜਾਣਕਾਰੀ"],
  },
  stats: {
    coreAreas: { value: "4", title: "ਮੁੱਖ ਖੇਤਰ", description: "ਖੇਤ, ਫ਼ਸਲਾਂ, ਖ਼ਰਚੇ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ" },
    languages: { value: "7", title: "ਸਹਾਇਕ ਭਾਸ਼ਾਵਾਂ", description: "ਭਾਰਤ ਦੇ ਵਿਭਿੰਨ ਕਿਸਾਨਾਂ ਲਈ" },
    farmerFocused: { value: "100%", title: "ਕਿਸਾਨ-ਕੇਂਦਰਿਤ", description: "ਅਸਲ ਖੇਤੀ ਵਰਕਫਲੋ ਅਨੁਸਾਰ" },
    platform: { value: "1", title: "ਜੁੜਿਆ ਪਲੇਟਫਾਰਮ", description: "ਤੁਹਾਡਾ ਸਾਰਾ ਖੇਤੀ ਡੇਟਾ ਇੱਕ ਥਾਂ" },
  },
  problemSolution: {
    badge: "ਅਸਲ ਖੇਤੀ ਲੋੜਾਂ ਦੇ ਅਧਾਰ 'ਤੇ",
    headline1: "ਖੇਤੀ ਗੁੰਝਲਦਾਰ ਹੈ।",
    headline2: "ਇਸਦਾ ਪ੍ਰਬੰਧਨ ਨਹੀਂ ਹੋਣਾ ਚਾਹੀਦਾ।",
    subheadline: "KrishiOra ਕਿਸਾਨਾਂ ਨੂੰ ਰਿਕਾਰਡ ਪ੍ਰਬੰਧਨ ਤੋਂ ਮੁਕਤ ਕਰਕੇ ਖੇਤਾਂ 'ਤੇ ਧਿਆਨ ਦੇਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।",
    challengeLabel: "ਚੁਣੌਤੀ",
    challengeTitle: "ਕਿਸਾਨਾਂ ਦੀਆਂ ਮੁਸ਼ਕਲਾਂ",
    solutionLabel: "ਹੱਲ",
    solutionTitle: "ਇੱਕ ਸਾਦਾ ਪਲੇਟਫਾਰਮ",
    tagline: "ਸਾਦੇ ਸੰਦ। ਬਿਹਤਰ ਫ਼ੈਸਲੇ। ਮਜ਼ਬੂਤ ਖੇਤ।",
    connected: "ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਹਰ ਲੋੜ, ਜੁੜੀ ਹੋਈ।",
    problems: [
      { title: "ਖਿੰਡੇ ਹੋਏ ਰਿਕਾਰਡ", description: "ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ ਕਾਪੀਆਂ ਅਤੇ ਵੱਖ-ਵੱਖ ਐਪਸ ਵਿੱਚ ਵੰਡੀ ਹੋਈ ਹੈ।" },
      { title: "ਅਸਪਸ਼ਟ ਖ਼ਰਚੇ", description: "ਸੰਗਠਿਤ ਟਰੈਕਿੰਗ ਤੋਂ ਬਿਨਾਂ ਖ਼ਰਚੇ ਸਮਝਣਾ ਔਖਾ ਹੈ।" },
      { title: "ਸੀਮਤ ਨਜ਼ਰੀਆ", description: "ਖੇਤ ਦਾ ਡੇਟਾ ਬੇਕਾਰ ਰਹਿੰਦਾ ਹੈ, ਯੋਜਨਾ ਬਣਾਉਣਾ ਔਖਾ ਹੋ ਜਾਂਦਾ ਹੈ।" },
    ],
    solutions: [
      { title: "ਆਪਣੇ ਖੇਤ ਪ੍ਰਬੰਧਿਤ ਕਰੋ", description: "ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ ਅਤੇ ਫ਼ਸਲ ਗਤੀਵਿਧੀਆਂ ਇੱਕ ਥਾਂ ਸੰਭਾਲੋ।" },
      { title: "ਹਰ ਖ਼ਰਚਾ ਟਰੈਕ ਕਰੋ", description: "ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਖ਼ਰਚੇ ਰਿਕਾਰਡ ਕਰੋ ਅਤੇ ਲਾਗਤਾਂ ਸਪੱਸ਼ਟ ਸਮਝੋ।" },
      { title: "ਡੇਟਾ ਤੋਂ ਜਾਣਕਾਰੀ ਲਓ", description: "ਸਾਦੇ ਵਿਸ਼ਲੇਸ਼ਣ ਨਾਲ ਖੇਤ ਨੂੰ ਸਮਝੋ ਅਤੇ ਬਿਹਤਰ ਫ਼ੈਸਲੇ ਕਰੋ।" },
    ],
  },
  features: {
    badge: "ਸਭ ਕੁਝ ਇੱਕ ਥਾਂ",
    headline1: "ਖੇਤੀ ਨੂੰ",
    headline2: "ਸਰਲ ਬਣਾਉਣ ਵਾਲੇ ਸੰਦ।",
    subheadline: "ਖੇਤਾਂ ਦੇ ਪ੍ਰਬੰਧਨ ਤੋਂ ਲੈ ਕੇ ਖ਼ਰਚੇ ਸਮਝਣ ਤੱਕ, KrishiOra ਤੁਹਾਡੀ ਖੇਤੀ ਯਾਤਰਾ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।",
    seeHow: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ ਦੇਖੋ",
    connected: "ਇੱਕ ਜੁੜਿਆ ਖੇਤੀ ਕਾਰਜਸਥਾਨ",
    connectedSub: "ਖੇਤ, ਫ਼ਸਲਾਂ, ਖ਼ਰਚੇ ਅਤੇ ਜਾਣਕਾਰੀ — ਇਕੱਠੇ।",
    items: [
      { title: "ਖੇਤ ਪ੍ਰਬੰਧਨ", description: "ਆਪਣੇ ਖੇਤਾਂ ਦੀ ਜਾਣਕਾਰੀ ਇੱਕ ਥਾਂ ਸੰਗਠਿਤ ਕਰੋ।", points: ["ਕਈ ਖੇਤ ਪ੍ਰਬੰਧਿਤ ਕਰੋ", "ਖੇਤ ਵੇਰਵੇ ਟਰੈਕ ਕਰੋ", "ਰਿਕਾਰਡ ਸੰਗਠਿਤ ਰੱਖੋ"] },
      { title: "ਫ਼ਸਲ ਪ੍ਰਬੰਧਨ", description: "ਬਿਜਾਈ ਤੋਂ ਵਾਢੀ ਤੱਕ ਫ਼ਸਲਾਂ ਟਰੈਕ ਕਰੋ।", points: ["ਸਰਗਰਮ ਫ਼ਸਲਾਂ ਟਰੈਕ ਕਰੋ", "ਫ਼ਸਲ ਪੜਾਅ ਦੇਖੋ", "ਰਿਕਾਰਡ ਸੰਭਾਲੋ"] },
      { title: "ਖ਼ਰਚਾ ਪ੍ਰਬੰਧਨ", description: "ਖੇਤੀ ਖ਼ਰਚੇ ਰਿਕਾਰਡ ਕਰੋ ਅਤੇ ਸਮਝੋ।", points: ["ਖ਼ਰਚੇ ਰਿਕਾਰਡ ਕਰੋ", "ਖ਼ਰਚੇ ਸ਼੍ਰੇਣੀਬੱਧ ਕਰੋ", "ਕੁੱਲ ਲਾਗਤ ਟਰੈਕ ਕਰੋ"] },
      { title: "ਸਮਾਰਟ ਵਿਸ਼ਲੇਸ਼ਣ", description: "ਖੇਤ ਡੇਟਾ ਤੋਂ ਸਾਦੀ ਜਾਣਕਾਰੀ ਲਓ।", points: ["ਖ਼ਰਚਾ ਰੁਝਾਨ ਦੇਖੋ", "ਡੇਟਾ ਸਮਝੋ", "ਸੂਝ-ਬੂਝ ਫ਼ੈਸਲੇ ਕਰੋ"] },
    ],
  },
  howItWorks: {
    badge: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    headline1: "ਖੇਤ ਰਿਕਾਰਡਾਂ ਤੋਂ",
    headline2: "ਬਿਹਤਰ ਫ਼ੈਸਲਿਆਂ ਤੱਕ।",
    subheadline: "KrishiOra ਪ੍ਰਕਿਰਿਆ ਨੂੰ ਸਾਦਾ ਰੱਖਦਾ ਹੈ। ਖੇਤ ਜੋੜੋ, ਫ਼ਸਲਾਂ ਪ੍ਰਬੰਧਿਤ ਕਰੋ, ਖ਼ਰਚੇ ਟਰੈਕ ਕਰੋ।",
    step: "ਕਦਮ",
    bannerTitle: "ਸਭ ਕੁਝ ਤੁਹਾਡੇ ਖੇਤ ਤੋਂ ਸ਼ੁਰੂ ਹੁੰਦਾ ਹੈ।",
    bannerDesc: "ਬੁਨਿਆਦੀ ਗੱਲਾਂ ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ ਅਤੇ ਹੌਲੀ-ਹੌਲੀ ਖੇਤੀ ਦੀ ਪੂਰੀ ਤਸਵੀਰ ਬਣਾਓ।",
    getStarted: "ਸ਼ੁਰੂ ਕਰੋ",
    steps: [
      { title: "ਆਪਣਾ ਖੇਤ ਬਣਾਓ", description: "ਖੇਤ ਦੇ ਵੇਰਵੇ ਦਾਖਲ ਕਰੋ ਅਤੇ ਸਾਰੀ ਜ਼ਰੂਰੀ ਜਾਣਕਾਰੀ ਇੱਕ ਥਾਂ ਸੰਭਾਲੋ।" },
      { title: "ਫ਼ਸਲਾਂ ਜੋੜੋ", description: "ਉਗਾਈਆਂ ਜਾਣ ਵਾਲੀਆਂ ਫ਼ਸਲਾਂ ਦਾਖਲ ਕਰੋ ਅਤੇ ਪੂਰੇ ਮੌਸਮ ਦੌਰਾਨ ਟਰੈਕ ਕਰੋ।" },
      { title: "ਖ਼ਰਚੇ ਟਰੈਕ ਕਰੋ", description: "ਹਰ ਖੇਤੀ ਖ਼ਰਚਾ ਰਿਕਾਰਡ ਕਰੋ ਅਤੇ ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਸੰਗਠਿਤ ਕਰੋ।" },
      { title: "ਆਪਣਾ ਖੇਤ ਸਮਝੋ", description: "ਸਾਦੇ ਵਿਸ਼ਲੇਸ਼ਣ ਨਾਲ ਡੇਟਾ ਸਮਝੋ ਅਤੇ ਬਿਹਤਰ ਫ਼ੈਸਲੇ ਕਰੋ।" },
    ],
  },
  expense: {
    badge: "ਖ਼ਰਚਾ ਜਾਣਕਾਰੀ",
    headline1: "ਜਾਣੋ ਤੁਹਾਡਾ ਪੈਸਾ",
    headline2: "ਕਿੱਥੇ ਜਾ ਰਿਹਾ ਹੈ।",
    subheadline: "ਖੇਤੀ ਖ਼ਰਚੇ ਰਿਕਾਰਡ ਕਰੋ, ਸ਼੍ਰੇਣੀ ਅਨੁਸਾਰ ਵੰਡੋ ਅਤੇ ਇੱਕ ਸਾਦੇ ਡੈਸ਼ਬੋਰਡ ਤੋਂ ਸਪੱਸ਼ਟ ਤਸਵੀਰ ਲਓ।",
    calloutText: "ਬਿਹਤਰ ਖ਼ਰਚਾ ਦ੍ਰਿਸ਼ਟੀ ਤੁਹਾਨੂੰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦੀ ਹੈ",
    calloutHighlight: "ਬਿਹਤਰ ਖੇਤੀ ਫ਼ੈਸਲੇ।",
    startTracking: "ਟਰੈਕਿੰਗ ਸ਼ੁਰੂ ਕਰੋ",
  },
  cta: {
    eyebrow: "ਆਪਣੇ ਖੇਤ ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ",
    headline1: "ਆਪਣਾ ਖੇਤ ਪ੍ਰਬੰਧਿਤ ਕਰਨ ਲਈ ਤਿਆਰ ਹੋ",
    headline2: "ਸਮਾਰਟ ਤਰੀਕੇ ਨਾਲ?",
    subheadline: "ਖੇਤ ਰਿਕਾਰਡ, ਫ਼ਸਲਾਂ, ਖ਼ਰਚੇ ਅਤੇ ਜਾਣਕਾਰੀ KrishiOra ਨਾਲ ਇੱਕਠੇ ਕਰੋ।",
    ctaPrimary: "ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ",
    ctaSecondary: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ ਦੇਖੋ",
    cardTitle: "ਸਭ ਕੁਝ ਜੁੜਿਆ",
    cardSub: "ਤੁਹਾਡੇ ਖੇਤ ਲਈ ਇੱਕ ਥਾਂ",
    cardFooter: "ਛੋਟੇ ਤੋਂ ਸ਼ੁਰੂ ਕਰੋ। ਸਮਾਰਟ ਖੇਤ ਬਣਾਓ।",
    benefits: ["ਆਪਣੇ ਖੇਤ ਇੱਕ ਥਾਂ ਪ੍ਰਬੰਧਿਤ ਕਰੋ", "ਫ਼ਸਲਾਂ ਅਤੇ ਖ਼ਰਚੇ ਟਰੈਕ ਕਰੋ", "ਸਾਦੀ ਜਾਣਕਾਰੀ ਨਾਲ ਖੇਤ ਸਮਝੋ"],
  },
  footer: {
    description: "ਕਿਸਾਨਾਂ ਦੀ ਖੇਤੀ ਡੇਟਾ ਵਧੇਰੇ ਸਪੱਸ਼ਟਤਾ ਨਾਲ ਪ੍ਰਬੰਧਿਤ ਕਰਨ ਲਈ ਇੱਕ ਸਾਦਾ ਡਿਜੀਟਲ ਪਲੇਟਫਾਰਮ।",
    product: "ਉਤਪਾਦ",
    company: "ਕੰਪਨੀ",
    languages: "ਭਾਸ਼ਾਵਾਂ",
    langDesc: "ਭਾਰਤ ਭਰ ਦੇ ਕਿਸਾਨਾਂ ਲਈ ਡਿਜੀਟਲ ਖੇਤੀ ਪਹੁੰਚਯੋਗ ਬਣਾਉਣ ਲਈ।",
    madeFor: "ਭਾਰਤ ਭਰ ਦੇ ਕਿਸਾਨਾਂ ਲਈ ਬਣਿਆ",
    backToTop: "ਉੱਪਰ ਜਾਓ",
    privacyPolicy: "ਗੋਪਨੀਯਤਾ ਨੀਤੀ",
    termsOfUse: "ਵਰਤੋਂ ਦੀਆਂ ਸ਼ਰਤਾਂ",
    allRights: "ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।",
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   HINDI (हिन्दी)
   ────────────────────────────────────────────────────────────────────────── */
const hi: Translation = {
  auth: {
  visual: {
    badge: "कृषि बुद्धिमत्ता मंच",
    title: "भारत का भविष्य उगाने वालों के लिए निर्मित।",
    description: "खेतों का प्रबंधन करें, फसलों को ट्रैक करें, खर्चों को समझें और एक ही स्थान से बेहतर कृषि निर्णय लें।",
    footer: [
      "फील्ड प्लॉट्स",
      "फसल ट्रैकिंग",
      "खर्च बुद्धिमत्ता"
    ]
  },
  login: {
    title: "वापसी पर स्वागत है",
    subtitle: "अपनी फसलों, खेतों और खर्चों तक पहुंचने के लिए अपने क्रेडेंशियल्स दर्ज करें।",
    emailLabel: "ईमेल या मोबाइल नंबर",
    emailPlaceholder: "name@farm.com या 9876543210",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "••••••••",
    forgotPassword: "पासवर्ड भूल गए?",
    rememberMe: "इस डिवाइस को 30 दिनों के लिए याद रखें",
    submitBtn: "डैशबोर्ड में साइन इन करें",
    submitting: "साइन इन हो रहा है...",
    orContinueWith: "या",
    newToPlatform: "KrishiOra पर नए हैं?",
    createAccount: "मुफ्त किसान खाता बनाएं",
    backToHome: "होम पर वापस जाएं",
    validation: {
      emailRequired: "कृपया अपना ईमेल या 10-अंकीय मोबाइल नंबर दर्ज करें।",
      emailInvalid: "कृपया एक वैध ईमेल पता या 10-अंकीय मोबाइल नंबर दर्ज करें।",
      passwordRequired: "कृपया अपना पासवर्ड दर्ज करें।",
      passwordShort: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
      emailOnlyError: "खाता साइन-इन के लिए वर्तमान में आपके पंजीकृत ईमेल पते की आवश्यकता है।",
      loginFailed: "साइन इन करने में असमर्थ। कृपया अपने क्रेडेंशियल्स सत्यापित करें और पुनः प्रयास करें।"
    }
  },
  register: {
    title: "अपना कृषि खाता बनाएं",
    subtitle: "अपने खेतों का प्रबंधन करने, खर्चों को ट्रैक करने और अपने कृषि व्यवसाय को बढ़ाने के लिए KrishiOra से जुड़ें।",
    nameLabel: "पूरा नाम",
    namePlaceholder: "उदा. रमेश कुमार",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "ramesh@farm.com",
    phoneLabel: "मोबाइल नंबर",
    phonePlaceholder: "10-अंकीय मोबाइल नंबर",
    stateLabel: "राज्य / क्षेत्र",
    statePlaceholder: "अपने कृषि राज्य का चयन करें",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "एक मजबूत पासवर्ड बनाएं",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "अपना पासवर्ड फिर से दर्ज करें",
    agreeTerms: "मैं नियमों और गोपनीयता नीति से सहमत हूं",
    submitBtn: "मुफ्त खाता बनाएं",
    submitting: "खाता बनाया जा रहा है...",
    orContinueWith: "या",
    alreadyHaveAccount: "क्या आपके पास पहले से खाता है?",
    loginInstead: "इसके बजाय साइन इन करें",
    backToHome: "होम पर वापस जाएं",
    validation: {
      nameRequired: "पूरा नाम आवश्यक है",
      emailRequired: "ईमेल आवश्यक है",
      emailInvalid: "अमान्य ईमेल प्रारूप",
      phoneRequired: "मोबाइल नंबर आवश्यक है",
      phoneInvalid: "10 अंकों का नंबर होना चाहिए",
      stateRequired: "राज्य चयन आवश्यक है",
      passwordRequired: "पासवर्ड आवश्यक है",
      passwordShort: "कम से कम 6 अक्षर होने चाहिए",
      confirmRequired: "पासवर्ड की पुष्टि करना आवश्यक है",
      confirmMismatch: "पासवर्ड मेल नहीं खाते",
      termsRequired: "आपको शर्तों से सहमत होना होगा",
      registerFailed: "पंजीकरण विफल। कृपया पुनः प्रयास करें।"
    }
  }
},
  nav: {
    home: "होम",
    features: "विशेषताएं",
    howItWorks: "यह कैसे काम करता है",
    whyKrishiOra: "KrishiOra क्यों",
    login: "लॉग इन",
    getStarted: "शुरू करें",
    coreCapabilities: "मुख्य क्षमताएं",
    selectLanguage: "भाषा चुनें",
    featItems: {
      farmManagement: { title: "खेत प्रबंधन", description: "प्लॉट, एकड़, मिट्टी और जल स्रोतों को व्यवस्थित करें।" },
      cropLifecycle: { title: "फसल चक्र", description: "बुवाई से कटाई तक के चरण ट्रैक करें।" },
      expenseIntelligence: { title: "खर्च बुद्धिमत्ता", description: "खाद, डीजल और मजदूरी के खर्च श्रेणीबद्ध करें।" },
      farmAnalytics: { title: "खेत विश्लेषण", description: "मौसमी सारांश और प्रति एकड़ लागत देखें।" },
    },
  },
  hero: {
    eyebrow: "कृषि बुद्धिमान मंच",
    line1: "स्मार्ट खेती।",
    line2: "बेहतर निर्णय।",
    line3: "मज़बूत फसल।",
    subheadline: "KrishiOra आपके खेतों, फसलों और मौसमी खर्चों को एक सरल मंच पर एकत्रित करता है — आधुनिक किसानों को आत्मविश्वास से खेती करने की स्पष्टता देता है।",
    ctaPrimary: "मुफ्त शुरू करें",
    ctaSecondary: "KrishiOra देखें",
    caps: ["भारतीय किसानों के लिए बना", "7 क्षेत्रीय भाषाएं", "स्पष्ट खर्च ट्रैकिंग", "फसल चक्र अंतर्दृष्टि"],
  },
  stats: {
    coreAreas: { value: "4", title: "मुख्य प्रबंधन क्षेत्र", description: "खेत, फसल, खर्च और विश्लेषण" },
    languages: { value: "7", title: "समर्थित भाषाएं", description: "भारत के विविध किसानों के लिए" },
    farmerFocused: { value: "100%", title: "किसान-केंद्रित", description: "वास्तविक खेती कार्यप्रवाह के अनुसार" },
    platform: { value: "1", title: "जुड़ा मंच", description: "आपका सारा कृषि डेटा एक जगह" },
  },
  problemSolution: {
    badge: "वास्तविक खेती जरूरतों पर आधारित",
    headline1: "खेती जटिल है।",
    headline2: "इसका प्रबंधन सरल होना चाहिए।",
    subheadline: "KrishiOra किसानों को रिकॉर्ड प्रबंधन से मुक्त करके खेतों पर ध्यान देने में मदद करता है।",
    challengeLabel: "चुनौती",
    challengeTitle: "किसानों की समस्याएं",
    solutionLabel: "समाधान",
    solutionTitle: "एक सरल मंच",
    tagline: "सरल उपकरण। बेहतर निर्णय। मजबूत खेत।",
    connected: "आपके खेत की हर जरूरत, जुड़ी हुई।",
    problems: [
      { title: "बिखरे हुए रिकॉर्ड", description: "खेत की जानकारी कॉपियों और अलग-अलग ऐप्स में बंटी होती है।" },
      { title: "अस्पष्ट खर्च", description: "संगठित ट्रैकिंग के बिना खर्च समझना मुश्किल है।" },
      { title: "सीमित दृश्यता", description: "खेत का डेटा बेकार रहता है, योजना बनाना कठिन हो जाता है।" },
    ],
    solutions: [
      { title: "अपने खेत प्रबंधित करें", description: "खेत की जानकारी और फसल गतिविधियां एक जगह संभालें।" },
      { title: "हर खर्च ट्रैक करें", description: "श्रेणी अनुसार खर्च दर्ज करें और लागतें स्पष्ट समझें।" },
      { title: "डेटा से जानकारी लें", description: "सरल विश्लेषण से खेत समझें और बेहतर निर्णय लें।" },
    ],
  },
  features: {
    badge: "सब कुछ एक जगह",
    headline1: "खेती को",
    headline2: "सरल बनाने वाले उपकरण।",
    subheadline: "खेत प्रबंधन से लेकर खर्च समझने तक, KrishiOra आपकी कृषि यात्रा में मदद करता है।",
    seeHow: "देखें कैसे काम करता है",
    connected: "एक जुड़ा कृषि कार्यक्षेत्र",
    connectedSub: "खेत, फसलें, खर्च और अंतर्दृष्टि — एक साथ।",
    items: [
      { title: "खेत प्रबंधन", description: "अपने खेतों की जानकारी एक जगह व्यवस्थित करें।", points: ["कई खेत प्रबंधित करें", "खेत विवरण ट्रैक करें", "रिकॉर्ड व्यवस्थित रखें"] },
      { title: "फसल प्रबंधन", description: "बुवाई से कटाई तक फसलें ट्रैक करें।", points: ["सक्रिय फसलें ट्रैक करें", "फसल चरण देखें", "रिकॉर्ड संभालें"] },
      { title: "खर्च प्रबंधन", description: "खेती खर्च दर्ज करें और समझें कहां पैसा जाता है।", points: ["खर्च दर्ज करें", "खर्च श्रेणीबद्ध करें", "कुल लागत ट्रैक करें"] },
      { title: "स्मार्ट विश्लेषण", description: "खेत डेटा से सरल जानकारी लें और प्रदर्शन समझें।", points: ["खर्च रुझान देखें", "डेटा समझें", "सूचित निर्णय लें"] },
    ],
  },
  howItWorks: {
    badge: "यह कैसे काम करता है",
    headline1: "खेत रिकॉर्ड से",
    headline2: "बेहतर निर्णयों तक।",
    subheadline: "KrishiOra प्रक्रिया को सरल रखता है। खेत जोड़ें, फसलें प्रबंधित करें, खर्च ट्रैक करें।",
    step: "चरण",
    bannerTitle: "सब कुछ आपके खेत से शुरू होता है।",
    bannerDesc: "बुनियादी बातों से शुरू करें और धीरे-धीरे कृषि का पूरा चित्र बनाएं।",
    getStarted: "शुरू करें",
    steps: [
      { title: "अपना खेत बनाएं", description: "खेत का विवरण दर्ज करें और सारी महत्वपूर्ण जानकारी एक जगह संभालें।" },
      { title: "फसलें जोड़ें", description: "उगाई जाने वाली फसलें दर्ज करें और पूरे मौसम ट्रैक करें।" },
      { title: "खर्च ट्रैक करें", description: "हर खेती खर्च दर्ज करें और श्रेणी अनुसार व्यवस्थित करें।" },
      { title: "अपना खेत समझें", description: "सरल विश्लेषण से डेटा समझें और बेहतर निर्णय लें।" },
    ],
  },
  expense: {
    badge: "खर्च बुद्धिमत्ता",
    headline1: "जानें आपका पैसा",
    headline2: "कहाँ जा रहा है।",
    subheadline: "खेती खर्च दर्ज करें, श्रेणी अनुसार व्यवस्थित करें और एक सरल डैशबोर्ड से स्पष्ट चित्र लें।",
    calloutText: "बेहतर खर्च दृश्यता आपको करने में मदद करती है",
    calloutHighlight: "बेहतर खेती निर्णय।",
    startTracking: "ट्रैकिंग शुरू करें",
  },
  cta: {
    eyebrow: "अपने खेत से शुरू करें",
    headline1: "अपना खेत प्रबंधित करने के लिए तैयार हैं",
    headline2: "स्मार्ट तरीके से?",
    subheadline: "खेत रिकॉर्ड, फसलें, खर्च और जानकारी KrishiOra के साथ एकत्रित करें।",
    ctaPrimary: "मुफ्त शुरू करें",
    ctaSecondary: "विशेषताएं देखें",
    cardTitle: "सब कुछ जुड़ा हुआ",
    cardSub: "आपके खेत के लिए एक कार्यक्षेत्र",
    cardFooter: "छोटे से शुरू करें। स्मार्ट खेत बनाएं।",
    benefits: ["अपने खेत एक जगह प्रबंधित करें", "फसलें और खेती खर्च ट्रैक करें", "सरल जानकारी से खेत समझें"],
  },
  footer: {
    description: "किसानों को उनके खेत, फसल, खर्च और कृषि डेटा अधिक स्पष्टता से प्रबंधित करने में मदद के लिए एक सरल डिजिटल मंच।",
    product: "उत्पाद",
    company: "कंपनी",
    languages: "भाषाएं",
    langDesc: "भारत भर के किसानों के लिए डिजिटल कृषि सुलभ बनाने के लिए।",
    madeFor: "भारत भर के किसानों के लिए बना",
    backToTop: "ऊपर जाएं",
    privacyPolicy: "गोपनीयता नीति",
    termsOfUse: "उपयोग की शर्तें",
    allRights: "सर्वाधिकार सुरक्षित।",
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   MARATHI (मराठी)
   ────────────────────────────────────────────────────────────────────────── */
const mr: Translation = {
  auth: {
  visual: {
    badge: "कृषी बुद्धिमत्ता प्लॅटफॉर्म",
    title: "भारताचे भविष्य घडवणाऱ्यांसाठी बनवलेले.",
    description: "शेतांचे व्यवस्थापन करा, पिकांचा मागोवा घ्या, खर्च समजून घ्या आणि एकाच ठिकाणाहून चांगले कृषी निर्णय घ्या.",
    footer: [
      "फील्ड प्लॉट्स",
      "पीक ट्रॅकिंग",
      "खर्च बुद्धिमत्ता"
    ]
  },
  login: {
    title: "पुन्हा स्वागत आहे",
    subtitle: "तुमची पिके, शेत आणि खर्चात प्रवेश करण्यासाठी तुमची ओळखपत्रे प्रविष्ट करा.",
    emailLabel: "ईमेल किंवा मोबाईल नंबर",
    emailPlaceholder: "name@farm.com किंवा 9876543210",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "••••••••",
    forgotPassword: "पासवर्ड विसरलात?",
    rememberMe: "हे डिव्हाइस 30 दिवसांसाठी लक्षात ठेवा",
    submitBtn: "डॅशबोर्डमध्ये साइन इन करा",
    submitting: "साइन इन करत आहे...",
    orContinueWith: "किंवा",
    newToPlatform: "KrishiOra वर नवीन आहात?",
    createAccount: "मोफत शेतकरी खाते तयार करा",
    backToHome: "होम वर परत जा",
    validation: {
      emailRequired: "कृपया तुमचा ईमेल किंवा 10-अंकी मोबाईल नंबर प्रविष्ट करा.",
      emailInvalid: "कृपया वैध ईमेल पत्ता किंवा 10-अंकी मोबाईल नंबर प्रविष्ट करा.",
      passwordRequired: "कृपया तुमचा पासवर्ड प्रविष्ट करा.",
      passwordShort: "पासवर्ड किमान 6 अक्षरांचा असावा.",
      emailOnlyError: "खाते साइन-इन करण्यासाठी सध्या तुमचा नोंदणीकृत ईमेल पत्ता आवश्यक आहे.",
      loginFailed: "साइन इन करण्यात अक्षम. कृपया तुमची ओळखपत्रे सत्यापित करा आणि पुन्हा प्रयत्न करा."
    }
  },
  register: {
    title: "तुमचे कृषी खाते तयार करा",
    subtitle: "तुमच्या शेतांचे व्यवस्थापन करण्यासाठी, खर्चाचा मागोवा घेण्यासाठी आणि तुमचा कृषी व्यवसाय वाढवण्यासाठी KrishiOra मध्ये सामील व्हा.",
    nameLabel: "पूर्ण नाव",
    namePlaceholder: "उदा. रमेश कुमार",
    emailLabel: "ईमेल पत्ता",
    emailPlaceholder: "ramesh@farm.com",
    phoneLabel: "मोबाईल नंबर",
    phonePlaceholder: "10-अंकी मोबाईल नंबर",
    stateLabel: "राज्य / प्रदेश",
    statePlaceholder: "तुमचे कृषी राज्य निवडा",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "एक मजबूत पासवर्ड तयार करा",
    confirmPasswordLabel: "पासवर्डची पुष्टी करा",
    confirmPasswordPlaceholder: "तुमचा पासवर्ड पुन्हा प्रविष्ट करा",
    agreeTerms: "मी अटी आणि गोपनीयता धोरणाशी सहमत आहे",
    submitBtn: "मोफत खाते तयार करा",
    submitting: "खाते तयार करत आहे...",
    orContinueWith: "किंवा",
    alreadyHaveAccount: "तुमच्याकडे आधीपासून खाते आहे का?",
    loginInstead: "याऐवजी साइन इन करा",
    backToHome: "होम वर परत जा",
    validation: {
      nameRequired: "पूर्ण नाव आवश्यक आहे",
      emailRequired: "ईमेल आवश्यक आहे",
      emailInvalid: "अवैध ईमेल स्वरूप",
      phoneRequired: "मोबाईल नंबर आवश्यक आहे",
      phoneInvalid: "10-अंकी नंबर असणे आवश्यक आहे",
      stateRequired: "राज्य निवडणे आवश्यक आहे",
      passwordRequired: "पासवर्ड आवश्यक आहे",
      passwordShort: "किमान 6 अक्षरे असणे आवश्यक आहे",
      confirmRequired: "पासवर्डची पुष्टी करणे आवश्यक आहे",
      confirmMismatch: "पासवर्ड जुळत नाहीत",
      termsRequired: "तुम्ही अटींशी सहमत असणे आवश्यक आहे",
      registerFailed: "नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा."
    }
  }
},
  nav: {
    home: "मुख्यपृष्ठ",
    features: "वैशिष्ट्ये",
    howItWorks: "हे कसे काम करते",
    whyKrishiOra: "KrishiOra का",
    login: "लॉग इन",
    getStarted: "सुरुवात करा",
    coreCapabilities: "मुख्य क्षमता",
    selectLanguage: "भाषा निवडा",
    featItems: {
      farmManagement: { title: "शेत व्यवस्थापन", description: "प्लॉट, एकर, मातीचे प्रकार आणि जलस्रोत व्यवस्थित करा।" },
      cropLifecycle: { title: "पीक चक्र", description: "पेरणीपासून काढणीपर्यंतचे टप्पे ट्रॅक करा।" },
      expenseIntelligence: { title: "खर्च बुद्धिमत्ता", description: "खत, डिझेल आणि मजुरीचे खर्च वर्गीकृत करा।" },
      farmAnalytics: { title: "शेत विश्लेषण", description: "हंगामी सारांश आणि प्रति एकर खर्च पहा।" },
    },
  },
  hero: {
    eyebrow: "कृषी बुद्धिमान मंच",
    line1: "स्मार्ट शेती।",
    line2: "चांगले निर्णय।",
    line3: "मजबूत पीक।",
    subheadline: "KrishiOra तुमची शेते, पिके आणि हंगामी खर्च एका साध्या मंचावर एकत्र आणतो — आधुनिक शेतकऱ्यांना आत्मविश्वासाने शेती करण्याची स्पष्टता देतो।",
    ctaPrimary: "मोफत सुरू करा",
    ctaSecondary: "KrishiOra पहा",
    caps: ["भारतीय शेतकऱ्यांसाठी बनवले", "७ प्रादेशिक भाषा", "स्पष्ट खर्च ट्रॅकिंग", "पीक चक्र अंतर्दृष्टी"],
  },
  stats: {
    coreAreas: { value: "4", title: "मुख्य व्यवस्थापन क्षेत्रे", description: "शेत, पिके, खर्च आणि विश्लेषण" },
    languages: { value: "7", title: "समर्थित भाषा", description: "भारतातील विविध शेतकऱ्यांसाठी" },
    farmerFocused: { value: "100%", title: "शेतकरी-केंद्रित", description: "वास्तविक शेती कामाप्रमाणे तयार केले" },
    platform: { value: "1", title: "जोडलेला मंच", description: "तुमचा सर्व कृषी डेटा एका ठिकाणी" },
  },
  problemSolution: {
    badge: "वास्तविक शेतीच्या गरजांवर आधारित",
    headline1: "शेती गुंतागुंतीची आहे।",
    headline2: "व्यवस्थापन सोपे असावे।",
    subheadline: "KrishiOra शेतकऱ्यांना नोंदी व्यवस्थापनापासून मुक्त करून शेतावर लक्ष केंद्रित करण्यास मदत करतो।",
    challengeLabel: "आव्हान",
    challengeTitle: "शेतकऱ्यांच्या समस्या",
    solutionLabel: "उपाय",
    solutionTitle: "एक साधा मंच",
    tagline: "साधी साधने। चांगले निर्णय। मजबूत शेत।",
    connected: "तुमच्या शेताची प्रत्येक गरज, जोडलेली।",
    problems: [
      { title: "विखुरलेल्या नोंदी", description: "शेताची माहिती वह्या आणि वेगवेगळ्या ॲप्समध्ये विभागलेली असते।" },
      { title: "अस्पष्ट खर्च", description: "संघटित ट्रॅकिंगशिवाय खर्च समजणे कठीण होते।" },
      { title: "मर्यादित दृश्यमानता", description: "शेताचा डेटा वापरला जात नाही, नियोजन कठीण होते।" },
    ],
    solutions: [
      { title: "तुमची शेते व्यवस्थापित करा", description: "शेताची माहिती आणि पीक क्रियाकलाप एका ठिकाणी ठेवा।" },
      { title: "प्रत्येक खर्च ट्रॅक करा", description: "श्रेणीनुसार खर्च नोंदवा आणि शेतीची किंमत स्पष्टपणे समजा।" },
      { title: "डेटाचे ज्ञानात रूपांतर करा", description: "साध्या विश्लेषणाने शेत समजून घ्या आणि चांगले निर्णय घ्या।" },
    ],
  },
  features: {
    badge: "सर्व काही एका ठिकाणी",
    headline1: "शेतीला",
    headline2: "सोपे करणारी साधने।",
    subheadline: "शेत व्यवस्थापनापासून खर्च समजण्यापर्यंत, KrishiOra तुमच्या कृषी प्रवासात मदत करतो।",
    seeHow: "कसे काम करते ते पहा",
    connected: "एक जोडलेले शेती कार्यक्षेत्र",
    connectedSub: "शेते, पिके, खर्च आणि अंतर्दृष्टी — एकत्र।",
    items: [
      { title: "शेत व्यवस्थापन", description: "तुमच्या शेतांची माहिती एका ठिकाणी व्यवस्थित करा।", points: ["अनेक शेते व्यवस्थापित करा", "शेताचे तपशील ट्रॅक करा", "नोंदी संघटित ठेवा"] },
      { title: "पीक व्यवस्थापन", description: "पेरणीपासून काढणीपर्यंत पिके ट्रॅक करा।", points: ["सक्रिय पिके ट्रॅक करा", "पीक टप्पे पहा", "नोंदी संभाळा"] },
      { title: "खर्च व्यवस्थापन", description: "शेतीचे खर्च नोंदवा आणि पैसा कुठे जातो ते समजा।", points: ["खर्च नोंदवा", "खर्च वर्गीकृत करा", "एकूण खर्च ट्रॅक करा"] },
      { title: "स्मार्ट विश्लेषण", description: "शेत डेटाचे साध्या माहितीत रूपांतर करा।", points: ["खर्च कल पहा", "डेटा समजा", "माहितीपूर्ण निर्णय घ्या"] },
    ],
  },
  howItWorks: {
    badge: "हे कसे काम करते",
    headline1: "शेताच्या नोंदींपासून",
    headline2: "चांगल्या निर्णयांपर्यंत।",
    subheadline: "KrishiOra प्रक्रिया सोपी ठेवतो। शेत जोडा, पिके व्यवस्थापित करा, खर्च ट्रॅक करा।",
    step: "पाऊल",
    bannerTitle: "सर्व काही तुमच्या शेतापासून सुरू होते।",
    bannerDesc: "मूलभूत गोष्टींपासून सुरू करा आणि हळूहळू कृषीचे पूर्ण चित्र तयार करा।",
    getStarted: "सुरुवात करा",
    steps: [
      { title: "तुमचे शेत तयार करा", description: "शेताचे तपशील प्रविष्ट करा आणि सर्व महत्त्वाची माहिती एका ठिकाणी ठेवा।" },
      { title: "पिके जोडा", description: "उगवलेल्या पिकांची नोंद करा आणि संपूर्ण हंगामात ट्रॅक करा।" },
      { title: "खर्च ट्रॅक करा", description: "प्रत्येक शेती खर्च नोंदवा आणि श्रेणीनुसार व्यवस्थित करा।" },
      { title: "तुमचे शेत समजा", description: "साध्या विश्लेषणाने डेटा समजा आणि चांगले निर्णय घ्या।" },
    ],
  },
  expense: {
    badge: "खर्च बुद्धिमत्ता",
    headline1: "तुमचा पैसा",
    headline2: "कुठे जातो ते जाणा।",
    subheadline: "शेतीचे खर्च नोंदवा, श्रेणीनुसार व्यवस्थित करा आणि एका साध्या डॅशबोर्डवरून स्पष्ट चित्र मिळवा।",
    calloutText: "चांगली खर्च दृश्यमानता तुम्हाला करण्यास मदत करते",
    calloutHighlight: "चांगले शेती निर्णय।",
    startTracking: "ट्रॅकिंग सुरू करा",
  },
  cta: {
    eyebrow: "तुमच्या शेतापासून सुरू करा",
    headline1: "तुमचे शेत व्यवस्थापित करण्यासाठी तयार आहात",
    headline2: "स्मार्ट पद्धतीने?",
    subheadline: "शेताच्या नोंदी, पिके, खर्च आणि माहिती KrishiOra सोबत एकत्र आणा।",
    ctaPrimary: "मोफत सुरू करा",
    ctaSecondary: "वैशिष्ट्ये पहा",
    cardTitle: "सर्व काही जोडलेले",
    cardSub: "तुमच्या शेतासाठी एक कार्यक्षेत्र",
    cardFooter: "छोट्याने सुरू करा। स्मार्ट शेत तयार करा।",
    benefits: ["तुमची शेते एका ठिकाणी व्यवस्थापित करा", "पिके आणि शेती खर्च ट्रॅक करा", "साध्या माहितीने शेत समजा"],
  },
  footer: {
    description: "शेतकऱ्यांना त्यांच्या शेत, पिके, खर्च आणि कृषी डेटा अधिक स्पष्टतेने व्यवस्थापित करण्यासाठी एक साधे डिजिटल व्यासपीठ।",
    product: "उत्पादन",
    company: "कंपनी",
    languages: "भाषा",
    langDesc: "भारतभरातील शेतकऱ्यांसाठी डिजिटल शेती सुलभ करण्यासाठी।",
    madeFor: "भारतभरातील शेतकऱ्यांसाठी बनवले",
    backToTop: "वर जा",
    privacyPolicy: "गोपनीयता धोरण",
    termsOfUse: "वापराच्या अटी",
    allRights: "सर्व हक्क राखीव।",
  },
};

/* ──────────────────────────────────────────────────────────────────────────
   GUJARATI (ગુજરાતી)
   ────────────────────────────────────────────────────────────────────────── */
const gu: Translation = {
  auth: {
  visual: {
    badge: "કૃષિ બુદ્ધિમત્તા પ્લેટફોર્મ",
    title: "ભારતનું ભવિષ્ય ઉગાડનારાઓ માટે બનાવેલ.",
    description: "ખેતરોનું સંચાલન કરો, પાકને ટ્રેક કરો, ખર્ચ સમજો અને એક જ જગ્યાએથી વધુ સારા કૃષિ નિર્ણયો લો.",
    footer: [
      "ફિલ્ડ પ્લોટ્સ",
      "પાક ટ્રેકિંગ",
      "ખર્ચ બુદ્ધિમત્તા"
    ]
  },
  login: {
    title: "ફરીથી સ્વાગત છે",
    subtitle: "તમારા પાક, ખેતરો અને ખર્ચને ઍક્સેસ કરવા માટે તમારા ઓળખપત્રો દાખલ કરો.",
    emailLabel: "ઈમેલ અથવા મોબાઈલ નંબર",
    emailPlaceholder: "name@farm.com અથવા 9876543210",
    passwordLabel: "પાસવર્ડ",
    passwordPlaceholder: "••••••••",
    forgotPassword: "પાસવર્ડ ભૂલી ગયા છો?",
    rememberMe: "આ ઉપકરણને 30 દિવસ માટે યાદ રાખો",
    submitBtn: "ડેશબોર્ડમાં સાઇન ઇન કરો",
    submitting: "સાઇન ઇન થઈ રહ્યું છે...",
    orContinueWith: "અથવા",
    newToPlatform: "KrishiOra પર નવા છો?",
    createAccount: "મફત ખેડૂત ખાતું બનાવો",
    backToHome: "હોમ પર પાછા જાઓ",
    validation: {
      emailRequired: "કૃપા કરીને તમારો ઈમેલ અથવા 10-આંકડાનો મોબાઈલ નંબર દાખલ કરો.",
      emailInvalid: "કૃપા કરીને માન્ય ઈમેલ સરનામું અથવા 10-આંકડાનો મોબાઈલ નંબર દાખલ કરો.",
      passwordRequired: "કૃપા કરીને તમારો પાસવર્ડ દાખલ કરો.",
      passwordShort: "પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરોનો હોવો જોઈએ.",
      emailOnlyError: "ખાતામાં સાઇન ઇન કરવા માટે હાલમાં તમારા નોંધાયેલ ઈમેલ સરનામાની જરૂર છે.",
      loginFailed: "સાઇન ઇન કરવામાં અસમર્થ. કૃપા કરીને તમારા ઓળખપત્રો ચકાસો અને ફરી પ્રયાસ કરો."
    }
  },
  register: {
    title: "તમારું કૃષિ ખાતું બનાવો",
    subtitle: "તમારા ખેતરોનું સંચાલન કરવા, ખર્ચને ટ્રેક કરવા અને તમારા કૃષિ વ્યવસાયને વધારવા માટે KrishiOra માં જોડાઓ.",
    nameLabel: "પૂરું નામ",
    namePlaceholder: "દા.ત. રમેશ કુમાર",
    emailLabel: "ઈમેલ સરનામું",
    emailPlaceholder: "ramesh@farm.com",
    phoneLabel: "મોબાઈલ નંબર",
    phonePlaceholder: "10-આંકડાનો મોબાઈલ નંબર",
    stateLabel: "રાજ્ય / પ્રદેશ",
    statePlaceholder: "તમારું કૃષિ રાજ્ય પસંદ કરો",
    passwordLabel: "પાસવર્ડ",
    passwordPlaceholder: "એક મજબૂત પાસવર્ડ બનાવો",
    confirmPasswordLabel: "પાસવર્ડની પુષ્ટિ કરો",
    confirmPasswordPlaceholder: "તમારો પાસવર્ડ ફરીથી દાખલ કરો",
    agreeTerms: "હું શરતો અને ગોપનીયતા નીતિ સાથે સંમત છું",
    submitBtn: "મફત ખાતું બનાવો",
    submitting: "ખાતું બની રહ્યું છે...",
    orContinueWith: "અથવા",
    alreadyHaveAccount: "શું તમારી પાસે પહેલેથી જ ખાતું છે?",
    loginInstead: "તેના બદલે સાઇન ઇન કરો",
    backToHome: "હોમ પર પાછા જાઓ",
    validation: {
      nameRequired: "પૂરું નામ આવશ્યક છે",
      emailRequired: "ઈમેલ આવશ્યક છે",
      emailInvalid: "અમાન્ય ઈમેલ ફોર્મેટ",
      phoneRequired: "મોબાઈલ નંબર આવશ્યક છે",
      phoneInvalid: "10 આંકડાનો નંબર હોવો જોઈએ",
      stateRequired: "રાજ્યની પસંદગી આવશ્યક છે",
      passwordRequired: "પાસવર્ડ આવશ્યક છે",
      passwordShort: "ઓછામાં ઓછા 6 અક્ષરો હોવા જોઈએ",
      confirmRequired: "પાસવર્ડની પુષ્ટિ કરવી આવશ્યક છે",
      confirmMismatch: "પાસવર્ડ મેળ ખાતા નથી",
      termsRequired: "તમારે શરતો સાથે સંમત થવું આવશ્યક છે",
      registerFailed: "નોંધણી નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો."
    }
  }
},
  nav: { home: "હોમ", features: "સુવિધાઓ", howItWorks: "આ કેવી રીતે કામ કરે છે", whyKrishiOra: "KrishiOra કેમ", login: "લૉગ ઇન", getStarted: "શરૂ કરો", coreCapabilities: "મુખ્ય ક્ષમતાઓ", selectLanguage: "ભાષા પસંદ કરો",
    featItems: { farmManagement: { title: "ખેત વ્યવસ્થાપન", description: "પ્લોટ, એકર, માટી અને જળ સ્ત્રોત ગોઠવો।" }, cropLifecycle: { title: "પાક ચક્ર", description: "વાવણીથી લણણી સુધીના તબક્કા ટ્રૅક કરો।" }, expenseIntelligence: { title: "ખર્ચ બુદ્ધિ", description: "ખાતર, ડીઝલ અને મજૂરી ખર્ચ વર્ગીકૃત કરો।" }, farmAnalytics: { title: "ખેત વિશ્લેષણ", description: "મૌસમી સારાંશ અને પ્રતિ એકર ખર્ચ જુઓ।" } }
  },
  hero: { eyebrow: "કૃષિ બુદ્ધિ મંચ", line1: "સ્માર્ટ ખેતી।", line2: "વધુ સારા નિર્ણયો।", line3: "મજબૂત પાક।", subheadline: "KrishiOra તમારા ખેતરો, પાક અને મૌસમી ખર્ચ એક સરળ મંચ પર એકત્રિત કરે છે।", ctaPrimary: "મફત શરૂ કરો", ctaSecondary: "KrishiOra જુઓ", caps: ["ભારતીય ખેડૂતો માટે બનાવ્યું", "7 પ્રાદેશિક ભાષાઓ", "સ્પષ્ટ ખર્ચ ટ્રૅકિંગ", "પાક ચક્ર અંતર્દૃષ્ટિ"] },
  stats: { coreAreas: { value: "4", title: "મુખ્ય વ્યવસ્થાપન ક્ષેત્રો", description: "ખેત, પાક, ખર્ચ અને વિશ્લેષણ" }, languages: { value: "7", title: "સમર્થિત ભાષાઓ", description: "ભારતના વૈવિધ્ય ખેડૂતો માટે" }, farmerFocused: { value: "100%", title: "ખેડૂત-કેન્દ્રિત", description: "વાસ્તવિક ખેતી વર્કફ્લો મુજબ" }, platform: { value: "1", title: "જોડાયેલ મંચ", description: "તમારો સઘળો કૃષિ ડેટા એક સ્થળે" } },
  problemSolution: { badge: "વાસ્તવિક ખેતી જરૂરિયાત પર આધારિત", headline1: "ખેતી જટિલ છે।", headline2: "વ્યવસ્થાપન સરળ હોવું જોઈએ।", subheadline: "KrishiOra ખેડૂતોને રેકોર્ડ વ્યવસ્થાપનથી મુક્ત કરી ખેતર પર ધ્યાન આપવામાં મદદ કરે છે।", challengeLabel: "પડકાર", challengeTitle: "ખેડૂતોની સમસ્યાઓ", solutionLabel: "ઉકેલ", solutionTitle: "એક સરળ મંચ", tagline: "સરળ સાધનો। વધારે સારા નિર્ણયો। મજબૂત ખેત।", connected: "તમારા ખેતની દરેક જરૂરિયાત, જોડાયેલ।",
    problems: [{ title: "વેરવિખેર નોંધ", description: "ખેત માહિતી ચોપડીઓ અને અલગ-અલગ ઍપ્સમાં વહેંચાયેલ છે।" }, { title: "અસ્પષ્ટ ખર્ચ", description: "સંગઠિત ટ્રૅકિંગ વિના ખર્ચ સમજવું મુશ્કેલ છે।" }, { title: "મર્યાદિત દ્રષ્ટિ", description: "ખેતનો ડેટા બેકાર રહે છે, આયોજન મુશ્કેલ બને છે।" }],
    solutions: [{ title: "તમારા ખેત સંભાળો", description: "ખેત માહિતી અને પાક પ્રવૃત્તિઓ એક સ્થળે ગોઠવો।" }, { title: "દરેક ખર્ચ ટ્રૅક કરો", description: "શ્રેણી પ્રમાણે ખર્ચ નોંધો અને ખેતીની કિંમત સ્પષ્ટ સમજો।" }, { title: "ડેટામાંથી જ્ઞાન મેળવો", description: "સરળ વિશ્લેષણ વડે ખેત સમજો અને સારા નિર્ણયો લો।" }]
  },
  features: { badge: "બધું જ એક જગ્યાએ", headline1: "ખેતીને", headline2: "સરળ બનાવતા સાધનો।", subheadline: "ખેત વ્યવસ્થાપનથી ખર્ચ સમજવા સુધી, KrishiOra તમારી કૃષિ યાત્રામાં મદદ કરે છે।", seeHow: "કેવી રીતે કામ કરે છે જુઓ", connected: "એક જોડાયેલ ખેતી કાર્યક્ષેત્ર", connectedSub: "ખેત, પાક, ખર્ચ અને અંતર્દૃષ્ટિ — સાથે।",
    items: [{ title: "ખેત વ્યવસ્થાપન", description: "ખેતોની માહિતી એક સ્થળે ગોઠવો।", points: ["અનેક ખેત સંભાળો", "ખેત વિગત ટ્રૅક કરો", "નોંધ ગોઠવો"] }, { title: "પાક વ્યવસ્થાપન", description: "વાવણીથી લણણી સુધી પાક ટ્રૅક કરો।", points: ["સક્રિય પાક ટ્રૅક કરો", "પાક તબક્કો જુઓ", "નોંધ સાચવો"] }, { title: "ખર્ચ વ્યવસ્થાપન", description: "ખેતીના ખર્ચ નોંધો અને સમજો।", points: ["ખર્ચ નોંધો", "ખર્ચ વર્ગીકૃત કરો", "કુલ ખર્ચ ટ્રૅક કરો"] }, { title: "સ્માર્ટ વિશ્લેષણ", description: "ખેત ડેટામાંથી સરળ અંતર્દૃષ્ટિ મેળવો।", points: ["ખર્ચ ટ્રેન્ડ જુઓ", "ડેટા સમજો", "માહિતગાર નિર્ણયો લો"] }]
  },
  howItWorks: { badge: "આ કેવી રીતે કામ કરે છે", headline1: "ખેત નોંધોથી", headline2: "સારા નિર્ણયો સુધી।", subheadline: "KrishiOra પ્રક્રિયાને સરળ રાખે છે। ખેત ઉમેરો, પાક સંભાળો, ખર્ચ ટ્રૅક કરો।", step: "પગલું", bannerTitle: "બધું જ તમારા ખેતથી શરૂ થાય છે।", bannerDesc: "મૂળભૂત બાબતોથી શરૂ કરો અને ધીરે ધીરે કૃષિનું સ્પષ્ટ ચિત્ર બનાવો।", getStarted: "શરૂ કરો",
    steps: [{ title: "તમારું ખેત બનાવો", description: "ખેતની વિગત નોંધો અને બધી મહત્વની માહિતી સાચવો।" }, { title: "પાક ઉમેરો", description: "ઉગાડવામાં આવેલ પાકો નોંધો અને આખા મૌસમ ટ્રૅક કરો।" }, { title: "ખર્ચ ટ્રૅક કરો", description: "દરેક ખેતી ખર્ચ નોંધો અને શ્રેણી પ્રમાણે ગોઠવો।" }, { title: "ખેત સમજો", description: "સરળ વિશ્લેષણ વડે ડેટા સમજો અને સારા નિર્ણયો લો।" }]
  },
  expense: { badge: "ખર્ચ બુદ્ધિ", headline1: "જાણો તમારો પૈસો", headline2: "ક્યાં જાય છે।", subheadline: "ખેતી ખર્ચ નોંધો, શ્રેણી પ્રમાણે ગોઠવો અને સ્પષ્ટ ચિત્ર મેળવો।", calloutText: "વધારે ખર્ચ દ્રષ્ટિ તમને કરવામાં મદદ કરે છે", calloutHighlight: "વધારે સારા ખેત નિર્ણયો।", startTracking: "ટ્રૅકિંગ શરૂ કરો" },
  cta: { eyebrow: "ખેતથી શરૂ કરો", headline1: "ખેત સ્માર્ટ રીતે", headline2: "સંભાળવા તૈયાર?", subheadline: "KrishiOra સાથે ખેત નોંધ, પાક, ખર્ચ અને અંતર્દૃષ્ટિ ભેગા કરો।", ctaPrimary: "મફત શરૂ કરો", ctaSecondary: "સુવિધાઓ જુઓ", cardTitle: "બધું જ જોડાયેલ", cardSub: "ખેત માટે એક કાર્યક્ષેત્ર", cardFooter: "નાનાથી શરૂ. સ્માર્ટ ખેત બનાવો।", benefits: ["ખેત એક જ સ્થળે સંભાળો", "પાક અને ખર્ચ ટ્રૅક કરો", "સરળ અંતર્દૃષ્ટિ વડે ખેત સમજો"] },
  footer: { description: "ખેડૂતોને ખેત, પાક, ખર્ચ અને કૃષિ ડેટા વ્યવસ્થિત રીતે સંભાળવા માટે સરળ ડિજિટલ મંચ।", product: "ઉત્પાદન", company: "કંપની", languages: "ભાષાઓ", langDesc: "ભારતભરના ખેડૂતો માટે ડિજિટલ ખેતી સુલભ બનાવવા।", madeFor: "ભારતભરના ખેડૂતો માટે બનાવ્યું", backToTop: "ઉપર જાઓ", privacyPolicy: "ગોપનીયતા નીતિ", termsOfUse: "ઉપયોગની શરતો", allRights: "સર્વ અધિકાર સુરક્ષિત।" },
};

/* ──────────────────────────────────────────────────────────────────────────
   TAMIL (தமிழ்)
   ────────────────────────────────────────────────────────────────────────── */
const ta: Translation = {
  auth: {
  visual: {
    badge: "விவசாய நுண்ணறிவு தளம்",
    title: "இந்தியாவின் எதிர்காலத்தை உருவாக்குபவர்களுக்காக வடிவமைக்கப்பட்டது.",
    description: "பண்ணைகளை நிர்வகிக்கவும், பயிர்களைக் கண்காணிக்கவும், செலவுகளைப் புரிந்துகொள்ளவும், ஒரே இடத்திலிருந்து சிறந்த விவசாய முடிவுகளை எடுக்கவும்.",
    footer: [
      "வயல் பகுதிகள்",
      "பயிர் கண்காணிப்பு",
      "செலவு நுண்ணறிவு"
    ]
  },
  login: {
    title: "மீண்டும் வருக",
    subtitle: "உங்கள் பயிர்கள், பண்ணைகள் மற்றும் செலவுகளை அணுக உங்கள் விவரங்களை உள்ளிடவும்.",
    emailLabel: "மின்னஞ்சல் அல்லது மொபைல் எண்",
    emailPlaceholder: "name@farm.com அல்லது 9876543210",
    passwordLabel: "கடவுச்சொல்",
    passwordPlaceholder: "••••••••",
    forgotPassword: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
    rememberMe: "இந்த சாதனத்தை 30 நாட்களுக்கு நினைவில் கொள்க",
    submitBtn: "டாஷ்போர்டில் உள்நுழைக",
    submitting: "உள்நுழைகிறது...",
    orContinueWith: "அல்லது",
    newToPlatform: "KrishiOra-க்கு புதியவரா?",
    createAccount: "இலவச விவசாயி கணக்கை உருவாக்கவும்",
    backToHome: "முகப்பிற்குத் திரும்பு",
    validation: {
      emailRequired: "உங்கள் மின்னஞ்சல் அல்லது 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
      emailInvalid: "சரியான மின்னஞ்சல் முகவரி அல்லது 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
      passwordRequired: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்.",
      passwordShort: "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.",
      emailOnlyError: "கணக்கில் உள்நுழைய தற்போது உங்கள் பதிவு செய்யப்பட்ட மின்னஞ்சல் முகவரி தேவை.",
      loginFailed: "உள்நுழைய முடியவில்லை. உங்கள் விவரங்களைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
    }
  },
  register: {
    title: "உங்கள் விவசாய கணக்கை உருவாக்கவும்",
    subtitle: "உங்கள் பண்ணைகளை நிர்வகிக்க, செலவுகளைக் கண்காணிக்க மற்றும் உங்கள் விவசாயத் தொழிலை வளர்க்க KrishiOra-வில் இணையுங்கள்.",
    nameLabel: "முழு பெயர்",
    namePlaceholder: "எ.கா. ரமேஷ் குமார்",
    emailLabel: "மின்னஞ்சல் முகவரி",
    emailPlaceholder: "ramesh@farm.com",
    phoneLabel: "மொபைல் எண்",
    phonePlaceholder: "10 இலக்க மொபைல் எண்",
    stateLabel: "மாநிலம் / பகுதி",
    statePlaceholder: "உங்கள் விவசாய மாநிலத்தைத் தேர்ந்தெடுக்கவும்",
    passwordLabel: "கடவுச்சொல்",
    passwordPlaceholder: "வலுவான கடவுச்சொல்லை உருவாக்கவும்",
    confirmPasswordLabel: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    confirmPasswordPlaceholder: "உங்கள் கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",
    agreeTerms: "விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஏற்கிறேன்",
    submitBtn: "இலவச கணக்கை உருவாக்கவும்",
    submitting: "கணக்கு உருவாக்கப்படுகிறது...",
    orContinueWith: "அல்லது",
    alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    loginInstead: "பதிலாக உள்நுழைக",
    backToHome: "முகப்பிற்குத் திரும்பு",
    validation: {
      nameRequired: "முழு பெயர் தேவை",
      emailRequired: "மின்னஞ்சல் தேவை",
      emailInvalid: "தவறான மின்னஞ்சல் வடிவம்",
      phoneRequired: "மொபைல் எண் தேவை",
      phoneInvalid: "10 இலக்க எண்ணாக இருக்க வேண்டும்",
      stateRequired: "மாநிலத் தேர்வு தேவை",
      passwordRequired: "கடவுச்சொல் தேவை",
      passwordShort: "குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்",
      confirmRequired: "கடவுச்சொல்லை உறுதிப்படுத்துதல் தேவை",
      confirmMismatch: "கடவுச்சொற்கள் பொருந்தவில்லை",
      termsRequired: "நீங்கள் விதிமுறைகளை ஏற்க வேண்டும்",
      registerFailed: "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்."
    }
  }
},
  nav: { home: "முகப்பு", features: "அம்சங்கள்", howItWorks: "இது எப்படி வேலை செய்கிறது", whyKrishiOra: "KrishiOra ஏன்", login: "உள்நுழை", getStarted: "தொடங்கு", coreCapabilities: "முக்கிய திறன்கள்", selectLanguage: "மொழி தேர்ந்தெடு",
    featItems: { farmManagement: { title: "பண்ணை மேலாண்மை", description: "நிலம், ஏக்கர், மண் வகை மற்றும் நீர் ஆதாரங்களை ஒழுங்கமை।" }, cropLifecycle: { title: "பயிர் சுழற்சி", description: "விதைப்பிலிருந்து அறுவடை வரையிலான கட்டங்களை கண்காணி।" }, expenseIntelligence: { title: "செலவு நுண்ணறிவு", description: "உரம், டீசல் மற்றும் கூலி செலவுகளை வகைப்படுத்து।" }, farmAnalytics: { title: "பண்ணை பகுப்பாய்வு", description: "பருவகால சுருக்கம் மற்றும் ஏக்கர் செலவைப் பார்।" } }
  },
  hero: { eyebrow: "விவசாய நுண்ணறிவு தளம்", line1: "புத்திசாலி விவசாயம்।", line2: "சிறந்த முடிவுகள்।", line3: "வலிமையான அறுவடை।", subheadline: "KrishiOra உங்கள் வயல்கள், பயிர்கள் மற்றும் பருவகால செலவுகளை ஒரு எளிய தளத்தில் இணைக்கிறது।", ctaPrimary: "இலவசமாக தொடங்கு", ctaSecondary: "KrishiOra பார்", caps: ["இந்திய விவசாயிகளுக்காக", "7 பிராந்திய மொழிகள்", "தெளிவான செலவு கண்காணிப்பு", "பயிர் சுழற்சி நுண்ணறிவு"] },
  stats: { coreAreas: { value: "4", title: "முக்கிய மேலாண்மை பகுதிகள்", description: "பண்ணை, பயிர், செலவு மற்றும் பகுப்பாய்வு" }, languages: { value: "7", title: "ஆதரிக்கப்படும் மொழிகள்", description: "இந்தியாவின் பல்வேறு விவசாயிகளுக்காக" }, farmerFocused: { value: "100%", title: "விவசாயி-கேந்திரிய", description: "உண்மையான விவசாய பணிப்பாய்வுக்கு ஏற்ப வடிவமைக்கப்பட்டது" }, platform: { value: "1", title: "இணைக்கப்பட்ட தளம்", description: "உங்கள் அனைத்து விவசாய தரவும் ஒரே இடத்தில்" } },
  problemSolution: { badge: "உண்மையான விவசாய தேவைகளின் அடிப்படையில்", headline1: "விவசாயம் சிக்கலானது।", headline2: "நிர்வாகம் எளிதாக இருக்க வேண்டும்।", subheadline: "KrishiOra விவசாயிகளை பதிவு நிர்வாகத்திலிருந்து விடுவித்து வயல்களில் கவனம் செலுத்த உதவுகிறது।", challengeLabel: "சவால்", challengeTitle: "விவசாயிகள் எதிர்கொள்ளும் பிரச்சனைகள்", solutionLabel: "தீர்வு", solutionTitle: "ஒரு எளிய தளம்", tagline: "எளிய கருவிகள். சிறந்த முடிவுகள். வலிமையான பண்ணை।", connected: "உங்கள் பண்ணையின் ஒவ்வொரு தேவையும், இணைக்கப்பட்டது।",
    problems: [{ title: "சிதறிய பதிவுகள்", description: "பண்ணை தகவல் குறிப்பேடுகள் மற்றும் வெவ்வேறு செயலிகளில் பரவி இருக்கிறது।" }, { title: "தெளிவற்ற செலவுகள்", description: "ஒழுங்கமைக்கப்பட்ட கண்காணிப்பு இல்லாமல் செலவுகளை புரிந்துகொள்வது கடினம்।" }, { title: "மட்டுப்படுத்தப்பட்ட தெரிவுநிலை", description: "பண்ணை தரவு பயன்படுத்தப்படாமல் போகிறது, திட்டமிடல் கடினமாகிறது।" }],
    solutions: [{ title: "உங்கள் பண்ணைகளை நிர்வகி", description: "பண்ணை தகவல் மற்றும் பயிர் நடவடிக்கைகளை ஒரே இடத்தில் ஒழுங்கமை।" }, { title: "ஒவ்வொரு செலவையும் கண்காணி", description: "வகை வாரியாக செலவுகளை பதிவு செய்து விவசாய செலவை தெளிவாக புரி।" }, { title: "தரவை நுண்ணறிவாக மாற்று", description: "எளிய பகுப்பாய்வு மூலம் பண்ணையை புரிந்துகொண்டு சிறந்த முடிவுகள் எடு।" }]
  },
  features: { badge: "அனைத்தும் ஒரே இடத்தில்", headline1: "விவசாயத்தை", headline2: "எளிதாக்கும் கருவிகள்।", subheadline: "பண்ணை நிர்வாகம் முதல் செலவு புரிதல் வரை, KrishiOra உங்கள் விவசாய பயணத்தில் உதவுகிறது।", seeHow: "எப்படி வேலை செய்கிறது பார்", connected: "ஒரு இணைக்கப்பட்ட விவசாய பணியிடம்", connectedSub: "பண்ணை, பயிர்கள், செலவுகள் மற்றும் நுண்ணறிவு — ஒன்றாக।",
    items: [{ title: "பண்ணை மேலாண்மை", description: "உங்கள் பண்ணை தகவலை ஒரே இடத்தில் ஒழுங்கமை।", points: ["பல பண்ணைகளை நிர்வகி", "பண்ணை விவரங்களை கண்காணி", "பதிவுகளை ஒழுங்காக வை"] }, { title: "பயிர் மேலாண்மை", description: "விதைப்பிலிருந்து அறுவடை வரை பயிர்களை கண்காணி।", points: ["செயலில் உள்ள பயிர்களை கண்காணி", "பயிர் கட்டங்களை கவனி", "பதிவுகளை பராமரி"] }, { title: "செலவு மேலாண்மை", description: "விவசாய செலவுகளை பதிவு செய்து பணம் எங்கு போகிறது என அறி।", points: ["செலவுகளை பதிவு செய்", "செலவுகளை வகைப்படுத்து", "மொத்த செலவை கண்காணி"] }, { title: "புத்திசாலி பகுப்பாய்வு", description: "பண்ணை தரவிலிருந்து எளிய நுண்ணறிவை பெறு।", points: ["செலவு போக்கை பார்", "தரவை புரி", "தகவல் அடிப்படையில் முடிவெடு"] }]
  },
  howItWorks: { badge: "இது எப்படி வேலை செய்கிறது", headline1: "பண்ணை பதிவுகளிலிருந்து", headline2: "சிறந்த முடிவுகள் வரை।", subheadline: "KrishiOra செயல்முறையை எளிதாக வைக்கிறது। பண்ணை சேர், பயிர்களை நிர்வகி, செலவை கண்காணி।", step: "படி", bannerTitle: "அனைத்தும் உங்கள் பண்ணையிலிருந்து தொடங்குகிறது।", bannerDesc: "அடிப்படையிலிருந்து தொடங்கி விவசாய நடவடிக்கைகளின் முழு படத்தை உருவாக்கு।", getStarted: "தொடங்கு",
    steps: [{ title: "உங்கள் பண்ணையை உருவாக்கு", description: "பண்ணை விவரங்களை உள்ளிட்டு முக்கிய தகவல்களை ஒரே இடத்தில் வை।" }, { title: "பயிர்களை சேர்", description: "பயிரிடும் பயிர்களை பதிவு செய்து முழு பருவமும் கண்காணி।" }, { title: "செலவுகளை கண்காணி", description: "ஒவ்வொரு விவசாய செலவையும் பதிவு செய்து வகை வாரியாக ஒழுங்கமை।" }, { title: "உங்கள் பண்ணையை புரி", description: "எளிய பகுப்பாய்வால் தரவை புரிந்துகொண்டு சிறந்த முடிவுகள் எடு।" }]
  },
  expense: { badge: "செலவு நுண்ணறிவு", headline1: "உங்கள் பணம்", headline2: "எங்கு செல்கிறது என்று தெரிந்துகொள்।", subheadline: "விவசாய செலவுகளை பதிவு செய், வகையமை, ஒரு எளிய டாஷ்போர்டில் தெளிவான படத்தை பெறு।", calloutText: "சிறந்த செலவு தெரிவுநிலை உங்களுக்கு உதவுகிறது", calloutHighlight: "சிறந்த பண்ணை முடிவுகள் எடுக்க।", startTracking: "கண்காணிப்பு தொடங்கு" },
  cta: { eyebrow: "உங்கள் பண்ணையிலிருந்து தொடங்கு", headline1: "உங்கள் பண்ணையை புத்திசாலியாக", headline2: "நிர்வகிக்க தயாரா?", subheadline: "பண்ணை பதிவுகள், பயிர்கள், செலவுகள் மற்றும் நுண்ணறிவை KrishiOra-உடன் இணை।", ctaPrimary: "இலவசமாக தொடங்கு", ctaSecondary: "அம்சங்களை பார்", cardTitle: "அனைத்தும் இணைக்கப்பட்டது", cardSub: "உங்கள் பண்ணைக்கு ஒரு பணியிடம்", cardFooter: "சிறியதிலிருந்து தொடங்கு. புத்திசாலி பண்ணை உருவாக்கு।", benefits: ["உங்கள் பண்ணைகளை ஒரே இடத்தில் நிர்வகி", "பயிர்கள் மற்றும் செலவுகளை கண்காணி", "எளிய நுண்ணறிவுடன் பண்ணையை புரி"] },
  footer: { description: "விவசாயிகளுக்கு தங்கள் பண்ணை, பயிர், செலவு மற்றும் விவசாய தரவை தெளிவாக நிர்வகிக்க உதவும் எளிய டிஜிட்டல் தளம்।", product: "தயாரிப்பு", company: "நிறுவனம்", languages: "மொழிகள்", langDesc: "இந்தியா முழுவதும் உள்ள விவசாயிகளுக்கு டிஜிட்டல் விவசாயத்தை எளிதாக்க।", madeFor: "இந்தியா முழுவதும் உள்ள விவசாயிகளுக்காக", backToTop: "மேலே செல்", privacyPolicy: "தனியுரிமை கொள்கை", termsOfUse: "பயன்பாட்டு விதிமுறைகள்", allRights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை।" },
};

/* ──────────────────────────────────────────────────────────────────────────
   TELUGU (తెలుగు)
   ────────────────────────────────────────────────────────────────────────── */
const te: Translation = {
  auth: {
  visual: {
    badge: "వ్యవసాయ ఇంటెలిజెన్స్ ప్లాట్‌ఫాం",
    title: "భారతదేశ భవిష్యత్తును పండించే వారి కోసం నిర్మించబడింది.",
    description: "పొలాలను నిర్వహించండి, పంటలను ట్రాక్ చేయండి, ఖర్చులను అర్థం చేసుకోండి మరియు ఒకే ప్రదేశం నుండి మెరుగైన వ్యవసాయ నిర్ణయాలు తీసుకోండి.",
    footer: [
      "ఫీల్డ్ ప్లాట్లు",
      "పంట ట్రాకింగ్",
      "ఖర్చు ఇంటెలిజెన్స్"
    ]
  },
  login: {
    title: "తిరిగి స్వాగతం",
    subtitle: "మీ పంటలు, పొలాలు మరియు ఖర్చులను యాక్సెస్ చేయడానికి మీ వివరాలను నమోదు చేయండి.",
    emailLabel: "ఈమెయిల్ లేదా మొబైల్ నంబర్",
    emailPlaceholder: "name@farm.com లేదా 9876543210",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "••••••••",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    rememberMe: "ఈ పరికరాన్ని 30 రోజుల పాటు గుర్తుంచుకో",
    submitBtn: "డ్యాష్‌బోర్డ్‌కు సైన్ ఇన్ చేయండి",
    submitting: "సైన్ ఇన్ అవుతోంది...",
    orContinueWith: "లేదా",
    newToPlatform: "KrishiOra కు కొత్తా?",
    createAccount: "ఉచిత రైతు ఖాతాను సృష్టించండి",
    backToHome: "హోమ్‌కు తిరిగి వెళ్ళు",
    validation: {
      emailRequired: "దయచేసి మీ ఈమెయిల్ లేదా 10-అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.",
      emailInvalid: "దయచేసి సరైన ఈమెయిల్ చిరునామా లేదా 10-అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.",
      passwordRequired: "దయచేసి మీ పాస్‌వర్డ్‌ను నమోదు చేయండి.",
      passwordShort: "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.",
      emailOnlyError: "ఖాతా సైన్-ఇన్ కోసం ప్రస్తుతం మీ నమోదిత ఈమెయిల్ చిరునామా అవసరం.",
      loginFailed: "సైన్ ఇన్ చేయడం సాధ్యపడలేదు. దయచేసి మీ వివరాలను ధృవీకరించి మళ్లీ ప్రయత్నించండి."
    }
  },
  register: {
    title: "మీ వ్యవసాయ ఖాతాను సృష్టించండి",
    subtitle: "మీ పొలాలను నిర్వహించడానికి, ఖర్చులను ట్రాక్ చేయడానికి మరియు మీ వ్యవసాయ వ్యాపారాన్ని పెంచుకోవడానికి KrishiOra లో చేరండి.",
    nameLabel: "పూర్తి పేరు",
    namePlaceholder: "ఉదా. రమేష్ కుమార్",
    emailLabel: "ఈమెయిల్ చిరునామా",
    emailPlaceholder: "ramesh@farm.com",
    phoneLabel: "మొబైల్ నంబర్",
    phonePlaceholder: "10-అంకెల మొబైల్ నంబర్",
    stateLabel: "రాష్ట్రం / ప్రాంతం",
    statePlaceholder: "మీ వ్యవసాయ రాష్ట్రాన్ని ఎంచుకోండి",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "బలమైన పాస్‌వర్డ్‌ను సృష్టించండి",
    confirmPasswordLabel: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    confirmPasswordPlaceholder: "మీ పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి",
    agreeTerms: "నేను నిబంధనలు మరియు గోప్యతా విధానానికి అంగీకరిస్తున్నాను",
    submitBtn: "ఉచిత ఖాతాను సృష్టించండి",
    submitting: "ఖాతా సృష్టించబడుతోంది...",
    orContinueWith: "లేదా",
    alreadyHaveAccount: "మీకు ఇప్పటికే ఖాతా ఉందా?",
    loginInstead: "బదులుగా సైన్ ఇన్ చేయండి",
    backToHome: "హోమ్‌కు తిరిగి వెళ్ళు",
    validation: {
      nameRequired: "పూర్తి పేరు అవసరం",
      emailRequired: "ఈమెయిల్ అవసరం",
      emailInvalid: "చెల్లని ఈమెయిల్ ఫార్మాట్",
      phoneRequired: "మొబైల్ నంబర్ అవసరం",
      phoneInvalid: "10-అంకెల నంబర్ ఉండాలి",
      stateRequired: "రాష్ట్ర ఎంపిక అవసరం",
      passwordRequired: "పాస్‌వర్డ్ అవసరం",
      passwordShort: "కనీసం 6 అక్షరాలు ఉండాలి",
      confirmRequired: "పాస్‌వర్డ్ నిర్ధారణ అవసరం",
      confirmMismatch: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు",
      termsRequired: "మీరు నిబంధనలకు అంగీకరించాలి",
      registerFailed: "నమోదు విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి."
    }
  }
},
  nav: { home: "హోమ్", features: "విశేషాలు", howItWorks: "ఇది ఎలా పని చేస్తుంది", whyKrishiOra: "KrishiOra ఎందుకు", login: "లాగిన్", getStarted: "ప్రారంభించు", coreCapabilities: "ముఖ్య సామర్థ్యాలు", selectLanguage: "భాష ఎంచుకో",
    featItems: { farmManagement: { title: "పొలం నిర్వహణ", description: "ప్లాట్లు, ఎకరాలు, మట్టి రకాలు మరియు నీటి వనరులను నిర్వహించు।" }, cropLifecycle: { title: "పంట చక్రం", description: "విత్తు నుండి కోత వరకు దశలను ట్రాక్ చేయి।" }, expenseIntelligence: { title: "వ్యయ తెలివిడి", description: "ఎరువు, డీజిల్ మరియు కూలి ఖర్చులను వర్గీకరించు।" }, farmAnalytics: { title: "పొలం విశ్లేషణ", description: "సీజనల్ సారాంశాలు మరియు ఎకరా వ్యయం చూడు।" } }
  },
  hero: { eyebrow: "వ్యవసాయ తెలివైన వేదిక", line1: "స్మార్ట్ వ్యవసాయం।", line2: "మెరుగైన నిర్ణయాలు।", line3: "బలమైన పంటలు।", subheadline: "KrishiOra మీ పొలాలు, పంటలు మరియు సీజనల్ ఖర్చులను ఒక సులభమైన వేదికలో ఏకీకరిస్తుంది।", ctaPrimary: "ఉచితంగా ప్రారంభించు", ctaSecondary: "KrishiOra చూడు", caps: ["భారతీయ రైతులకు నిర్మించబడింది", "7 ప్రాంతీయ భాషలు", "స్పష్టమైన వ్యయ ట్రాకింగ్", "పంట చక్రం అంతర్దృష్టి"] },
  stats: { coreAreas: { value: "4", title: "ముఖ్య నిర్వహణ రంగాలు", description: "పొలం, పంటలు, ఖర్చులు మరియు విశ్లేషణ" }, languages: { value: "7", title: "మద్దతు ఉన్న భాషలు", description: "భారతదేశంలోని వైవిధ్య రైతులకు" }, farmerFocused: { value: "100%", title: "రైతు-కేంద్రిత", description: "నిజమైన వ్యవసాయ వర్క్‌ఫ్లో ప్రకారం రూపొందించబడింది" }, platform: { value: "1", title: "అనుసంధానిత వేదిక", description: "మీ మొత్తం వ్యవసాయ డేటా ఒకే చోట" } },
  problemSolution: { badge: "నిజమైన వ్యవసాయ అవసరాల ఆధారంగా", headline1: "వ్యవసాయం సంక్లిష్టంగా ఉంది।", headline2: "నిర్వహణ సులభంగా ఉండాలి।", subheadline: "KrishiOra రైతులను రికార్డు నిర్వహణ నుండి విడిపించి పొలాలపై దృష్టి పెట్టేలా చేస్తుంది।", challengeLabel: "సవాలు", challengeTitle: "రైతులు ఎదుర్కొనే సమస్యలు", solutionLabel: "పరిష్కారం", solutionTitle: "ఒక సులభ వేదిక", tagline: "సులభ సాధనాలు. మెరుగైన నిర్ణయాలు. బలమైన పొలం।", connected: "మీ పొలానికి అవసరమైన ప్రతిదీ, అనుసంధానింపబడింది।",
    problems: [{ title: "చెల్లాచెదరైన రికార్డులు", description: "పొలం సమాచారం నోట్‌బుక్‌లు మరియు వేర్వేరు యాప్‌లలో విస్తరించి ఉంటుంది।" }, { title: "అస్పష్టమైన ఖర్చులు", description: "వ్యవస్థాపిత ట్రాకింగ్ లేకుండా ఖర్చులు అర్థం చేసుకోవడం కష్టం।" }, { title: "పరిమిత దృశ్యమానత", description: "పొలం డేటా ఉపయోగించబడదు, ప్రణాళిక చేయడం కష్టమవుతుంది।" }],
    solutions: [{ title: "మీ పొలాలను నిర్వహించు", description: "పొలం సమాచారం మరియు పంట కార్యకలాపాలను ఒకే చోట ఉంచు।" }, { title: "ప్రతి ఖర్చు ట్రాక్ చేయి", description: "వర్గం వారీగా ఖర్చులు నమోదు చేసి వ్యవసాయ వ్యయం స్పష్టంగా అర్థం చేసుకో।" }, { title: "డేటాను అంతర్దృష్టిగా మార్చు", description: "సులభ విశ్లేషణతో పొలం అర్థం చేసుకుని మెరుగైన నిర్ణయాలు తీసుకో।" }]
  },
  features: { badge: "అన్నీ ఒకే చోట", headline1: "వ్యవసాయాన్ని", headline2: "సులభతరం చేసే సాధనాలు।", subheadline: "పొలం నిర్వహణ నుండి ఖర్చు అర్థం చేసుకోవడం వరకు, KrishiOra మీ వ్యవసాయ ప్రయాణంలో సహాయపడుతుంది।", seeHow: "ఎలా పని చేస్తుందో చూడు", connected: "అనుసంధానిత వ్యవసాయ కార్యక్షేత్రం", connectedSub: "పొలాలు, పంటలు, ఖర్చులు మరియు అంతర్దృష్టి — కలిసి।",
    items: [{ title: "పొలం నిర్వహణ", description: "మీ పొలాల సమాచారాన్ని ఒకే చోట నిర్వహించు।", points: ["అనేక పొలాలను నిర్వహించు", "పొలం వివరాలను ట్రాక్ చేయి", "రికార్డులు నిర్వహించు"] }, { title: "పంట నిర్వహణ", description: "విత్తు నుండి కోత వరకు పంటలను ట్రాక్ చేయి।", points: ["క్రియాశీల పంటలు ట్రాక్ చేయి", "పంట దశలు చూడు", "రికార్డులు నిర్వహించు"] }, { title: "వ్యయ నిర్వహణ", description: "వ్యవసాయ ఖర్చులు నమోదు చేసి డబ్బు ఎక్కడ వెళుతుందో అర్థం చేసుకో।", points: ["ఖర్చులు నమోదు చేయి", "ఖర్చులు వర్గీకరించు", "మొత్తం వ్యయం ట్రాక్ చేయి"] }, { title: "స్మార్ట్ విశ్లేషణ", description: "పొలం డేటా నుండి సులభ అంతర్దృష్టి పొందు।", points: ["ఖర్చు ధోరణులు చూడు", "డేటా అర్థం చేసుకో", "సమాచార నిర్ణయాలు తీసుకో"] }]
  },
  howItWorks: { badge: "ఇది ఎలా పని చేస్తుంది", headline1: "పొలం రికార్డుల నుండి", headline2: "మెరుగైన నిర్ణయాలకు।", subheadline: "KrishiOra ప్రక్రియను సులభంగా ఉంచుతుంది। పొలం చేర్చు, పంటలు నిర్వహించు, ఖర్చులు ట్రాక్ చేయి।", step: "అడుగు", bannerTitle: "అన్నీ మీ పొలం నుండి ప్రారంభమవుతాయి।", bannerDesc: "ప్రాథమిక అంశాలతో ప్రారంభించి వ్యవసాయ కార్యకలాపాల పూర్తి చిత్రాన్ని నిర్మించు।", getStarted: "ప్రారంభించు",
    steps: [{ title: "మీ పొలం సృష్టించు", description: "పొలం వివరాలు నమోదు చేసి అన్ని ముఖ్యమైన సమాచారాన్ని ఒకే చోట ఉంచు।" }, { title: "పంటలు చేర్చు", description: "పెంచే పంటలను నమోదు చేసి మొత్తం సీజన్ అంతటా ట్రాక్ చేయి।" }, { title: "ఖర్చులు ట్రాక్ చేయి", description: "ప్రతి వ్యవసాయ ఖర్చు నమోదు చేసి వర్గం వారీగా నిర్వహించు।" }, { title: "మీ పొలం అర్థం చేసుకో", description: "సులభ విశ్లేషణతో డేటా అర్థం చేసుకుని మెరుగైన నిర్ణయాలు తీసుకో।" }]
  },
  expense: { badge: "వ్యయ తెలివిడి", headline1: "మీ డబ్బు ఎక్కడికి", headline2: "వెళుతుందో తెలుసుకో।", subheadline: "వ్యవసాయ ఖర్చులు నమోదు చేయి, వర్గీకరించు మరియు ఒక సులభ డాష్‌బోర్డ్ నుండి స్పష్టమైన చిత్రం పొందు।", calloutText: "మెరుగైన వ్యయ దృశ్యమానత మీకు సహాయపడుతుంది", calloutHighlight: "మెరుగైన వ్యవసాయ నిర్ణయాలు తీసుకోవడానికి।", startTracking: "ట్రాకింగ్ ప్రారంభించు" },
  cta: { eyebrow: "మీ పొలం నుండి ప్రారంభించు", headline1: "మీ పొలాన్ని స్మార్ట్‌గా నిర్వహించడానికి", headline2: "సిద్ధంగా ఉన్నారా?", subheadline: "పొలం రికార్డులు, పంటలు, ఖర్చులు మరియు అంతర్దృష్టిని KrishiOra తో ఏకీకృతం చేయి।", ctaPrimary: "ఉచితంగా ప్రారంభించు", ctaSecondary: "విశేషాలు చూడు", cardTitle: "అన్నీ అనుసంధానింపబడ్డాయి", cardSub: "మీ పొలానికి ఒక కార్యక్షేత్రం", cardFooter: "చిన్నగా ప్రారంభించు. స్మార్ట్ పొలం నిర్మించు।", benefits: ["మీ పొలాలను ఒకే చోట నిర్వహించు", "పంటలు మరియు వ్యవసాయ ఖర్చులు ట్రాక్ చేయి", "సులభ అంతర్దృష్టితో పొలం అర్థం చేసుకో"] },
  footer: { description: "రైతులు తమ పొలం, పంటలు, ఖర్చులు మరియు వ్యవసాయ డేటాను మరింత స్పష్టంగా నిర్వహించడానికి సులభమైన డిజిటల్ వేదిక।", product: "ఉత్పత్తి", company: "కంపెనీ", languages: "భాషలు", langDesc: "భారతదేశం అంతటా రైతులకు డిజిటల్ వ్యవసాయాన్ని అందుబాటులో ఉంచడానికి।", madeFor: "భారతదేశం అంతటా రైతులకు", backToTop: "పైకి వెళ్ళు", privacyPolicy: "గోప్యతా విధానం", termsOfUse: "వినియోగ నిబంధనలు", allRights: "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి।" },
};

/* ──────────────────────────────────────────────────────────────────────────
   BENGALI (বাংলা)
   ────────────────────────────────────────────────────────────────────────── */
const bn: Translation = {
  auth: {
  visual: {
    badge: "কৃষি বুদ্ধিমত্তা প্ল্যাটফর্ম",
    title: "ভারতের ভবিষ্যৎ কৃষকদের জন্য তৈরি।",
    description: "খামার পরিচালনা করুন, ফসল ট্র্যাক করুন, খরচ বুঝুন এবং এক জায়গা থেকে আরও ভাল কৃষি সিদ্ধান্ত নিন।",
    footer: [
      "ফিল্ড প্লট",
      "ফসল ট্র্যাকিং",
      "খরচ বুদ্ধিমত্তা"
    ]
  },
  login: {
    title: "আবার স্বাগতম",
    subtitle: "আপনার ফসল, খামার এবং খরচ অ্যাক্সেস করতে আপনার বিবরণ লিখুন।",
    emailLabel: "ইমেইল বা মোবাইল নম্বর",
    emailPlaceholder: "name@farm.com বা 9876543210",
    passwordLabel: "পাসওয়ার্ড",
    passwordPlaceholder: "••••••••",
    forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
    rememberMe: "এই ডিভাইসটি ৩০ দিনের জন্য মনে রাখুন",
    submitBtn: "ড্যাশবোর্ডে সাইন ইন করুন",
    submitting: "সাইন ইন হচ্ছে...",
    orContinueWith: "অথবা",
    newToPlatform: "KrishiOra তে নতুন?",
    createAccount: "বিনামূল্যে কৃষক অ্যাকাউন্ট তৈরি করুন",
    backToHome: "হোমে ফিরে যান",
    validation: {
      emailRequired: "অনুগ্রহ করে আপনার ইমেইল বা ১০-সংখ্যার মোবাইল নম্বর লিখুন।",
      emailInvalid: "অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা বা ১০-সংখ্যার মোবাইল নম্বর লিখুন।",
      passwordRequired: "অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।",
      passwordShort: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
      emailOnlyError: "অ্যাকাউন্টে সাইন-ইন করার জন্য বর্তমানে আপনার নিবন্ধিত ইমেইল ঠিকানা প্রয়োজন।",
      loginFailed: "সাইন ইন করতে অক্ষম। অনুগ্রহ করে আপনার বিবরণ যাচাই করুন এবং আবার চেষ্টা করুন।"
    }
  },
  register: {
    title: "আপনার কৃষি অ্যাকাউন্ট তৈরি করুন",
    subtitle: "আপনার খামার পরিচালনা করতে, খরচ ট্র্যাক করতে এবং আপনার কৃষি ব্যবসা বাড়াতে KrishiOra তে যোগ দিন।",
    nameLabel: "পুরো নাম",
    namePlaceholder: "উদাঃ রমেশ কুমার",
    emailLabel: "ইমেইল ঠিকানা",
    emailPlaceholder: "ramesh@farm.com",
    phoneLabel: "মোবাইল নম্বর",
    phonePlaceholder: "১০-সংখ্যার মোবাইল নম্বর",
    stateLabel: "রাজ্য / অঞ্চল",
    statePlaceholder: "আপনার কৃষি রাজ্য নির্বাচন করুন",
    passwordLabel: "পাসওয়ার্ড",
    passwordPlaceholder: "একটি শক্তিশালী পাসওয়ার্ড তৈরি করুন",
    confirmPasswordLabel: "পাসওয়ার্ড নিশ্চিত করুন",
    confirmPasswordPlaceholder: "আপনার পাসওয়ার্ড পুনরায় লিখুন",
    agreeTerms: "আমি শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত",
    submitBtn: "বিনামূল্যে অ্যাকাউন্ট তৈরি করুন",
    submitting: "অ্যাকাউন্ট তৈরি হচ্ছে...",
    orContinueWith: "অথবা",
    alreadyHaveAccount: "আপনার কি ইতিমধ্যে অ্যাকাউন্ট আছে?",
    loginInstead: "পরিবর্তে সাইন ইন করুন",
    backToHome: "হোমে ফিরে যান",
    validation: {
      nameRequired: "পুরো নাম প্রয়োজন",
      emailRequired: "ইমেইল প্রয়োজন",
      emailInvalid: "অবৈধ ইমেইল বিন্যাস",
      phoneRequired: "মোবাইল নম্বর প্রয়োজন",
      phoneInvalid: "১০-সংখ্যার নম্বর হতে হবে",
      stateRequired: "রাজ্য নির্বাচন প্রয়োজন",
      passwordRequired: "পাসওয়ার্ড প্রয়োজন",
      passwordShort: "কমপক্ষে ৬ অক্ষর হতে হবে",
      confirmRequired: "পাসওয়ার্ড নিশ্চিতকরণ প্রয়োজন",
      confirmMismatch: "পাসওয়ার্ড মিলছে না",
      termsRequired: "আপনাকে শর্তাবলীতে সম্মত হতে হবে",
      registerFailed: "নিবন্ধন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
    }
  }
},
  nav: { home: "হোম", features: "বৈশিষ্ট্য", howItWorks: "এটি কীভাবে কাজ করে", whyKrishiOra: "KrishiOra কেন", login: "লগ ইন", getStarted: "শুরু করুন", coreCapabilities: "মূল সক্ষমতা", selectLanguage: "ভাষা নির্বাচন করুন",
    featItems: { farmManagement: { title: "খামার ব্যবস্থাপনা", description: "প্লট, একর, মাটির ধরন এবং জলের উৎস সংগঠিত করুন।" }, cropLifecycle: { title: "ফসল চক্র", description: "বপন থেকে ফসল কাটা পর্যন্ত ধাপগুলি ট্র্যাক করুন।" }, expenseIntelligence: { title: "ব্যয় বুদ্ধিমত্তা", description: "সার, ডিজেল এবং মজুরি ব্যয় শ্রেণিবদ্ধ করুন।" }, farmAnalytics: { title: "খামার বিশ্লেষণ", description: "মৌসুমী সারসংক্ষেপ এবং প্রতি একর ব্যয় দেখুন।" } }
  },
  hero: { eyebrow: "কৃষি বুদ্ধিমান প্ল্যাটফর্ম", line1: "স্মার্ট চাষ।", line2: "উন্নত সিদ্ধান্ত।", line3: "শক্তিশালী ফসল।", subheadline: "KrishiOra আপনার খামার, ফসল এবং মৌসুমী ব্যয়কে একটি সহজ প্ল্যাটফর্মে একত্রিত করে।", ctaPrimary: "বিনামূল্যে শুরু করুন", ctaSecondary: "KrishiOra দেখুন", caps: ["ভারতীয় কৃষকদের জন্য তৈরি", "৭টি আঞ্চলিক ভাষা", "স্পষ্ট ব্যয় ট্র্যাকিং", "ফসল চক্র অন্তর্দৃষ্টি"] },
  stats: { coreAreas: { value: "4", title: "মূল ব্যবস্থাপনা ক্ষেত্র", description: "খামার, ফসল, ব্যয় এবং বিশ্লেষণ" }, languages: { value: "7", title: "সমর্থিত ভাষাগুলি", description: "ভারতের বৈচিত্র্যময় কৃষকদের জন্য" }, farmerFocused: { value: "100%", title: "কৃষক-কেন্দ্রিক", description: "বাস্তব খামার কর্মপ্রবাহ অনুযায়ী ডিজাইন" }, platform: { value: "1", title: "সংযুক্ত প্ল্যাটফর্ম", description: "আপনার সমস্ত কৃষি ডেটা এক জায়গায়" } },
  problemSolution: { badge: "প্রকৃত কৃষি প্রয়োজনের উপর ভিত্তি করে", headline1: "কৃষি জটিল।", headline2: "পরিচালনা সহজ হওয়া উচিত।", subheadline: "KrishiOra কৃষকদের রেকর্ড পরিচালনা থেকে মুক্ত করে খামারে মনোযোগ দিতে সাহায্য করে।", challengeLabel: "চ্যালেঞ্জ", challengeTitle: "কৃষকরা যে সমস্যার মুখোমুখি হন", solutionLabel: "সমাধান", solutionTitle: "একটি সহজ প্ল্যাটফর্ম", tagline: "সহজ সরঞ্জাম। উন্নত সিদ্ধান্ত। শক্তিশালী খামার।", connected: "আপনার খামারের প্রতিটি প্রয়োজন, সংযুক্ত।",
    problems: [{ title: "বিক্ষিপ্ত রেকর্ড", description: "খামারের তথ্য নোটবুক এবং বিভিন্ন অ্যাপে ছড়িয়ে থাকে।" }, { title: "অস্পষ্ট ব্যয়", description: "সংগঠিত ট্র্যাকিং ছাড়া ব্যয় বোঝা কঠিন।" }, { title: "সীমিত দৃশ্যমানতা", description: "খামারের ডেটা ব্যবহার করা হয় না, পরিকল্পনা কঠিন হয়।" }],
    solutions: [{ title: "আপনার খামার পরিচালনা করুন", description: "খামারের তথ্য ও ফসলের কার্যক্রম এক জায়গায় সংগঠিত রাখুন।" }, { title: "প্রতিটি ব্যয় ট্র্যাক করুন", description: "বিভাগ অনুযায়ী ব্যয় রেকর্ড করুন এবং কৃষি ব্যয় স্পষ্ট বুঝুন।" }, { title: "ডেটাকে অন্তর্দৃষ্টিতে রূপান্তরিত করুন", description: "সহজ বিশ্লেষণে খামার বুঝুন এবং উন্নত সিদ্ধান্ত নিন।" }]
  },
  features: { badge: "সবকিছু এক জায়গায়", headline1: "কৃষিকে", headline2: "সহজ করার সরঞ্জাম।", subheadline: "খামার ব্যবস্থাপনা থেকে ব্যয় বোঝা পর্যন্ত, KrishiOra আপনার কৃষি যাত্রায় সাহায্য করে।", seeHow: "কীভাবে কাজ করে দেখুন", connected: "একটি সংযুক্ত কৃষি কর্মক্ষেত্র", connectedSub: "খামার, ফসল, ব্যয় এবং অন্তর্দৃষ্টি — একসাথে।",
    items: [{ title: "খামার ব্যবস্থাপনা", description: "আপনার খামারের তথ্য এক জায়গায় সংগঠিত করুন।", points: ["একাধিক খামার পরিচালনা করুন", "খামারের বিবরণ ট্র্যাক করুন", "রেকর্ড সংগঠিত রাখুন"] }, { title: "ফসল ব্যবস্থাপনা", description: "বপন থেকে ফসল কাটা পর্যন্ত ট্র্যাক করুন।", points: ["সক্রিয় ফসল ট্র্যাক করুন", "ফসলের পর্যায় দেখুন", "রেকর্ড সংরক্ষণ করুন"] }, { title: "ব্যয় ব্যবস্থাপনা", description: "কৃষি ব্যয় রেকর্ড করুন এবং অর্থ কোথায় যাচ্ছে বুঝুন।", points: ["ব্যয় রেকর্ড করুন", "ব্যয় শ্রেণিবদ্ধ করুন", "মোট ব্যয় ট্র্যাক করুন"] }, { title: "স্মার্ট বিশ্লেষণ", description: "খামার ডেটা থেকে সহজ অন্তর্দৃষ্টি পান।", points: ["ব্যয়ের প্রবণতা দেখুন", "ডেটা বুঝুন", "তথ্যপূর্ণ সিদ্ধান্ত নিন"] }]
  },
  howItWorks: { badge: "এটি কীভাবে কাজ করে", headline1: "খামার রেকর্ড থেকে", headline2: "উন্নত সিদ্ধান্তে।", subheadline: "KrishiOra প্রক্রিয়াটিকে সহজ রাখে। খামার যোগ করুন, ফসল পরিচালনা করুন, ব্যয় ট্র্যাক করুন।", step: "ধাপ", bannerTitle: "সবকিছু আপনার খামার থেকে শুরু হয়।", bannerDesc: "মূল বিষয়গুলি দিয়ে শুরু করুন এবং ধীরে ধীরে কৃষির সম্পূর্ণ চিত্র তৈরি করুন।", getStarted: "শুরু করুন",
    steps: [{ title: "আপনার খামার তৈরি করুন", description: "খামারের বিবরণ প্রবেশ করুন এবং গুরুত্বপূর্ণ তথ্য এক জায়গায় রাখুন।" }, { title: "ফসল যোগ করুন", description: "চাষ করা ফসলগুলি রেকর্ড করুন এবং পুরো মৌসুম ট্র্যাক করুন।" }, { title: "ব্যয় ট্র্যাক করুন", description: "প্রতিটি কৃষি ব্যয় রেকর্ড করুন এবং বিভাগ অনুযায়ী সংগঠিত করুন।" }, { title: "আপনার খামার বুঝুন", description: "সহজ বিশ্লেষণে ডেটা বুঝুন এবং উন্নত সিদ্ধান্ত নিন।" }]
  },
  expense: { badge: "ব্যয় বুদ্ধিমত্তা", headline1: "আপনার অর্থ কোথায়", headline2: "যাচ্ছে তা জানুন।", subheadline: "কৃষি ব্যয় রেকর্ড করুন, বিভাগ অনুযায়ী সংগঠিত করুন এবং একটি সহজ ড্যাশবোর্ড থেকে স্পষ্ট চিত্র পান।", calloutText: "উন্নত ব্যয় দৃশ্যমানতা আপনাকে সাহায্য করে", calloutHighlight: "উন্নত কৃষি সিদ্ধান্ত নিতে।", startTracking: "ট্র্যাকিং শুরু করুন" },
  cta: { eyebrow: "আপনার খামার থেকে শুরু করুন", headline1: "আপনার খামার স্মার্টভাবে", headline2: "পরিচালনা করতে প্রস্তুত?", subheadline: "খামার রেকর্ড, ফসল, ব্যয় এবং অন্তর্দৃষ্টি KrishiOra-এর সাথে একত্রিত করুন।", ctaPrimary: "বিনামূল্যে শুরু করুন", ctaSecondary: "বৈশিষ্ট্য দেখুন", cardTitle: "সবকিছু সংযুক্ত", cardSub: "আপনার খামারের জন্য একটি কর্মক্ষেত্র", cardFooter: "ছোট দিয়ে শুরু করুন। স্মার্ট খামার তৈরি করুন।", benefits: ["আপনার খামার এক জায়গায় পরিচালনা করুন", "ফসল এবং কৃষি ব্যয় ট্র্যাক করুন", "সহজ অন্তর্দৃষ্টিতে খামার বুঝুন"] },
  footer: { description: "কৃষকদের তাদের খামার, ফসল, ব্যয় এবং কৃষি ডেটা আরও স্পষ্টতার সাথে পরিচালনা করতে সাহায্য করার জন্য একটি সহজ ডিজিটাল প্ল্যাটফর্ম।", product: "পণ্য", company: "কোম্পানি", languages: "ভাষাসমূহ", langDesc: "সারা ভারতের কৃষকদের জন্য ডিজিটাল কৃষিকে সহজলভ্য করতে।", madeFor: "সারা ভারতের কৃষকদের জন্য তৈরি", backToTop: "উপরে যান", privacyPolicy: "গোপনীয়তা নীতি", termsOfUse: "ব্যবহারের শর্তাবলী", allRights: "সর্বস্বত্ব সংরক্ষিত।" },
};

/* ──────────────────────────────────────────────────────────────────────────
   EXPORT MAP
   ────────────────────────────────────────────────────────────────────────── */
export const translations: Record<LangCode, Translation> = { en, pa, hi, mr, gu, ta, te, bn };

export const SUPPORTED_LANGUAGES: { code: LangCode; native: string; english: string; flag: string }[] = [
  { code: "en", native: "English",  english: "English",  flag: "🇬🇧" },
  { code: "pa", native: "ਪੰਜਾਬੀ",  english: "Punjabi",  flag: "🇮🇳" },
  { code: "hi", native: "हिन्दी",   english: "Hindi",    flag: "🇮🇳" },
  { code: "mr", native: "मराठी",    english: "Marathi",  flag: "🇮🇳" },
  { code: "gu", native: "ગુજરાતી",  english: "Gujarati", flag: "🇮🇳" },
  { code: "ta", native: "தமிழ்",    english: "Tamil",    flag: "🇮🇳" },
  { code: "te", native: "తెలుగు",   english: "Telugu",   flag: "🇮🇳" },
  { code: "bn", native: "বাংলা",    english: "Bengali",  flag: "🇮🇳" },
];
