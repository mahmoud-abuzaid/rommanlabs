const languageButton = document.querySelector(".language-switch");
const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector(".main-nav");
const productInsight = document.querySelector("#stage-insight");
const lensInsight = document.querySelector("#lens-insight");
const stageCounter = document.querySelector("#stage-counter");
const telemetryIssue = document.querySelector("#telemetry-issue");
const telemetryRfi = document.querySelector("#telemetry-rfi");
const telemetryAuth = document.querySelector("#telemetry-auth");
const autoplayBtn = document.querySelector("#stage-autoplay");
const autoplayIcon = document.querySelector("#autoplay-icon");
const autoplayLabel = document.querySelector("#autoplay-label");
const heroSimulateTrigger = document.querySelector("#hero-simulate-trigger");

const workflowTabs = [...document.querySelectorAll(".workflow-tab")];
const translatable = [...document.querySelectorAll("[data-ar][data-en]")];
const themeButtons = [...document.querySelectorAll(".theme-btn")];
const scrollProgressBar = document.querySelector("#scroll-progress-bar");
const chapterDots = [...document.querySelectorAll(".chapter-dot")];
const navLinks = [...document.querySelectorAll(".main-nav a[data-nav]")];

let language = "ar";
let activeStage = "issue";
let activeLens = "field";
let autoplayTimer = null;
let activeHotspot = "diary";
let whisperIndex = 0;
let activeSequenceStep = 0;
let activeWorkflow = "field";
let workflowSubState = {
  field: "verified",
  decisions: "field_request",
  materials: "reversal",
  change: "linked",
  visibility: "issues_drill",
};
let activeActor = "owner_unassigned";
let activeAction = "read_evidence";
let activeFitZone = "sammam";
let themePref = "light";

const stagesOrder = ["issue", "rfi", "response", "close"];

const stageData = {
  issue: {
    index: "STAGE 01 / 04",
    ar: "ابدأ بسجل المشكلة كما ظهرت في الموقع؛ سياقها وأدلتها يتبعان مصدرها ولا تضيع وسط المحادثات.",
    en: "Start with the issue as it appeared on site; its context and evidence stay attached to the source record.",
    telemetry: {
      issue: { ar: "مفتوحة · OPEN", en: "OPEN · ACTIVE", cls: "status-pill is-open" },
      rfi: { ar: "لم يُنشأ بعد · NONE", en: "NOT CREATED · —", cls: "status-pill is-muted" },
      auth: { ar: "عضو معيّن في المشروع", en: "Assigned Project Member", cls: "status-pill is-auth" },
    },
    lenses: {
      field: {
        ar: "عدسة الميدان: يوثّق عضو الفريق المشكلة في موقعها ويرفق الصور؛ حتى لو تعذّر رفع مرفق يبقى حفظ السجل واضحًا ومنفصلًا.",
        en: "Field lens: The teammate records the site issue and attaches evidence; record save and attachment status stay distinct.",
      },
      management: {
        ar: "عدسة الإدارة: تظهر المشكلة فورًا في التسلسل التشغيلي للمشروع بهوية كاتبها وتوقيتها الفعلي.",
        en: "Management lens: The issue appears in the project timeline with verified author attribution and timestamp.",
      },
      audit: {
        ar: "عدسة الحوكمة: يُفحص تعيين الفاعل في المشروع عبر الجلسة وPostgreSQL RLS قبل قبول الكتابة.",
        en: "Audit lens: Active project assignment is verified via session and PostgreSQL RLS before committing.",
      },
    },
  },
  rfi: {
    index: "STAGE 02 / 04",
    ar: "أنشئ استفسارًا فنيًا من المشكلة ليرتبط بها صراحةً (source_issue_id) ويصل إلى المسؤول المعيّن.",
    en: "Create a technical RFI from the issue so it links explicitly (source_issue_id) and reaches its assigned owner.",
    telemetry: {
      issue: { ar: "مفتوحة · OPEN", en: "OPEN · LINKED", cls: "status-pill is-open" },
      rfi: { ar: "بانتظار الرد · OPEN", en: "AWAITING REPLY · OPEN", cls: "status-pill is-open" },
      auth: { ar: "موجّه للمسؤول (can_act)", en: "Routed to Assignee (can_act)", cls: "status-pill is-auth" },
    },
    lenses: {
      field: {
        ar: "عدسة الميدان: لا حاجة لنسخ القصة من جديد؛ الاستفسار يحمل رابط المشكلة الأصلية تلقائيًا.",
        en: "Field lens: No need to copy-paste context; the RFI carries an explicit link back to the source issue.",
      },
      management: {
        ar: "عدسة الإدارة: يصل إشعار مباشر للمسؤول المعيّن في المشروع مع صلاحية الإجابة (can_act).",
        en: "Management lens: The assigned project owner receives an in-app notification with explicit can_act authority.",
      },
      audit: {
        ar: "عدسة الحوكمة: الرابط بين السجلين صريح ومفهرس، وكل سجل يحتفظ بدورة حياته المستقلة.",
        en: "Audit lens: The cross-record link is explicit and typed; each record retains its independent lifecycle.",
      },
    },
  },
  response: {
    index: "STAGE 03 / 04",
    ar: "يعود الرد المعتمد إلى سجل الاستفسار؛ لكنه لا يغلق المشكلة الأصلية تلقائيًا دون تحقق.",
    en: "The authorized response returns to the RFI record; it never auto-closes the source issue.",
    telemetry: {
      issue: { ar: "تبقى مفتوحة! · STILL OPEN", en: "STILL OPEN · UNRESOLVED", cls: "status-pill is-open" },
      rfi: { ar: "تم الرد · ANSWERED", en: "ANSWERED · RECORDED", cls: "status-pill is-resolved" },
      auth: { ar: "محمي بمفتاح عدم تكرار", en: "Idempotency-Key Protected", cls: "status-pill is-auth" },
    },
    lenses: {
      field: {
        ar: "عدسة الميدان: يقرأ الفريق التوجيه الفني على الاستفسار، بينما تبقى المشكلة مفتوحة في الميدان لحين تنفيذ المعالجة.",
        en: "Field lens: The team reads the technical answer on the RFI while the site issue remains open until physical work completes.",
      },
      management: {
        ar: "عدسة الإدارة: تقديم الجواب الفني لا يُخفي المشكلة من قائمة المتابعة قبل التأكد من إغلاقها الفعلي.",
        en: "Management lens: Answering an RFI never silently hides the underlying site issue before resolution is verified.",
      },
      audit: {
        ar: "عدسة الحوكمة: يُحفظ الرد بعقد عدم تكرار (Idempotency) ويظل تاريخ الاستفسار والمشكلة متمايزين.",
        en: "Audit lens: The response commits under durable idempotency while preserving separate RFI and Issue states.",
      },
    },
  },
  close: {
    index: "STAGE 04 / 04",
    ar: "يسجّل صاحب الصلاحية معالجة المشكلة كخطوة مستقلة وواضحة، ليكتمل الخيط من الملاحظة إلى الإغلاق.",
    en: "An authorized teammate records issue resolution as an explicit step, completing the thread from site to closure.",
    telemetry: {
      issue: { ar: "تمت المعالجة · RESOLVED", en: "RESOLVED · CLOSED", cls: "status-pill is-resolved" },
      rfi: { ar: "مرتبط بالأصل · LINKED", en: "ANSWERED · LINKED", cls: "status-pill is-resolved" },
      auth: { ar: "سلسلة أثر مكتملة", en: "Full Audit Trace Intact", cls: "status-pill is-auth" },
    },
    lenses: {
      field: {
        ar: "عدسة الميدان: أُغلقت المشكلة بعد إنجاز العمل فعليًا، مع بقاء الدليل والاستفسار المرتبط مرجعًا دائمًا.",
        en: "Field lens: The issue closes after actual site work finishes, keeping evidence and linked RFI inspectable.",
      },
      management: {
        ar: "عدسة الإدارة: تظهر المعالجة في النشاط والتقارير التشغيلية مرتبطةً بسجلاتها المصدرية.",
        en: "Management lens: Resolution reflects in operational activity and period reports backed by source rows.",
      },
      audit: {
        ar: "عدسة الحوكمة: من الرصد الأول إلى الاستفسار والرد والإغلاق — كل خطوة موثّقة بفاعلها وتوقيتها.",
        en: "Audit lens: From initial observation to RFI, reply and closure—every transition retains actor provenance.",
      },
    },
  },
};

