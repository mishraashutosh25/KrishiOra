import { useState, useEffect, useRef, useMemo } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Share2,
  FlaskConical,
  Sprout,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export type CopilotLang = "hi" | "pa" | "gu" | "mr" | "bn" | "te" | "ta" | "en";

export interface StructuredAdvisory {
  title: string;
  badge: string;
  badgeType: "CRITICAL" | "CAUTION" | "INFO" | "SUCCESS";
  summary: string;
  symptoms?: string;
  chemicalDosage?: string;
  tankMix15L?: string;
  organicRemedy?: string;
  cautionTip?: string;
  quickActions?: Array<{ label: string; actionType: "NAVIGATE" | "QUERY"; payload: string }>;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "doctor";
  rawText?: string;
  advisory?: StructuredAdvisory;
  timestamp: string;
}

export const QUICK_CHIPS: Record<
  CopilotLang,
  Array<{ title: string; query: string; icon: string }>
> = {
  hi: [
    { title: "सरसों में माहू (चेपा)", query: "सरसों में माहू कीट का तुरंत इलाज बताओ", icon: "🐛" },
    { title: "गेहूं की पहली सिंचाई व यूरिया", query: "गेहूं में पहली सिंचाई (CRI) कब करें और यूरिया कितना डालें?", icon: "🌾" },
    { title: "आज स्प्रे करना सुरक्षित है?", query: "क्या आज खेत में कीटनाशक स्प्रे करना सुरक्षित है?", icon: "⛅" },
    { title: "चने में फली छेदक सुंडी", query: "चने में फली छेदक इल्ली की रोकथाम कैसे करें?", icon: "🌿" },
    { title: "1 एकड़ खाद की लागत", query: "1 एकड़ गेहूं में DAP और यूरिया का कितना खर्चा होगा?", icon: "💰" },
  ],
  pa: [
    { title: "ਕਣਕ ਵਿੱਚ ਪੀਲੀ ਕੁੰਗੀ", query: "ਕਣਕ ਵਿੱਚ ਪੀਲੀ ਕੁੰਗੀ ਦਾ ਪੱਕਾ ਇਲਾਜ ਕੀ ਹੈ?", icon: "🌾" },
    { title: "ਸਰ੍ਹੋਂ ਵਿੱਚ ਚੇਪਾ ਕੀਟ", query: "ਸਰ੍ਹੋਂ ਦੇ ਤੇਲੇ ਦੀ ਰੋਕਥਾਮ ਲਈ ਦਵਾਈ ਦੱਸੋ", icon: "🐛" },
    { title: "ਕੀ ਅੱਜ ਸਪ੍ਰੇਅ ਕਰੀਏ?", query: "ਕੀ ਅੱਜ ਮੌਸਮ ਅਨੁਸਾਰ ਸਪ੍ਰੇਅ ਕਰਨਾ ਠੀਕ ਹੈ?", icon: "⛅" },
  ],
  gu: [
    { title: "રાયડામાં મોલો-મસી", query: "રાયડામાં મોલો-મસી જીવાત માટે કઈ દવા છાંટવી?", icon: "🐛" },
    { title: "ઘઉંમાં પહેલું પિયત", query: "ઘઉંમાં પહેલું પિયત ક્યારે આપવું અને યુરિયા કેટલું નાખવું?", icon: "🌾" },
  ],
  mr: [
    { title: "गव्हावरील पिवळा तांबेरा", query: "गव्हावरील पिवळा तांबेरा रोगावर कोणता उपाय करावा?", icon: "🌾" },
    { title: "हरभऱ्यावरील घाटे अळी", query: "हरभऱ्यावरील घाटे अळी नियंत्रणासाठी काय फवारावे?", icon: "🌿" },
  ],
  bn: [
    { title: "সরিষার জাব পোকা", query: "সরিষার জাব পোকা দমনের জন্য কোন ওষুধ স্প্রে করব?", icon: "🐛" },
    { title: "গমের হলুদ মরিচা", query: "গমের হলুদ মরিচা রোগের সঠিক চিকিৎসা কী?", icon: "🌾" },
  ],
  te: [
    { title: "గోధుమలో తుప్పు తెగులు", query: "గోధుమలో పసుపు తుప్పు తెగులు నివారణకు ఏ మందు పిచికారీ చేయాలి?", icon: "🌾" },
  ],
  ta: [
    { title: "கோதுமை துரு நோய்", query: "கோதுமை மஞ்சள் துரு நோயை கட்டுப்படுத்துவது எப்படி?", icon: "🌾" },
  ],
  en: [
    { title: "Yellow Rust in Wheat", query: "How to cure yellow rust disease in wheat?", icon: "🌾" },
    { title: "Mustard Aphid Remedy", query: "What is the best pesticide dosage for mustard aphids?", icon: "🐛" },
    { title: "Weather Spray Window", query: "Is it safe to spray pesticides today based on weather?", icon: "⛅" },
  ],
};

