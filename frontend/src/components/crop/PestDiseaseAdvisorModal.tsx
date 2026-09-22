import { useState, useMemo, useEffect, useRef } from "react";
import {
  Bug,
  X,
  Volume2,
  VolumeX,
  Leaf,
  CheckCircle2,
  Copy,
  Check,
  Languages,
  FlaskConical,
  Sprout,
  Search,
  PhoneCall,
  Share2,
  Calculator,
  Shield,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

export type RegionalLang = "hi" | "pa" | "gu" | "mr" | "bn" | "te" | "ta" | "en";

export interface LocalizedText {
  hi: string; // Hindi
  pa: string; // Punjabi
  gu: string; // Gujarati
  mr: string; // Marathi
  bn: string; // Bengali
  te: string; // Telugu
  ta: string; // Tamil
  en: string; // English
}

export interface PestDiseaseItem {
  id: string;
  cropCode: string;
  cropName: LocalizedText;
  stageCode: string;
  stageName: LocalizedText;
  pestName: LocalizedText;
  type: "PEST" | "DISEASE";
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  affectedPart: "LEAF" | "STEM" | "POD" | "ROOT" | "GRAIN" | "FRUIT";
  etlThreshold: LocalizedText;
  phiDays: number;
  symptoms: LocalizedText;
  chemicalControl: LocalizedText;
  organicControl: LocalizedText;
  tankMixDosage: LocalizedText;
  dosagePerAcreMlOrGm: number;
  dosageUnit: "ml" | "gm" | "kg";
  waterPerAcreLitres: number;
  sprayerNozzle: LocalizedText;
  idealWeatherTrigger: LocalizedText;
  audioScripts: LocalizedText;
}

// Full UI Localizations across 8 Languages
export const UI_TRANSLATIONS: Record<
  RegionalLang,
  {
    title: string;
    subTitle: string;
    tagline: string;
    helpline: string;
    voiceLang: string;
    speed: string;
    allThreats: string;
    insectPests: string;
    diseases: string;
    searchPlaceholder: string;
    noThreats: string;
    noThreatsSub: string;
    criticalThreat: string;
    moderateAlert: string;
    targetPart: string;
    stage: string;
    listenVoice: string;
    stopVoice: string;
    copied: string;
    copy: string;
    symptomsTitle: string;
    chemicalTitle: string;
    organicTitle: string;
    tankMixTitle: string;
    safeMicrobes: string;
    etl: string;
    phi: string;
    days: string;
    nozzle: string;
    weather: string;
    calcTitle: string;
    calcClose: string;
    farmArea: string;
    acres: string;
    totalDose: string;
    totalWater: string;
    knapsackPumps: string;
    certified: string;
    close: string;
  }
> = {
  hi: {
    title: "फसल कीट व रोग प्रारंभिक चेतावनी इंजन",
    subTitle: "ICAR और DPPQS प्रमाणित पौध संरक्षण प्रणाली (8 भारतीय भाषाएं)",
    tagline: "कीट व रोग सलाह",
    helpline: "हेल्पलाइन (1800-180-1551)",
    voiceLang: "भाषा (Language):",
    speed: "गति (Speed):",
    allThreats: "सभी खतरे (All)",
    insectPests: "🐛 कीट (Pests)",
    diseases: "🍄 रोग व फफूंद (Diseases)",
    searchPlaceholder: "लक्षण, रोग या दवा का नाम खोजें...",
    noThreats: "कोई सक्रिय खतरा नहीं मिला",
    noThreatsSub: "इस चयन के लिए फसल स्वस्थ है।",
    criticalThreat: "🔴 गंभीर खतरा",
    moderateAlert: "🟡 मध्यम चेतावनी",
    targetPart: "🎯 प्रभावित भाग",
    stage: "अवस्था",
    listenVoice: "आवाज़ में सुनें (Voice)",
    stopVoice: "रोको (Stop)",
    copied: "कॉपी हुआ!",
    copy: "पर्चा कॉपी करें",
    symptomsTitle: "पहचान व लक्षण (Visual Diagnostic Key)",
    chemicalTitle: "🧪 रासायनिक उपचार (Chemical Spray)",
    organicTitle: "🌿 जैविक व प्राकृतिक उपाय (Bio-Control)",
    tankMixTitle: "15-लीटर पंप टंकी मात्रा",
    safeMicrobes: "मित्र कीटों व केंचुओं के लिए सुरक्षित।",
    etl: "क्षति स्तर (ETL)",
    phi: "तुड़ाई सुरक्षित समय (PHI)",
    days: "दिन (Days)",
    nozzle: "नोजल प्रकार",
    weather: "मौसम कारक",
    calcTitle: "खेत के अनुसार दवा व टंकी की मात्रा निकालें",
    calcClose: "कैल्कुलेटर बंद करें",
    farmArea: "खेत का रकबा",
    acres: "एकड़ (Acres)",
    totalDose: "कुल आवश्यक दवा",
    totalWater: "कुल पानी",
    knapsackPumps: "15L पंप टंकियां",
    certified: "ICAR व DPPQS वैज्ञानिक पौध संरक्षण प्रमाणित मानक",
    close: "बंद करें (Close)",
  },
  pa: {
    title: "ਫ਼ਸਲ ਕੀੜੇ ਅਤੇ ਰੋਗ ਮੁੱਢਲੀ ਚੇਤਾਵਨੀ ਪ੍ਰਣਾਲੀ",
    subTitle: "ICAR ਅਤੇ DPPQS ਪ੍ਰਮਾਣਿਤ ਪੌਦ ਸੁਰੱਖਿਆ ਸਲਾਹ",
    tagline: "ਕੀਟ ਤੇ ਰੋਗ ਸਲਾਹ",
    helpline: "ਹੈਲਪਲਾਈਨ (1800-180-1551)",
    voiceLang: "ਭਾਸ਼ਾ (Language):",
    speed: "ਰਫ਼ਤਾਰ (Speed):",
    allThreats: "ਸਾਰੇ ਖ਼ਤਰੇ (All)",
    insectPests: "🐛 ਕੀੜੇ (Pests)",
    diseases: "🍄 ਬਿਮਾਰੀਆਂ (Diseases)",
    searchPlaceholder: "ਲੱਛਣ ਜਾਂ ਦਵਾਈ ਖੋਜੋ...",
    noThreats: "ਕੋਈ ਖ਼ਤਰਾ ਨਹੀਂ ਮਿਲਿਆ",
    noThreatsSub: "ਇਸ ਚੋਣ ਲਈ ਤੁਹਾਡੀ ਫ਼ਸਲ ਬਿਲਕੁਲ ਤੰਦਰੁਸਤ ਹੈ।",
    criticalThreat: "🔴 ਗੰਭੀਰ ਖ਼ਤਰਾ",
    moderateAlert: "🟡 ਦਰਮਿਆਨਾ ਅਲਰਟ",
    targetPart: "🎯 ਪ੍ਰਭਾਵਿਤ ਹਿੱਸਾ",
    stage: "ਪੜਾਅ",
    listenVoice: "ਸੁਣੋ (Voice)",
    stopVoice: "ਰੋਕੋ (Stop)",
    copied: "ਕਾਪੀ ਹੋ ਗਿਆ!",
    copy: "ਕਾਪੀ ਕਰੋ",
    symptomsTitle: "ਪਛਾਣ ਅਤੇ ਲੱਛਣ",
    chemicalTitle: "🧪 ਰਸਾਇਣਕ ਸਪ੍ਰੇਅ (Chemical Spray)",
    organicTitle: "🌿 ਜੈਵਿਕ ਉਪਾਅ (Bio-Control)",
    tankMixTitle: "15-ਲੀਟਰ ਟੈਂਕੀ ਮਾਤਰਾ",
    safeMicrobes: "ਮਿੱਤਰ ਕੀੜਿਆਂ ਲਈ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸੁਰੱਖਿਅਤ।",
    etl: "ਨੁਕਸਾਨ ਪੱਧਰ (ETL)",
    phi: "ਕਟਾਈ ਸੁਰੱਖਿਆ ਅੰਤਰਾਲ (PHI)",
    days: "ਦਿਨ",
    nozzle: "ਨੋਜ਼ਲ ਕਿਸਮ",
    weather: "ਮੌਸਮੀ ਕਾਰਕ",
    calcTitle: "ਆਪਣੇ ਖੇਤ ਅਨੁਸਾਰ ਦਵਾਈ ਅਤੇ ਟੈਂਕੀਆਂ ਦਾ ਹਿਸਾਬ ਲਗਾਓ",
    calcClose: "ਕੈਲਕੁਲੇਟਰ ਬੰਦ ਕਰੋ",
    farmArea: "ਖੇਤ ਦਾ ਰਕਬਾ",
    acres: "ਏਕੜ",
    totalDose: "ਕੁੱਲ ਲੋੜੀਂਦੀ ਦਵਾਈ",
    totalWater: "ਕੁੱਲ ਪਾਣੀ",
    knapsackPumps: "15L ਟੈਂਕੀਆਂ",
    certified: "ICAR ਤੇ DPPQS ਵਿਗਿਆਨਕ ਮਿਆਰ",
    close: "ਬੰਦ ਕਰੋ",
  },
  gu: {
    title: "પાક જીવાત અને રોગ પ્રારંભિક ચેતવણી સિસ્ટમ",
    subTitle: "ICAR અને DPPQS પ્રમાણિત પાક સંરક્ષણ માર્ગદર્શિકા",
    tagline: "જીવાત અને રોગ સલાહ",
    helpline: "હેલ્પલાઇન (1800-180-1551)",
    voiceLang: "ભાષા (Language):",
    speed: "ઝડપ (Speed):",
    allThreats: "બધા જોખમો (All)",
    insectPests: "🐛 જીવાતો (Pests)",
    diseases: "🍄 રોગો (Diseases)",
    searchPlaceholder: "લક્ષણો, દવા કે રોગ શોધો...",
    noThreats: "કોઈ જોખમ જણાયું નથી",
    noThreatsSub: "આ પસંદગી માટે પાક તંદુરસ્ત છે.",
    criticalThreat: "🔴 ગંભીર જોખમ",
    moderateAlert: "🟡 મધ્યમ ચેતવણી",
    targetPart: "🎯 અસરગ્રસ્ત ભાગ",
    stage: "તબક્કો",
    listenVoice: "સાંભળો (Voice)",
    stopVoice: "રોકો (Stop)",
    copied: "કોપી થઈ ગયું!",
    copy: "પ્રિસ્ક્રિપ્શન કોપી કરો",
    symptomsTitle: "ઓળખ અને લક્ષણો",
    chemicalTitle: "🧪 રાસાયણિક છંટકાવ (Chemical Spray)",
    organicTitle: "🌿 જૈવિક ઉપાયો (Bio-Control)",
    tankMixTitle: "15-લિટર પંપ માપ",
    safeMicrobes: "મિત્ર કીટકો માટે સુરક્ષિત.",
    etl: "નુકસાન સ્તર (ETL)",
    phi: "કાપણી સલામતી અંતરાલ (PHI)",
    days: "દિવસ",
    nozzle: "નોઝલ પ્રકાર",
    weather: "હવામાન ટ્રિગર",
    calcTitle: "ખેતર અનુસાર દવા અને પંપની ગણતરી કરો",
    calcClose: "કેલ્ક્યુલેટર બંધ કરો",
    farmArea: "ખેતરનું માપ",
    acres: "એકર",
    totalDose: "કુલ દવા",
    totalWater: "કુલ પાણી",
    knapsackPumps: "15L પંપ",
    certified: "ICAR અને DPPQS પ્રમાણિત ધોરણો",
    close: "બંધ કરો",
  },
  mr: {
    title: "पीक कीड व रोग पूर्वसूचना प्रणाली",
    subTitle: "ICAR आणि DPPQS प्रमाणित पीक संरक्षण सल्ला",
    tagline: "कीड व रोग सल्ला",
    helpline: "हेल्पलाईन (1800-180-1551)",
    voiceLang: "भाषा (Language):",
    speed: "गती (Speed):",
    allThreats: "सर्व धोके (All)",
    insectPests: "🐛 कीटक (Pests)",
    diseases: "🍄 रोग व बुरशी (Diseases)",
    searchPlaceholder: "लक्षणे किंवा औषध शोधा...",
    noThreats: "कोणताही धोका आढळला नाही",
    noThreatsSub: "या निवडीसाठी पीक निरोगी आहे.",
    criticalThreat: "🔴 गंभीर धोका",
    moderateAlert: "🟡 मध्यम इशारा",
    targetPart: "🎯 बाधित भाग",
    stage: "अवस्था",
    listenVoice: "ऐका (Voice)",
    stopVoice: "थांबवा (Stop)",
    copied: "कॉपी झाले!",
    copy: "प्रिस्क्रिप्शन कॉपी करा",
    symptomsTitle: "ओळख आणि लक्षणे",
    chemicalTitle: "🧪 रासायनिक फवारणी (Chemical Spray)",
    organicTitle: "🌿 सेंद्रिय व जैविक उपाय (Bio-Control)",
    tankMixTitle: "15-लिटर पंप प्रमाण",
    safeMicrobes: "मित्र किडींसाठी सुरक्षित.",
    etl: "आर्थिक नुकसान पातळी (ETL)",
    phi: "कापणी सुरक्षित कालावधी (PHI)",
    days: "दिवस",
    nozzle: "नोझल प्रकार",
    weather: "हवामान स्थिती",
    calcTitle: "क्षेत्रफळानुसार औषध व पंपाचे प्रमाण काढा",
    calcClose: "कॅल्क्युलेटर बंद करा",
    farmArea: "शेताचे क्षेत्र",
    acres: "एकर",
    totalDose: "एकूण औषध",
    totalWater: "एकूण पाणी",
    knapsackPumps: "15L पंप",
    certified: "ICAR आणि DPPQS प्रमाणित मार्गदर्शक तत्त्वे",
    close: "बंद करा",
  },
  bn: {
    title: "শস্য কীট ও রোগ প্রাথমিক সতর্কতা ইঞ্জিন",
    subTitle: "ICAR এবং DPPQS প্রত্যয়িত উদ্ভিদ সুরক্ষা গাইড",
    tagline: "কীট ও রোগ পরামর্শ",
    helpline: "হেল্পলাইন (1800-180-1551)",
    voiceLang: "ভাষা (Language):",
    speed: "গতি (Speed):",
    allThreats: "সকল বিপদ (All)",
    insectPests: "🐛 কীটপতঙ্গ (Pests)",
    diseases: "🍄 রোগবালাই (Diseases)",
    searchPlaceholder: "লক্ষণ বা ওষুধের নাম খুঁজুন...",
    noThreats: "কোনো রোগ বা পোকার আক্রমণ নেই",
    noThreatsSub: "আপনার ফসল সম্পূর্ণ সুস্থ রয়েছে।",
    criticalThreat: "🔴 গুরুতর বিপদ",
    moderateAlert: "🟡 মাঝারি সতর্কতা",
    targetPart: "🎯 ক্ষতিগ্রস্ত অংশ",
    stage: "পর্যায়",
    listenVoice: "শুনুন (Voice)",
    stopVoice: "থামান (Stop)",
    copied: "কপি সম্পন্ন!",
    copy: "প্রেসক্রিপশন কপি করুন",
    symptomsTitle: "শনাক্তকরণ এবং লক্ষণ",
    chemicalTitle: "🧪 রাসায়নিক নিয়ন্ত্রণ (Chemical Spray)",
    organicTitle: "🌿 জৈব ও প্রাকৃতিক প্রতিকার (Bio-Control)",
    tankMixTitle: "১৫-লিটার স্প্রেয়ার ট্যাঙ্কের মাত্রা",
    safeMicrobes: "উপকারী পোকামাকড়ের জন্য নিরাপদ।",
    etl: "ক্ষতির মাত্রা (ETL)",
    phi: "ফসল তোলার ব্যবধান (PHI)",
    days: "দিন",
    nozzle: "নোজেল ধরন",
    weather: "আবহাওয়া সূচক",
    calcTitle: "জমির পরিমাপ অনুযায়ী ওষুধ ও জলের হিসাব করুন",
    calcClose: "ক্যালকুলেটর বন্ধ করুন",
    farmArea: "জমির পরিমাণ",
    acres: "একর",
    totalDose: "মোট ওষুধ",
    totalWater: "মোট জল",
    knapsackPumps: "১৫ লিটার ট্যাঙ্ক",
    certified: "ICAR এবং DPPQS বৈজ্ঞানিক মান",
    close: "বন্ধ করুন",
  },
  te: {
    title: "పంట పురుగులు & తెగుళ్ల ముందస్తు హెచ్చరిక ఇంజిన్",
    subTitle: "ICAR & DPPQS ప్రామాణిక పంట రక్షణ సలహాలు",
    tagline: "పురుగు & తెగులు సలహా",
    helpline: "హెల్ప్‌లైన్ (1800-180-1551)",
    voiceLang: "భాష (Language):",
    speed: "వేగం (Speed):",
    allThreats: "అన్ని సమస్యలు (All)",
    insectPests: "🐛 పురుగులు (Pests)",
    diseases: "🍄 తెగుళ్లు (Diseases)",
    searchPlaceholder: "లక్షణాలు లేదా మందు పేరును వెతకండి...",
    noThreats: "ఎలాంటి సమస్యలు కనుగొనబడలేదు",
    noThreatsSub: "ఈ ఎంపికకు మీ పంట ఆరోగ్యంగా ఉంది.",
    criticalThreat: "🔴 తీవ్రమైన ముప్పు",
    moderateAlert: "🟡 మధ్యస్థ హెచ్చరిక",
    targetPart: "🎯 ప్రభావిత భాగం",
    stage: "దశ",
    listenVoice: "వినండి (Voice)",
    stopVoice: "ఆపండి (Stop)",
    copied: "కాపీ చేయబడింది!",
    copy: "కాపీ చేసుకోండి",
    symptomsTitle: "గుర్తింపు మరియు లక్షణాలు",
    chemicalTitle: "🧪 రసాయన మందుల పిచికారీ (Chemical Spray)",
    organicTitle: "🌿 సేంద్రీయ / జీవ నియంత్రణ (Bio-Control)",
    tankMixTitle: "15-లీటర్ల పంపు మోతాదు",
    safeMicrobes: "మిత్ర పురుగులకు పూర్తిగా సురక్షితం.",
    etl: "ఆర్థిక నష్ట స్థాయి (ETL)",
    phi: "కోత భద్రతా వ్యవధి (PHI)",
    days: "రోజులు",
    nozzle: "నాజిల్ రకం",
    weather: "వాతావరణ కారణం",
    calcTitle: "మీ పొలం విస్తీర్ణాన్ని బట్టి మందు మోతాదు లెక్కించండి",
    calcClose: "క్యాలిక్యులేటర్ మూసివేయండి",
    farmArea: "పొలం విస్తీర్ణం",
    acres: "ఎకరాలు",
    totalDose: "మొత్తం మందు",
    totalWater: "మొత్తం నీరు",
    knapsackPumps: "15L పంపులు",
    certified: "ICAR & DPPQS ప్రామాణికాలు",
    close: "మూసివేయి",
  },
  ta: {
    title: "பயிர் பூச்சி மற்றும் நோய் முன்னெச்சரிக்கை அமைப்பு",
    subTitle: "ICAR மற்றும் DPPQS சான்றளிக்கப்பட்ட தாவர பாதுகாப்பு",
    tagline: "பூச்சி & நோய் ஆலோசனை",
    helpline: "உதவி எண் (1800-180-1551)",
    voiceLang: "மொழி (Language):",
    speed: "வேகம் (Speed):",
    allThreats: "அனைத்தும் (All)",
    insectPests: "🐛 பூச்சிகள் (Pests)",
    diseases: "🍄 நோய்கள் (Diseases)",
    searchPlaceholder: "அறிகுறிகள் அல்லது மருந்துகளைத் தேடுங்கள்...",
    noThreats: "எந்த பாதிப்பும் கண்டறியப்படவில்லை",
    noThreatsSub: "உங்கள் பயிர் ஆரோக்கியமாக உள்ளது.",
    criticalThreat: "🔴 கடுமையான அச்சுறுத்தல்",
    moderateAlert: "🟡 நடுத்தர எச்சரிக்கை",
    targetPart: "🎯 பாதிக்கப்பட்ட பகுதி",
    stage: "பயிர் நிலை",
    listenVoice: "கேளுங்கள் (Voice)",
    stopVoice: "நிறுத்து (Stop)",
    copied: "நகலெடுக்கப்பட்டது!",
    copy: "நகலெடு",
    symptomsTitle: "அடையாளம் மற்றும் அறிகுறிகள்",
    chemicalTitle: "🧪 இரசாயன தெளிப்பு (Chemical Spray)",
    organicTitle: "🌿 இயற்கை மற்றும் உயிரியல் கட்டுப்பாடு (Bio-Control)",
    tankMixTitle: "15-லிட்டர் தெளிப்பான் அளவு",
    safeMicrobes: "நன்மை செய்யும் பூச்சிகளுக்கு பாதுகாப்பானது.",
    etl: "பொருளாதார சேத நிலை (ETL)",
    phi: "அறுவடை பாதுகாப்பு இடைவெளி (PHI)",
    days: "நாட்கள்",
    nozzle: "முனை வகை",
    weather: "வானிலை காரணி",
    calcTitle: "நிலத்தின் அளவிற்கு ஏற்ப மருந்து கணக்கீடு",
    calcClose: "மூடு",
    farmArea: "நிலத்தின் அளவு",
    acres: "ஏக்கர்",
    totalDose: "மொத்த மருந்து",
    totalWater: "மொத்த நீர்",
    knapsackPumps: "15L தெளிப்பான்கள்",
    certified: "ICAR & DPPQS அறிவியல் தரநிலைகள்",
    close: "மூடு",
  },
  en: {
    title: "Crop Stage Pest & Disease Early Warning Engine",
    subTitle: "ICAR & DPPQS Certified Plant Protection Standard (8 Indian Languages)",
    tagline: "Pest & Disease Advisory",
    helpline: "Kisan Helpline (1800-180-1551)",
    voiceLang: "Voice Language:",
    speed: "Speed:",
    allThreats: "All Threats",
    insectPests: "🐛 Insect Pests",
    diseases: "🍄 Fungal Diseases",
    searchPlaceholder: "Search symptoms, pesticide, or disease...",
    noThreats: "No Matching Threats Found",
    noThreatsSub: "Crop condition is healthy for this selection.",
    criticalThreat: "🔴 Critical Threat",
    moderateAlert: "🟡 Moderate Alert",
    targetPart: "🎯 Target Part",
    stage: "Stage",
    listenVoice: "Listen (Voice)",
    stopVoice: "Stop Voice",
    copied: "Copied!",
    copy: "Copy Prescription",
    symptomsTitle: "Visual Diagnostic Symptoms",
    chemicalTitle: "🧪 Chemical Spray Treatment",
    organicTitle: "🌿 Organic & Bio-Control",
    tankMixTitle: "15-Litre Knapsack Sprayer Dosage",
    safeMicrobes: "Safe for soil beneficials & honeybees.",
    etl: "Economic Threshold (ETL)",
    phi: "Pre-Harvest Interval (PHI)",
    days: "Days",
    nozzle: "Nozzle Type",
    weather: "Weather Trigger",
    calcTitle: "Calculate Dosage for My Field Size",
    calcClose: "Hide Calculator",
    farmArea: "Farm Area",
    acres: "Acres",
    totalDose: "Total Chemical Dose",
    totalWater: "Total Water",
    knapsackPumps: "15L Knapsack Pumps",
    certified: "ICAR & DPPQS Scientific Plant Protection Standards",
    close: "Close",
  },
};

export const PEST_DISEASE_DATABASE: PestDiseaseItem[] = [
  // 1. Wheat
  {
    id: "wheat-yellow-rust",
    cropCode: "WHEAT",
    cropName: {
      hi: "गेहूं",
      pa: "ਕਣਕ (Wheat)",
      gu: "ઘઉં (Wheat)",
      mr: "गहू (Wheat)",
      bn: "গম (Wheat)",
      te: "గోధుమ (Wheat)",
      ta: "கோதுமை (Wheat)",
      en: "Bread Wheat",
    },
    stageCode: "JOINTING_BOOTING",
    stageName: {
      hi: "गांठे बनने से बाली निकलने तक (Jointing-Booting)",
      pa: "ਗੰਢਾਂ ਬਣਨ ਤੋਂ ਸਿੱਟਾ ਨਿਕਲਣ ਤੱਕ",
      gu: "ગાંઠો બનવાથી ડુંડી નીકળવા સુધી",
      mr: "कांडी फुटण्यापासून लोंबी येईपर्यंत",
      bn: "গাঁট তৈরি থেকে শিষ বের হওয়া পর্যন্ত",
      te: "పిలకల నుండి కంకి దశ వరకు",
      ta: "முடிச்சுகள் தோன்றுவது முதல் கதிர் வரை",
      en: "Jointing to Booting Stage",
    },
    pestName: {
      hi: "पीला रतुआ (हल्दी रोग / पीली कुंगी)",
      pa: "ਪੀਲੀ ਕੁੰਗੀ (ਹਲਦੀ ਰੋਗ / Yellow Rust)",
      gu: "પીળો ગેરુ (હળદર રોગ / Yellow Rust)",
      mr: "पिवळा तांबेरा (हळदी रोग / Yellow Rust)",
      bn: "হলুদ মরিচা রোগ (Yellow Stripe Rust)",
      te: "పసుపు తుప్పు తెగులు (Yellow Rust)",
      ta: "மஞ்சள் துரு நோய் (Yellow Rust)",
      en: "Yellow / Stripe Rust (Puccinia striiformis)",
    },
    type: "DISEASE",
    severity: "CRITICAL",
    affectedPart: "LEAF",
    etlThreshold: {
      hi: "1-2 संक्रमित पत्तियां प्रति वर्ग मीटर",
      pa: "1-2 ਬਿਮਾਰ ਪੱਤੇ ਪ੍ਰਤੀ ਵਰਗ ਮੀਟਰ",
      gu: "1-2 સંક્રમિત પાંદડા પ્રતિ ચોરસ મીટર",
      mr: "1-2 प्रादुर्भावित पाने प्रति चौरस मीटर",
      bn: "প্রতি বর্গমিটারে ১-২টি আক্রান্ত পাতা",
      te: "చదరపు మీటరుకు 1-2 సోకిన ఆకులు",
      ta: "சதுர மீட்டருக்கு 1-2 பாதிக்கப்பட்ட இலைகள்",
      en: "1-2 infected leaves per square meter",
    },
    phiDays: 30,
    symptoms: {
      hi: "पत्तियों पर हल्दी जैसा पीला पाउडर धारियों में दिखता है। छूने पर अंगुली पीली हो जाती है।",
      pa: "ਪੱਤਿਆਂ 'ਤੇ ਹਲਦੀ ਵਰਗਾ ਪੀਲਾ ਪਾਊਡਰ ਧਾਰੀਆਂ ਵਿੱਚ ਦਿਸਦਾ ਹੈ। ਛੂਹਣ 'ਤੇ ਉਂਗਲ ਪੀਲੀ ਹੋ ਜਾਂਦੀ ਹੈ।",
      gu: "પાંદડા પર હળદર જેવો પીળો પાવડર પટ્ટાઓમાં દેખાય છે. અડવાથી આંગળી પીળી થાય છે.",
      mr: "पानांवर हळदीसारखी पिवळी पावडर पट्ट्यांमध्ये दिसते. हाताला पिवळा रंग लागतो.",
      bn: "পাতায় হলুদ গুঁড়োর মতো রেখা দেখা যায়। আঙুল ছোঁয়ালে হলুদ দাগ লেগে যায়।",
      te: "ఆకులపై పసుపు పొడి చారలుగా కనిపిస్తుంది. తాకితే వేలికి పసుపు రంగు అంటుకుంటుంది.",
      ta: "இலைகளில் மஞ்சள் பொடி கோடுகளாகத் தோன்றும். தொட்டால் விரலில் மஞ்சள் படியும்.",
      en: "Yellow powdery pustules in parallel stripes on leaves. Rubs off yellow on fingers.",
    },
    chemicalControl: {
      hi: "प्रोपिकोनाजोल 25% EC (टिल्ट) @ 200 मिली प्रति 200 लीटर पानी प्रति एकड़ छिड़कें।",
      pa: "ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ 25% ਈ.ਸੀ. (ਟਿਲਟ) @ 200 ਮਿ.ਲੀ. ਪ੍ਰਤੀ 200 ਲੀਟਰ ਪਾਣੀ ਪ੍ਰਤੀ ਏਕੜ ਸਪ੍ਰੇਅ ਕਰੋ।",
      gu: "પ્રોપિકોનાઝોલ 25% ઈસી @ 200 મિ.લી. પ્રતિ 200 લિટર પાણીમાં ભેળવી છંટકાવ કરો.",
      mr: "प्रोपिकोनाझोल 25% ईसी @ 200 मिली प्रति 200 लिटर पाण्यात मिसळून फवारावे.",
      bn: "প্রোপিকোনাজল ২৫% ইসি @ ২০০ মিলি প্রতি ২০০ লিটার জলে মিশিয়ে স্প্রে করুন।",
      te: "ఎకరాకు 200 మి.లీ. ప్రొపికోనజోల్ 25% EC ని 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి.",
      ta: "புரோபிகோனசோல் 25% EC @ 200 மிலி 200 லிட்டர் நீரில் கலந்து தெளிக்கவும்.",
      en: "Spray Propiconazole 25% EC (Tilt) @ 200 ml in 200 Litres water per acre.",
    },
    organicControl: {
      hi: "देशी गाय का गोमूत्र (10%) + खट्टी छाछ 50 मिली प्रति लीटर पानी मिलाकर प्रारंभिक छिड़काव करें।",
      pa: "ਦੇਸੀ ਗਾਂ ਦਾ ਗਊਮੂਤਰ (10%) + ਖੱਟੀ ਲੱਸੀ 50 ਮਿ.ਲੀ. ਪ੍ਰਤੀ ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਛਿੜਕੋ।",
      gu: "ગૌમૂત્ર (10%) + ખાટી છાશ 50 મિ.લી. પ્રતિ લિટર પાણીમાં ભેળવી છાંટો.",
      mr: "गोमूत्र (10%) + आंबट ताक 50 मिली प्रति लिटर पाण्यात मिसळून फवारावे.",
      bn: "গোমূত্র (১০%) + টক ঘোল ৫০ মিলি প্রতি লিটার জলে গুলে স্প্রে করুন।",
      te: "గోమూత్రం (10%) + పుల్లటి మజ్జిగ లీటరు నీటికి 50 మి.లీ. కలిపి పిచికారీ చేయండి.",
      ta: "மாட்டு கோமியம் (10%) + புளித்த மோர் 50 மிலி/லிட்டர் நீரில் கலந்து தெளிக்கவும்.",
      en: "Spray Cow urine (10%) + Fermented buttermilk (Chaach) @ 50 ml/L as early preventive.",
    },
    tankMixDosage: {
      hi: "15L टंकी: 15-20 मिली प्रोपिकोनाजोल + 5 मिली चिपको/सर्फेक्टेंट।",
      pa: "15L ਟੈਂਕੀ: 15-20 ਮਿ.ਲੀ. ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ + 5 ਮਿ.ਲੀ. ਚਿਪਕੋ।",
      gu: "15L પંપ: 15-20 મિ.લી. પ્રોપિકોનાઝોલ + 5 મિ.લી. સ્ટીકર.",
      mr: "15L पंप: 15-20 मिली प्रोपिकोनाझोल + 5 मिली स्टीकर.",
      bn: "১৫L ট্যাঙ্ক: ১৫-২০ মিলি প্রোপিকোনাজল + ৫ মিলি স্টিকার।",
      te: "15L పంపు: 15-20 మి.లీ. ప్రొపికోనజోల్ + 5 మి.లీ. స్ప్రెడ్డర్.",
      ta: "15L தெளிப்பான்: 15-20 மிலி புரோபிகோனசோல் + 5 மிலி ஒட்டும் திரவம்.",
      en: "15-Litre Pump: 15-20 ml Propiconazole + 5 ml Spreader.",
    },
    dosagePerAcreMlOrGm: 200,
    dosageUnit: "ml",
    waterPerAcreLitres: 200,
    sprayerNozzle: {
      hi: "होलो कोन नोजल (बारीक फुहार)",
      pa: "ਹੋਲੋ ਕੋਨ ਨੋਜ਼ਲ (ਬਾਰੀਕ ਫੁਹਾਰ)",
      gu: "હોલો કોન નોઝલ",
      mr: "होलो कोन नोझल (बारीक फवारा)",
      bn: "হলো কোন নোজেল",
      te: "హోలో కోన్ నాజిల్",
      ta: "ஹோலோ கோன் முனை",
      en: "Hollow Cone Nozzle",
    },
    idealWeatherTrigger: {
      hi: "ठंडा मौसम (10-20°C), सुबह का घना कोहरा व बादल।",
      pa: "ਠੰਡਾ ਮੌਸਮ (10-20°C), ਸਵੇਰ ਦੀ ਧੁੰਦ ਅਤੇ ਬੱਦਲਵਾਈ।",
      gu: "ઠંડુ વાતાવરણ (10-20°C), સવારનું ઝાકળ અને વાદળછાયું આકાશ.",
      mr: "थंड हवामान (10-20°C), सकाळचे धुके आणि ढगाळ वातावरण.",
      bn: "ঠান্ডা আবহাওয়া (১০-২০°সে), কুয়াশা ও মেঘলা আকাশ।",
      te: "చల్లని వాతావరణం (10-20°C), దట్టమైన పొగమంచు, మేఘావృతం.",
      ta: "குளிர்ந்த வானிலை (10-20°C), அதிகாலை பனிமூட்டம்.",
      en: "Cool temp (10-20°C) with dense morning fog and clouds.",
    },
    audioScripts: {
      hi: "गेहूं में पीला रतुआ की रोकथाम: पत्तियों पर पीला पाउडर दिखने पर तुरंत 200 मिली प्रोपिकोनाजोल 25 ईसी 200 लीटर पानी में मिलाकर प्रति एकड़ छिड़कें। 15 लीटर की टंकी में 15 से 20 मिली दवा डालें।",
      pa: "ਕਣਕ ਵਿੱਚ ਪੀਲੀ ਕੁੰਗੀ ਦੀ ਰੋਕਥਾਮ: ਪੱਤਿਆਂ 'ਤੇ ਪੀਲਾ ਪਾਊਡਰ ਦਿੱਸਣ 'ਤੇ ਤੁਰੰਤ 200 ਮਿ.ਲੀ. ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ 25 ਈ.ਸੀ. 200 ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਪ੍ਰਤੀ ਏਕੜ ਛਿੜਕੋ। 15 ਲੀਟਰ ਦੀ ਟੈਂਕੀ ਵਿੱਚ 15 ਤੋਂ 20 ਮਿ.ਲੀ. ਦਵਾਈ ਪਾਓ।",
      gu: "ઘઉંમાં પીળા ગેરુના નિયંત્રણ માટે: પાંદડા પર પીળો પાવડર દેખાય ત્યારે તરત જ 200 મિ.લી. પ્રોપિકોનાઝોલ 25 ઈસી 200 લિટર પાણીમાં ભેળવી પ્રતિ એકર છંટકાવ કરો. 15 લિટર પંપમાં 15 થી 20 મિ.લી. દવા નાખો.",
      mr: "गव्हावरील पिवळा तांबेरा नियंत्रण: पानांवर पिवळी पावडर दिसताच 200 मिली प्रोपिकोनाझोल 25 ईसी 200 लिटर पाण्यात मिसळून प्रति एकर फवारावे. 15 लिटर पंपात 15 ते 20 मिली औषध टाकावे.",
      bn: "গমের হলুদ মরিচা রোগ নিয়ন্ত্রণ: পাতায় হলুদ গুঁড়ো দেখা দিলে প্রতি একরে ২০০ মিলি প্রোপিকোনাজল ২৫ ইসি ২০০ লিটার জলে গুলে স্প্রে করুন। ১৫ লিটার স্প্রেয়ার ট্যাঙ্কে ১৫ থেকে ২০ মিলি ওষুধ দিন।",
      te: "గోధుమలో పసుపు తుప్పు తెగులు నివారణకు: ఆకులపై పసుపు పొడి కనిపించిన వెంటనే ఎకరాకు 200 మి.లీ. ప్రొపికోనజోల్ 200 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి. 15 లీటర్ల పంపుకు 15-20 మి.లీ. మందు వాడండి.",
      ta: "கோதுமையில் மஞ்சள் துரு நோய் கட்டுப்பாடு: இலைகளில் மஞ்சள் தூள் தென்பட்டால் 200 மிலி புரோபிகோனசோல் 200 லிட்டர் நீரில் கலந்து ஏக்கருக்கு தெளிக்கவும். 15 லிட்டர் தெளிப்பானில் 15 முதல் 20 மிலி மருந்து சேர்க்கவும்.",
      en: "Yellow Rust Management in Wheat: At first symptom of yellow powdery stripes, spray Propiconazole 25 EC at 200 ml per acre in 200 liters of water. For a 15-liter knapsack pump, use 15 to 20 ml with spreader.",
    },
  },
  {
    id: "wheat-aphids",
    cropCode: "WHEAT",
    cropName: {
      hi: "गेहूं",
      pa: "ਕਣਕ (Wheat)",
      gu: "ઘઉં (Wheat)",
      mr: "गहू (Wheat)",
      bn: "গম (Wheat)",
      te: "గోధుమ (Wheat)",
      ta: "கோதுமை (Wheat)",
      en: "Bread Wheat",
    },
    stageCode: "GRAIN_FILLING",
    stageName: {
      hi: "दुग्ध व दाना भराव अवस्था (Grain Filling)",
      pa: "ਦੁੱਧ ਅਤੇ ਦਾਣਾ ਭਰਨ ਦਾ ਸਮਾਂ",
      gu: "દૂધિયા અને દાણા ભરાવવાનો તબક્કો",
      mr: "दाणे भरण्याची अवस्था (मिल्किंग स्टेज)",
      bn: "দুধ ও দানা গঠনের পর্যায়",
      te: "గింజ పాలుపోసుకునే దశ",
      ta: "பால் மற்றும் தானியம் நிரம்பும் நிலை",
      en: "Milking & Grain Filling Stage",
    },
    pestName: {
      hi: "गेहूं का माहू (चेपा / मोयला)",
      pa: "ਕਣਕ ਦਾ ਤੇਲਾ (ਚੇਪਾ ਕੀਟ)",
      gu: "ઘઉંનો મોલો-મસી (ચેપા)",
      mr: "गव्हावरील मावा (चेपा कीड)",
      bn: "গমের জাব পোকা (Aphids)",
      te: "గోధుమ పేనుబంక (Wheat Aphids)",
      ta: "கோதுமை அசுவினி பூச்சி (Aphids)",
      en: "Wheat Aphids / Mahu (Rhopalosiphum padi)",
    },
    type: "PEST",
    severity: "HIGH",
    affectedPart: "GRAIN",
    etlThreshold: {
      hi: "5-10 माहू कीट प्रति बाली",
      pa: "5-10 ਤੇਲਾ ਪ੍ਰਤੀ ਸਿੱਟਾ",
      gu: "5-10 મોલો પ્રતિ ડુંડી",
      mr: "5-10 मावा प्रति लोंबी",
      bn: "প্রতি শিষে ৫-১০টি জাব পোকা",
      te: "కంకికి 5-10 పేనుబంక పురుగులు",
      ta: "கதிருக்கு 5-10 அசுவினி பூச்சிகள்",
      en: "5-10 aphids per earhead",
    },
    phiDays: 21,
    symptoms: {
      hi: "बालियों और पत्तियों पर काले-हरे कीट चिपक कर रस चूसते हैं जिससे दाना सिकुड़ जाता है।",
      pa: "ਸਿੱਟਿਆਂ 'ਤੇ ਕਾਲੇ-ਹਰੇ ਕੀੜੇ ਚਿਪਕ ਕੇ ਰਸ ਚੂਸਦੇ ਹਨ ਜਿਸ ਨਾਲ ਦਾਣਾ ਸੁੰਗੜ ਜਾਂਦਾ ਹੈ।",
      gu: "ડુંડીઓ પર કાળા-લીલા જીવાત ચોંટીને રસ ચૂસે છે જેથી દાણો સંકોચાઈ જાય છે.",
      mr: "लोंब्यांवर काळे-हिरवे कीटक रस शोषतात ज्यामुळे दाणे बारीक व हलके होतात.",
      bn: "শিষ থেকে রস চুষে নেয় যার ফলে দানা পাতলা ও কুঁচকে যায়।",
      te: "కంకులపై రసం పీల్చడం వల్ల గింజలు సరిగ్గా ఊరక ముడతలు పడతాయి.",
      ta: "கதிர்களில் சாற்றை உறிஞ்சுவதால் தானியங்கள் சுருங்கி எடை குறையும்.",
      en: "Colonies suck sap from earheads, shriveling grains and reducing bushel weight.",
    },
    chemicalControl: {
      hi: "इमिडाक्लोप्रिड 17.8% SL @ 60 मिली प्रति 150 लीटर पानी प्रति एकड़ छिड़कें।",
      pa: "ਇਮੀਡਾਕਲੋਪ੍ਰਿਡ 17.8% ਐਸ.ਐਲ. @ 60 ਮਿ.ਲੀ. ਪ੍ਰਤੀ 150 ਲੀਟਰ ਪਾਣੀ ਪ੍ਰਤੀ ਏਕੜ ਛਿੜਕੋ।",
      gu: "ઇમિડાક્લોપ્રિડ 17.8% એસ.એલ. @ 60 મિ.લી. પ્રતિ 150 લિટર પાણીમાં છાંટો.",
      mr: "इमिडाक्लोप्रिड 17.8% एसएल @ 60 मिली प्रति 150 लिटर पाण्यात फवारावे.",
      bn: "ইমিডাক্লোপ্রিড ১৭.৮% এসএল @ ৬০ মিলি ১৫০ লিটার জলে গুলে স্প্রে করুন।",
      te: "ఎకరాకు 60 మి.లీ. ఇమిడాక్లోప్రిడ్ 17.8% SL ని 150 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి.",
      ta: "இமிடாகுளோபிரிட் 17.8% SL @ 60 மிலி 150 லிட்டர் நீரில் கலந்து தெளிக்கவும்.",
      en: "Spray Imidacloprid 17.8% SL @ 60 ml/acre in 150L water.",
    },
    organicControl: {
      hi: "नीम का तेल (1500 ppm) @ 4 मिली प्रति लीटर पानी में थोड़ा साबुन घोलकर छिड़कें।",
      pa: "ਨਿੰਮ ਦਾ ਤੇਲ (1500 ppm) @ 4 ਮਿ.ਲੀ. ਪ੍ਰਤੀ ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਸਾਬਣ ਮਿਲਾ ਕੇ ਛਿੜਕੋ।",
      gu: "લીંબોળીનું તેલ @ 4 મિ.લી. પ્રતિ લિટર સાબુના ફીણ સાથે છાંટો.",
      mr: "कडुनिंब तेल (1500 ppm) @ 4 मिली प्रति लिटर पाण्यात मिसळून फवारावे.",
      bn: "নিম তেল (১৫০০ পিপিএম) @ ৪ মিলি প্রতি লিটার জলে সাবান মিশিয়ে স্প্রে করুন।",
      te: "వేప నూనె (1500 ppm) లీటరు నీటికి 4 మి.లీ. కలిపి పిచికారీ చేయండి.",
      ta: "வேப்ப எண்ணெய் @ 4 மிலி/லிட்டர் நீரில் சோப்பு சேர்த்து தெளிக்கவும்.",
      en: "Spray Neem Oil (1500 ppm) @ 4 ml/L with liquid soap.",
    },
    tankMixDosage: {
      hi: "15L टंकी: 6 से 7 मिली इमिडाक्लोप्रिड।",
      pa: "15L ਟੈਂਕੀ: 6 ਤੋਂ 7 ਮਿ.ਲੀ. ਇਮੀਡਾਕਲੋਪ੍ਰਿਡ।",
      gu: "15L પંપ: 6 થી 7 મિ.લી. ઇમિડાક્લોપ્રિડ.",
      mr: "15L पंप: 6 ते 7 मिली इमिडाक्लोप्रिड.",
      bn: "১৫L ট্যাঙ্ক: ৬ থেকে ৭ মিলি ইমিডাক্লোপ্রিড।",
      te: "15L పంపు: 6-7 మి.లీ. ఇమిడాక్లోప్రిడ్.",
      ta: "15L தெளிப்பான்: 6-7 மிலி இமிடாகுளோபிரிட்.",
      en: "15-Litre Pump: 6-7 ml Imidacloprid.",
    },
    dosagePerAcreMlOrGm: 60,
    dosageUnit: "ml",
    waterPerAcreLitres: 150,
    sprayerNozzle: {
      hi: "होलो कोन नोजल",
      pa: "ਹੋਲੋ ਕੋਨ ਨੋਜ਼ਲ",
      gu: "હોલો કોન નોઝલ",
      mr: "होलो कोन नोझल",
      bn: "হলো কোন নোজেল",
      te: "హోలో కోన్ నాజిల్",
      ta: "ஹோலோ கோன் முனை",
      en: "Hollow Cone Nozzle",
    },
    idealWeatherTrigger: {
      hi: "फरवरी-मार्च का बादलों वाला व गर्म उमस भरा मौसम।",
      pa: "ਫ਼ਰਵਰੀ-ਮਾਰਚ ਦਾ ਬੱਦਲਵਾਈ ਅਤੇ ਨਿੱਘਾ ਮੌਸਮ।",
      gu: "ફેબ્રુઆરી-માર્ચનું વાદળછાયું અને ભેજવાળું વાતાવરણ.",
      mr: "फेब्रुवारी-मार्चमधील ढगाळ व उष्ण दमट हवामान.",
      bn: "ফেব্রুয়ারি-মার্চের মেঘলা ও আর্দ্র আবহাওয়া।",
      te: "ఫిబ్రవరి-మార్చిలో మేఘావృతమైన, తేమతో కూడిన వాతావరణం.",
      ta: "பிப்ரவரி-மார்ச் மாதங்களில் மேகமூட்டமான வெப்ப வானிலை.",
      en: "Cloudy, warm and humid weather in Feb-March.",
    },
    audioScripts: {
      hi: "गेहूं में माहू या चेपा कीट नियंत्रण: बालियों पर कीट दिखने पर 60 मिली इमिडाक्लोप्रिड 17.8 एसएल 150 लीटर पानी में मिलाकर प्रति एकड़ छिड़कें। 15 लीटर की टंकी में 6 से 7 मिली दवा डालें।",
      pa: "ਕਣਕ ਵਿੱਚ ਤੇਲਾ ਜਾਂ ਚੇਪਾ ਕੀਟ ਰੋਕਥਾਮ: ਸਿੱਟਿਆਂ 'ਤੇ ਕੀੜੇ ਦਿੱਸਣ 'ਤੇ 60 ਮਿ.ਲੀ. ਇਮੀਡਾਕਲੋਪ੍ਰਿਡ 17.8 ਐਸ.ਐਲ. 150 ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਛਿੜਕੋ। 15 ਲੀਟਰ ਦੀ ਟੈਂਕੀ ਵਿੱਚ 6 ਤੋਂ 7 ਮਿ.ਲੀ. ਪਾਓ।",
      gu: "ઘઉંમાં મોલો-મસી કંટ્રોલ: ડુંડીઓ પર જીવાત દેખાય ત્યારે 60 મિ.લી. ઇમિડાક્લોપ્રિડ 17.8 એસ.એલ. 150 લિટર પાણીમાં ભેળવી પ્રતિ એકર છાંટો. 15 લિટર પંપમાં 6 થી 7 મિ.લી. દવા નાખો.",
      mr: "गव्हावरील मावा कीड नियंत्रण: लोंब्यांवर कीड दिसल्यास 60 मिली इमिडाक्लोप्रिड 17.8 एसएल 150 लिटर पाण्यात मिसळून प्रति एकर फवारावे. 15 लिटर पंपात 6 ते 7 मिली औषध वापरावे.",
      bn: "গমের জাব পোকা দমন: শিষের উপর পোকা দেখা দিলে প্রতি একরে ৬০ মিলি ইমিডাক্লোপ্রিড ১৭.৮ এসএল ১৫০ লিটার জলে গুলে স্প্রে করুন। ১৫ লিটার ট্যাঙ্কে ৬ থেকে ৭ মিলি দিন।",
      te: "గోధుమలో పేనుబంక నివారణ: కంకులపై పురుగులు కనిపిస్తే ఎకరాకు 60 మి.లీ. ఇమిడాక్లోప్రిడ్ 150 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి. 15 లీటర్ల పంపుకు 6-7 మి.లీ. కలపండి.",
      ta: "கோதுமை அசுவினி பூச்சி கட்டுப்பாடு: கதிர்களில் பூச்சிகள் தென்பட்டால் 60 மிலி இமிடாகுளோபிரிட் 150 லிட்டர் நீரில் கலந்து ஏக்கருக்கு தெளிக்கவும்.",
      en: "Wheat Aphid Control: When aphids cluster on earheads exceeding 5 insects per head, spray Imidacloprid 17.8 SL at 60 ml per acre in 150 liters water. For a 15-liter pump, use 6-7 ml.",
    },
  },
  // 2. Mustard
  {
    id: "mustard-aphids",
    cropCode: "MUSTARD",
    cropName: {
      hi: "सरसों",
      pa: "ਸਰ੍ਹੋਂ (Mustard)",
      gu: "રાયડો (Mustard)",
      mr: "मोहरी (Mustard)",
      bn: "সরিষা (Mustard)",
      te: "ఆవాలు (Mustard)",
      ta: "கடுகு (Mustard)",
      en: "Indian Mustard",
    },
    stageCode: "FLOWERING_POD",
    stageName: {
      hi: "फूल व फली बनते समय (Flowering & Pod Setting)",
      pa: "ਫੁੱਲ ਅਤੇ ਫਲੀਆਂ ਬਣਨ ਸਮੇਂ",
      gu: "ફૂલ અને શીંગો બનવાના સમયે",
      mr: "फुलोरा आणि शेंगा लागण्याची अवस्था",
      bn: "ফুল ও শুঁটি গঠনের পর্যায়",
      te: "పూత మరియు కాయల దశ",
      ta: "பூ மற்றும் காய் பிடிக்கும் பருவம்",
      en: "Flowering & Pod Setting Stage",
    },
    pestName: {
      hi: "सरसों का चेपा / माहू कीट",
      pa: "ਸਰ੍ਹੋਂ ਦਾ ਤੇਲਾ (ਚੇਪਾ ਕੀਟ)",
      gu: "રાયડાનો મોલો-મસી (ચેપા)",
      mr: "मोहरीवरील मावा कीड (माहू)",
      bn: "সরিষার জাব পোকা (Mustard Aphid)",
      te: "ఆవాల పేనుబంక (Mustard Aphid)",
      ta: "கடுகு அசுவினி பூச்சி",
      en: "Mustard Aphid / Chepa (Lipaphis erysimi)",
    },
    type: "PEST",
    severity: "CRITICAL",
    affectedPart: "POD",
    etlThreshold: {
      hi: "50-60 माहू प्रति 10 सेमी शाखा या 20% पौधे प्रभावित",
      pa: "50-60 ਤੇਲਾ ਪ੍ਰਤੀ 10 ਸੈਂਟੀਮੀਟਰ ਟਾਹਣੀ",
      gu: "50-60 મોલો પ્રતિ 10 સેમી ડાળખી",
      mr: "50-60 मावा प्रति 10 सेंमी शेंडा",
      bn: "প্রতি ১০ সেমি ডালে ৫০-৬০টি পোকা",
      te: "10 సెం.మీ కొమ్మకు 50-60 పేనుబంక",
      ta: "10 செமீ கிளைக்கு 50-60 பூச்சிகள்",
      en: "50-60 aphids per 10 cm top shoot",
    },
    phiDays: 20,
    symptoms: {
      hi: "फूलों और फलियों पर अनगिनत माहू कीट चिपक कर चिपचिपा रस छोड़ते हैं जिससे फलियां नहीं बनतीं।",
      pa: "ਫੁੱਲਾਂ ਅਤੇ ਫਲੀਆਂ 'ਤੇ ਤੇਲਾ ਚਿਪਕ ਕੇ ਚਿਪਚਿਪਾ ਰਸ ਛੱਡਦਾ ਹੈ ਜਿਸ ਨਾਲ ਫਲੀਆਂ ਨਹੀਂ ਬਣਦੀਆਂ।",
      gu: "ફૂલ અને શીંગો પર અસંખ્ય મોલો ચોંટીને ચીકણો રસ છોડે છે જેથી શીંગો બેસતી નથી.",
      mr: "फुले आणि शेंगांवर मावा चिकट द्रव सोडतो ज्यामुळे शेंगा भरत नाहीत आणि पीक काळे पडते.",
      bn: "ফুল ও শুঁটিতে পোকা আঠালো রস নিঃসরণ করে ফলে শুঁটি তৈরি হয় না।",
      te: "పూత, కాయలపై తేనె లాంటి జిగురు వదిలి కాయలు ఏర్పడకుండా చేస్తాయి.",
      ta: "பூக்கள் மற்றும் காய்களில் ஒட்டும் திரவத்தை சுரந்து காய்கள் உருவாவதைத் தடுக்கிறது.",
      en: "Colonies cover floral buds and pods, secreting honeydew and stunting pod development.",
    },
    chemicalControl: {
      hi: "डाइमेथोएट 30% EC (रोगोर) @ 250 मिली प्रति 150 लीटर पानी प्रति एकड़ छिड़कें।",
      pa: "ਡਾਈਮੇਥੋਏਟ 30% ਈ.ਸੀ. (ਰੋਗੋਰ) @ 250 ਮਿ.ਲੀ. ਪ੍ਰਤੀ 150 ਲੀਟਰ ਪਾਣੀ ਪ੍ਰਤੀ ਏਕੜ ਸਪ੍ਰੇਅ ਕਰੋ।",
      gu: "ડાયમિથોએટ 30% ઈસી (રોગોર) @ 250 મિ.લી. પ્રતિ 150 લિટર પાણીમાં છાંટો.",
      mr: "डायमेथोएट 30% ईसी (रोगोर) @ 250 मिली प्रति 150 लिटर पाण्यात फवारावे.",
      bn: "ডাইমেথোয়েট ৩০% ইসি (রগোর) @ ২৫০ মিলি ১৫০ লিটার জলে গুলে স্প্রে করুন।",
      te: "ఎకరాకు 250 మి.లీ. రోగోర్ 30% EC ని 150 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి.",
      ta: "டைமெத்தோயேட் 30% EC (ரோகர்) @ 250 மிலி 150 லிட்டர் நீரில் கலந்து தெளிக்கவும்.",
      en: "Spray Dimethoate 30% EC (Rogor) @ 250 ml/acre in 150L water.",
    },
    organicControl: {
      hi: "पीले चिपचिपे कार्ड (Yellow Traps) @ 10 प्रति एकड़ लगाएं + 5% नीम बीज का अर्क (NSKE) छिड़कें।",
      pa: "ਪੀਲੇ ਚਿਪਕਵੇਂ ਟਰੈਪ @ 10 ਪ੍ਰਤੀ ਏਕੜ ਲਗਾਓ + ਨਿੰਮ ਦਾ ਅਰਕ ਛਿੜਕੋ।",
      gu: "પીળા સ્ટીકી ટ્રેપ @ 10 પ્રતિ એકર લગાવો + લીંબોળી અર્ક છાંટો.",
      mr: "पिवळे चिकट सापळे @ 10 प्रति एकर लावा + 5% निंबोळी अर्क फवारा.",
      bn: "হলুদ স্টিকি ট্র্যাপ প্রতি একরে ১০টি লাগান + নিম বীজের নির্যাস স্প্রে করুন।",
      te: "ఎకరాకు 10 పసుపు జిగురు కార్డులు + 5% వేప గింజల కషాయం పిచికారీ చేయండి.",
      ta: "மஞ்சள் ஒட்டும் பொறிகள் @ 10/ஏக்கர் + 5% வேப்பங்கொட்டை சாறு தெளிக்கவும்.",
      en: "Install Yellow Sticky Traps @ 10/acre + Spray 5% Neem Seed Kernel Extract.",
    },
    tankMixDosage: {
      hi: "15L टंकी: 25 मिली रोगोर (डाइमेथोएट 30 EC)।",
      pa: "15L ਟੈਂਕੀ: 25 ਮਿ.ਲੀ. ਰੋਗੋਰ।",
      gu: "15L પંપ: 25 મિ.લી. રોગોર.",
      mr: "15L पंप: 25 मिली रोगोर.",
      bn: "১৫L ট্যাঙ্ক: ২৫ মিলি রগোর।",
      te: "15L పంపు: 25 మి.లీ. రోగోర్.",
      ta: "15L தெளிப்பான்: 25 மிலி ரோகர்.",
      en: "15-Litre Pump: 25 ml Dimethoate 30 EC.",
    },
    dosagePerAcreMlOrGm: 250,
    dosageUnit: "ml",
    waterPerAcreLitres: 150,
    sprayerNozzle: {
      hi: "होलो कोन नोजल",
      pa: "ਹੋਲੋ ਕੋਨ ਨੋਜ਼ਲ",
      gu: "હોલો કોન નોઝલ",
      mr: "होलो कोन नोझल",
      bn: "হলো কোন নোজেল",
      te: "హోలో కోన్ నాజిల్",
      ta: "ஹோலோ கோன் முனை",
      en: "Hollow Cone Nozzle",
    },
    idealWeatherTrigger: {
      hi: "बादलों वाला मौसम, आर्द्रता (>75%) और 15-22°C तापमान।",
      pa: "ਬੱਦਲਵਾਈ, ਨਮੀ (>75%) ਅਤੇ 15-22°C ਤਾਪਮਾਨ।",
      gu: "વાદળછાયું વાતાવરણ, ભેજ (>75%) અને 15-22°C તાપમાન.",
      mr: "ढगाळ हवामान, उच्च आर्द्रता (>75%) आणि 15-22°C तापमान.",
      bn: "মেঘলা আবহাওয়া, আর্দ্রতা (>৭৫%) এবং ১৫-২২°সে তাপমাত্রা।",
      te: "మేఘావృతమైన రోజులు, అధిక తేమ (>75%), 15-22°C ఉష్ణోగ్రత.",
      ta: "மேகமூட்டம், அதிக ஈரப்பதம் (>75%) மற்றும் 15-22°C வெப்பநிலை.",
      en: "Cloudy days with high humidity (>75%) and 15-22°C temp.",
    },
    audioScripts: {
      hi: "सरसों में चेपा या माहू कीट नियंत्रण: फूल और फली पर माहू दिखने पर 250 मिली रोगोर (डाइमेथोएट 30 ईसी) 150 लीटर पानी में मिलाकर प्रति एकड़ छिड़कें। 15 लीटर की टंकी में 25 मिली दवा डालें।",
      pa: "ਸਰ੍ਹੋਂ ਵਿੱਚ ਚੇਪਾ ਕੀਟ ਕੰਟਰੋਲ: ਫੁੱਲਾਂ ਅਤੇ ਫਲੀਆਂ 'ਤੇ ਤੇਲਾ ਦਿੱਸਣ 'ਤੇ 250 ਮਿ.ਲੀ. ਰੋਗੋਰ 150 ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਪ੍ਰਤੀ ਏਕੜ ਛਿੜਕੋ। 15 ਲੀਟਰ ਦੀ ਟੈਂਕੀ ਵਿੱਚ 25 ਮਿ.ਲੀ. ਪਾਓ।",
      gu: "રાયડામાં મોલો-મસી નિયંત્રણ: ફૂલ અને શીંગો પર જીવાત દેખાય ત્યારે 250 મિ.લી. ડાયમિથોએટ (રોગોર 30 ઈસી) 150 લિટર પાણીમાં ભેળવી પ્રતિ એકર છાંટો. 15 લિટર પંપમાં 25 મિ.લી. દવા નાખો.",
      mr: "मोहरीवरील मावा कीड नियंत्रण: फुले आणि शेंगांवर मावा दिसल्यास 250 मिली रोगोर (डायमेथोएट 30 ईसी) 150 लिटर पाण्यात मिसळून फवारावे. 15 लिटर पंपात 25 मिली औषध टाकावे.",
      bn: "সরিষার জাব পোকা দমন: ফুল ও শুঁটিতে পোকা দেখা দিলে প্রতি একরে ২৫০ মিলি রগোর (ডাইমেথোয়েট ৩০ ইসি) ১৫০ লিটার জলে গুলে স্প্রে করুন। ১৫ লিটার ট্যাঙ্কে ২৫ মিলি দিন।",
      te: "ఆవాలలో పేనుబంక నివారణ: పూత, కాయలపై పేనుబంక ఉంటే ఎకరాకు 250 మి.లీ. రోగోర్ 150 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి. 15 లీటర్ల పంపుకు 25 మి.లీ. వాడండి.",
      ta: "கடுகு அசுவினி பூச்சி கட்டுப்பாடு: பூக்கள் மற்றும் காய்களில் பூச்சிகள் இருந்தால் 250 மிலி ரோகர் 150 லிட்டர் நீரில் கலந்து ஏக்கருக்கு தெளிக்கவும்.",
      en: "Mustard Aphid Management: If aphids infest floral twigs, spray Dimethoate 30 EC (Rogor) at 250 ml per acre in 150 liters water. For a 15-liter pump, use 25 ml.",
    },
  },
];

interface PestDiseaseAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCropCode?: string;
}

