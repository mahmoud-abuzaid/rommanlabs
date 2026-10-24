const root = document.documentElement;
const langButton = document.getElementById("lang-toggle");
const langText = document.getElementById("lang-text");
const menuButton = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");
const themeButtons = [...document.querySelectorAll(".theme-btn")];
const translatable = [...document.querySelectorAll("[data-ar][data-en]")];
const scrollProgressBar = document.getElementById("scroll-progress-bar");
const chapterDots = [...document.querySelectorAll(".chapter-dot")];
const navLinks = [...document.querySelectorAll(".desktop-nav a[data-nav]")];

let language = "ar";
let themePref = "dark";
let activeSignal = "noise";
let synthMode = "order";
let synthTimer = null;
let activeAnatomy = "arils";
let activeConviction = "dust";
let activeSammamProof = "thread";
let activeMethod = 0;
let activeHorizon = "construction";
let activeTopic = "sammam";

const signalsOrder = ["noise", "ownership", "custody"];

const synthData = {
  noise: {
    code: "SIGNAL 01 / 03",
    chaos: {
      sub: {
        ar: "رسائل وصور مبعثرة في مجموعات الدردشة بلا تاريخ أو مرجع ثابت",
        en: "Photos and notes scattered across chat threads with no durable record",
      },
      tag: { ar: "سياق ضائع !", en: "LOST CONTEXT !" },
      metrics: {
        context: { ar: "مشتت بين القنوات", en: "Fragmented in chats", cls: "m-pill is-warn" },
        scope: { ar: "غير محكوم", en: "Unscoped access", cls: "m-pill is-warn" },
        memory: { ar: "تضيع مع الوقت", en: "Fades over time", cls: "m-pill is-warn" },
      },
      explanation: {
        ar: "قبل رمان لابز: التحديث موجود في هاتف أحدهم، لكن الفريق لا يملك سجلًا موحدًا يرجع إليه عند الخلاف أو المراجعة.",
        en: "Without Romman architecture: The update exists on someone’s phone, but the team has no canonical record to return to.",
      },
      ref: { ar: "الفجوة التشغيلية الأولى: ضياع الحقيقة الميدانية", en: "Gap 01: Loss of field truth" },
    },
    order: {
      sub: {
        ar: "تتحول إلى سجل مؤرخ ومنسوب مع دليله المفحوص",
        en: "Transformed into a dated, attributed record with governed evidence",
      },
      tag: { ar: "حقيقة محفوظة ✓", en: "TRUTH PRESERVED ✓" },
      metrics: {
        context: { ar: "مرتبط بالمصدر 100%", en: "100% Source-Linked", cls: "m-pill is-good" },
        scope: { ar: "معزول لكل مشروع (RLS)", en: "Project-Scoped (RLS)", cls: "m-pill is-good" },
        memory: { ar: "قابلة للتدقيق الفوري", en: "Instantly Auditable", cls: "m-pill is-gold" },
      },
      explanation: {
        ar: "في مختبر رمان: لا نسمح لملاحظة الميدان أن تتبخر في محادثة عابرة؛ نصمم لها حجرة سجل مستقلة تحفظ كاتبها، توقيتها، وأدلتها.",
        en: "With Romman architecture: Every site observation gets a dedicated record chamber preserving its author, timestamp and authorized evidence.",
      },
      ref: { ar: "تطبيق حيّ في منتجنا الأول: صمّام (SAMMAM)", en: "Live in our flagship product: SAMMAM" },
    },
  },
  ownership: {
    code: "SIGNAL 02 / 03",
    chaos: {
      sub: {
        ar: "الكل يعرف أن هناك مشكلة، لكن لا أحد يعرف من يملك الخطوة التالية",
        en: "Everyone knows an issue exists, but no one knows who owns the next step",
      },
      tag: { ar: "مسؤولية ضبابية !", en: "BLURRED OWNER !" },
      metrics: {
        context: { ar: "ردود بلا قرار", en: "Replies without closure", cls: "m-pill is-warn" },
        scope: { ar: "صلاحيات متداخلة", en: "Blurred permissions", cls: "m-pill is-warn" },
        memory: { ar: "إغلاق افتراضي مربك", en: "Premature closure risk", cls: "m-pill is-warn" },
      },
      explanation: {
        ar: "قبل رمان لابز: يضيع الطلب بين الإيميلات، أو يُظن أن مجرد الرد على سؤال فني يعني أن المشكلة في الموقع قد حُلّت.",
        en: "Without Romman architecture: Requests stall between channels, or a simple reply is mistaken for physical resolution.",
      },
      ref: { ar: "الفجوة التشغيلية الثانية: انفصال الرد عن المعالجة", en: "Gap 02: Reply confused with resolution" },
    },
    order: {
      sub: {
        ar: "توجيه لمسؤول معيّن داخل المشروع مع بقاء الأصل مفتوحًا لحين المعالجة",
        en: "Routed to an assigned owner while source stays open until resolved",
      },
      tag: { ar: "مسؤولية صريحة ✓", en: "EXPLICIT OWNER ✓" },
      metrics: {
        context: { ar: "ارتباط صريح بالأصل", en: "Explicit Source Link", cls: "m-pill is-good" },
        scope: { ar: "فحص صلاحية (can_act)", en: "Server can_act Check", cls: "m-pill is-good" },
        memory: { ar: "حماية Idempotency-Key", en: "Idempotency Protected", cls: "m-pill is-gold" },
      },
      explanation: {
        ar: "في مختبر رمان: يوجَّه الطلب أو الاستفسار لشخص معيّن في المشروع، ولا يُغلق السجل الأصلي تلقائيًا بمجرد الرد بل بخطوة معالجة مستقلة.",
        en: "With Romman architecture: Follow-ups route to an assigned project owner, and replying never auto-closes the source issue.",
      },
      ref: { ar: "تطبيق حيّ في مسار القرارات والاستفسارات في صمّام", en: "Live in SAMMAM Decisions & RFI routing" },
    },
  },
  custody: {
    code: "SIGNAL 03 / 03",
    chaos: {
      sub: {
        ar: "الموافقة على الورق لا تخبرك بما وصل للموقع فعلًا أو ما تم إرجاعه",
        en: "Paper approval doesn’t tell you what reached the site or was reversed",
      },
      tag: { ar: "كميات مبتورة !", en: "INCOMPLETE TRACE !" },
      metrics: {
        context: { ar: "الموافقة = الاستلام خطأً", en: "Approval ≠ Delivery", cls: "m-pill is-warn" },
        scope: { ar: "تعديل يمسح الأصل", en: "Edits overwrite history", cls: "m-pill is-warn" },
        memory: { ar: "ملخص بلا مصادر", en: "Summary without source", cls: "m-pill is-warn" },
      },
      explanation: {
        ar: "قبل رمان لابز: تُعدَّل الأرقام يدويًا في الجداول عند حدوث خطأ أو تلف، فيختفي الرقم الأصلي ويضيع سبب التعديل.",
        en: "Without Romman architecture: Spreadsheets are manually overwritten when damaged goods return, erasing the original trace.",
      },
      ref: { ar: "الفجوة التشغيلية الثالثة: غياب دورة الكميات الكاملة", en: "Gap 03: Broken quantity & custody story" },
    },
    order: {
      sub: {
        ar: "فصل الموافقة عن الاستلام، وحفظ العكس وسببه بجانب الأصل",
        en: "Approval separated from receipt; reversal & reason stay beside original",
      },
      tag: { ar: "أثر لا يُمحى ✓", en: "IMMUTABLE TRACE ✓" },
      metrics: {
        context: { ar: "طلب ≠ قرار ≠ استلام", en: "Request ≠ Receipt", cls: "m-pill is-good" },
        scope: { ar: "الأصل + العكس معًا", en: "Original + Reversal Kept", cls: "m-pill is-good" },
        memory: { ar: "تقرير يفتح مصادره", en: "Report Drills to Source", cls: "m-pill is-gold" },
      },
      explanation: {
        ar: "في مختبر رمان: الاستلام الأصلي لا يُحذف أبدًا؛ يُسجّل العكس المصرح به مع سببه وهوية منفذه، وتفتح التقارير سجلاتها المصدرية مباشرة.",
        en: "With Romman architecture: Receipts are never deleted; authorized reversals record actor and reason beside the original.",
      },
      ref: { ar: "تطبيق حيّ في دفتر المواد والتقارير المصدرية في صمّام", en: "Live in SAMMAM Materials & Source Reports" },
    },
  },
};