// Realistic Human Agronomic Knowledge Engine
export const getDoctorAdvisory = (userQuery: string, _lang: CopilotLang): StructuredAdvisory => {
  const q = userQuery.toLowerCase();

  // 1. Wheat Yellow Rust
  if (
    q.includes("yellow rust") ||
    q.includes("पीला रतुआ") ||
    q.includes("हल्दी रोग") ||
    q.includes("ਕੁੰਗੀ") ||
    q.includes("ગેરુ") ||
    q.includes("तांबेरा") ||
    q.includes("মরিচা") ||
    q.includes("తుప్పు")
  ) {
    return {
      title: "गेहूं में पीला रतुआ (हल्दी रोग) का त्वरित निदान",
      badge: "🔴 गंभीर फफूंद रोग (Puccinia striiformis)",
      badgeType: "CRITICAL",
      summary: "पत्तियों पर पीला पाउडर दिखने पर तुरंत प्रकाश संश्लेषण रुकने से पहले फफूंदनाशक का छिड़काव करें।",
      symptoms: "पत्तियों की नसों के समानांतर हल्दी जैसी पीली धारियां बनती हैं जो छूने पर अंगुली पर चिपकती हैं।",
      chemicalDosage: "प्रोपिकोनाजोल 25% EC (टिल्ट) @ 200 मिली प्रति 200 लीटर पानी प्रति एकड़।",
      tankMix15L: "15-लीटर पंप टंकी में 15 से 20 मिली प्रोपिकोनाजोल + 5 मिली चिपको (सर्फेक्टेंट) घोलें।",
      organicRemedy: "देशी गाय का गोमूत्र (10%) + खट्टी छाछ (50ml/L) का छिड़काव शुरुआती अवस्था में करें।",
      cautionTip: "छिड़काव सुबह ओस सूखने के बाद धूप निकलने पर ही करें। पानी साफ उपयोग करें।",
      quickActions: [
        { label: "कीट व रोग चेतावनी कार्ड्स देखें", actionType: "NAVIGATE", payload: "/crops" },
        { label: "15L टंकी कैलकुलेटर", actionType: "NAVIGATE", payload: "/crops" },
      ],
    };
  }

  // 2. Mustard Aphid / Chepa
  if (
    q.includes("aphid") ||
    q.includes("माहू") ||
    q.includes("चेपा") ||
    q.includes("मोयला") ||
    q.includes("ਤੇਲਾ") ||
    q.includes("મોલો") ||
    q.includes("मावा") ||
    q.includes("জাব") ||
    q.includes("పేనుబంక")
  ) {
    return {
      title: "सरसों में माहू (चेपा कीट) का संपूर्ण नियंत्रण",
      badge: "🐛 रस चूसक कीट (Lipaphis erysimi)",
      badgeType: "CRITICAL",
      summary: "फूल और फलियों पर माहू चिपक कर रस चूसते हैं जिससे फलियां नहीं बनतीं। आर्थिक क्षति स्तर (ETL) पार होते ही स्प्रे करें।",
      symptoms: "कोमल टहनियों और फूलों पर अनगिनत काले-हरे कीड़े और चिपचिपा मधु-रस।",
      chemicalDosage: "डाइमेथोएट 30% EC (रोगोर) @ 250 मिली OR इमिडाक्लोप्रिड 17.8% SL @ 60 मिली प्रति एकड़ (150L पानी)।",
      tankMix15L: "15-लीटर पंप टंकी में 25 मिली रोगोर (डाइमेथोएट) घोलें।",
      organicRemedy: "पीले चिपचिपे कार्ड (Yellow Traps) @ 10/एकड़ लगाएं + 5% नीम बीज अर्क (NSKE) छिड़कें।",
      cautionTip: "मधुमक्खियों के परागण की सुरक्षा के लिए छिड़काव दोपहर बाद 3:30 बजे के बाद ही करें।",
      quickActions: [
        { label: "दवा की सही मात्रा निकालें", actionType: "NAVIGATE", payload: "/crops" },
        { label: "मौसम स्प्रे विंडो चेक करें", actionType: "NAVIGATE", payload: "/dashboard" },
      ],
    };
  }

  // 3. Wheat CRI First Irrigation & Urea
  if (
    q.includes("cri") ||
    q.includes("पहली सिंचाई") ||
    q.includes("सिंचाई") ||
    q.includes("यूरिया") ||
    q.includes("ਪਾਣੀ") ||
    q.includes("પિયત") ||
    q.includes("पाणी") ||
    q.includes("সেচ") ||
    q.includes("తడి")
  ) {
    return {
      title: "गेहूं की पहली सिंचाई व यूरिया टॉप-ड्रेसिंग गाइड",
      badge: "🌾 शीर्ष जड़ अवस्था (CRI Stage - 21 दिन)",
      badgeType: "SUCCESS",
      summary: "बुवाई के 20 से 22 दिन बाद का समय गेहूं की पैदावार के लिए सबसे नाजुक होता है। इस समय क्राउन रूट्स बनती हैं।",
      symptoms: "खेत में पहली सिंचाई हल्की करें, पानी रुकने न दें।",
      chemicalDosage: "सिंचाई के 3-4 दिन बाद (पैर टिकने पर) 1 बैग (45 किलो) नीम लेपित यूरिया प्रति एकड़ बखेरें।",
      tankMix15L: "यदि पीलापन हो तो 15L टंकी में 100 ग्राम 19:19:19 NPK + 15 ग्राम चिलेटेड जिंक स्प्रे करें।",
      organicRemedy: "जीवामृत 200 लीटर प्रति एकड़ सिंचाई जल के साथ बहाएं।",
      cautionTip: "ज्यादा गहरा पानी न दें, इससे कल्ले (Tillers) फूटने में बाधा आती है।",
      quickActions: [
        { label: "खाद डोज कैलकुलेटर खोलें", actionType: "NAVIGATE", payload: "/crops" },
      ],
    };
  }

  // 4. Weather Spraying Window
  if (
    q.includes("weather") ||
    q.includes("spray") ||
    q.includes("मौसम") ||
    q.includes("स्प्रे") ||
    q.includes("हवा") ||
    q.includes("बारिश") ||
    q.includes("ਮੀਂਹ") ||
    q.includes("વરસાદ") ||
    q.includes("पाऊस")
  ) {
    return {
      title: "आज के मौसम अनुसार स्प्रे सुरक्षा समीक्षा",
      badge: "⛅ एग्रो-रडार वेदर इंडेक्स (Agro-Radar)",
      badgeType: "CAUTION",
      summary: "दवा के 100% असर के लिए हवा की गति और बारिश की संभावना का ध्यान रखना बेहद जरूरी है।",
      symptoms: "हवा की गति 15 किमी/घंटा से कम और बारिश की संभावना 20% से नीचे होने पर ही स्प्रे करें।",
      chemicalDosage: "कीटनाशक के साथ हमेशा 5 मिली सिलिकॉन आधारित चिपको (Spreader) अवश्य मिलाएं।",
      tankMix15L: "दवा हमेशा साफ मीठे पानी में घोलें, गंदे या खारे पानी में दवा की शक्ति घट जाती है।",
      cautionTip: "दोपहर 12 से 3 बजे तेज चिलचिलाती धूप में स्प्रे कभी न करें। सुबह 7-10 या शाम 4-6 का समय सबसे उत्तम है।",
      quickActions: [
        { label: "डैशबोर्ड पर लाइव वेदर रडार देखें", actionType: "NAVIGATE", payload: "/dashboard" },
      ],
    };
  }

  // 5. Fertilizer Cost per Acre
  if (
    q.includes("dap") ||
    q.includes("खाद") ||
    q.includes("खर्च") ||
    q.includes("cost") ||
    q.includes("ਲਾਗਤ") ||
    q.includes("ખર્ચ") ||
    q.includes("खत")
  ) {
    return {
      title: "1 एकड़ संतुलित पोषण व सरकारी सब्सिडी खाद खर्च",
      badge: "💰 ICAR प्रमाणित उर्वरक बजट",
      badgeType: "INFO",
      summary: "सरकारी MRP दरों के अनुसार संतुलित खाद डालने पर प्रति एकड़ लागत और उत्पादकता का ब्यौरा।",
      chemicalDosage: "गेहूं: 1 बैग DAP (₹1,350) + 0.5 बैग MOP (₹850) + 2 बैग यूरिया (₹533) = कुल ~₹2,733 प्रति एकड़।",
      tankMix15L: "सरसों: 0.7 बैग DAP + 10 किलो बेंटोनाइट सल्फर (₹500) + 1.5 बैग यूरिया = ~₹2,200 प्रति एकड़।",
      organicRemedy: "गोबर की सड़ी खाद (FYM) 2-3 ट्रॉली प्रति एकड़ डालकर रासायनिक खाद पर 25% बचत की जा सकती है।",
      cautionTip: "DAP हमेशा बुवाई के समय कतारों में बीज से नीचे डालें, ऊपर से न बखेरें।",
      quickActions: [
        { label: "ICAR खाद कैलकुलेटर खोलें", actionType: "NAVIGATE", payload: "/crops" },
        { label: "खर्च बहीखाता (Expenses) देखें", actionType: "NAVIGATE", payload: "/expenses" },
      ],
    };
  }

  // Default fallback
  return {
    title: "कृषि वैज्ञानिक सलाह व मार्गदर्शन",
    badge: "🌾 सामान्य कृषि परामर्श",
    badgeType: "INFO",
    summary: "आपकी फसल से जुड़े सवाल का विश्लेषण किया गया है। सही समाधान के लिए नीचे दिए गए टूल्स का उपयोग करें।",
    symptoms: "रोग या कीट की सटीक पहचान के लिए लक्षण मिलान करें।",
    chemicalDosage: "कीट/रोग निवारण के लिए 'Crop Stage Warning Cards' में सटीक ICAR दवाएं देखें।",
    tankMix15L: "15L स्प्रेयर पंप में हमेशा अनुशंसित मात्रा में ही दवा डालें।",
    organicRemedy: "फसल चक्र अपनाएं और मित्र कीटों की सुरक्षा का ध्यान रखें।",
    cautionTip: "किसी भी आपात स्थिति में टोल-फ्री किसान कॉल सेंटर 1800-180-1551 पर तुरंत बात करें।",
    quickActions: [
      { label: "रोग व कीट कार्ड्स खोलें", actionType: "NAVIGATE", payload: "/crops" },
      { label: "खाद कैलकुलेटर देखें", actionType: "NAVIGATE", payload: "/crops" },
    ],
  };
};

