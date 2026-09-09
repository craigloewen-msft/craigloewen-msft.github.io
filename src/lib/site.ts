export const site = {
  title: 'Craig Loewen',
  tagline: 'Engineer, developer, creator, manager',
  description:
    'Craig Loewen is a Product Manager at Microsoft working on the Windows Subsystem for Linux and Windows developer tooling. He writes and speaks about dev tools, Linux and AI.',
  url: 'https://www.craigloewen.com',
  authorEmail: 'craigaloewen@gmail.com',
  analyticsId: 'G-SE3SC9XDNN',
  resume: '/download_src/Craig_Loewen_Resume.pdf',
} as const;

export const socials = [
  {
    label: 'GitHub',
    handle: 'craigaloewen',
    url: 'https://www.github.com/craigaloewen',
    icon: 'github',
  },
  { label: 'X', handle: 'craigaloewen', url: 'https://www.twitter.com/craigaloewen', icon: 'x' },
  {
    label: 'LinkedIn',
    handle: 'Craig A. Loewen',
    url: 'https://www.linkedin.com/in/craig-a-loewen-8b020675',
    icon: 'linkedin',
  },
  {
    label: 'Email',
    handle: 'craigaloewen@gmail.com',
    url: 'mailto:craigaloewen@gmail.com',
    icon: 'mail',
  },
] as const;

export const navLinks = [
  { label: 'Writing & talks', href: '/writing' },
  { label: 'Projects', href: '/projects' },
  { label: 'About', href: '/about' },
] as const;

/**
 * Short, easily-edited "what I'm doing now" block surfaced on the homepage.
 */
export const now = {
  items: [
    'Building the Windows Subsystem for Linux at Microsoft — now fully open source.',
    'Exploring how coding agents change the shape of developer tools.',
    'Lifting, playing guitar, and getting outdoors whenever the weather allows.',
  ],
} as const;