const anatomyData = {
  arils: {
    code: "ANATOMY / 01 · THE SEED",
    dual: { ar: "حبة الرمان ⇄ السجل الميداني", en: "Pomegranate Aril ⇄ Canonical Record" },
    title: {
      ar: "كل واقعة ميدانية هي «حبة» مكتملة المعنى لا تقبل الذوبان.",
      en: "Every field event is a self-contained crystalline seed that never dissolves into noise.",
    },
    desc: {
      ar: "في الرمانة لا تختلط حبة بأخرى؛ وفي أنظمتنا لا نسمح لمشكلة موقع أو طلب توريد أو استفسار فني أن يذوب في سيل رسائل عشوائي. لكل حدث هويته، كاتبه، وتوقيته الأصيل.",
      en: "In a pomegranate, no seed blurs into another. In our systems, a site issue, material request or RFI never dissolves into an unstructured chat stream—each keeps its identity, author and timestamp.",
    },
    nature: {
      ar: "بذرة بلورية مستقلة محاطة بغلاف يحفظ نقاءها وجوهرها.",
      en: "A distinct crystalline seed enclosed in a protective coat.",
    },
    tech: {
      ar: "سجل قانوني (Canonical Record) بهوية فريدة ومرفقات مفحوصة الصلاحية.",
      en: "A typed canonical record with immutable authorship and governed evidence.",
    },
  },
  membrane: {
    code: "ANATOMY / 02 · THE MEMBRANE",
    dual: { ar: "الغشاء الفاصل ⇄ عزل الصلاحيات (RLS)", en: "Chamber Membrane ⇄ Forced RLS Scope" },
    title: {
      ar: "أغشية دقيقة تفصل الحجرات؛ فلا تمنح عضوية الشركة وصولًا عشوائيًا للمشاريع.",
      en: "Delicate membranes separate chambers—just as company authority stays distinct from project access.",
    },
    desc: {
      ar: "ما يحفظ توازن الرمانة هو الأغشية التي تقسّمها إلى حجرات منظمة. في رمان لابز، نصمم حدود الصلاحيات في صلب قاعدة البيانات (PostgreSQL Forced RLS) بحيث يتطلب كل مشروع تعيينًا صريحًا.",
      en: "Internal membranes give the pomegranate its structural integrity. At Romman Labs, we enforce scope boundaries down to PostgreSQL Forced RLS so every project requires explicit assignment.",
    },
    nature: {
      ar: "أغشية طبيعية تفصل كل مجموعة حبات في حجرة محمية.",
      en: "Natural partitions keeping each chamber distinct and protected.",
    },
    tech: {
      ar: "عزل صارم للنطاق (Company ≠ Project) وإعادة فحص الصلاحية عند كل قراءة.",
      en: "Strict tenant & project isolation (Company ≠ Project) verified on every read.",
    },
  },
  circuit: {
    code: "ANATOMY / 03 · THE CIRCUIT",
    dual: { ar: "العروق المغذية ⇄ خيط المتابعة الصريح", en: "Root Veins ⇄ Explicit Record Links" },
    title: {
      ar: "مسارات دقيقة تنقل الإشارة من الميدان إلى صاحب القرار دون انقطاع.",
      en: "Precision pathways routing signals from field observation to authorized decision.",
    },
    desc: {
      ar: "النصف الأيمن من شعار رمان لابز يمثل الدارات التي تلتقط الحقيقة العضوية وتوجّهها. كل متابعة أو استفسار يرتبط بسجله الأصلي بمعرّف صريح، ويصل للشخص المعين داخل المشروع.",
      en: "The right hemisphere of the Romman emblem represents the circuit pathways that route organic truth. Every follow-up links explicitly to its source record and reaches its assigned owner.",
    },
    nature: {
      ar: "شبكة أوعية دقيقة تصل كل حبة بالجذر الرئيسي للثمرة.",
      en: "A vascular network connecting every single seed to the main root.",
    },
    tech: {
      ar: "روابط مصدرية صريحة (Explicit Source IDs) وتوجيه محكوم بمؤشر can_act.",
      en: "Explicit source IDs and server-verified can_act ownership routing.",
    },
  },
  crown: {
    code: "ANATOMY / 04 · THE NODE",
    dual: { ar: "تاج الرمانة ⇄ الأثر والحوكمة", en: "The Crown ⇄ Audited Decision Trace" },
    title: {
      ar: "قرارات موثّقة وأثر محفوظ يتيح الرجوع من الملخص إلى أصل القصة.",
      en: "Verifiable decisions and preserved traces that lead from any summary back to its origin.",
    },
    desc: {
      ar: "عندما يُتخذ القرار أو تُستلم الكمية أو يُسجّل العكس، لا ينتهي المسار برقم صامت؛ بل يبقى الأثر التاريخي كاملًا ليتمكن الفريق من مراجعة القصة من أولها إلى آخرها.",
      en: "When a decision, delivery receipt or reversal is recorded, it leaves a complete historical trace—allowing the team to return from any report directly to its source rows.",
    },
    nature: {
      ar: "تاج الثمرة الذي يختم البناء المعماري ويحفظ تماسكه.",
      en: "The crown that seals the fruit’s architecture together.",
    },
    tech: {
      ar: "سجل تاريخي لا يُمحى (Append-only History) وتقارير تفتح مصادرها الفعلية.",
      en: "Append-only operational history and reports that resolve to canonical sources.",
    },
  },
};

