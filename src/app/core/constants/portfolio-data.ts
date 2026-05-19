import {
  ContactEntry,
  ExperienceItem,
  FooterLink,
  NavItem,
  SkillCategory,
  SocialLink
} from '../models/portfolio.models';

export const CV_FILE_PATH = 'Hesham%20Ahmed%20_%20CV.pdf';
export const PROFILE_IMAGE_PATH = 'Portfolio_image.png';
export const GITHUB_USERNAME = 'heshamAsayed';

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', index: '01' },
  { id: 'skills', label: 'Skills', index: '02' },
  { id: 'experience', label: 'Experience', index: '03' },
  { id: 'projects', label: 'Projects', index: '04' },
  { id: 'contact', label: 'Contact', index: '05' }
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'GitHub',
    display: 'github.com/heshamAsayed',
    url: 'https://github.com/heshamAsayed',
    platform: 'github',
    color: '#dce2f5'
  },
  {
    label: 'LinkedIn',
    display: 'linkedin.com/in/hesham-a7med',
    url: 'https://www.linkedin.com/in/hesham-a7med',
    platform: 'linkedin',
    color: '#0a66c2'
  },
  {
    label: 'Facebook',
    display: 'facebook.com/h4am7md',
    url: 'https://www.facebook.com/h4am7md',
    platform: 'facebook',
    color: '#1877f2'
  },
  {
    label: 'WhatsApp',
    display: 'wa.me/201147284782',
    url: 'https://wa.me/201147284782',
    platform: 'whatsapp',
    color: '#25d366'
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: 'Architecture & Design',
    skills: [
      { name: 'Clean Architecture', glyph: 'CA', color: '#9b7bff' },
      { name: 'CQRS', glyph: 'CQ', color: '#56f0d1' },
      { name: 'Mediator Pattern', glyph: 'MP', color: '#c084fc' },
      { name: 'SOLID Principles', glyph: 'SD', color: '#ffb703' },
      { name: 'Design Patterns', glyph: 'DP', color: '#ff6db6' },
      { name: 'MVC', glyph: 'MV', color: '#00d1b2' },
      { name: 'Repository Pattern', glyph: 'RP', color: '#6c7bff' },
      { name: 'Unit of Work', glyph: 'UW', color: '#74c7ec' }
    ]
  },
  {
    label: 'Backend',
    skills: [
      { name: 'C#', glyph: 'C#', color: '#9b59b6' },
      { name: 'OOP', glyph: 'OO', color: '#4cc9f0' },
      { name: '.NET Framework', glyph: '.N', color: '#4f9cf9' },
      { name: 'ASP.NET Core Web API', glyph: 'AP', color: '#7b4dff' },
      { name: 'SignalR', glyph: 'SR', color: '#ff5c8a' },
      { name: 'AutoMapper', glyph: 'AM', color: '#facc15' },
      { name: 'FluentValidation', glyph: 'FV', color: '#00bbf9' }
    ]
  },
  {
    label: 'Databases & ORM',
    skills: [
      { name: 'SQL Server', glyph: 'SQ', color: '#5dd39e' },
      { name: 'LINQ', glyph: 'LQ', color: '#4ce0d2' },
      { name: 'Entity Framework', glyph: 'EF', color: '#9b59b6' },
      { name: 'EF Core', glyph: 'EC', color: '#8e77ff' },
      { name: 'MySQL', glyph: 'MY', color: '#00a6fb' },
      { name: 'Firebase', glyph: 'FB', color: '#ffb703' }
    ]
  },
  {
    label: 'Core',
    skills: [
      { name: 'Data Structures', glyph: 'DS', color: '#c084fc' },
      { name: 'Algorithms', glyph: 'AL', color: '#7b8cff' },
      { name: 'Agile', glyph: 'AG', color: '#60a5fa' },
      { name: 'Unit Testing', glyph: 'UT', color: '#34d399' }
    ]
  },
  {
    label: 'DevOps & Deployment',
    skills: [
      { name: 'Git', glyph: 'GT', color: '#f97316' },
      { name: 'GitHub', glyph: 'GH', color: '#e2e8f0' },
      { name: 'GitHub Actions', glyph: 'GA', color: '#60a5fa' },
      { name: 'Docker', glyph: 'DK', color: '#38bdf8' },
      { name: 'CI/CD', glyph: 'CI', color: '#00f5d4' },
      { name: 'n8n', glyph: 'N8', color: '#ff7096' }
    ]
  },
  {
    label: 'Frontend',
    skills: [
      { name: 'HTML', glyph: 'HT', color: '#f97316' },
      { name: 'CSS', glyph: 'CS', color: '#38bdf8' },
      { name: 'Bootstrap', glyph: 'BS', color: '#7c3aed' },
      { name: 'JavaScript', glyph: 'JS', color: '#facc15' },
      { name: 'jQuery', glyph: 'JQ', color: '#0ea5e9' },
      { name: 'TypeScript', glyph: 'TS', color: '#2b7fff' },
      { name: 'Angular', glyph: 'NG', color: '#ff5c8a' }
    ]
  },
  {
    label: 'Soft Skills',
    skills: [
      { name: 'Teamwork', glyph: 'TW', color: '#9b8cff' },
      { name: 'Research', glyph: 'RS', color: '#74c7ec' },
      { name: 'Time Management', glyph: 'TM', color: '#f9a826' },
      { name: 'Communication Skills', glyph: 'CM', color: '#4ade80' },
      { name: 'Presentation Skills', glyph: 'PS', color: '#fb7185' }
    ]
  }
];

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    company: 'Zad Construction Solutions',
    role: 'Freelance .NET Developer',
    period: 'Oct 2025 — Mar 2026',
    location: 'Cairo',
    codeLead: 'var result = await Project.BuildMEP();',
    comments: [
      'AI-powered MEP platform with .NET Core + Angular',
      'Implemented ML for smart estimations & real-time insights',
      'Built: FileManagement, UserProfile, ResultDisplay modules',
      'Automated workflows using n8n'
    ]
  },
  {
    company: 'Information Technology Institute (ITI)',
    role: 'Full Stack Web Development Intern',
    period: 'Jul 2025 — Dec 2025',
    location: 'Egypt',
    codeLead: 'await Training.Complete("FullStack", duration: "6 months");',
    comments: [
      'Stacks: .NET | Angular | SQL | Desktop',
      'Delivered 5+ projects (3 collaborative, rest independent)',
      'Strengthened deadline management, teamwork, and pressure handling'
    ]
  }
];

export const CONTACT_ENTRIES: ContactEntry[] = [
  {
    key: 'email',
    value: 'heshmahmed146@gmail.com',
    href: 'mailto:heshmahmed146@gmail.com',
    comment: 'mailto link'
  },
  {
    key: 'location',
    value: 'Cairo, Egypt',
    comment: 'current base'
  },
  {
    key: 'phone',
    value: '+201147284782',
    href: 'https://wa.me/201147284782',
    comment: 'wa.me/201147284782'
  }
  // {
  //   key: 'phone2',
  //   value: '+201550658989',
  //   href: 'tel:+201550658989',
  //   comment: 'calls only'
  // }
];

export const FOOTER_PROJECTS: FooterLink[] = [
  { label: 'eCommerce Platform', target: '#projects' },
  { label: 'MEP Construction Platform', target: '#projects' },
  { label: 'Movie App', target: '#projects' }
];

export const FOOTER_NAV: FooterLink[] = NAV_ITEMS.map((item) => ({
  label: item.label,
  target: `#${item.id}`
}));
