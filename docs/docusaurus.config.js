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
	themes: ['@docusaurus/theme-search-algolia'],
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
						href: '/fetch-mock/docs/legacy-api',
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
			algolia: {
	      // The application ID provided by Algolia
	      appId: 'M20F8W4K2K',

	      // Public API key: it is safe to commit it
	      apiKey: 'cd211d1ca55fcbcd002ef2ae5188b900',

	      indexName: 'wheresrhys-co',

	      // Optional: see doc section below
	      contextualSearch: false,

	      // Optional: Specify domains where the navigation should occur through
	      // window.location instead on history.push. Useful when our Algolia config
	      // crawls multiple documentation sites and we want to navigate with
	      // window.location.href to them.
	      // externalUrlRegex: 'external\\.com|domain\\.com',

	      // Optional: Replace parts of the item URLs from Algolia. Useful when
	      // using the same search index for multiple deployments using a different
	      // baseUrl. You can use regexp or string in the `from` param.
	      // For example: localhost:3000 vs myCompany.com/docs
	      // replaceSearchResultPathname: {
	      //   from: '/docs/', // or as RegExp: /\/docs\//
	      //   to: '/',
	      // },

	      // Optional: Algolia search parameters
	      searchParameters: {},

	      // Optional: path for search page that enabled by default (`false` to disable it)
	      searchPagePath: 'search',

	      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
	      insights: false,

	      //... other Algolia params
	    }
		}),
};

export default config;
