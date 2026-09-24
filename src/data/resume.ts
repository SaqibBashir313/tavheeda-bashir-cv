/**
 * Single source of truth for every piece of résumé content on this site.
 *
 * Nothing here is invented: every string is taken from the source CV. Pages and
 * sections read from this file only, so a CV update is a one-file change and
 * the site can never drift from the document it represents.
 */

export interface Role {
  id: string;
  company: string;
  title: string;
  location: string;
  period: string;
  /** Bullets exactly as written in the CV. */
  highlights: readonly string[];
}

export interface Credential {
  name: string;
}

export interface Education {
  institution: string;
  location: string;
  degree: string;
}

export interface ToolGroup {
  category: string;
  items: readonly string[];
}

export interface ContractVehicle {
  name: string;
  /** The role under which the CV lists this vehicle. */
  context: string;
}

/* ── identity ─────────────────────────────────────────────────────────────── */

export const PROFILE = {
  firstName: 'Tavheeda',
  lastName: 'Bashir Bara',
  fullName: 'Tavheeda Bashir Bara',
  initials: 'TB',
  title: 'Proposal Specialist',
  email: 'tavheeda@gmail.com',
  phone: '+91 7006914384',
  location: 'Srinagar 190003',
  linkedin: 'https://in.linkedin.com/in/tavheeda-bashir',
  /** Headline distilled strictly from the CV's own wording. */
  headline: 'End-to-end proposal development across federal, state/local, and commercial markets.',
  summary:
    'Experienced Proposal Specialist with 6+ years of experience in end-to-end proposal development across federal, state/local, and commercial markets. APMP Certified with strong expertise in proposal management, solicitation analysis, compliance, writing, editing, production coordination, and cross-functional team leadership. Experienced in developing compelling Executive Summaries, Corporate Capabilities, Management Approaches, Past Performance, Staffing Plans, Quality Control Plans, and other technical and non-technical proposal sections. Strong understanding of federal contracting, contract vehicles, capture support, opportunity research, and proposal best practices. Proficient in leveraging latest AI-assisted technologies to support proposal development, including solicitation analysis, requirements extraction, research, content development, editing, summarization, compliance reviews, and proposal visualization. Proven ability to understand client requirements, develop tailored responses, and deliver accurate, compliant, and compelling proposals.',
} as const;

/**
 * Figures stated verbatim in the CV. Deliberately not derived or estimated —
 * a portfolio that rounds up is a portfolio that gets caught.
 */
export const HIGHLIGHTS = [
  { value: '6+', label: 'Years in end-to-end proposal development' },
  { value: 'APMP', label: 'Certified proposal professional' },
  { value: '4+', label: 'Member proposal team led and mentored' },
  { value: '100%', label: 'Compliance target on response delivery' },
] as const;

/* ── experience ───────────────────────────────────────────────────────────── */

