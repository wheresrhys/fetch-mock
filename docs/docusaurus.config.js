// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: 'Fetch Mock',
	tagline: 'Powerful mocking of the fetch API.',
	favicon: 'img/favicon.ico',
	projectName: 'wheresrhys.github.io',
	organizationName: 'wheresrhys',
	// Set the production url of your site here
	url: 'https://www.wheresrhys.co.uk',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/fetch-mock',

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	presets: [
		[
			'classic',
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: './sidebars.js',
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl: 'https://github.com/wheresrhys/fetch-mock',
				},
				theme: {
					customCss: './src/css/custom.css',
				},
			}),
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			// Replace with your project's social card
			image: 'img/docusaurus-social-card.jpg',
			navbar: {
				title: 'Fetch Mock',
				items: [
					{
						type: 'docSidebar',
						sidebarId: 'fetchMockSidebar',
						position: 'left',
						label: 'Docs'
					},
					{
						type: 'docSidebar',
						sidebarId: 'legacySidebar',
						position: 'left',
						label: 'Legacy docs',

					},
					{ to: 'blog', label: 'Blog', position: 'right' },
					{
						href: 'https://github.com/wheresrhys/fetch-mock',
						label: 'GitHub',
						position: 'right',
					},
				],
			},
			prism: {
				theme: prismThemes.github,
				darkTheme: prismThemes.dracula,
			},
		}),
};

export default config;