const convictionsData = {
  dust: {
    badge: "CONVICTION 01 / 04 · FIELD EMPATHY",
    title: {
      ar: "الشاشة التي لا تفهم تعب الموقع تتحول إلى عبء إضافي.",
      en: "A screen that doesn’t understand site fatigue becomes just another burden.",
    },
    body: {
      ar: "قبل أن نكتب سطر كود واحد، نسأل: من سيفتح هذه الشاشة؟ هل يقف تحت شمس الظهيرة في موقع إنشائي؟ هل يراجع عشرات الطلبات قبل اجتماع حاسم؟ نصمم المسار ليكون بديهيًا، مباشرًا، وخاليًا من الحقول الاستعراضية التي لا تخدم القرار.",
      en: "Before writing a single line of code, we ask: Who opens this screen? Are they standing on a construction site at noon, or reviewing urgent requests before a meeting? We strip away theatrical clutter so every action serves the decision.",
    },
    refuse: {
      ar: "برمجيات المكاتب المعقدة التي تفترض أن المستخدم متفرغ لملء عشرات النماذج المنفصلة عن سياق الحدث.",
      en: "Bloated office software that assumes field workers have time to fill out detached, multi-page forms.",
    },
    embrace: {
      ar: "إجراءات سريعة ومحددة السياق تربط الحدث بمصدره ومسؤوله بأقل قدر من الاحتكاك الذهني.",
      en: "Context-aware composers that connect an observation to its source and owner with minimal friction.",
    },
  },
  honesty: {
    badge: "CONVICTION 02 / 04 · ENGINEERING HONESTY",
    title: {
      ar: "لا نخترع نجاحًا زائفًا، ولا نعد بذكاء سحري يلغي مسؤولية الإنسان.",
      en: "We never fake a successful save, and we never claim magic that replaces human accountability.",
    },
    body: {
      ar: "في الأنظمة التشغيلية الحقيقية، الكذب البرمجي الصغير قد يكلّف مشروعًا كاملًا. لذلك لا نخفي فشل رفع الدليل وراء حفظ السجل، ولا نعيد إرسال عمليات غير مؤكدة دون عقد عدم تكرار (Idempotency)، ولا نصنع نسب إنجاز وهمية.",
      en: "In real operations, a polite software lie can derail a project. We keep attachment upload failures distinct from saved records, guard retries with strict idempotency contracts, and never invent standalone completion metrics.",
    },
    refuse: {
      ar: "الواجهات التجميلية التي تعرض علامة «تم الحفظ» قبل تأكيد الخادم أو تخلط التقديرات التشغيلية بالمحاسبة المالية.",
      en: "Optimistic UI tricks that show fake success before server commit or blur operational estimates with accounting.",
    },
    embrace: {
      ar: "وضوح صريح في كل حالة: ما حُفظ فعلًا، وما ينتظر القرار، وما يتطلب إعادة المحاولة بأمان.",
      en: "Candid system feedback: what committed on the server, what awaits a decision, and what can be safely retried.",
    },
  },
  calm: {
    badge: "CONVICTION 03 / 04 · VISUAL CALM",
    title: {
      ar: "حين يكون الميدان مزدحمًا، يجب أن تكون الأداة هادئة ومريحة للنفس.",
      en: "When the physical site is chaotic, the digital instrument must remain calm and composed.",
    },
    body: {
      ar: "نرفض القوالب المولّدة آليًا المليئة بالبطاقات ذات الحواف السميكة المكررة والألوان الصاخبة. نصمم واجهاتنا بروح المخططات المعمارية والكتب التحريرية الراقية: تراتبية واضحة، تباين مدروس للوضع النهاري والليلي، وتفاصيل تحترم العين.",
      en: "We reject generic AI templates crowded with thick outlined cards and noisy badges. We design with the poise of architectural monographs: deliberate hierarchy, balanced tonal surfaces, and effortless Light and Dark appearance.",
    },
    refuse: {
      ar: "الفوضى البصرية، الإطارات الجانبية المزخرفة بلا معنى، وتكديس الأزرار في شاشات الهاتف الضيقة.",
      en: "Visual clutter, decorative one-sided border rails, and cramped navigation bars during focused mobile work.",
    },
    embrace: {
      ar: "تكوينات مساحية متزنة، طباعة عربية وإنجليزية رصينة، وتركيز هادئ على السجل التشغيلي نفسه.",
      en: "Balanced spatial composition, authoritative typography, and calm focus on the canonical record at hand.",
    },
  },
  arabic: {
    badge: "CONVICTION 04 / 04 · ARABIC-NATIVE CRAFT",
    title: {
      ar: "لغتنا العربية هي نقطة الانطلاق في التفكير والتصميم، وليست طبقة تعريب لاحقة.",
      en: "Arabic is our starting point in thought and typography—never an afterthought translation.",
    },
    body: {
      ar: "نصوغ مصطلحاتنا وتجربة القراءة في العربية والإنجليزية معًا منذ اللحظة الأولى. نختار للعناوين العربية محارف نسخية وتحريرية تمنح الكلمة هيبتها، ولبيئة العمل محارف هندسية فائقة الوضوح، مع الحفاظ التام على النص الذي يكتبه المستخدم كما هو.",
      en: "We author Arabic and English copy together from day one—pairing expressive Naskh display headlines with razor-sharp IBM Plex Sans Arabic for dense operational UI, while preserving user-authored record text verbatim.",
    },
    refuse: {
      ar: "الترجمات الآلية الركيكة أو قلب الواجهات من اليسار لليمين دون مراعاة إيقاع القراءة العربية.",
      en: "Mechanical translations or mirrored layouts that ignore the natural rhythm and proportion of Arabic script.",
    },
    embrace: {
      ar: "تجربة ثنائية اللغة (RTL / LTR) متكافئة الإتقان تشعر فيها أن النظام كُتب بلغتك الأم.",
      en: "Bilingual RTL/LTR symmetry crafted with native fluency for both field engineers and executive teams.",
    },
  },
};