const hotspotData = {
  diary: {
    code: "FIELD PIN / 01 · SITE DIARY",
    title: { ar: "يومية موقع مؤرخة ومنسوبة", en: "Dated & Attributed Site Diary" },
    desc: {
      ar: "توثيق الوقائع اليومية في الموقع باسم الكاتب وتوقيته الفعلي، مع ربط الصور والمستندات بصلاحية السجل.",
      en: "Capture daily site observations with verified author and timestamp, keeping attachments governed by record access.",
    },
  },
  issue: {
    code: "FIELD PIN / 02 · SITE ISSUE + EVIDENCE",
    title: { ar: "مشكلة موقع مع دليل مرتبط", en: "Site Issue with Linked Evidence" },
    desc: {
      ar: "رصد العوائق والملاحظات الفنية في لحظتها؛ وتبقى حالة حفظ السجل مستقلة عن حالة رفع الملفات دون تزييف.",
      en: "Log site issues as they happen; record persistence stays explicitly separate from attachment upload outcomes.",
    },
  },
  routing: {
    code: "FIELD PIN / 03 · ROUTED FOLLOW-UP",
    title: { ar: "توجيه مباشر للمسؤول المعيّن", en: "Direct Routing to Assigned Owner" },
    desc: {
      ar: "تحويل المشاهدة الميدانية إلى طلب ميداني أو استفسار فني يصل للشخص المخوّل داخل المشروع مع إشعار فوري.",
      en: "Turn field reality into an assigned Field Request or linked RFI routed to the authorized project teammate.",
    },
  },
};

const whispers = [
  {
    idx: "01 / 04",
    ar: "ما بقرر عنك — بخلي الخيط واضح بين الملاحظة والقرار.",
    en: "I don’t decide for you — I keep the thread clear between observation and decision.",
  },
  {
    idx: "02 / 04",
    ar: "الرد على الاستفسار ما بيغلق المشكلة لحاله؛ كل سجل إله مساره!",
    en: "An RFI reply never auto-closes the source issue; each record keeps its own lifecycle!",
  },
  {
    idx: "03 / 04",
    ar: "الموافقة على المادة غير عن استلامها بالموقع، والعكس بيبقى جنب الأصل.",
    en: "Approving a material isn’t receiving it on site—and a reversal always stays beside the original.",
  },
  {
    idx: "04 / 04",
    ar: "عضوية الشركة لحالها ما بتفتح المشروع؛ لازم تعيين صريح داخل الفريق.",
    en: "Company membership alone doesn’t open a project; active project assignment is required.",
  },
];

const sequenceGuarantees = [
  {
    code: "GUARANTEE / 01 · FIELD TRUTH",
    title: {
      ar: "هوية الكاتب والتوقيت والدليل محفوظة عند الإنشاء",
      en: "Author identity, timestamp & evidence bound at creation",
    },
    detail: {
      ar: "لا يصنع صمام أحداثًا تلقائية؛ كل سجل ميداني يُحفظ بهوية العضو المعيّن في المشروع، وتُفحص صلاحية قراءة المرفقات عند كل طلب.",
      en: "Sammam never fabricates activity; every field record is persisted with the authenticated project member’s identity and reauthorized on read.",
    },
    schema: ["actor_id", "project_scope", "canonical_record"],
  },
  {
    code: "GUARANTEE / 02 · EXPLICIT LINKING",
    title: {
      ar: "ارتباطات صريحة بمعرّفات السجلات المصدرية",
      en: "Explicit connections via canonical source IDs",
    },
    detail: {
      ar: "تُربط الاستفسارات وإشعارات التغيير بمصادرها بمعرّفات قاعدة بيانات صريحة، مع بقاء حالة السجل الأصلي مستقلة وواضحة.",
      en: "RFIs and Change Notices link to their origins via explicit canonical IDs while keeping the source record’s lifecycle independent.",
    },
    schema: ["source_issue_id", "explicit_link", "independent_state"],
  },
  {
    code: "GUARANTEE / 03 · SCOPED OWNERSHIP",
    title: {
      ar: "توجيه محكوم بصلاحيات الفريق ومؤشر can_act",
      en: "Routing governed by team assignment & server can_act",
    },
    detail: {
      ar: "يتحقق الخادم من أن المسؤول المعيّن عضو نشط في المشروع، ويحمي قرارات الطلبات بمفاتيح عدم التكرار (Idempotency-Key).",
      en: "The server verifies active project membership for assignees and guards key decisions with durable Idempotency-Key contracts.",
    },
    schema: ["assigned_member", "can_act_check", "idempotent_write"],
  },
  {
    code: "GUARANTEE / 04 · AUDITED OUTCOME",
    title: {
      ar: "سجل تاريخي لا يُمحى للقرارات والاستلام والعكس",
      en: "Append-only operational trace for closures & reversals",
    },
    detail: {
      ar: "من إغلاق الطلب الميداني إلى استلام المواد أو عكسها مع السبب — تبقى السلسلة الزمنية كاملة للرجوع إليها من النشاط والتقارير.",
      en: "From field request closure to material receipts and reasoned reversals—the full operational history stays inspectable from reports.",
    },
    schema: ["decision_trace", "receipt_reversal", "report_to_source"],
  },
];

