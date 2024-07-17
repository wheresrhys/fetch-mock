import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.wheresrhys.co.uk',
  base: '/fetch-mock',
	integrations: [
		starlight({
			title: 'fetch-mock',
			social: {
				github: 'https://github.com/fetch-mock/packages/fetch-mock',
			},
			sidebar: [
				{
					label: 'Usage',
					autogenerate: { directory: 'usage' },
				},
				{
					label: 'API reference',
					items: [
						{label: "Mocking", autogenerate: { directory: 'API/Mocking' }},
						{label: "Inspection", autogenerate: { directory: 'API/Inspection' }},
						{label: "Lifecycle", autogenerate: { directory: 'API/Lifecycle' }}
					],
				},
				{
					label: 'Troubleshooting',
					autogenerate: { directory: 'troubleshooting' },
				},

			],
		})
	],
});