const sammamProofData = {
  thread: {
    title: {
      ar: "الرد على الاستفسار لا يغلق المشكلة الأصلية تلقائيًا.",
      en: "An RFI reply never automatically closes the source site issue.",
    },
    desc: {
      ar: "يربط صمّام الاستفسار الفني (RFI) بمشكلة الموقع التي ولدته بمعرّف صريح، لكنه يحترم الواقع الهندسي: الجواب الفني يعود للسجل، بينما تبقى المشكلة الأصلية مفتوحة حتى يسجّل صاحب الصلاحية معالجتها فعليًا.",
      en: "SAMMAM links a technical RFI to its origin site issue via an explicit ID while respecting field reality: the reply returns to the RFI, while the issue stays open until an authorized teammate records its resolution.",
    },
    code: "SITE_ISSUE (OPEN) ⟵ [source_issue_id] ⟵ TECHNICAL_RFI (ANSWERED)",
  },
  rls: {
    title: {
      ar: "عضوية الشركة لا تمنح وصولًا تلقائيًا للمشروع (Company ≠ Project).",
      en: "Company authority never implies automatic project access (Company ≠ Project).",
    },
    desc: {
      ar: "يفصل صمّام بين صلاحيات إدارة الشركة وبين التعيين التشغيلي داخل كل مشروع، ويفرض هذا العزل عبر جلسات موثقة وسياق موقّع داخل PostgreSQL Forced RLS، مع إعادة فحص صلاحية قراءة الأدلة في كل مرة.",
      en: "SAMMAM separates company administration from project assignment, enforcing isolation through signed transaction context and PostgreSQL Forced RLS, while reauthorizing evidence on every read.",
    },
    code: "FIREBASE_UID ⟶ SAMMAM_SESSION ⟶ SIGNED_RLS_CONTEXT ⟶ PROJECT_SCOPE",
  },
  ledger: {
    title: {
      ar: "فصل طلب المادة عن الاستلام الفعلي، وحفظ العكس وسببه إلى جانب الأصل.",
      en: "Material requests stay distinct from delivery receipts, and reversals preserve the original.",
    },
    desc: {
      ar: "يتتبع صمّام الكمية المطلوبة، ثم دفعات الاستلام الفعلية في الموقع، وإذا سُجل عكس مصرح به يبقى الاستلام الأصلي محفوظًا ويظهر أثر العكس وسببه بوضوح (مثال: 24 مطلوبة / 16 مستلمة فعليًا / 8 متبقية).",
      en: "SAMMAM tracks requested quantities across partial site deliveries. An authorized reversal never deletes or edits the original receipt—it records actor and reason alongside it (e.g., 24 requested / 16 received / 8 remaining).",
    },
    code: "REQUEST (24) ⟶ RECEIPT (+18) + REVERSAL (-2, REASON) = EFFECTIVE (16) / REMAINING (8)",
  },
};