const workflows = {
  field: {
    label: ["FIELD RECORDS & EVIDENCE / 01", "FIELD RECORDS & EVIDENCE / 01"],
    glyph: "≋",
    title: ["الحقيقة تبدأ من الميدان.", "Operational truth starts in the field."],
    copy: [
      "سجّل يوميات الموقع ومشكلاته ضمن المشروع، مع الموقع أو السياق المتاح والمرفقات المرتبطة بالسجل. ما يُحفظ هو ما أُدخل فعلًا؛ لا يصنع صمام نشاطًا أو بيانات بديلة.",
      "Record site diaries and issues within the project, with available location or context and evidence attached to the record. What is saved is what was actually entered; Sammam does not invent activity or fill in missing data.",
    ],
    record: ["يومية موقع · مشكلة موقع · دليل مرفق", "Site diary · Site issue · Linked evidence"],
    proof: ["الوقت · الكاتب · استقلال حفظ السجل عن المرفق", "Time · Author · Distinct save vs. upload state"],
    coda: [
      "تحديث موقعك يصبح سجلًا يمكن العثور عليه والرجوع إلى سياقه ومرفقاته المخوّلة.",
      "A site update becomes a record the team can find and return to in context with authorized attachments.",
    ],
    sandbox: {
      title: { ar: "محاكي حفظ السجل والمرفقات (SIMULATION)", en: "RECORD & EVIDENCE OUTCOME SIMULATOR" },
      options: [
        { id: "verified", ar: "حفظ السجل + رفع المرفق", en: "Record Saved + Evidence Uploaded" },
        { id: "interrupted", ar: "حفظ السجل + تعذّر المرفق", en: "Record Saved + Upload Interrupted" },
      ],
      states: {
        verified: {
          metrics: [
            { label: ["حالة السجل (ISS-08)", "Record Status (ISS-08)"], val: ["محفوظ ومؤكد ✓", "Persisted & Confirmed ✓"] },
            { label: ["حالة المرفق المصوّر", "Evidence Attachment"], val: ["مرتبط ومفحوص الصلاحية", "Linked & Reauthorized on Read"] },
            { label: ["التخزين في المتصفح", "Browser Cache"], val: ["عابر (Transient) · غير مخزّن", "Transient · Never Cached Offline"] },
          ],
          note: [
            "يُقرأ الدليل عبر صلاحية المشروع والسجل الحالية، ولا يُحفظ في ذاكرة المتصفح الدائمة.",
            "Evidence is fetched through live project and record authorization and never persisted in browser storage.",
          ],
        },
        interrupted: {
          metrics: [
            { label: ["حالة السجل (ISS-08)", "Record Status (ISS-08)"], val: ["محفوظ بنجاح ✓", "Record Saved Cleanly ✓"] },
            { label: ["حالة المرفق المصوّر", "Evidence Attachment"], val: ["فشل الرفع · تنبيه صريح !", "Upload Failed · Explicit Alert !"] },
            { label: ["سلوك النظام", "System Behavior"], val: ["لا يدّعي نجاح المرفق", "Never Fakes Upload Success"] },
          ],
          note: [
            "إذا انقطع رفع الملف بعد حفظ السجل، يبقى السجل محفوظًا ويُبلغك صمام بدقة بتعذّر المرفق بدل إظهار نجاح زائف.",
            "If an attachment upload fails after record creation, the saved record stays intact while the upload failure is reported honestly.",
          ],
        },
      },
    },
  },
  decisions: {
    label: ["DECISIONS & FOLLOW-UP / 02", "DECISIONS & FOLLOW-UP / 02"],
    glyph: "✓",
    title: ["القرار يصل إلى صاحبه.", "The decision reaches its owner."],
    copy: [
      "طلبات الاعتماد والاستفسارات الفنية وطلبات الموقع لها مسارات وسجلات مميزة. يُعيّن المسؤول داخل المشروع، وتبقى الإجابة أو القرار أو الإتمام مرتبطًا بالطلب.",
      "Approval requests, technical RFIs and field requests use distinct record paths. The responsible person is assigned within the project, and the response, decision or completion remains attached to its request.",
    ],
    record: ["طلب اعتماد · استفسار فني · طلب ميداني", "Approval · Technical RFI · Field request"],
    proof: ["المسؤول المعيّن · القرار · مفتاح عدم التكرار", "Assigned owner · Decision · Idempotency key"],
    coda: [
      "لا يتحول فتح السجل إلى تنفيذ للقرار؛ الإجراء يظل واضحًا وصريحًا وبصلاحية محددة.",
      "Opening a record never executes a decision; each action stays explicit and server-authorized.",
    ],
    sandbox: {
      title: { ar: "قارن مسارات التوجيه والقرار", en: "COMPARE DECISION ROUTING PATHS" },
      options: [
        { id: "field_request", ar: "طلب ميداني (Field Request)", en: "Field Request" },
        { id: "rfi_path", ar: "استفسار فني (Technical RFI)", en: "Technical RFI" },
        { id: "approval_path", ar: "طلب اعتماد (Approval)", en: "Approval Request" },
      ],
      states: {
        field_request: {
          metrics: [
            { label: ["دورة الحياة", "Lifecycle"], val: ["إنشاء ← قرار ← إغلاق", "Create → Decision → Closure"] },
            { label: ["صلاحية البتّ", "Decision Authority"], val: ["الزميل المعيّن في المشروع", "Assigned Project Teammate"] },
            { label: ["حماية الكتابة", "Write Protection"], val: ["Idempotency-Key + بصمة المحتوى", "Idempotency-Key + Payload Hash"] },
          ],
          note: [
            "يحتفظ الطلب الميداني بسجل الأحداث الثلاثة: الإنشاء، القرار (موافقة/رفض)، والإغلاق الموثّق.",
            "Field Requests retain all three canonical history events: creation, decision, and explicit closure.",
          ],
        },
        rfi_path: {
          metrics: [
            { label: ["الارتباط", "Source Connection"], val: ["يرتبط بمشكلة موقع اختياريًا", "Optional Explicit Issue Link"] },
            { label: ["الأثر على المشكلة", "Effect on Source Issue"], val: ["الرد لا يغلق المشكلة تلقائيًا", "Reply Never Auto-Closes Issue"] },
            { label: ["صلاحية الجواب", "Response Authority"], val: ["المسؤول المعيّن (can_act)", "Assigned Owner (can_act)"] },
          ],
          note: [
            "يفصل صمام بين الإجابة الفنية على الاستفسار وبين التحقق الميداني من معالجة المشكلة الأصلية.",
            "Sammam separates answering a technical question from verifying that the physical site issue is resolved.",
          ],
        },
        approval_path: {
          metrics: [
            { label: ["نوع السجل", "Record Type"], val: ["اعتماد داخلي ضمن المشروع", "Project-Scoped Approval"] },
            { label: ["صلاحية القرار", "Decision Authority"], val: ["المسؤول المخوّل في المشروع", "Authorized Project Assignee"] },
            { label: ["حدود المعنى", "Scope Boundary"], val: ["تنظيم تشغيلي · ليس التزامًا تعاقديًا خارجيًا", "Operational · Not External Legal Sign-off"] },
          ],
          note: [
            "يوثّق طلب الاعتماد قرار المشروع وملاحظاته وتاريخه ضمن حدود الصلاحية الداخلية.",
            "Approval requests record internal project decisions, notes and timestamps within explicit authority rules.",
          ],
        },
      },
    },
  },
  materials: {
    label: ["MATERIALS, RECEIPTS & REVERSAL / 03", "MATERIALS, RECEIPTS & REVERSAL / 03"],
    glyph: "▤",
    title: ["الطلب ليس الاستلام.", "A request is not a receipt."],
    copy: [
      "يتتبع صمام طلب المادة وقرارها ثم كميات الاستلام على دفعات. يبقى الاستلام الأصلي محفوظًا؛ وإذا سُجل عكسٌ مصرح به، يظهر سببه وأثره على الكمية الفعلية دون مسح الأصل.",
      "Sammam tracks the material request and decision, then receipts in separate deliveries. The original receipt stays preserved; an authorized reversal records its reason and effect on the effective quantity.",
    ],
    record: ["طلب مادة · قرار · استلام دفعات · عكس مصرح به", "Material request · Decision · Receipts · Reversal"],
    proof: ["الكمية الفعالة · الفاعل · سبب العكس المحفوظ", "Effective quantity · Actor · Preserved reversal reason"],
    coda: [
      "الكمية المستلمة ليست دفعة مالية؛ لكل سجل معناه وحدوده وأثره الكامل.",
      "Received quantity is not a financial payment; each record keeps its meaning, boundary and full history.",
    ],
    sandbox: {
      title: { ar: "دفتر الكميات والاستلام والعكس التفاعلي", en: "INTERACTIVE QUANTITY & REVERSAL LEDGER" },
      options: [
        { id: "approved", ar: "1. اعتماد الطلب (24)", en: "1. Request Approved (24)" },
        { id: "delivered", ar: "2. استلام دفعة (18)", en: "2. Delivery Receipt (+18)" },
        { id: "reversal", ar: "3. تسجيل عكس مصرح (-2)", en: "3. Authorized Reversal (-2)" },
      ],
      states: {
        approved: {
          metrics: [
            { label: ["الكمية المطلوبة المعتمدة", "Approved Requested Qty"], val: ["24 وحدة", "24 Units"] },
            { label: ["المستلم الفعلي بالموقع", "Effective Site Receipt"], val: ["0 وحدة", "0 Units"] },
            { label: ["المتبقي للتوريد", "Remaining Balance"], val: ["24 وحدة", "24 Units"] },
          ],
          note: [
            "اعتماد طلب المادة يفتح باب الاستلام لكنه لا يفترض وصول أي كمية للموقع تلقائيًا.",
            "Approving a material request authorizes deliveries without assuming any quantity has reached the site yet.",
          ],
        },
        delivered: {
          metrics: [
            { label: ["الكمية المطلوبة", "Requested Qty"], val: ["24 وحدة", "24 Units"] },
            { label: ["المستلم (دفعة #01)", "Received (Delivery #01)"], val: ["18 وحدة + دليل استلام", "18 Units + Receipt Evidence"] },
            { label: ["المتبقي للتوريد", "Remaining Balance"], val: ["6 وحدات", "6 Units"] },
          ],
          note: [
            "يُسجّل الاستلام الفعلي كحدث مستقل مع إمكانية إرفاق سند الاستلام أو الصورة.",
            "Actual site delivery is recorded as an independent receipt event with optional attachment evidence.",
          ],
        },
        reversal: {
          metrics: [
            { label: ["الأصل المحفوظ", "Preserved Original"], val: ["استلام +18 (لا يُحذف) + عكس -2", "Receipt +18 (Intact) + Reversal -2"] },
            { label: ["الصافي الفعلي المستلم", "Net Effective Received"], val: ["16 وحدة معتمدة", "16 Effective Units"] },
            { label: ["المتبقي الفعلي", "Effective Remaining"], val: ["8 وحدات", "8 Units Remaining"] },
          ],
          note: [
            "عند عكس 2 وحدة بسبب تلف، يبقى سجل الـ 18 الأصلي محفوظًا ويُضاف سجل العكس (-2) مع اسم منفذه وسببه ليصبح الصافي 16 والمتبقي 8.",
            "Reversing 2 damaged units keeps the original +18 receipt untouched and appends a reasoned -2 reversal, yielding 16 received / 8 remaining.",
          ],
        },
      },
    },
  },
  change: {
    label: ["INSTRUCTIONS & CHANGE NOTICES / 04", "INSTRUCTIONS & CHANGE NOTICES / 04"],
    glyph: "⌁",
    title: ["سجّل التوجيه كسياق تشغيلي.", "Keep direction in operational context."],
    copy: [
      "التعليمات وإشعارات التغيير تحفظ التوجيه أو وصف التغيير ومصدره وأثره التقديري عند توفره. تسجيلها لا يعني اعتمادًا أو قبولًا خارجيًا أو استحقاقًا قانونيًا.",
      "Instructions and Change Notices preserve a direction or change description, its source and estimated impact when available. Recording one does not imply external approval, acceptance or legal entitlement.",
    ],
    record: ["تعليمات موقع · إشعار تغيير مرتبط بالمصدر", "Instruction · Source-linked Change Notice"],
    proof: ["المصدر الحصري · الوصف · شرط عملة المشروع للتكلفة", "Exclusive source · Description · Currency prerequisite"],
    coda: [
      "المعلومة التشغيلية تبقى دقيقة في حدود ما يسجله الفريق وما تسمح به إعدادات المشروع.",
      "Operational information stays precise about what the team recorded and what project settings support.",
    ],
    sandbox: {
      title: { ar: "قواعد ربط المصدر وتقدير التكلفة", en: "SOURCE LINK & CURRENCY PREREQUISITE RULES" },
      options: [
        { id: "linked", ar: "ربط بمصدر واحد صريح", en: "Mutually Exclusive Source Link" },
        { id: "currency", ar: "شرط عملة المشروع للتسعير", en: "Project Currency Prerequisite" },
      ],
      states: {
        linked: {
          metrics: [
            { label: ["مصدر إشعار التغيير", "Change Notice Source"], val: ["مشكلة أو استفسار أو طلب ميداني", "Issue OR RFI OR Field Request"] },
            { label: ["منع التضارب", "Exclusivity Rule"], val: ["اختيار مصدر يلغي الآخر تلقائيًا", "Mutually Exclusive Source ID"] },
            { label: ["الأثر القانوني", "Legal Boundary"], val: ["توثيق تشغيلي داخلي فقط", "Internal Operational Record Only"] },
          ],
          note: [
            "يضمن صمام ارتباط إشعار التغيير بسجل مصدري واحد واضح لمنع ازدواجية المرجعية.",
            "Sammam enforces mutually exclusive source selection so every Change Notice points to an unambiguous origin.",
          ],
        },
        currency: {
          metrics: [
            { label: ["مشروع بعملة محددة (مثل JOD)", "Project with Currency Set"], val: ["يسمح بتسجيل تقدير تكلفة", "Priced Operational Impact Enabled"] },
            { label: ["مشروع بدون عملة مفعّلة", "Project without Currency"], val: ["يعطّل القيم المالية ويقبل غير المسعّر", "Priced Impact Disabled · Unpriced Allowed"] },
            { label: ["الشفافية", "Honesty Rule"], val: ["لا يخترع عملة أو ميزانية افتراضية", "Never Invents Default Currency/Budget"] },
          ],
          note: [
            "إذا لم تُضبط عملة المشروع، يمنع النظام إدخال أرقام مالية مبهمة ويوضح المتطلب بوضوح.",
            "When project currency is unconfigured, priced fields are disabled with a clear explanation rather than inventing defaults.",
          ],
        },
      },
    },
  },
  visibility: {
    label: ["ACTIVITY & SOURCE REPORTING / 05", "ACTIVITY & SOURCE REPORTING / 05"],
    glyph: "⌕",
    title: ["من النظرة العامة إلى المصدر.", "From overview back to source."],
    copy: [
      "اعثر على السجلات التشغيلية، تابع النشاط المشتق من السجلات، وافتح مصادر التقرير نفسه. الأعداد تعكس ما توفره السجلات والفترة، ولا تُنشأ كمؤشرات مستقلة.",
      "Find operational records, follow activity derived from those records and open the source rows behind a report. Counts reflect available records and period filters; they are not generated as standalone metrics.",
    ],
    record: ["تسلسل النشاط · تقرير الفترة · السجلات المصدرية", "Activity timeline · Period report · Source rows"],
    proof: ["السجل الأصلي · فلتر الفترة · فكّ التجميع للمصدر", "Canonical record · Period filter · Source drill-down"],
    coda: [
      "يظل التقرير ملخصًا تشغيليًا قابلًا للتحقق، لا بيانًا محاسبيًا أو لوحة أرقام مفصولة عن الواقع.",
      "A report remains a verifiable operational summary, never an accounting statement or detached dashboard.",
    ],
    sandbox: {
      title: { ar: "جرّب فتح السجلات المصدرية وراء التقرير", en: "DRILL DOWN FROM REPORT GROUP TO SOURCE ROWS" },
      options: [
        { id: "issues_drill", ar: "مجموعة مشكلات الموقع (2)", en: "Site Issues Group (2)" },
        { id: "materials_drill", ar: "مجموعة طلبات المواد (24 / 16 / 8)", en: "Materials Group (24 / 16 / 8)" },
      ],
      states: {
        issues_drill: {
          metrics: [
            { label: ["ملخص التقرير للفترة", "Period Report Count"], val: ["2 مشكلات مسجلة", "2 Recorded Site Issues"] },
            { label: ["السجل المصدري #1", "Source Row #1"], val: ["ISS-04 · مفتوحة (مرتبطة بـ RFI-12)", "ISS-04 · Open (Linked to RFI-12)"] },
            { label: ["السجل المصدري #2", "Source Row #2"], val: ["ISS-01 · تمت المعالجة ✓", "ISS-01 · Resolved ✓"] },
          ],
          note: [
            "النقر على أي مجموعة في التقرير يفتح السجلات الفعلية التي كوّنت هذا الرقم لتقرأ تفاصيلها ومرفقاتها.",
            "Selecting any report group exposes the exact canonical records behind the count for immediate inspection.",
          ],
        },
        materials_drill: {
          metrics: [
            { label: ["ملخص كميات الفترة", "Period Quantity Summary"], val: ["24 مطلوبة · 16 مستلمة · 8 متبقية", "24 Requested · 16 Received · 8 Remaining"] },
            { label: ["السجل المصدري", "Canonical Source"], val: ["MAT-02 · حديد تسليح (معتمد)", "MAT-02 · Rebar Request (Approved)"] },
            { label: ["سجل الدفعات والعكس", "Receipts & Reversals"], val: ["استلام +18 · عكس مصرح -2", "Receipt +18 · Authorized Reversal -2"] },
          ],
          note: [
            "الأرقام في التقرير مشتقة مباشرة من سجلات الطلبات والاستلام والعكس المعتمدة في المشروع.",
            "Report totals derive directly from canonical material requests, delivery receipts and authorized reversals.",
          ],
        },
      },
    },
  },
};

