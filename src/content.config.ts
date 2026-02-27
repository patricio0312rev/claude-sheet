import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const sheet = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sheet' }),
});

export const collections = { sheet };