const methodOutputs = [
  {
    tag: "STUDIO DELIVERABLE / 01 · FIELD MAP",
    title: {
      ar: "خريطة الاحتكاك الميداني ومسارات القرار الفعلية",
      en: "Field Friction Map & Real Decision Pathways",
    },
    desc: {
      ar: "نخرج من الميدان بتشخيص دقيق للنقاط التي تضيع فيها المعلومة بين الموقع والمكتب قبل رسم أي شاشة.",
      en: "We diagnose the exact handoffs where context is lost between field sites and management before sketching a single screen.",
    },
  },
  {
    tag: "STUDIO DELIVERABLE / 02 · AUTHORITY MODEL",
    title: {
      ar: "مصفوفة النطاق والصلاحيات ودورة حياة كل سجل",
      en: "Scope Matrix, Authority Rules & Record Lifecycles",
    },
    desc: {
      ar: "نصمم القواعد الصارمة التي تحكم من ينشئ، ومن يقرر (can_act)، وكيف تظل السجلات المرتبطة مستقلة الحالة.",
      en: "We codify strict invariants governing creation, decision ownership (can_act), and independent linked record states.",
    },
  },
  {
    tag: "STUDIO DELIVERABLE / 03 · CANONICAL ENGINE",
    title: {
      ar: "قاعدة بيانات معزولة النطاق وسجل تاريخي لا يقبل المسح",
      en: "Tenant-Isolated Persistence & Append-Only Audit History",
    },
    desc: {
      ar: "نبني المحرك الخلفي وعقود الـ API بحيث تبقى كل عملية كتابة محمية من التكرار ومرتبطة بفاعلها وتوقيتها.",
      en: "We engineer the API contract and database constraints so every mutation is idempotent, attributed and auditable.",
    },
  },
  {
    tag: "STUDIO DELIVERABLE / 04 · VERIFIED PRODUCT",
    title: {
      ar: "تطبيق ويب تقدمي (PWA) فائق الوضوح بالعربية والإنجليزية",
      en: "High-Craft Bilingual Web & Online-First PWA Workspace",
    },
    desc: {
      ar: "نختبر كل مسار في المتصفح الفعلي على شاشات المكتب والهواتف لضمان تجربة هادئة، سريعة، وصادقة.",
      en: "We verify every workflow in real browsers across desktop and mobile viewports in Arabic and English.",
    },
  },
];

const horizonsData = {
  construction: {
    code: "FRONTIER 01 · CONSTRUCTION OPERATIONS (LIVE: SAMMAM)",
    question: {
      ar: "«كيف نجعل كل قرار في المشروع الإنشائي مرتبطًا بالواقعة الميدانية التي استدعته؟»",
      en: "“How do we keep every construction decision connected to the site event that triggered it?”",
    },
    thesis: {
      ar: "في مشاريع البناء، تتفرّق الحقيقة بين جولات المهندسين، مجموعات الدردشة، والجداول المكتبية. ابتكرنا «صمّام» ليكون طبقة التشغيل التي تمنح كل ملاحظة واستفسار ومادة مسارًا واحدًا واضح المسؤولية ومحفوظ الأثر.",
      en: "In construction, truth scatters across site walks, chat apps and office spreadsheets. We built SAMMAM as the operating layer that gives every observation, RFI and material delivery one accountable thread.",
    },
    focus: {
      ar: "المصدر · المسؤول المعيّن · القرار · الأثر",
      en: "Source · Assigned Owner · Decision · Trace",
    },
    state: {
      ar: "منظومة صمّام (Web / PWA + FastAPI + PostgreSQL RLS)",
      en: "SAMMAM Workspace (Web / PWA + FastAPI + PostgreSQL RLS)",
    },
  },
  supply: {
    code: "FRONTIER 02 · PROCUREMENT & SITE CUSTODY",
    question: {
      ar: "«لماذا تنتهي أنظمة المشتريات عند إصدار الموافقة، بينما تبدأ القصة الحقيقية عند بوابة الموقع؟»",
      en: "“Why do procurement tools stop at approval, when the real story begins at the site gate?”",
    },
    thesis: {
      ar: "الاعتماد الورقي لا يعني أن المادة وصلت سليمة للموقع. نبحث ونطور أنماطًا تشغيلية تفصل القرار عن دفعات الاستلام الفعلي، وتحفظ عمليات الإرجاع والعكس مع أسبابها دون تشويه السجل الأصلي.",
      en: "An approved request doesn’t mean materials arrived intact. We design operational models that separate approval from partial deliveries and preserve reasoned reversals alongside original receipts.",
    },
    focus: {
      ar: "الكمية المطلوبة ≠ المستلمة · حفظ العكس والسبب",
      en: "Requested ≠ Received · Preserved Reversal & Reason",
    },
    state: {
      ar: "مطبق في مسار المواد في صمّام + توسع بحثي مستمر",
      en: "Implemented in SAMMAM Materials + ongoing R&D",
    },
  },
  assets: {
    code: "FRONTIER 03 · CRITICAL ASSETS & FIELD HANDOFFS",
    question: {
      ar: "«كيف تنتقل العهدة والمسؤولية الميدانية بين الفرق دون نقطة عمياء واحدة؟»",
      en: "“How can physical custody and operational responsibility transfer between field teams with zero blind spots?”",
    },
    thesis: {
      ar: "في اللوجستيات والأصول الصناعية، تحدث الأخطاء المكلفة في لحظات التسليم والاستلام بين طرفين. نصمم في مختبر رمان نماذج تحقق ثنائية تحفظ سلسلة الحيازة والتدقيق اللحظي تحت ضغط التشغيل.",
      en: "In industrial logistics and asset management, costly failures happen during handoffs. Romman Labs explores verifiable custody chains and low-friction field sign-offs under pressure.",
    },
    focus: {
      ar: "سلسلة الحيازة · التسليم الموثّق · التدقيق اللحظي",
      en: "Chain of Custody · Verified Handoff · Instant Audit",
    },
    state: {
      ar: "أفق بحثي وتصميمي للشركاء المبكرين",
      en: "Research & Early Design Partner Horizon",
    },
  },
};