const authorityMatrix = {
  owner_unassigned: {
    read_evidence: {
      allowed: false,
      badge: ["مرفوض · 404/403 غير معيّن بالمشروع", "DENIED · NOT ASSIGNED TO PROJECT"],
      rule: "RULE: COMPANY_OWNER ≠ PROJECT_ASSIGNMENT (FORCED RLS)",
      explanation: [
        "رغم أن الفاعل مالك للشركة، إلا أنه غير معيّن في فريق هذا المشروع. يرفض الخادم وPostgreSQL RLS قراءة سجلات المشروع أو مرفقاته.",
        "Although the actor is a Company Owner, they have no active assignment in this project. Both FastAPI and PostgreSQL RLS deny operational reads.",
      ],
    },
    manager_decision: {
      allowed: false,
      badge: ["مرفوض · خارج نطاق المشروع", "DENIED · NO PROJECT ACCESS"],
      rule: "RULE: REQUIRE_ACTIVE_PROJECT_ASSIGNMENT",
      explanation: [
        "لا يمكن اتخاذ قرار تشغيلي داخل مشروع دون تعيين نشط فيه وصلاحية مسندة على السجل.",
        "Operational decisions cannot be executed without active project assignment and record-level authority.",
      ],
    },
    company_admin: {
      allowed: true,
      badge: ["مسموح · صلاحية إدارة الشركة ✓", "ALLOWED · COMPANY AUTHORITY ✓"],
      rule: "RULE: REQUIRE_COMPANY_OWNER_OR_ADMIN",
      explanation: [
        "مالك الشركة يملك صلاحية إدارة أعضاء الشركة، إرسال الدعوات، وإنشاء مسودات المشاريع ضمن حصة الشركة.",
        "Company Owners are authorized to manage company membership, invitations and project draft creation.",
      ],
    },
  },
  project_manager: {
    read_evidence: {
      allowed: true,
      badge: ["مسموح · تعيين نشط في المشروع ✓", "ALLOWED · ACTIVE PROJECT ASSIGNMENT ✓"],
      rule: "RULE: ASSIGNED_PROJECT_COMPANY + REAUTHORIZE_ON_READ",
      explanation: [
        "مدير المشروع معيّن بشكل نشط؛ يُسمح له بقراءة السجلات ومعاينة الأدلة العابرة بعد التحقق الآني من الجلسة.",
        "The Project Manager has an active assignment; records and transient evidence previews are authorized on read.",
      ],
    },
    manager_decision: {
      allowed: true,
      badge: ["مسموح · المسؤول المعيّن (can_act) ✓", "ALLOWED · ASSIGNED OWNER (can_act) ✓"],
      rule: "RULE: ASSIGNEE_MATCH + IDEMPOTENCY_KEY_CLAIM",
      explanation: [
        "الطلب مسند لمدير المشروع وصلاحية can_act مفعّلة؛ يُحفظ القرار في معاملة قاعدة بيانات واحدة محمية من التكرار.",
        "The request is assigned to the Project Manager with can_act=true; the decision commits atomically with idempotency protection.",
      ],
    },
    company_admin: {
      allowed: false,
      badge: ["مرفوض · إدارة المشروع لا تمنح إدارة الشركة", "DENIED · PROJECT ROLE ≠ COMPANY ADMIN"],
      rule: "RULE: PROJECT_MANAGER ≠ COMPANY_ADMIN",
      explanation: [
        "دور مدير المشروع يطبق داخل المشروع المعيّن فقط، ولا يمنح تلقائيًا صلاحية إدارة عضوية الشركة أو ترقية الأعضاء.",
        "Project Manager authority applies strictly to the assigned project and never confers company-wide administration.",
      ],
    },
  },
  field_member: {
    read_evidence: {
      allowed: true,
      badge: ["مسموح · عضو معيّن في المشروع ✓", "ALLOWED · ASSIGNED PROJECT MEMBER ✓"],
      rule: "RULE: ASSIGNED_PROJECT_MEMBER_READ",
      explanation: [
        "عضو الميدان المعيّن في المشروع يقرأ السجلات والمرفقات ويسجّل اليوميات والمشكلات والأدلة ضمن نطاق المشروع.",
        "An assigned Field Member can read project records/evidence and create diaries, issues and requests within scope.",
      ],
    },
    manager_decision: {
      allowed: false,
      badge: ["مرفوض · القرار مسند لمدير المشروع", "DENIED · NOT THE ASSIGNED DECISION OWNER"],
      rule: "RULE: CAN_ACT_FALSE (ASSIGNED_TO_MANAGER)",
      explanation: [
        "يستطيع عضو الميدان قراءة حالة الطلب، لكن البتّ فيه محصور بالمسؤول المعيّن عليه (can_act = false).",
        "The Field Member can view the request status, but executing the decision is restricted to the assigned owner (can_act=false).",
      ],
    },
    company_admin: {
      allowed: false,
      badge: ["مرفوض · عضو غير إداري في الشركة", "DENIED · COMPANY MEMBER ONLY"],
      rule: "RULE: COMPANY_MEMBER_NO_ADMIN_AUTHORITY",
      explanation: [
        "عضوية الشركة العادية والتعيين الميداني لا يمنحان صلاحية إدارة الشركة أو إنشاء المشاريع.",
        "Standard company membership and field assignment do not grant company administration privileges.",
      ],
    },
  },
};

