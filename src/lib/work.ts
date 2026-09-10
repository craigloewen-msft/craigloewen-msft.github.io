/**
 * What I'm responsible for now, framed by scope and outcome.
 *
 * This replaced a grid of university projects on the homepage. The rule for
 * anything added here: it has to be something I own or owned, and every claim
 * has to be backed by a link anyone can open.
 */
export interface WorkArea {
  name: string;
  /** e.g. "2018 — present" */
  period: string;
  role: string;
  summary: string;
  outcomes: string[];
  links: { label: string; url: string }[];
  featured?: boolean;
}

export const work: WorkArea[] = [
  {
    name: 'Windows Subsystem for Linux',
    period: '2018 — present',
    role: 'Product owner',
    summary:
      'Linux running properly on a Windows machine. I have owned WSL since 2018 — the strategy, the roadmap, and the case for why Windows should be a good place to do Linux work at all. It is now used by more than five million developers and IT professionals.',
    outcomes: [
      'Led the move to a virtualised architecture on a Microsoft-built Linux kernel: full system call compatibility, and roughly 20x faster file system performance.',
      'Took it from a developer curiosity to something enterprises deploy, with security controls that work through Intune and Microsoft Defender for Endpoint.',
      'Released WSL as fully open source in 2025, and set up how a Microsoft team and an outside community share one repository.',
    ],
    links: [
      {
        label: 'WSL is now open source',
        url: 'https://blogs.windows.com/windowsdeveloper/2025/05/19/the-windows-subsystem-for-linux-is-now-open-source/',
      },
      {
        label: 'Announcing WSL 2',
        url: 'https://devblogs.microsoft.com/commandline/announcing-wsl-2/',
      },
      { label: 'microsoft/WSL on GitHub', url: 'https://github.com/microsoft/WSL' },
    ],
    featured: true,
  },
  {
    name: 'WSL containers',
    period: '2026',
    role: 'Product owner',
    summary:
      'Letting a Windows application run Linux code as a normal part of its workflow, so local AI and cloud-shaped workloads stop being a separate thing you set up by hand. Shipped to public preview in 2026.',
    outcomes: [
      'Extended the Linux-on-Windows strategy from "a place to develop" to "a runtime other products build on".',
      'Shipped a new CLI and set of APIs, presented at Build 2026.',
    ],
    links: [
      {
        label: 'Public preview announcement',
        url: 'https://devblogs.microsoft.com/commandline/wsl-container-is-now-available-for-public-preview/',
      },
      { label: 'Build 2026 session', url: 'https://www.youtube.com/watch?v=i0M13ZvL04M' },
    ],
  },
  {
    name: 'AI in the Windows developer experience',
    period: '2024 — present',
    role: 'Product manager and prototyper',
    summary:
      'The case that AI should show up in the parts of the OS people already use, rather than as a separate destination. I still build the prototypes myself when that is the fastest way to settle an argument.',
    outcomes: [
      'Prototyped an AI-assisted Windows clipboard in C#; it shipped in PowerToys as Advanced Paste, and I am a named inventor on the granted patent.',
      'Drove the local-model developer story on Windows — running models on device, and exposing app capability to agents through MCP.',
    ],
    links: [
      { label: 'Advanced Paste', url: 'https://www.youtube.com/watch?v=MA7Crced2EY' },
      {
        label: 'Local LLMs on Windows (Build 2024)',
        url: 'https://www.youtube.com/watch?v=sOqTyhCMbiY',
      },
    ],
  },
];