/* ==================== THEME MANAGEMENT ==================== */
const systemDarkMatcher = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(pref) {
  themePref = pref;
  const resolved = pref === "system" ? (systemDarkMatcher.matches ? "dark" : "light") : pref;
  root.dataset.theme = resolved;
  root.dataset.themePref = pref;

  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) metaTheme.content = resolved === "dark" ? "#0e0709" : "#f6f1eb";

  for (const btn of themeButtons) {
    const active = btn.dataset.themeValue === pref;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  }
  try {
    localStorage.setItem("romman-theme-pref", pref);
  } catch {
    /* ignore storage errors */
  }
}

systemDarkMatcher.addEventListener("change", () => {
  if (themePref === "system") applyTheme("system");
});

for (const btn of themeButtons) {
  btn.addEventListener("click", () => applyTheme(btn.dataset.themeValue));
}

/* ==================== LAB SYNTHESIZER ==================== */
function renderSynthesizer() {
  const sig = synthData[activeSignal];
  if (!sig) return;
  const modeObj = sig[synthMode];

  document.getElementById("synth-stage-code").textContent = sig.code;

  for (const sKey of signalsOrder) {
    const subEl = document.getElementById(`sig-sub-${sKey}`);
    const tagEl = document.getElementById(`sig-tag-${sKey}`);
    if (subEl) subEl.textContent = synthData[sKey][synthMode].sub[language];
    if (tagEl) tagEl.textContent = synthData[sKey][synthMode].tag[language];
  }

  for (const node of document.querySelectorAll(".signal-node")) {
    const active = node.dataset.signal === activeSignal;
    node.classList.toggle("active", active);
    node.setAttribute("aria-pressed", String(active));
  }

  for (const mBtn of document.querySelectorAll(".mode-btn")) {
    const active = mBtn.dataset.mode === synthMode;
    mBtn.classList.toggle("active", active);
    mBtn.setAttribute("aria-selected", String(active));
  }

  const mContext = document.getElementById("metric-context");
  const mScope = document.getElementById("metric-scope");
  const mMemory = document.getElementById("metric-memory");

  mContext.textContent = modeObj.metrics.context[language];
  mContext.className = modeObj.metrics.context.cls;

  mScope.textContent = modeObj.metrics.scope[language];
  mScope.className = modeObj.metrics.scope.cls;

  mMemory.textContent = modeObj.metrics.memory[language];
  mMemory.className = modeObj.metrics.memory.cls;

  document.getElementById("synth-explanation").textContent = modeObj.explanation[language];
  document.getElementById("synth-product-ref").textContent = modeObj.ref[language];
}

function toggleSynthAutoplay(force) {
  const next = typeof force === "boolean" ? force : !synthTimer;
  const btn = document.getElementById("synth-autoplay");
  const icon = document.getElementById("synth-auto-icon");
  const label = document.getElementById("synth-auto-label");

  if (synthTimer) {
    clearInterval(synthTimer);
    synthTimer = null;
  }

  if (next) {
    btn.setAttribute("aria-pressed", "true");
    icon.textContent = "⏸";
    label.textContent = language === "ar" ? "إيقاف المختبر" : "Pause lab";
    synthTimer = setInterval(() => {
      const idx = (signalsOrder.indexOf(activeSignal) + 1) % signalsOrder.length;
      activeSignal = signalsOrder[idx];
      renderSynthesizer();
    }, 2800);
  } else {
    btn.setAttribute("aria-pressed", "false");
    icon.textContent = "▶";
    label.textContent = language === "ar" ? "تشغيل المختبر" : "Auto-synthesize";
  }
}

document.getElementById("synth-autoplay")?.addEventListener("click", () => toggleSynthAutoplay());
document.getElementById("hero-synth-trigger")?.addEventListener("click", () => {
  document.querySelector(".lab-synthesizer")?.scrollIntoView({ behavior: "smooth", block: "center" });
  synthMode = "order";
  toggleSynthAutoplay(true);
  renderSynthesizer();
});

for (const node of document.querySelectorAll(".signal-node")) {
  node.addEventListener("click", () => {
    if (synthTimer) toggleSynthAutoplay(false);
    activeSignal = node.dataset.signal;
    renderSynthesizer();
  });
}