const fitZonesData = {
  field: {
    tag: "ZONE 01 · FIELD REALITY",
    ar: "الواقع الميداني: المشاهدات اليومية، المشكلات الطارئة، الصور، التساؤلات الفنية، والشحنات الواصلة لبوابة الموقع.",
    en: "Field Reality: Daily site observations, emerging issues, photos, technical questions, and material deliveries arriving at the gate.",
  },
  sammam: {
    tag: "ZONE 02 · SAMMAM OPERATING LAYER",
    ar: "يمسك صمام الخيط التشغيلي اليومي: تحويل واقعة الموقع إلى سجل منسوب، ربطه بالاستفسار أو الطلب، توجيهه للمسؤول المعيّن، وحفظ القرار والاستلام الفعلي وعكسه.",
    en: "Sammam holds the daily operational thread: turning site events into attributed records, linking follow-ups, routing to assigned owners, and preserving decisions and receipts.",
  },
  enterprise: {
    tag: "ZONE 03 · COMPANY SYSTEMS OF RECORD",
    ar: "أنظمة الشركة: المحاسبة المالية، الفواتير والمدفوعات، ERP، الجداول الزمنية التعاقدية (CPM)، ونمذجة BIM — يكملها صمام ولا يدّعي استبدالها.",
    en: "Company Systems: Financial accounting, invoices/payments, ERP, contractual CPM scheduling, and BIM authoring—Sammam complements rather than replaces them.",
  },
};

