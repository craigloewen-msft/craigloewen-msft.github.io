export const site = {
  title: 'Craig Loewen',
  tagline: 'Product at Microsoft — WSL and the Windows developer experience',
  description:
    'Craig Loewen is a Principal Product Manager at Microsoft, where he owns the Windows Subsystem for Linux and parts of the Windows developer experience. He writes and speaks about developer tools, Linux, open source and AI.',
  url: 'https://www.craigloewen.com',
  authorEmail: 'craigaloewen@gmail.com',
  analyticsId: 'G-SE3SC9XDNN',
  resume: '/download_src/Craig_Loewen_Resume.pdf',
} as const;

/**
 * The reusable third-person bio, for conference programmes and podcast hosts.
 * Kept here so the /about press kit and the site description can't drift apart.
 */
export const bio = {
  short:
    'Craig Loewen is a Principal Product Manager at Microsoft, where he owns the Windows Subsystem for Linux — used by millions of developers — and parts of the Windows developer experience.',
  long: "Craig Loewen is a Principal Product Manager at Microsoft, where he owns the Windows Subsystem for Linux and parts of the Windows developer experience. He has led WSL since 2018, through its move to a real Linux kernel, its arrival in the enterprise, and its release as fully open source in 2025. He speaks regularly at Microsoft Build, Microsoft Ignite and Ubuntu Summit, writes on Microsoft's developer blogs, and holds a patent for AI-assisted clipboard tooling in Windows. He studied Mechatronics Engineering at the University of Waterloo.",
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

/**
 * The pre-Microsoft project archive is deliberately absent: it's reached from
 * /about rather than the header, because it isn't what the site is about.
 */
export const navLinks = [
  { label: 'Writing', href: '/writing' },
  { label: 'Speaking', href: '/speaking' },
  { label: 'About', href: '/about' },
] as const;

/**
 * "What I'm working on now" — responsibilities and open bets rather than a task
 * list. Short enough that keeping it current stays realistic.
 */
export const now = {
  items: [
    'Setting direction for WSL now that it is fully open source — roadmap, governance, and how a Microsoft team and an outside community share one repository.',
    'Working out what Windows developer tooling becomes when a capable agent is sitting next to the developer, and turning that into a plan other teams can build against.',
    'Writing the strategy docs and running the reviews that let a dozen teams make the same call without me in the room.',
    'Off the clock: lifting, guitar, and getting far enough from a screen that the only thing left to solve is the next hold.',
  ],
} as const;

/**
 * What I believe about the work. Opinions are the part of a product person that
 * doesn't fit in a résumé, and they're the most useful thing to publish.
 */
export const beliefs = [
  'The best developer tools disappear. If people are talking about your tool instead of their work, something has gone wrong.',
  'Distribution beats novelty. A good tool that ships in the box beats a great tool nobody installs.',
  'Open source is a product strategy, not a licensing decision.',
  'The terminal is the most durable interface in computing. Agents change what is on the other end of it, not that we are typing into it.',
  'Roadmaps are cheap. The strategy document that makes ten teams decide the same way is expensive, and worth it.',
  'Ship the thing you would want to use at 11pm, tired, the night before a deadline.',
] as const;