for (const mBtn of document.querySelectorAll(".mode-btn")) {
  mBtn.addEventListener("click", () => {
    synthMode = mBtn.dataset.mode;
    renderSynthesizer();
  });
}

/* ==================== ANATOMY STAGE ==================== */
function renderAnatomy(id) {
  activeAnatomy = id;
  const data = anatomyData[id];
  if (!data) return;

  for (const pin of document.querySelectorAll(".anatomy-pin")) {
    const active = pin.dataset.anatomy === id;
    pin.classList.toggle("active", active);
    pin.setAttribute("aria-pressed", String(active));
  }

  document.getElementById("anatomy-code").textContent = data.code;
  document.getElementById("anatomy-dual").textContent = data.dual[language];
  document.getElementById("anatomy-title").textContent = data.title[language];
  document.getElementById("anatomy-desc").textContent = data.desc[language];
  document.getElementById("anatomy-nature").textContent = data.nature[language];
  document.getElementById("anatomy-tech").textContent = data.tech[language];
}

for (const pin of document.querySelectorAll(".anatomy-pin")) {
  pin.addEventListener("click", () => renderAnatomy(pin.dataset.anatomy));
}

/* ==================== CONVICTIONS DECK ==================== */
function renderConviction(id) {
  activeConviction = id;
  const data = convictionsData[id];
  if (!data) return;

  for (const tab of document.querySelectorAll(".conv-tab")) {
    const active = tab.dataset.conviction === id;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  }

  document.getElementById("conv-badge").textContent = data.badge;
  document.getElementById("conv-title").textContent = data.title[language];
  document.getElementById("conv-body").textContent = data.body[language];
  document.getElementById("conv-refuse").textContent = data.refuse[language];
  document.getElementById("conv-embrace").textContent = data.embrace[language];
}

for (const tab of document.querySelectorAll(".conv-tab")) {
  tab.addEventListener("click", () => renderConviction(tab.dataset.conviction));
}

/* ==================== SAMMAM PROOF TABS ==================== */
function renderSammamProof(id) {
  activeSammamProof = id;
  const data = sammamProofData[id];
  if (!data) return;

  for (const tab of document.querySelectorAll(".s-proof-tab")) {
    const active = tab.dataset.sproof === id;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  }

  document.getElementById("sproof-title").textContent = data.title[language];
  document.getElementById("sproof-desc").textContent = data.desc[language];
  document.getElementById("sproof-code").textContent = data.code;
}

for (const tab of document.querySelectorAll(".s-proof-tab")) {
  tab.addEventListener("click", () => renderSammamProof(tab.dataset.sproof));
}

/* ==================== ROMMAN METHOD ==================== */
function renderMethod(idx) {
  activeMethod = idx;
  const data = methodOutputs[idx];
  if (!data) return;

  for (const card of document.querySelectorAll(".method-card")) {
    const active = Number(card.dataset.method) === idx;
    card.classList.toggle("active", active);
    card.setAttribute("aria-selected", String(active));
    card.tabIndex = active ? 0 : -1;
  }

  document.getElementById("method-out-tag").textContent = data.tag;
  document.getElementById("method-out-title").textContent = data.title[language];
  document.getElementById("method-out-desc").textContent = data.desc[language];
}

for (const card of document.querySelectorAll(".method-card")) {
  card.addEventListener("click", () => renderMethod(Number(card.dataset.method)));
  card.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = (activeMethod + dir + 4) % 4;
    const target = document.querySelector(`.method-card[data-method='${next}']`);
    target?.focus();
    renderMethod(next);
  });
}

/* ==================== LAB HORIZONS ==================== */
function renderHorizon(id) {
  activeHorizon = id;
  const data = horizonsData[id];
  if (!data) return;

  for (const card of document.querySelectorAll(".horizon-card")) {
    const active = card.dataset.horizon === id;
    card.classList.toggle("active", active);
    card.setAttribute("aria-selected", String(active));
  }

  document.getElementById("h-detail-code").textContent = data.code;
  document.getElementById("h-detail-question").textContent = data.question[language];
  document.getElementById("h-detail-thesis").textContent = data.thesis[language];
  document.getElementById("h-detail-focus").textContent = data.focus[language];
  document.getElementById("h-detail-state").textContent = data.state[language];
}

for (const card of document.querySelectorAll(".horizon-card")) {
  card.addEventListener("click", () => renderHorizon(card.dataset.horizon));
}

/* ==================== CONTACT TOPICS & FORM ==================== */
for (const pill of document.querySelectorAll(".topic-pill")) {
  pill.addEventListener("click", () => {
    activeTopic = pill.dataset.topic;
    for (const p of document.querySelectorAll(".topic-pill")) {
      const active = p === pill;
      p.classList.toggle("active", active);
      p.setAttribute("aria-checked", String(active));
    }
  });
}