/* ==================== THEME MANAGEMENT ==================== */
const systemDarkMatcher = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(preference) {
  themePref = preference;
  const resolved = preference === "system" ? (systemDarkMatcher.matches ? "dark" : "light") : preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePref = preference;
  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) metaTheme.content = resolved === "dark" ? "#0c1511" : "#14221c";

  for (const btn of themeButtons) {
    const active = btn.dataset.themeValue === preference;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  }
  try {
    localStorage.setItem("sammam-website-theme", preference);
  } catch {
    /* ignore storage restrictions */
  }
}

systemDarkMatcher.addEventListener("change", () => {
  if (themePref === "system") applyTheme("system");
});

for (const btn of themeButtons) {
  btn.addEventListener("click", () => applyTheme(btn.dataset.themeValue));
}

/* ==================== HERO STAGE & LENS ==================== */
function renderStage(stage) {
  activeStage = stage;
  const data = stageData[stage];
  if (!data) return;

  stageCounter.textContent = data.index;
  productInsight.textContent = data[language];
  lensInsight.textContent = data.lenses[activeLens][language];

  telemetryIssue.textContent = data.telemetry.issue[language];
  telemetryIssue.className = data.telemetry.issue.cls;

  telemetryRfi.textContent = data.telemetry.rfi[language];
  telemetryRfi.className = data.telemetry.rfi.cls;

  telemetryAuth.textContent = data.telemetry.auth[language];
  telemetryAuth.className = data.telemetry.auth.cls;

  for (const node of document.querySelectorAll(".record-node")) {
    const active = node.dataset.stage === stage;
    node.classList.toggle("active", active);
    node.setAttribute("aria-pressed", String(active));
  }
}

function renderLens(lens) {
  activeLens = lens;
  for (const btn of document.querySelectorAll(".lens-btn")) {
    const active = btn.dataset.lens === lens;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  }
  renderStage(activeStage);
}

function toggleAutoplay(forceState) {
  const nextState = typeof forceState === "boolean" ? forceState : !autoplayTimer;
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  if (nextState) {
    autoplayBtn.setAttribute("aria-pressed", "true");
    autoplayIcon.textContent = "⏸";
    autoplayLabel.textContent = language === "ar" ? "إيقاف المسار" : "Pause trace";
    autoplayTimer = setInterval(() => {
      const nextIdx = (stagesOrder.indexOf(activeStage) + 1) % stagesOrder.length;
      renderStage(stagesOrder[nextIdx]);
    }, 2800);
  } else {
    autoplayBtn.setAttribute("aria-pressed", "false");
    autoplayIcon.textContent = "▶";
    autoplayLabel.textContent = language === "ar" ? "تشغيل تلقائي" : "Auto-trace";
  }
}

autoplayBtn.addEventListener("click", () => toggleAutoplay());
if (heroSimulateTrigger) {
  heroSimulateTrigger.addEventListener("click", () => {
    document.querySelector(".hero-product")?.scrollIntoView({ behavior: "smooth", block: "center" });
    renderStage("issue");
    toggleAutoplay(true);
  });
}

for (const node of document.querySelectorAll(".record-node")) {
  node.addEventListener("click", () => {
    if (autoplayTimer) toggleAutoplay(false);
    renderStage(node.dataset.stage);
  });
}

for (const btn of document.querySelectorAll(".lens-btn")) {
  btn.addEventListener("click", () => renderLens(btn.dataset.lens));
}

/* ==================== FIELD HOTSPOTS ==================== */
function renderHotspot(id) {
  activeHotspot = id;
  const data = hotspotData[id];
  if (!data) return;
  for (const pin of document.querySelectorAll(".field-hotspot")) {
    const active = pin.dataset.hotspot === id;
    pin.classList.toggle("active", active);
    pin.setAttribute("aria-pressed", String(active));
  }
  document.querySelector("#hotspot-code").textContent = data.code;
  document.querySelector("#hotspot-title").textContent = data.title[language];
  document.querySelector("#hotspot-desc").textContent = data.desc[language];
}

for (const pin of document.querySelectorAll(".field-hotspot")) {
  pin.addEventListener("click", () => renderHotspot(pin.dataset.hotspot));
}

/* ==================== MASCOT WHISPERS & INTERACTIVE THREAD ==================== */
function renderWhisper() {
  const item = whispers[whisperIndex];
  const isAr = language === "ar";
  document.querySelector("#whisper-index").textContent = isAr
    ? `همسة صمّام ${item.idx} · انقر للتبديل`
    : `Sammam note ${item.idx} · Click for next`;
  document.querySelector("#whisper-text").textContent = item[language];
}

document.querySelector("#mascot-whisper-btn")?.addEventListener("click", () => {
  whisperIndex = (whisperIndex + 1) % whispers.length;
  renderWhisper();
});