export const KrishiSahayakCopilot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<CopilotLang>("hi");
  const [inputQuery, setInputQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-card",
      sender: "doctor",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      advisory: {
        title: "राम-राम किसान भाई! मैं डॉ. कृषि (Krishi Doctor) हूँ",
        badge: "🌱 वरिष्ठ कृषि वैज्ञानिक परामर्श",
        badgeType: "SUCCESS",
        summary: "आप अपनी फसल के रोग, खाद की मात्रा, मौसम, या स्प्रे समय के बारे में मुझसे बोलकर या लिखकर पूछ सकते हैं।",
        cautionTip: "सभी परामर्श ICAR, राज्य कृषि विश्वविद्यालयों (PAU, HAU) और DPPQS मानकों पर आधारित हैं।",
        quickActions: [
          { label: "सरसों में माहू कीट का इलाज", actionType: "QUERY", payload: "सरसों में माहू कीट का तुरंत इलाज बताओ" },
          { label: "गेहूं में पहली सिंचाई व खाद", actionType: "QUERY", payload: "गेहूं में पहली सिंचाई (CRI) कब करें और यूरिया कितना डालें?" },
          { label: "क्या आज स्प्रे करना सुरक्षित है?", actionType: "QUERY", payload: "क्या आज खेत में कीटनाशक स्प्रे करना सुरक्षित है?" },
        ],
      },
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Clean audio/speech on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Web Speech Recognition
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("आपके ब्राउज़र में वॉइस इनपुट सपोर्ट नहीं है। कृपया टाइप करें।");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const langLocales: Record<CopilotLang, string> = {
        hi: "hi-IN",
        pa: "pa-IN",
        gu: "gu-IN",
        mr: "mr-IN",
        bn: "bn-IN",
        te: "te-IN",
        ta: "ta-IN",
        en: "en-IN",
      };

      recognition.lang = langLocales[selectedLanguage] || "hi-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setInputQuery(spokenText);
        handleSendMessage(spokenText);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Human voice readout for structured advisory
  const speakAdvisory = (advisory: StructuredAdvisory) => {
    stopAudio();
    setIsSpeaking(true);

    const speechScript = `${advisory.title}। ${advisory.summary}। ${
      advisory.chemicalDosage ? "दवा छिड़काव: " + advisory.chemicalDosage : ""
    }। ${advisory.tankMix15L ? "15 लीटर टंकी मात्रा: " + advisory.tankMix15L : ""}`;

    const googleLangMap: Record<CopilotLang, string> = {
      hi: "hi",
      pa: "pa",
      gu: "gu",
      mr: "mr",
      bn: "bn",
      te: "te",
      ta: "ta",
      en: "en",
    };

    const targetLang = googleLangMap[selectedLanguage] || "hi";
    const chunk = speechScript.slice(0, 190);
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodeURIComponent(
      chunk
    )}`;

    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      currentAudioRef.current = null;
    };

    audio.onerror = () => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = `${targetLang}-IN`;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    };

    audio.play().catch(() => {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = `${targetLang}-IN`;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    });
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      rawText: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const advisory = getDoctorAdvisory(query, selectedLanguage);

      const doctorMessage: ChatMessage = {
        id: `doctor-${Date.now()}`,
        sender: "doctor",
        advisory,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, doctorMessage]);
      setIsTyping(false);

      if (autoSpeak) {
        speakAdvisory(advisory);
      }
    }, 450);
  };

  const handleCopyAdvisory = (msg: ChatMessage) => {
    if (!msg.advisory) return;
    const a = msg.advisory;
    const text = `🌾 KrishiOra Doctor Prescription (डॉ. कृषि परामर्श)
━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ${a.title}
🏷️ ${a.badge}

📝 सारांश (Summary):
${a.summary}

${a.symptoms ? `🔍 लक्षण (Symptoms):\n${a.symptoms}\n` : ""}${
      a.chemicalDosage ? `🧪 रासायनिक दवा (Chemical Dosage):\n${a.chemicalDosage}\n` : ""
    }${a.tankMix15L ? `🪣 15L टंकी मात्रा (Tank Mix):\n${a.tankMix15L}\n` : ""}${
      a.organicRemedy ? `🌿 जैविक उपाय (Bio Control):\n${a.organicRemedy}\n` : ""
    }${a.cautionTip ? `⚠️ सावधानी (Caution):\n${a.cautionTip}\n` : ""}━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 किसान हेल्पलाइन: 1800-180-1551 (Toll-Free)
🏛️ ICAR & DPPQS Scientific Standard`;

    navigator.clipboard.writeText(text);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const handleShareWhatsApp = (msg: ChatMessage) => {
    if (!msg.advisory) return;
    const a = msg.advisory;
    const text = encodeURIComponent(
      `🌾 *KrishiOra Doctor Prescription*\n\n` +
      `*${a.title}*\n` +
      `*${a.badge}*\n\n` +
      `*सारांश:* ${a.summary}\n` +
      (a.chemicalDosage ? `*दवा:* ${a.chemicalDosage}\n` : "") +
      (a.tankMix15L ? `*15L टंकी:* ${a.tankMix15L}\n` : "") +
      `\n📞 किसान हेल्पलाइन: 1800-180-1551`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const chips = useMemo(() => {
    return QUICK_CHIPS[selectedLanguage] || QUICK_CHIPS.hi;
  }, [selectedLanguage]);

  return (
    <>
      {/* 1. Friendly Human Floating Action Badge (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in duration-300">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 px-5 py-3 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-500/40 ring-4 ring-emerald-500/15"
          >
            {/* Live Indicator Dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>

            {/* Doctor Icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-900 font-black text-sm shadow-xs">
              👨‍⚕️
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-white">डॉ. कृषि (Ask Doctor)</span>
                <span className="rounded-md bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[9px] font-black uppercase">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-emerald-200 font-medium">बोलकर पूछें • 8 भाषाएं</p>
            </div>
          </button>
        </div>
      )}

      {/* 2. Human-Designed Doctor Advisory Window */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex flex-col rounded-3xl border border-slate-300 bg-white text-slate-900 shadow-2xl transition-all duration-300 overflow-hidden ${
            isMinimized
              ? "h-16 w-80 sm:w-96 shadow-lg"
              : "h-[88vh] sm:h-[650px] w-[calc(100vw-1.5rem)] sm:w-[480px]"
          }`}
        >
          {/* Top Doctor Profile Bar */}
          <div className="flex items-center justify-between border-b border-emerald-800 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 px-4 py-3.5 text-white shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-2xl shadow-inner border border-emerald-400/30">
                👨‍⚕️
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-emerald-950 text-[9px]">
                  ✓
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">डॉ. कृषि (Krishi Doctor)</h3>
                  <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[9px] font-extrabold text-emerald-300">
                    <ShieldCheck size={10} />
                    <span>ICAR Expert</span>
                  </span>
                </div>
                <p className="text-[10px] text-emerald-200/90 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ऑनलाइन सहायता उपलब्ध • तुरंत समाधान</span>
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as CopilotLang)}
                className="text-[11px] font-extrabold bg-emerald-900 text-emerald-100 rounded-xl px-2 py-1 border border-emerald-700 focus:outline-none cursor-pointer"
              >
                <option value="hi">हिंदी (HI)</option>
                <option value="pa">ਪੰਜਾਬੀ (PA)</option>
                <option value="gu">ગુજરાતી (GU)</option>
                <option value="mr">मराठी (MR)</option>
                <option value="bn">বাংলা (BN)</option>
                <option value="te">తెలుగు (TE)</option>
                <option value="ta">தமிழ் (TA)</option>
                <option value="en">English (EN)</option>
              </select>

              {/* Auto Speak Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) stopAudio();
                  setAutoSpeak(!autoSpeak);
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-xl transition-colors cursor-pointer ${
                  autoSpeak
                    ? "bg-emerald-500 text-slate-950 font-black"
                    : "bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800"
                }`}
                title={autoSpeak ? "Auto Voice Readout On" : "Auto Voice Readout Off"}
              >
                {autoSpeak ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>

              {/* Minimize */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 transition-colors cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  stopAudio();
                  setIsOpen(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-900/60 text-emerald-200 hover:text-red-300 hover:bg-red-950 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Active Voice Equalizer Bar */}
              {isSpeaking && (
                <div className="bg-gradient-to-r from-emerald-100 via-amber-50 to-emerald-50 px-4 py-2 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-950 animate-in slide-in-from-top-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-2" />
                      <span className="w-1 bg-emerald-700 rounded-full animate-bounce h-3.5 delay-75" />
                      <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-2 delay-150" />
                    </div>
                    <span className="text-[11px]">डॉ. कृषि बोल रहे हैं... (Speaking Advisory)</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopAudio}
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-red-100 text-red-800 border border-red-300 cursor-pointer hover:bg-red-200"
                  >
                    आवाज़ रोकें (Stop)
                  </button>
                </div>
              )}

              {/* Chat Thread Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAF7] text-xs">
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  const isCopied = copiedMsgId === msg.id;

                  if (isUser) {
                    return (
                      <div key={msg.id} className="flex justify-end animate-in fade-in">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-800 text-white px-4 py-2.5 shadow-xs">
                          <p className="text-xs font-semibold leading-relaxed">{msg.rawText}</p>
                          <span className="text-[9px] text-emerald-200/80 mt-1 block text-right">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Structured Doctor Advisory Card
                  const adv = msg.advisory;
                  if (!adv) return null;

                  return (
                    <div key={msg.id} className="flex gap-2.5 items-start animate-in fade-in">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm border border-emerald-300 shadow-2xs mt-1">
                        👨‍⚕️
                      </div>

                      <div className="flex-1 max-w-[92%] rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                        {/* Card Header & Severity Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              adv.badgeType === "CRITICAL"
                                ? "bg-red-100 text-red-900 border border-red-200"
                                : adv.badgeType === "CAUTION"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}
                          >
                            {adv.badge}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Voice Read Button */}
                            <button
                              type="button"
                              onClick={() => speakAdvisory(adv)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                              title="Listen to advice"
                            >
                              <Volume2 size={12} />
                              <span>सुनें</span>
                            </button>

                            {/* WhatsApp Share */}
                            <button
                              type="button"
                              onClick={() => handleShareWhatsApp(msg)}
                              className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                              title="Share on WhatsApp"
                            >
                              <Share2 size={12} />
                            </button>

                            {/* Copy Prescription */}
                            <button
                              type="button"
                              onClick={() => handleCopyAdvisory(msg)}
                              className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                              title="Copy prescription"
                            >
                              {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>

                        {/* Advisory Title & Main Summary */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">{adv.title}</h4>
                          <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                            {adv.summary}
                          </p>
                        </div>

                        {/* Symptoms Diagnostic (if present) */}
                        {adv.symptoms && (
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
                            <span className="font-extrabold text-slate-900 block mb-0.5">
                              🔍 पहचान व लक्षण (Visual Diagnostic):
                            </span>
                            <span className="text-slate-700 font-medium">{adv.symptoms}</span>
                          </div>
                        )}

                        {/* Chemical Spray Prescription Box */}
                        {adv.chemicalDosage && (
                          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-[11px] space-y-1">
                            <span className="font-black text-rose-950 flex items-center gap-1">
                              <FlaskConical size={13} className="text-rose-700" />
                              <span>🧪 रासायनिक दवा (Chemical Prescription):</span>
                            </span>
                            <p className="text-slate-900 font-bold leading-relaxed">{adv.chemicalDosage}</p>
                            {adv.tankMix15L && (
                              <p className="text-[11px] text-rose-900 font-extrabold pt-1 border-t border-rose-200/60">
                                🪣 15-लीटर टंकी मात्रा: {adv.tankMix15L}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Organic Remedy Box */}
                        {adv.organicRemedy && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px]">
                            <span className="font-black text-emerald-950 flex items-center gap-1 mb-0.5">
                              <Sprout size={13} className="text-emerald-700" />
                              <span>🌿 जैविक व प्राकृतिक उपाय:</span>
                            </span>
                            <span className="text-slate-800 font-semibold">{adv.organicRemedy}</span>
                          </div>
                        )}

                        {/* Caution Tip */}
                        {adv.cautionTip && (
                          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-950 font-bold flex items-start gap-1.5">
                            <AlertCircle size={13} className="text-amber-700 shrink-0 mt-0.5" />
                            <span>{adv.cautionTip}</span>
                          </div>
                        )}

                        {/* Smart Action Navigation Buttons */}
                        {adv.quickActions && adv.quickActions.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                            {adv.quickActions.map((qa, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  if (qa.actionType === "NAVIGATE") {
                                    navigate(qa.payload);
                                  } else {
                                    handleSendMessage(qa.payload);
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-[10px] font-black text-emerald-900 transition-colors cursor-pointer shadow-2xs"
                              >
                                <span>{qa.label}</span>
                                <ChevronRight size={11} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing status */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs pl-2">
                    <span className="text-sm animate-bounce">👨‍⚕️</span>
                    <span className="italic font-bold">डॉ. कृषि सलाह तैयार कर रहे हैं...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Query Horizontal Chips */}
              <div className="px-3 py-2 bg-white border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">सुझाव:</span>
                {chips.map((ch, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(ch.query)}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 text-slate-700 border border-slate-200 px-3 py-1 text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{ch.icon}</span>
                    <span>{ch.title}</span>
                  </button>
                ))}
              </div>

              {/* Human Input Footer Bar */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      stopAudio();
                      setMessages([
                        {
                          id: `welcome-${Date.now()}`,
                          sender: "doctor",
                          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          advisory: {
                            title: "नमस्ते किसान भाई! बातचीत रीसेट कर दी गई है।",
                            badge: "🌱 नया परामर्श",
                            badgeType: "SUCCESS",
                            summary: "आप अपनी किसी भी फसल, कीट, मौसम या खाद के बारे में नया सवाल पूछ सकते हैं।",
                          },
                        },
                      ]);
                    }}
                    title="नई बातचीत शुरू करें"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    <RotateCcw size={15} />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={
                        isListening
                          ? "🎙️ डॉ. कृषि सुन रहे हैं, बोलिए..."
                          : "फसल रोग, खाद, या मौसम का सवाल पूछें..."
                      }
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                        isListening
                          ? "border-red-500 bg-red-50 ring-2 ring-red-400/30"
                          : "border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                  </div>

                  {/* Mic Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all cursor-pointer shrink-0 shadow-xs ${
                      isListening
                        ? "bg-red-600 text-white animate-pulse ring-4 ring-red-300"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                    title={isListening ? "Stop Listening" : "बोलकर पूछें (Voice Input)"}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputQuery.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0 shadow-md"
                  >
                    <Send size={16} />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                  <ShieldCheck size={12} className="text-emerald-700" />
                  <span>ICAR & KVK प्रमाणित कृषि वैज्ञानिक प्रोटोकॉल • हेल्पलाइन: 1800-180-1551</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default KrishiSahayakCopilot;
