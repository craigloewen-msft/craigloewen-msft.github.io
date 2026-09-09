import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { site } from '@/lib/site';

const posts = await getCollection('writing', ({ data }) => !data.draft);
const projects = await getCollection('projects');

/** Every page that gets a generated social card, keyed by output path. */
const pages: Record<string, { title: string; description?: string }> = {
  default: { title: site.title, description: site.tagline },
  writing: { title: 'Writing', description: 'Posts on developer tools, WSL, Linux and AI.' },
  talks: { title: 'Talks & appearances', description: 'Conference talks, videos and articles.' },
  projects: { title: "Things I've built", description: 'Selected projects by Craig Loewen.' },
  about: { title: 'About Craig Loewen', description: site.tagline },
};

for (const post of posts) {
  pages[`writing-${post.id}`] = {
    title: post.data.title,
    description: post.data.description,
  };
}

for (const project of projects) {
  pages[`projects-${project.id}`] = {
    title: project.data.name,
    description: project.data.tagline,
  };
}

const route = await OGImageRoute({
  pages,
  getImageOptions: (_path, page: (typeof pages)[string]) => ({
    title: page.title,
    description: page.description,
    logo: { path: './src/assets/og-logo.png', size: [380] },
    bgGradient: [
      [11, 13, 16],
      [16, 22, 30],
    ],
    border: { color: [61, 220, 255], width: 12, side: 'inline-start' },
    padding: 70,
    font: {
      title: {
        size: 62,
        lineHeight: 1.15,
        weight: 'Bold',
        color: [238, 241, 245],
        families: ['Inter'],
      },
      description: {
        size: 28,
        lineHeight: 1.4,
        color: [169, 179, 193],
        families: ['Inter'],
      },
    },
    fonts: [
      'https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf',
      'https://api.fontsource.org/v1/fonts/inter/latin-700-normal.ttf',
    ],
  }),
});

export const getStaticPaths = route.getStaticPaths;
export const GET = route.GET;