export const ROLES: readonly Role[] = [
  {
    id: 'commdex-proposal-specialist',
    company: 'Commdex',
    title: 'Proposal Specialist',
    location: 'Remote',
    period: '01/2025 - 09/2026',
    highlights: [
      'Managed end-to-end proposal development for federal, state, and local government opportunities, including RFPs, RFQs, RFIs, Sources Sought, IDIQs, BPAs, GWACs, and task-order pursuits, ensuring compliance with solicitation requirements, evaluation criteria, and submission instructions.',
      'Worked on multiple federal contract vehicles, including GSA Schedule 70, GSA OASIS/OASIS+, DHS TacCom II, NASA SEWP VI, GSA 8(a) STARS II, etc.',
      'Experienced in GSA Schedule management, including the addition and modification of Special Item Numbers (SINs).',
      'Experienced in drafting and editing executive summaries, technical and management approaches, staffing plans, quality control plans, transition plans, past performance, corporate experience, key personnel resumes, job descriptions, and other proposal volumes.',
      'Developed proposals across diverse domains, including IT, telecommunications, systems integration, public safety, healthcare, staffing, and facilities/janitorial services, tailoring content to agency-specific requirements and customer priorities.',
      'Experienced in identifying and researching federal, state, and local government opportunities using leading procurement and opportunity-intelligence platforms, including SAM.gov, GovWin, GovTribe, GSA eBuy, FPDS, GovSpend, BidSpeed, Bonfire, BidNet, InstantMarkets, GovSurf, and PlanetBids, to support opportunity qualification, pipeline development, capture activities, and proposal planning.',
      'Leveraged AI-powered tools, including ChatGPT, Claude, Microsoft Copilot, Google Gemini, NotebookLM, and Napkin AI, to support solicitation analysis, requirements extraction, research, content development, editing, summarization, compliance reviews, brainstorming, and proposal visualization, while maintaining human oversight and accuracy.',
      'Used Canva, Napkin AI, and other visual/AI productivity tools to support the development of visual concepts, process representations, and presentation-ready content for proposals and internal proposal strategy.',
      'Analyzed solicitations to identify requirements, risks, gaps, evaluation factors, and customer objectives; developed Go/No-Go assessments, compliance matrices, proposal outlines, schedules, content plans, and proposal templates to guide successful proposal development.',
      'Collaborated with cross-functional teams to gather insights and refine proposal strategies.',
      'Reviewed proposals for accuracy, clarity, and compliance with client specifications before submission.',
      'Conducted post-submission reviews to identify areas for improvement, and implement lessons learned in future proposals.',
      'Maintained up-to-date knowledge of industry trends and best practices to ensure proposal contents were relevant and competitive in the market landscape.',
      'Demonstrated strong knowledge of federal proposal development, capture support, government procurement processes, contract vehicles, proposal best practices, resource management, and deadline-driven proposal operations.',
    ],
  },
  {
    id: 'iquasar-proposal-specialist',
    company: 'IQuasar, LLC',
    title: 'Proposal Specialist',
    location: 'Onsite',
    period: '04/2023 - 10/2024',
    highlights: [
      'Proposal Specialist with expertise in end-to-end proposal creation for federal and state clients, ensuring compliance with all requirements and guidelines.',
      "Experienced in analyzing different segments of RFPs, and writing/editing proposal sections, executive summaries, and other materials to create compelling narratives that showcase the company's strengths and differentiators.",
      'Leads and guides a team for more than 4 members; provides writers with clear direction and focused guidance and mentorship; cultivates an environment that follows processes, best practices, and compliance.',
      'Extensive proposal management and department management experience in the pursuit of multiple federal government opportunities.',
      'Managed contact vehicles like CIOSP4, Swift 3, JETS 2.0, POLARIS, Efast and many more.',
      'Proven track record leading teams through complex projects involving multiple stakeholders, many times remotely.',
      'Knowledge of online resources for finding opportunities, such as SAM.gov, Bidspeed, GovTribe, GSA eBuy, Bonfire, InstantMarkets, BidNet, GovSpend, PlanetBit, Gov Surf, GovWin, and FPDS, etc.',
      'Experienced in proposal development in various domains, including Healthcare, IT, Staffing, and Janitorial Services.',
      'Experienced in drafting and editing management and quality control plans, past performance volumes, and other necessary documents/plans.',
      'Determining proposal concepts by identifying RFP/RFQ needs and objectives and experienced in RFP/RFQ analysis and documenting requirements for Go/No Go decisions.',
      'Experienced in managing proposal schedules, developing proposal outlines, compliance matrices, proposal templates, and other tools to guide proposal development and ensure adherence to client requirements.',
      'Excellent skills in analyzing RFP documentation and writing compliant proposals.',
      'Experienced in Resource Management and providing guidance and feedback to develop their skills and ensure high-quality proposal submissions.',
      'Thorough understanding of proposal best practices and standards.',
      'Ability to multi-task to meet deadlines.',
      'Extensive experience in creating Job descriptions and resumes based on the solicitations.',
      'Ability to manage unsolicited proposals and identify appropriate agencies to submit them properly.',
    ],
  },
  {
    id: 'iquasar-senior-proposal-writer',
    company: 'IQuasar, LLC',
    title: 'Senior Proposal Writer',
    location: 'Onsite',
    period: '10/2022 - 03/2023',
    highlights: [
      'Write compelling and compliant proposal responses based on customer specifications, Amendments, Statement of Work (SOW), Performance Work Statement (PWS), etc and industry standards.',
      'Review Solicitations. Assess, document, and effectively communicate solicitation requirements.',
      'Create a project summary (Understanding Document) to present to the client for GO/NO-GO decisions.',
      'Develop compliant response outlines that incorporate Section L and M specifications (or other Solicitation instructions to offerer) and the overall proposal strategy, checklists, and milestones.',
      'Organize and present clear, persuasive content either from researching through websites, blogs, forums, etc., or by obtaining and translating input from subject matter experts (SMEs) and other resources into proposal text.',
      'Coordinate proposal color and team reviews, incorporating feedback from the review teams to ensure high-quality, compliant, and on-time proposal submission.',
      'Constantly enhance proposal documentation, including Capability Statements, Compliance Matrices, Assignment Matrices, and Response Outlines, to enhance efficiency, quality, and win rates.',
      'Analyzes solicitations and controls development and delivery of responses for 100% compliance.',
      'Track record for creating distinctive responses with detailed graphics, eye-catching call-out boxes, and win themes with complete reference to the past performances and achievements.',
      'Specializes in developing and documenting proposal management lifecycle processes using Shipley and other best practices.',
      'Lead color team reviews of proposal strategies, storyboards, win themes and content according to Shipley proposal process.',
      'Always learning more about how to be the best proposal manager and get the best results.',
      'Responsible for the development and strict adherence to the overall proposal schedule, proposal production schedule, response outlines storyboards, RFP compliance matrices, proposal development plan, as well as the coordination of all writing assignments.',
      'Collaborate with cross-functional teams and SMEs to gather proposal requirements, manage timelines, build Opportunity Pipelines, and ensure the timely submission of high-quality proposals in response to Federal/State/Local solicitations.',
      'Tracked key dates and submission deadlines to ensure that proposals are delivered on time.',
    ],
  },
  {
    id: 'iquasar-proposal-writer',
    company: 'IQuasar, LLC',
    title: 'Proposal Writer',
    location: 'Onsite',
    period: '05/2021 - 09/2022',
    highlights: [
      'Creating compliance matrix, outline, preparing job description and coordinating with recruitment team for identifying the best candidate for particular RFP.',
      'Responsible for working with pre-sales and extensive experience in understanding RFP documents.',
      'Responsible for Writing Federal Proposals, responding to RFPs and RFIs of Federal Government.',
      'Prepare the development and writing of technical, management and past performance sections of proposals & responsible for end-2-end Response Preparation for RFI, RFQ and Work Order.',
      'Develops pre-proposal and proposal related submissions, RFI – Requests for information, as well as determining the layout of the proposal.',
      'Serves as proposal writer on smaller bids, RFIs, Sources Sought Notices and Capability Statements.',
      'Analyze RFPs/RFIs/RFQs to prepare Proposal Responses, Outlines, Understanding Documents, Compliance Matrices, Assignment Matrices, and Capability Statements.',
      'Responsible for opportunity search using free and paid portals such as SAM.gov, GovTribe, etc.',
      'Write proposal sections such as cover letters, executive summaries, past performance, management approaches, and resumes/staffing.',
      'Managed the opportunity pipeline, conducted reviews, and provided recommendations for bid/no-bid decisions.',
      'Write compliant proposal responses that adhere to the specifications stated in the RFP, RFQ, RFI, and PWS with organization, clarity, conciseness, style, and terminology.',
      'Perform a thorough compliance review and quality check of drafts and final proposal and assist the client with final submission by creating the final submission package and submission instructions.',
      'Responsible for writing various sections of the proposal response, especially management sections, for the U.S Department of Defense, Army, Navy, U.S Air Force, Department of Agriculture, and Department of Housing and Urban Development.',
    ],
  },
];

