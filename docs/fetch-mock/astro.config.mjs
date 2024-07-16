import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'fetch-mock',
			social: {
				github: 'https://github.com/fetch-mock/packages/fetch-mock',
			},
			sidebar: [
				{
					label: 'About',
					autogenerate: { directory: 'fetch-mock/about' },
				},
				{
					label: 'Usage',
					autogenerate: { directory: 'fetch-mock/usage' },
				},
				{
					label: 'Mocking methods',
					autogenerate: { directory: 'fetch-mock/api-mocking' },
				},
				{
					label: 'Inspection methods',
					autogenerate: { directory: 'fetch-mock/api-inspection' },
				},
				{
					label: 'Lifecycle methods',
					autogenerate: { directory: 'fetch-mock/api-lifecycle' },
				},
				{
					label: 'Troubleshooting',
					autogenerate: { directory: 'fetch-mock/troubleshooting' },
				},

			],
		})
	],
});