const form = document.getElementById("contact-form");
const emailInput = document.getElementById("contact-email");
const submitBtn = document.getElementById("contact-submit");
const feedbackEl = document.getElementById("form-feedback");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isAr = language === "ar";
    const labelSpan = submitBtn.querySelector("span");
    const originalText = labelSpan.textContent;
    submitBtn.disabled = true;
    labelSpan.textContent = isAr ? "جارٍ الإرسال..." : "Sending...";
    feedbackEl.textContent = "";

    const topicNames = {
      sammam: "استكشاف نظام صمّام (SAMMAM)",
      partner: "شراكة تصميم مبكر لمنتج ميداني",
      general: "استفسار عام — رمان لابز",
    };

    try {
      const response = await fetch("https://formsubmit.co/ajax/63044dcb243f3a64704b00e72500939c", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `طلب تواصل جديد من موقع رمان لابز — ${topicNames[activeTopic] || ""}`,
          topic: activeTopic,
          email: emailInput.value.trim(),
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      feedbackEl.textContent = isAr
        ? "وصلنا طلبك بنجاح. سنتواصل معك قريبًا من فريق رمان لابز."
        : "We received your inquiry. The Romman Labs team will be in touch soon.";
    } catch {
      feedbackEl.textContent = isAr
        ? "تعذر الإرسال الآلي الآن. يسعدنا تواصلك مباشرة على hello@rommanlabs.com"
        : "Could not send right now. Please email us directly at hello@rommanlabs.com";
    } finally {
      submitBtn.disabled = false;
      labelSpan.textContent = originalText;
    }
  });
}

/* ==================== LANGUAGE SWITCH ==================== */
function applyLanguage(nextLang) {
  language = nextLang;
  const isAr = language === "ar";
  root.lang = language;
  root.dir = isAr ? "rtl" : "ltr";
  langText.textContent = isAr ? "EN" : "عربي";
  document.title = isAr
    ? "رمان لابز — مختبر ابتكار الأنظمة والمنتجات التشغيلية | Romman Labs"
    : "Romman Labs — Operational Product Studio & Creator of SAMMAM";

  for (const el of translatable) {
    const val = el.dataset[language];
    if (el instanceof HTMLInputElement) {
      el.placeholder = val;
    } else {
      el.innerHTML = val;
    }
  }

  const autoLabel = document.getElementById("synth-auto-label");
  if (autoLabel) {
    autoLabel.textContent = synthTimer
      ? isAr
        ? "إيقاف المختبر"
        : "Pause lab"
      : isAr
      ? "تشغيل المختبر"
      : "Auto-synthesize";
  }

  renderSynthesizer();
  renderAnatomy(activeAnatomy);
  renderConviction(activeConviction);
  renderSammamProof(activeSammamProof);
  renderMethod(activeMethod);
  renderHorizon(activeHorizon);

  try {
    localStorage.setItem("romman-lang", language);
  } catch {
    /* ignore storage errors */
  }
}

langButton?.addEventListener("click", () => applyLanguage(language === "ar" ? "en" : "ar"));

menuButton?.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

/* ==================== SCROLL PROGRESS & CHAPTER TRACKING ==================== */
function updateScrollProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
  if (scrollProgressBar) scrollProgressBar.style.width = `${pct}%`;
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const trackedSections = ["top", "philosophy", "convictions", "samaam", "approach", "sectors", "contact"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);

if ("IntersectionObserver" in window && trackedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        for (const dot of chapterDots) {
          dot.classList.toggle("active", dot.dataset.chapter === id);
        }
        for (const navLink of navLinks) {
          navLink.classList.toggle("is-current", navLink.dataset.nav === id);
        }
      }
    },
    { threshold: 0.25 }
  );
  trackedSections.forEach((sec) => sectionObserver.observe(sec));
}

/* ==================== AMBIENT POMEGRANATE & CIRCUIT CANVAS ==================== */
const rommanCanvas = document.getElementById("romman-canvas");
if (rommanCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const ctx = rommanCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;

  const nodes = [
    { x: 0.16, y: 0.28, color: "rgba(230, 46, 80, 0.35)", r: 3.5 },
    { x: 0.28, y: 0.66, color: "rgba(230, 46, 80, 0.3)", r: 3 },
    { x: 0.48, y: 0.42, color: "rgba(216, 179, 106, 0.35)", r: 4 },
    { x: 0.72, y: 0.26, color: "rgba(216, 179, 106, 0.3)", r: 3 },
    { x: 0.84, y: 0.7, color: "rgba(101, 185, 170, 0.3)", r: 3.5 },
  ];

  function resizeCanvas() {
    const rect = rommanCanvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    rommanCanvas.width = width;
    rommanCanvas.height = height;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });

  rommanCanvas.parentElement.addEventListener(
    "pointermove",
    (e) => {
      const rect = rommanCanvas.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / Math.max(1, width);
      pointerY = (e.clientY - rect.top) / Math.max(1, height);
    },
    { passive: true }
  );

  let tick = 0;
  function drawAmbient() {
    tick += 0.007;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(216, 179, 106, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const px = (n.x + Math.sin(tick + i) * 0.014 + (pointerX - 0.5) * 0.02) * width;
      const py = (n.y + Math.cos(tick + i * 1.2) * 0.014 + (pointerY - 0.5) * 0.02) * height;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const px = (n.x + Math.sin(tick + i) * 0.014 + (pointerX - 0.5) * 0.02) * width;
      const py = (n.y + Math.cos(tick + i * 1.2) * 0.014 + (pointerY - 0.5) * 0.02) * height;
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(px, py, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(drawAmbient);
  }
  requestAnimationFrame(drawAmbient);
}

/* ==================== INITIALIZE ==================== */
try {
  const savedTheme = localStorage.getItem("romman-theme-pref");
  if (savedTheme && ["dark", "light", "system"].includes(savedTheme)) {
    applyTheme(savedTheme);
  } else {
    applyTheme("dark");
  }
} catch {
  applyTheme("dark");
}

try {
  const savedLang = localStorage.getItem("romman-lang");
  applyLanguage(savedLang === "en" ? "en" : "ar");
} catch {
  applyLanguage("ar");
}