const mascotStage = document.querySelector("#mascot-stage");
const mascotPath = document.querySelector("#mascot-dynamic-path");
if (mascotStage && mascotPath && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  mascotStage.addEventListener("pointermove", (e) => {
    const rect = mascotStage.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    const c1x = Math.round(175 + nx * 45);
    const c1y = Math.round(140 + ny * 55);
    const c2x = Math.round(265 - nx * 45);
    const c2y = Math.round(320 - ny * 55);
    mascotPath.setAttribute("d", `M 88 195 C ${c1x} ${c1y}, ${c2x} ${c2y}, 362 252`);
  });
  mascotStage.addEventListener("pointerleave", () => {
    mascotPath.setAttribute("d", "M 88 195 C 175 140, 265 320, 362 252");
  });
}

/* ==================== OPERATING SEQUENCE INSPECTOR ==================== */
function renderSequenceStep(idx) {
  activeSequenceStep = idx;
  const data = sequenceGuarantees[idx];
  if (!data) return;

  for (const step of document.querySelectorAll(".sequence-step")) {
    const active = Number(step.dataset.stepIndex) === idx;
    step.classList.toggle("active", active);
    step.setAttribute("aria-selected", String(active));
    step.tabIndex = active ? 0 : -1;
  }
  for (const ruler of document.querySelectorAll(".sequence-ruler span")) {
    ruler.classList.toggle("active", Number(ruler.dataset.ruler) <= idx);
  }
  const progressLine = document.querySelector("#sequence-progress-line");
  if (progressLine) progressLine.style.width = `${(idx + 1) * 25}%`;

  document.querySelector("#seq-code").textContent = data.code;
  document.querySelector("#seq-title").textContent = data.title[language];
  document.querySelector("#seq-detail").textContent = data.detail[language];
  const schemaEl = document.querySelector("#seq-schema");
  if (schemaEl) {
    schemaEl.innerHTML = data.schema
      .map((token, i) => (i === 0 ? `<span>${token}</span>` : `<i>→</i><span>${token}</span>`))
      .join("");
  }
}

for (const step of document.querySelectorAll(".sequence-step")) {
  step.addEventListener("click", () => renderSequenceStep(Number(step.dataset.stepIndex)));
  step.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = (activeSequenceStep + dir + 4) % 4;
    const target = document.querySelector(`.sequence-step[data-step-index='${next}']`);
    target?.focus();
    renderSequenceStep(next);
  });
}

/* ==================== FRICTION FILTER & ROW EXPANSION ==================== */
for (const chip of document.querySelectorAll(".filter-chip")) {
  chip.addEventListener("click", () => {
    const view = chip.dataset.frictionView;
    document.querySelector(".friction-table")?.setAttribute("data-view", view);
    for (const c of document.querySelectorAll(".filter-chip")) {
      const active = c === chip;
      c.classList.toggle("active", active);
      c.setAttribute("aria-pressed", String(active));
    }
  });
}

for (const row of document.querySelectorAll(".friction-row")) {
  row.addEventListener("click", () => {
    for (const r of document.querySelectorAll(".friction-row")) {
      r.classList.toggle("is-expanded", r === row);
    }
  });
  row.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      row.click();
    }
  });
}

/* ==================== WORKFLOWS & LIVE BLUEPRINT SANDBOX ==================== */
function renderWorkflow(id) {
  activeWorkflow = id;
  const workflow = workflows[id];
  if (!workflow) return;
  const langIdx = language === "ar" ? 0 : 1;

  for (const tab of workflowTabs) {
    const active = tab.dataset.workflow === id;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  }

  document.querySelector("#workflow-label").textContent = workflow.label[langIdx];
  document.querySelector("#workflow-glyph").textContent = workflow.glyph;
  document.querySelector("#workflow-title").textContent = workflow.title[langIdx];
  document.querySelector("#workflow-copy").textContent = workflow.copy[langIdx];
  document.querySelector("#workflow-record").textContent = workflow.record[langIdx];
  document.querySelector("#workflow-proof").textContent = workflow.proof[langIdx];
  document.querySelector("#workflow-coda").textContent = workflow.coda[langIdx];

  renderWorkflowSandbox(id);
}

function renderWorkflowSandbox(id) {
  const container = document.querySelector("#workflow-sandbox");
  const workflow = workflows[id];
  if (!container || !workflow?.sandbox) return;

  const langIdx = language === "ar" ? 0 : 1;
  const subKey = workflowSubState[id] || workflow.sandbox.options[0].id;
  const stateObj = workflow.sandbox.states[subKey];

  const buttonsHtml = workflow.sandbox.options
    .map((opt) => {
      const isAct = opt.id === subKey;
      const label = language === "ar" ? opt.ar : opt.en;
      return `<button type="button" class="sandbox-btn ${isAct ? "active" : ""}" data-substate="${opt.id}" aria-pressed="${isAct}">${label}</button>`;
    })
    .join("");

  const metricsHtml = stateObj.metrics
    .map(
      (m) => `
      <div class="sandbox-metric">
        <small>${m.label[langIdx]}</small>
        <strong>${m.val[langIdx]}</strong>
      </div>`
    )
    .join("");

  container.innerHTML = `
    <div class="sandbox-header">
      <span class="sandbox-title">${workflow.sandbox.title[language]}</span>
      <div class="sandbox-controls">${buttonsHtml}</div>
    </div>
    <div class="sandbox-stage">${metricsHtml}</div>
    <p class="sandbox-note">${stateObj.note[langIdx]}</p>
  `;

  for (const btn of container.querySelectorAll(".sandbox-btn")) {
    btn.addEventListener("click", () => {
      workflowSubState[id] = btn.dataset.substate;
      renderWorkflowSandbox(id);
    });
  }
}

for (const tab of workflowTabs) {
  tab.addEventListener("click", () => renderWorkflow(tab.dataset.workflow));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const current = workflowTabs.indexOf(tab);
    const next =
      (current + (event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1) + workflowTabs.length) %
      workflowTabs.length;
    workflowTabs[next].focus();
    renderWorkflow(workflowTabs[next].dataset.workflow);
  });
}

/* ==================== AUTHORITY & SCOPE MATRIX ==================== */
function renderAuthorityVerdict() {
  const verdict = authorityMatrix[activeActor]?.[activeAction];
  if (!verdict) return;
  const langIdx = language === "ar" ? 0 : 1;

  for (const pill of document.querySelectorAll("[data-actor]")) {
    const active = pill.dataset.actor === activeActor;
    pill.classList.toggle("active", active);
    pill.setAttribute("aria-checked", String(active));
  }
  for (const pill of document.querySelectorAll("[data-action]")) {
    const active = pill.dataset.action === activeAction;
    pill.classList.toggle("active", active);
    pill.setAttribute("aria-checked", String(active));
  }

  const badgeEl = document.querySelector("#verdict-badge");
  badgeEl.textContent = verdict.badge[langIdx];
  badgeEl.className = `verdict-badge ${verdict.allowed ? "is-allowed" : "is-denied"}`;

  document.querySelector("#verdict-rule").textContent = verdict.rule;
  document.querySelector("#verdict-explanation").textContent = verdict.explanation[langIdx];
}

for (const pill of document.querySelectorAll("[data-actor]")) {
  pill.addEventListener("click", () => {
    activeActor = pill.dataset.actor;
    renderAuthorityVerdict();
  });
}
for (const pill of document.querySelectorAll("[data-action]")) {
  pill.addEventListener("click", () => {
    activeAction = pill.dataset.action;
    renderAuthorityVerdict();
  });
}

/* ==================== STACK FIT ZONES ==================== */
function renderFitZone(zone) {
  activeFitZone = zone;
  const data = fitZonesData[zone];
  if (!data) return;
  for (const btn of document.querySelectorAll(".fit-zone")) {
    const active = btn.dataset.zone === zone;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  }
  document.querySelector("#fit-detail-tag").textContent = data.tag;
  document.querySelector("#fit-detail-text").textContent = data[language];
}

for (const btn of document.querySelectorAll(".fit-zone")) {
  btn.addEventListener("click", () => renderFitZone(btn.dataset.zone));
}

/* ==================== FAQ EXPAND / COLLAPSE ALL ==================== */
const faqToggleAllBtn = document.querySelector("#faq-toggle-all");
if (faqToggleAllBtn) {
  faqToggleAllBtn.addEventListener("click", () => {
    const allDetails = [...document.querySelectorAll(".faq-list details")];
    const allOpen = allDetails.every((d) => d.open);
    allDetails.forEach((d) => {
      d.open = !allOpen;
    });
    const span = faqToggleAllBtn.querySelector("span");
    if (span) {
      span.dataset.ar = !allOpen ? "طي جميع الإجابات" : "فتح جميع الإجابات";
      span.dataset.en = !allOpen ? "Collapse all answers" : "Expand all answers";
      span.textContent = span.dataset[language];
    }
  });
}

/* ==================== LANGUAGE SWITCH ==================== */
function setLanguage(nextLanguage) {
  language = nextLanguage;
  const isArabic = language === "ar";
  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? "rtl" : "ltr";
  document.title = isArabic
    ? "صمام — تشغيل المشروع من الميدان إلى القرار"
    : "Sammam — Construction Operations, Field to Decision";

  const metaDesc = document.querySelector("meta[name='description']");
  if (metaDesc) {
    metaDesc.content = isArabic
      ? "صمام — طبقة تشغيل تربط واقع الموقع بسجلات المشروع وقراراته، وتحفظ المسؤولية والأثر من الميدان إلى الإدارة."
      : "Sammam connects site reality to project records and decisions, keeping ownership and trace from field to management.";
  }

  for (const element of translatable) {
    element.innerHTML = element.dataset[language];
  }

  languageButton.textContent = isArabic ? "EN" : "عربي";
  languageButton.setAttribute("aria-label", isArabic ? "Switch language to English" : "غيّر اللغة إلى العربية");
  menuButton.setAttribute("aria-label", isArabic ? "فتح القائمة" : "Open menu");
  menu.setAttribute("aria-label", isArabic ? "التنقل الرئيسي" : "Main navigation");
  document.querySelector(".site-header .brand")?.setAttribute("aria-label", isArabic ? "صمام — الرئيسية" : "Sammam — Home");
  document.querySelector(".hero-product")?.setAttribute("aria-label", isArabic ? "مسار توضيحي لسجل تشغيلي" : "Illustrative operational record flow");
  document.querySelector(".workflow-tabs")?.setAttribute("aria-label", isArabic ? "قدرات صمام" : "SAMMAM capabilities");
  document.querySelector(".site-interlude")?.setAttribute("aria-label", isArabic ? "مشهد إنشائي توضيحي" : "Illustrative construction scene");

  for (const image of document.querySelectorAll("[data-alt-ar][data-alt-en]")) {
    image.alt = image.dataset[`alt${isArabic ? "Ar" : "En"}`];
  }

  if (autoplayTimer) {
    autoplayLabel.textContent = isArabic ? "إيقاف المسار" : "Pause trace";
  } else {
    autoplayLabel.textContent = isArabic ? "تشغيل تلقائي" : "Auto-trace";
  }

  renderStage(activeStage);
  renderHotspot(activeHotspot);
  renderWhisper();
  renderSequenceStep(activeSequenceStep);
  renderWorkflow(activeWorkflow);
  renderAuthorityVerdict();
  renderFitZone(activeFitZone);
}

languageButton.addEventListener("click", () => setLanguage(language === "ar" ? "en" : "ar"));

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("is-open", open);
});

for (const link of menu.querySelectorAll("a")) {
  link.addEventListener("click", () => {
    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
}

/* ==================== SCROLL PROGRESS & ACTIVE CHAPTER TRACKING ==================== */
function updateScrollProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
  if (scrollProgressBar) scrollProgressBar.style.width = `${pct}%`;
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const trackedSections = ["top", "field-scene", "method", "friction", "work", "governance", "fit", "faq"]
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
    { threshold: 0.28 }
  );
  trackedSections.forEach((sec) => sectionObserver.observe(sec));
}

/* ==================== SCROLL REVEAL ==================== */
const revealTargets = document.querySelectorAll(
  ".hero-copy, .hero-product, .site-interlude, .mascot-portrait, .mascot-copy, .position-band, .section-heading, .section-summary, .sequence-step, .sequence-inspector, .friction-intro, .friction-row, .workflow-tabs, .workflow-detail, .governance-title, .governance-principles article, .authority-lab, .fit-content, .faq-heading, .faq-list details, .closing-content"
);
for (const element of revealTargets) element.classList.add("reveal");

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -24px 0px" }
  );
  revealTargets.forEach((element) => observer.observe(element));
  document.documentElement.classList.add("motion-ready");
} else {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
}

/* ==================== HERO AMBIENT BLUEPRINT CANVAS ==================== */
const heroCanvas = document.querySelector("#hero-canvas");
if (heroCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const ctx = heroCanvas.getContext("2d");
  let width = 0;
  let height = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;

  const nodes = [
    { x: 0.14, y: 0.25, r: 3 },
    { x: 0.34, y: 0.68, r: 3.5 },
    { x: 0.52, y: 0.38, r: 4 },
    { x: 0.78, y: 0.24, r: 3 },
    { x: 0.86, y: 0.72, r: 3.5 },
  ];

  function resizeCanvas() {
    const rect = heroCanvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    heroCanvas.width = width;
    heroCanvas.height = height;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });

  heroCanvas.parentElement.addEventListener(
    "pointermove",
    (e) => {
      const rect = heroCanvas.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / Math.max(1, width);
      pointerY = (e.clientY - rect.top) / Math.max(1, height);
    },
    { passive: true }
  );

  let tick = 0;
  function drawAmbient() {
    tick += 0.008;
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(207, 224, 179, 0.09)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const px = (n.x + Math.sin(tick + i) * 0.015 + (pointerX - 0.5) * 0.02) * width;
      const py = (n.y + Math.cos(tick + i * 1.3) * 0.015 + (pointerY - 0.5) * 0.02) * height;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const px = (n.x + Math.sin(tick + i) * 0.015 + (pointerX - 0.5) * 0.02) * width;
      const py = (n.y + Math.cos(tick + i * 1.3) * 0.015 + (pointerY - 0.5) * 0.02) * height;
      ctx.fillStyle = "rgba(207, 224, 179, 0.25)";
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
  const savedTheme = localStorage.getItem("sammam-website-theme");
  if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
    applyTheme(savedTheme);
  } else {
    applyTheme("light");
  }
} catch {
  applyTheme("light");
}

setLanguage("ar");