/* ── capability ───────────────────────────────────────────────────────────── */

export const CORE_SKILLS: readonly string[] = [
  'Proposal Management & End-to-End Proposal Development',
  'Capture Management',
  'RFP/RFQ/RFI & Solicitation Analysis',
  'Proposal Strategy & Compliance Management',
  'Technical & Management Proposal Writing',
  'Go/No-Go Analysis & Opportunity Qualification',
  'Win Themes & Competitive Analysis',
  'Capture & Business Development Support',
  'Federal, State & Local Government Proposals',
  'IDIQs, GWACs, BPAs & Task Orders',
  'Team Leadership & SME Coordination',
  'Resource Management & Stakeholder Management',
  'AI-Assisted Proposal Development',
];

export const SOFT_SKILLS: readonly string[] = [
  'Attention to Detail',
  'Prioritization skills',
  'Time Management',
  'Communication Skills',
  'Critical Thinking',
  'Team Work',
  'Emotional Intelligence',
  'Work Ethic',
  'Flexibility',
  'Team Leadership',
  'Team Management',
  'Team Building',
  'Employee Relations',
];

export const CONTRACT_VEHICLES: readonly ContractVehicle[] = [
  { name: 'GSA Schedule 70', context: 'Commdex · Proposal Specialist' },
  { name: 'GSA OASIS / OASIS+', context: 'Commdex · Proposal Specialist' },
  { name: 'DHS TacCom II', context: 'Commdex · Proposal Specialist' },
  { name: 'NASA SEWP VI', context: 'Commdex · Proposal Specialist' },
  { name: 'GSA 8(a) STARS II', context: 'Commdex · Proposal Specialist' },
  { name: 'CIO-SP4', context: 'IQuasar, LLC · Proposal Specialist' },
  { name: 'Swift 3', context: 'IQuasar, LLC · Proposal Specialist' },
  { name: 'JETS 2.0', context: 'IQuasar, LLC · Proposal Specialist' },
  { name: 'POLARIS', context: 'IQuasar, LLC · Proposal Specialist' },
  { name: 'eFast', context: 'IQuasar, LLC · Proposal Specialist' },
];

/** Domains named in the CV's work history. */
export const DOMAINS: readonly string[] = [
  'IT',
  'Telecommunications',
  'Systems Integration',
  'Public Safety',
  'Healthcare',
  'Staffing',
  'Facilities / Janitorial Services',
];

/** Agencies named in the CV for management-section authorship. */
export const AGENCIES: readonly string[] = [
  'U.S. Department of Defense',
  'Army',
  'Navy',
  'U.S. Air Force',
  'Department of Agriculture',
  'Department of Housing and Urban Development',
];

/** Proposal artefacts the CV lists as drafted and edited. */
export const DELIVERABLES: readonly string[] = [
  'Executive Summaries',
  'Corporate Capabilities',
  'Technical & Management Approaches',
  'Staffing Plans',
  'Quality Control Plans',
  'Transition Plans',
  'Past Performance',
  'Corporate Experience',
  'Key Personnel Resumes',
  'Job Descriptions',
  'Compliance Matrices',
  'Assignment Matrices',
  'Capability Statements',
  'Response Outlines',
];

/* ── credentials ──────────────────────────────────────────────────────────── */

export const CERTIFICATIONS: readonly Credential[] = [
  { name: 'APMP Certified' },
  { name: 'Mastering Generative AI for Proposal Creation' },
  { name: 'AI Writing Mastery: Become an Exceptional Prompter' },
];

export const EDUCATION: readonly Education[] = [
  {
    institution: 'University Of Kashmir',
    location: 'Srinagar',
    degree: 'Master of Computer Applications: Computer Science',
  },
  {
    institution: 'Islamia College of Science And Commerce',
    location: 'Srinagar',
    degree: 'Bachelor of Computer Applications: Computer Science',
  },
];

export const TOOL_GROUPS: readonly ToolGroup[] = [
  {
    category: 'Opportunity Research',
    items: [
      'SAM.gov',
      'GovWin',
      'GovTribe',
      'GSA eBuy',
      'FPDS',
      'GovSpend',
      'BidSpeed',
      'Bonfire',
      'BidNet',
      'InstantMarkets',
      'GovSurf',
      'PlanetBids',
    ],
  },
  {
    category: 'AI & Proposal Technology',
    items: [
      'ChatGPT',
      'Claude',
      'Microsoft Copilot',
      'Google Gemini',
      'NotebookLM',
      'Napkin AI',
      'AI-assisted solicitation analysis',
      'Requirements extraction',
      'Proposal content development',
      'Editing & summarization',
      'Compliance review',
      'Proposal visualization',
    ],
  },
  {
    category: 'Design & Visualization',
    items: ['Canva', 'Adobe Acrobat', 'Visio', 'Publisher'],
  },
  {
    category: 'CRM & Collaboration',
    items: ['Salesforce', 'SharePoint', 'Microsoft Teams'],
  },
  {
    category: 'Productivity',
    items: [
      'MS Office',
      'MS Word',
      'MS Project',
      'PowerPoint',
      'Excel',
      'Google Apps',
      'Google Docs',
      'Google Mail',
    ],
  },
];