export const PestDiseaseAdvisorModal = ({
  isOpen,
  onClose,
  defaultCropCode = "WHEAT",
}: PestDiseaseAdvisorModalProps) => {
  const [selectedCrop, setSelectedCrop] = useState<string>(defaultCropCode);
  const [filterType, setFilterType] = useState<"ALL" | "PEST" | "DISEASE">("ALL");
  const [selectedLanguage, setSelectedLanguage] = useState<RegionalLang>("hi");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedCalcId, setExpandedCalcId] = useState<string | null>(null);
  const [acreInputs, setAcreInputs] = useState<Record<string, number>>({});
  const [currentSpokenText, setCurrentSpokenText] = useState<string>("");

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const activeItemIdRef = useRef<string | null>(null);

  const t = UI_TRANSLATIONS[selectedLanguage] || UI_TRANSLATIONS.hi;

  const availableCrops = [
    {
      code: "WHEAT",
      name: {
        hi: "गेहूं (Wheat)",
        pa: "ਕਣਕ (Wheat)",
        gu: "ઘઉં (Wheat)",
        mr: "गहू (Wheat)",
        bn: "গম (Wheat)",
        te: "గోధుమ (Wheat)",
        ta: "கோதுமை (Wheat)",
        en: "Wheat",
      },
    },
    {
      code: "MUSTARD",
      name: {
        hi: "सरसों (Mustard)",
        pa: "ਸਰ੍ਹੋਂ (Mustard)",
        gu: "રાયડો (Mustard)",
        mr: "मोहरी (Mustard)",
        bn: "সরিষা (Mustard)",
        te: "ఆవాలు (Mustard)",
        ta: "கடுகு (Mustard)",
        en: "Mustard",
      },
    },
  ];

  const filteredAdvisories = useMemo(() => {
    return PEST_DISEASE_DATABASE.filter((item) => {
      const matchCrop = item.cropCode === selectedCrop;
      const matchType = filterType === "ALL" || item.type === filterType;
      const currentPestName = item.pestName[selectedLanguage] || item.pestName.hi;
      const currentSymptoms = item.symptoms[selectedLanguage] || item.symptoms.hi;
      const currentChem = item.chemicalControl[selectedLanguage] || item.chemicalControl.hi;

      const matchSearch =
        !searchQuery ||
        currentPestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currentSymptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currentChem.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCrop && matchType && matchSearch;
    });
  }, [selectedCrop, filterType, searchQuery, selectedLanguage]);

  // Stop all active audio streams and speech synthesis
  const stopAllAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = "";
      currentAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    audioQueueRef.current = [];
    activeItemIdRef.current = null;
    setSpeakingId(null);
    setCurrentSpokenText("");
  };

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      stopAllAudio();
    };
  }, []);

  // Split long texts into manageable chunks for streaming TTS
  const splitTextIntoChunks = (text: string, maxLen = 130): string[] => {
    const sentences = text.match(/[^।?!.,;]+[।?!.,;]?/g) || [text];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLen) {
        currentChunk += sentence;
      } else {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        if (sentence.length > maxLen) {
          const words = sentence.split(" ");
          let sub = "";
          for (const w of words) {
            if ((sub + " " + w).length <= maxLen) {
              sub += (sub ? " " : "") + w;
            } else {
              if (sub.trim()) chunks.push(sub.trim());
              sub = w;
            }
          }
          if (sub.trim()) chunks.push(sub.trim());
          currentChunk = "";
        } else {
          currentChunk = sentence;
        }
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks.length > 0 ? chunks : [text];
  };

  // Play Web Speech API as fallback if online stream is unavailable
  const playWebSpeechFallback = (text: string, langKey: RegionalLang) => {
    if (!("speechSynthesis" in window)) {
      stopAllAudio();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const langMap: Record<RegionalLang, string> = {
      hi: "hi-IN",
      pa: "pa-IN",
      gu: "gu-IN",
      mr: "mr-IN",
      bn: "bn-IN",
      te: "te-IN",
      ta: "ta-IN",
      en: "en-IN",
    };

    const targetLang = langMap[langKey] || "hi-IN";
    utterance.lang = targetLang;

    const voices = window.speechSynthesis.getVoices();
    const directVoice = voices.find(
      (v) =>
        v.lang === targetLang ||
        v.lang.toLowerCase().startsWith(langKey) ||
        v.lang.toLowerCase().includes(langKey)
    );
    const hindiVoice = voices.find((v) => v.lang.includes("hi") || v.name.toLowerCase().includes("hindi"));
    const englishVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en"));

    utterance.voice = directVoice || hindiVoice || englishVoice || null;
    utterance.rate = speechSpeed;
    utterance.pitch = 1.0;

    utterance.onend = () => stopAllAudio();
    utterance.onerror = () => stopAllAudio();

    window.speechSynthesis.speak(utterance);
  };

  // Sequential chunk audio streamer for natural regional pronunciation
  const playNextChunk = (langKey: RegionalLang, fullText: string) => {
    if (audioQueueRef.current.length === 0) {
      stopAllAudio();
      return;
    }

    const chunk = audioQueueRef.current.shift()!;
    const googleLangMap: Record<RegionalLang, string> = {
      hi: "hi",
      pa: "pa",
      gu: "gu",
      mr: "mr",
      bn: "bn",
      te: "te",
      ta: "ta",
      en: "en",
    };

    const googleLang = googleLangMap[langKey] || "hi";
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${googleLang}&q=${encodeURIComponent(
      chunk
    )}`;

    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;
    audio.playbackRate = speechSpeed;

    audio.onended = () => {
      playNextChunk(langKey, fullText);
    };

    audio.onerror = () => {
      playWebSpeechFallback(fullText, langKey);
    };

    audio.play().catch(() => {
      playWebSpeechFallback(fullText, langKey);
    });
  };

  // High-Quality Multi-Lingual Audio Handler
  const handleVoiceAdvisory = (item: PestDiseaseItem) => {
    if (speakingId === item.id) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    setSpeakingId(item.id);
    activeItemIdRef.current = item.id;

    const speechScript = item.audioScripts[selectedLanguage] || item.audioScripts.hi;
    setCurrentSpokenText(speechScript);

    const chunks = splitTextIntoChunks(speechScript);
    audioQueueRef.current = [...chunks];

    playNextChunk(selectedLanguage, speechScript);
  };

  const handleCopyTreatment = (item: PestDiseaseItem) => {
    const pestName = item.pestName[selectedLanguage] || item.pestName.hi;
    const cropName = item.cropName[selectedLanguage] || item.cropName.hi;
    const stageName = item.stageName[selectedLanguage] || item.stageName.hi;
    const symptoms = item.symptoms[selectedLanguage] || item.symptoms.hi;
    const chemical = item.chemicalControl[selectedLanguage] || item.chemicalControl.hi;
    const tankMix = item.tankMixDosage[selectedLanguage] || item.tankMixDosage.hi;
    const organic = item.organicControl[selectedLanguage] || item.organicControl.hi;
    const etl = item.etlThreshold[selectedLanguage] || item.etlThreshold.hi;
    const nozzle = item.sprayerNozzle[selectedLanguage] || item.sprayerNozzle.hi;
    const weather = item.idealWeatherTrigger[selectedLanguage] || item.idealWeatherTrigger.hi;

    const text = `🌾 KrishiOra Crop Doctor Prescription (कृषि डॉक्टर पर्चा)
━━━━━━━━━━━━━━━━━━━━━━━━━━
🌾 ${cropName} | ⚠️ ${pestName}
📌 ${t.stage}: ${stageName}
🔴 ${t.criticalThreat}: ${item.severity}
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 ${t.symptomsTitle}:
${symptoms}

🧪 ${t.chemicalTitle}:
${chemical}

🪣 ${t.tankMixTitle}:
${tankMix}

🌿 ${t.organicTitle}:
${organic}

⏱️ ${t.etl}: ${etl}
⏳ ${t.phi}: ${item.phiDays} ${t.days}
🚜 ${t.nozzle}: ${nozzle}
⛅ ${t.weather}: ${weather}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 ${t.helpline}: 1800-180-1551 (Toll-Free)
🏛️ ${t.certified}`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleShareWhatsApp = (item: PestDiseaseItem) => {
    const pestName = item.pestName[selectedLanguage] || item.pestName.hi;
    const cropName = item.cropName[selectedLanguage] || item.cropName.hi;
    const chemical = item.chemicalControl[selectedLanguage] || item.chemicalControl.hi;
    const tankMix = item.tankMixDosage[selectedLanguage] || item.tankMixDosage.hi;
    const organic = item.organicControl[selectedLanguage] || item.organicControl.hi;

    const text = encodeURIComponent(
      `🌾 *KrishiOra Plant Protection Alert*\n\n` +
      `*${cropName}* — *${pestName}*\n` +
      `*${t.chemicalTitle}:* ${chemical}\n` +
      `*${t.tankMixTitle}:* ${tankMix}\n` +
      `*${t.organicTitle}:* ${organic}\n\n` +
      `📞 ${t.helpline}: 1800-180-1551`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl border border-slate-700/60 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/40 px-5 py-4 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white shadow-inner">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/20 border border-red-400/40 text-red-400 backdrop-blur-md shadow-inner">
              <Bug size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  {t.title}
                </h2>
                <span className="text-[10px] font-extrabold bg-red-500/20 text-red-300 border border-red-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-flex">
                  {t.tagline}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {t.subTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:18001801551"
              title="Kisan Call Center: 1800-180-1551"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700/60 hover:bg-emerald-600/80 text-emerald-200 border border-emerald-500/30 transition-all cursor-pointer"
            >
              <PhoneCall size={13} />
              <span>{t.helpline}</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Multi-Language Selector Bar & Crop Tabs */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Crop Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {availableCrops.map((c) => {
                const localizedCropLabel = c.name[selectedLanguage] || c.name.hi;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCrop(c.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                      selectedCrop === c.code
                        ? "bg-slate-950 text-amber-300 border border-amber-400/40 ring-2 ring-amber-400/20"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {localizedCropLabel}
                  </button>
                );
              })}
            </div>

            {/* Regional Language Selector + Speed */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl shadow-xs">
                <Languages size={15} className="text-emerald-700" />
                <span className="text-[11px] font-bold text-slate-500">{t.voiceLang}</span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    stopAllAudio();
                    setSelectedLanguage(e.target.value as RegionalLang);
                  }}
                  className="text-xs font-black text-emerald-950 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="en">English (India)</option>
                </select>
              </div>

              {/* Speed Buttons */}
              <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs text-[11px] font-bold text-slate-600">
                <Sliders size={12} className="text-slate-500" />
                <span>{t.speed}</span>
                {[0.8, 1.0, 1.2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setSpeechSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      speechSpeed === spd
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Types & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {(
                [
                  { id: "ALL", label: t.allThreats },
                  { id: "PEST", label: t.insectPests },
                  { id: "DISEASE", label: t.diseases },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterType === f.id
                      ? "bg-amber-100 text-amber-950 font-black border border-amber-300 shadow-2xs"
                      : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 w-56 sm:w-72 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Live Speaking Subtitle Strip */}
        {speakingId && currentSpokenText && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 text-white px-5 py-2.5 border-b border-emerald-500/30 flex items-center justify-between gap-3 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-semibold text-emerald-100 truncate italic">
                "{currentSpokenText}"
              </p>
            </div>
            <button
              type="button"
              onClick={stopAllAudio}
              className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black bg-red-500/30 hover:bg-red-500/50 text-red-200 border border-red-400/40 cursor-pointer"
            >
              {t.stopVoice}
            </button>
          </div>
        )}

        {/* Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredAdvisories.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mb-3 border border-emerald-200 shadow-xs">
                <Shield size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">{t.noThreats}</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {t.noThreatsSub}
              </p>
            </div>
          ) : (
            filteredAdvisories.map((item) => {
              const isSpeaking = speakingId === item.id;
              const isCopied = copiedId === item.id;
              const isCalcOpen = expandedCalcId === item.id;
              const currentAcre = acreInputs[item.id] ?? 1;

              const pestName = item.pestName[selectedLanguage] || item.pestName.hi;
              const stageName = item.stageName[selectedLanguage] || item.stageName.hi;
              const symptoms = item.symptoms[selectedLanguage] || item.symptoms.hi;
              const chemical = item.chemicalControl[selectedLanguage] || item.chemicalControl.hi;
              const tankMix = item.tankMixDosage[selectedLanguage] || item.tankMixDosage.hi;
              const organic = item.organicControl[selectedLanguage] || item.organicControl.hi;
              const etl = item.etlThreshold[selectedLanguage] || item.etlThreshold.hi;
              const nozzle = item.sprayerNozzle[selectedLanguage] || item.sprayerNozzle.hi;
              const weather = item.idealWeatherTrigger[selectedLanguage] || item.idealWeatherTrigger.hi;

              const totalDose = (currentAcre * item.dosagePerAcreMlOrGm).toFixed(1);
              const totalWater = currentAcre * item.waterPerAcreLitres;
              const knapsackTanksNeeded = Math.ceil(totalWater / 15);

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-lg transition-all space-y-4 relative overflow-hidden"
                >
                  {/* Decorative severity strip */}
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                      item.severity === "CRITICAL" ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />

                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            item.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {item.severity === "CRITICAL" ? t.criticalThreat : t.moderateAlert}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.type === "PEST" ? t.insectPests : t.diseases}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {t.targetPart}: {item.affectedPart}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1.5">
                        {pestName}
                      </h3>

                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mt-1">
                        <Leaf size={13} className="text-emerald-600 shrink-0" />
                        <span>
                          {t.stage}: {stageName}
                        </span>
                      </p>
                    </div>

                    {/* Regional Voice Speech & Action Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleVoiceAdvisory(item)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black border transition-all cursor-pointer shadow-xs ${
                          isSpeaking
                            ? "bg-amber-500 border-amber-600 text-slate-950 animate-pulse"
                            : "bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 border-emerald-700 text-white"
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX size={15} />
                            <span>{t.stopVoice}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={15} />
                            <span>{t.listenVoice}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(item)}
                        title="WhatsApp Share"
                        className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-2xl text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Share2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyTreatment(item)}
                        title={t.copy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-emerald-700">{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>{t.copy}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Identification Symptoms in Selected Language */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <span className="font-black text-slate-900 block mb-1 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-600" />
                      {t.symptomsTitle}:
                    </span>
                    <p className="text-slate-800 leading-relaxed font-semibold">
                      {symptoms}
                    </p>
                  </div>

                  {/* Treatment Protocol Grid in Selected Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    {/* Chemical Control */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50/60 to-rose-50/30 border border-red-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-900 flex items-center gap-1">
                          {t.chemicalTitle}
                        </span>
                        <span className="text-[10px] font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-md">
                          ICAR Standard
                        </span>
                      </div>
                      <p className="text-slate-900 font-bold leading-relaxed">
                        {chemical}
                      </p>
                      <div className="pt-2 border-t border-red-200 flex items-center gap-1.5 text-[11px] text-red-950 font-black">
                        <FlaskConical size={13} className="text-red-700 shrink-0" />
                        <span>
                          {t.tankMixTitle}: {tankMix}
                        </span>
                      </div>
                    </div>

                    {/* Organic / Bio Control */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                          {t.organicTitle}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          Zero Residue
                        </span>
                      </div>
                      <p className="text-slate-900 font-bold leading-relaxed">
                        {organic}
                      </p>
                      <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-900 font-bold flex items-center gap-1">
                        <Sprout size={13} className="text-emerald-700" />
                        <span>{t.safeMicrobes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Agronomic Parameters (ETL, PHI, Nozzle, Weather) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">{t.etl}:</span>
                      <span className="font-extrabold text-slate-800 text-[11px]">{etl}</span>
                    </div>

                    <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">{t.phi}:</span>
                      <span className="font-extrabold text-slate-800 text-[11px]">
                        {item.phiDays} {t.days}
                      </span>
                    </div>

                    <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">{t.nozzle}:</span>
                      <span className="font-extrabold text-slate-800 text-[11px]">{nozzle}</span>
                    </div>

                    <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">{t.weather}:</span>
                      <span className="font-extrabold text-slate-800 text-[11px] truncate block" title={weather}>
                        {weather}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Acre & Tank Dosage Calculator */}
                  <div className="border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setExpandedCalcId(isCalcOpen ? null : item.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                    >
                      <Calculator size={14} className="text-emerald-700" />
                      <span>{isCalcOpen ? t.calcClose : t.calcTitle}</span>
                      {isCalcOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isCalcOpen && (
                      <div className="mt-3 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 animate-in fade-in space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-300">{t.farmArea}:</span>
                            <div className="flex items-center gap-1 bg-slate-800 border border-slate-600 rounded-xl px-2.5 py-1">
                              <input
                                type="number"
                                min="0.25"
                                max="50"
                                step="0.25"
                                value={currentAcre}
                                onChange={(e) =>
                                  setAcreInputs((prev) => ({
                                    ...prev,
                                    [item.id]: Math.max(0.25, parseFloat(e.target.value) || 1),
                                  }))
                                }
                                className="w-16 bg-transparent text-amber-400 font-black text-sm text-center focus:outline-none"
                              />
                              <span className="text-xs font-bold text-slate-400">{t.acres}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {[1, 2, 5, 10].map((ac) => (
                              <button
                                key={ac}
                                type="button"
                                onClick={() =>
                                  setAcreInputs((prev) => ({
                                    ...prev,
                                    [item.id]: ac,
                                  }))
                                }
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                  currentAcre === ac
                                    ? "bg-amber-400 text-slate-950"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                }`}
                              >
                                {ac} {t.acres}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Calculated Results */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                            <span className="text-[10px] text-slate-400 block">{t.totalDose}:</span>
                            <span className="text-sm font-black text-amber-300">
                              {totalDose} {item.dosageUnit}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                            <span className="text-[10px] text-slate-400 block">{t.totalWater}:</span>
                            <span className="text-sm font-black text-cyan-300">
                              {totalWater > 0 ? `${totalWater} Litres` : "Soil Granules"}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                            <span className="text-[10px] text-slate-400 block">{t.knapsackPumps}:</span>
                            <span className="text-sm font-black text-emerald-300">
                              {knapsackTanksNeeded > 0 ? `~${knapsackTanksNeeded}` : "Direct Soil"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>{t.certified}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestDiseaseAdvisorModal;
