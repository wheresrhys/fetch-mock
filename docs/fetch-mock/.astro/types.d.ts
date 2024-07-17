declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"docs": {
"fetch-mock/about/introduction.md": {
	id: "fetch-mock/about/introduction.md";
  slug: "fetch-mock/about/introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/about/previous-versions.md": {
	id: "fetch-mock/about/previous-versions.md";
  slug: "fetch-mock/about/previous-versions";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/about/quickstart.md": {
	id: "fetch-mock/about/quickstart.md";
  slug: "fetch-mock/about/quickstart";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-inspection/called.md": {
	id: "fetch-mock/api-inspection/called.md";
  slug: "fetch-mock/api-inspection/called";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-inspection/calls.md": {
	id: "fetch-mock/api-inspection/calls.md";
  slug: "fetch-mock/api-inspection/calls";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-inspection/done.md": {
	id: "fetch-mock/api-inspection/done.md";
  slug: "fetch-mock/api-inspection/done";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-inspection/fundamentals.md": {
	id: "fetch-mock/api-inspection/fundamentals.md";
  slug: "fetch-mock/api-inspection/fundamentals";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-inspection/lastCall.md": {
	id: "fetch-mock/api-inspection/lastCall.md";
  slug: "fetch-mock/api-inspection/lastcall";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-inspection/lastOptions.md": {
	id: "fetch-mock/api-inspection/lastOptions.md";
  slug: "fetch-mock/api-inspection/lastoptions";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-inspection/lastResponse.md": {
	id: "fetch-mock/api-inspection/lastResponse.md";
  slug: "fetch-mock/api-inspection/lastresponse";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-inspection/lastUrl.md": {
	id: "fetch-mock/api-inspection/lastUrl.md";
  slug: "fetch-mock/api-inspection/lasturl";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-lifecycle/flush.md": {
	id: "fetch-mock/api-lifecycle/flush.md";
  slug: "fetch-mock/api-lifecycle/flush";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-lifecycle/resetBehavior.md": {
	id: "fetch-mock/api-lifecycle/resetBehavior.md";
  slug: "fetch-mock/api-lifecycle/resetbehavior";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-lifecycle/resetHistory.md": {
	id: "fetch-mock/api-lifecycle/resetHistory.md";
  slug: "fetch-mock/api-lifecycle/resethistory";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-lifecycle/restore_reset.md": {
	id: "fetch-mock/api-lifecycle/restore_reset.md";
  slug: "fetch-mock/api-lifecycle/restore_reset";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-lifecycle/sandbox.md": {
	id: "fetch-mock/api-lifecycle/sandbox.md";
  slug: "fetch-mock/api-lifecycle/sandbox";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/add-matcher.md": {
	id: "fetch-mock/api-mocking/add-matcher.md";
  slug: "fetch-mock/api-mocking/add-matcher";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/catch.md": {
	id: "fetch-mock/api-mocking/catch.md";
  slug: "fetch-mock/api-mocking/catch";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/combined-shorthands.md": {
	id: "fetch-mock/api-mocking/combined-shorthands.md";
  slug: "fetch-mock/api-mocking/combined-shorthands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/cookies.md": {
	id: "fetch-mock/api-mocking/cookies.md";
  slug: "fetch-mock/api-mocking/cookies";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/get_post.md": {
	id: "fetch-mock/api-mocking/get_post.md";
  slug: "fetch-mock/api-mocking/get_post";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/mock.md": {
	id: "fetch-mock/api-mocking/mock.md";
  slug: "fetch-mock/api-mocking/mock";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/mock_any.md": {
	id: "fetch-mock/api-mocking/mock_any.md";
  slug: "fetch-mock/api-mocking/mock_any";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/mock_matcher.md": {
	id: "fetch-mock/api-mocking/mock_matcher.md";
  slug: "fetch-mock/api-mocking/mock_matcher";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/mock_once.md": {
	id: "fetch-mock/api-mocking/mock_once.md";
  slug: "fetch-mock/api-mocking/mock_once";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/mock_options.md": {
	id: "fetch-mock/api-mocking/mock_options.md";
  slug: "fetch-mock/api-mocking/mock_options";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/mock_response.md": {
	id: "fetch-mock/api-mocking/mock_response.md";
  slug: "fetch-mock/api-mocking/mock_response";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/mock_sticky.md": {
	id: "fetch-mock/api-mocking/mock_sticky.md";
  slug: "fetch-mock/api-mocking/mock_sticky";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/api-mocking/spy.md": {
	id: "fetch-mock/api-mocking/spy.md";
  slug: "fetch-mock/api-mocking/spy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/troubleshooting/troubleshooting.md": {
	id: "fetch-mock/troubleshooting/troubleshooting.md";
  slug: "fetch-mock/troubleshooting/troubleshooting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/cheatsheet.md": {
	id: "fetch-mock/usage/cheatsheet.md";
  slug: "fetch-mock/usage/cheatsheet";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/configuration.md": {
	id: "fetch-mock/usage/configuration.md";
  slug: "fetch-mock/usage/configuration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/custom-classes.md": {
	id: "fetch-mock/usage/custom-classes.md";
  slug: "fetch-mock/usage/custom-classes";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/debug-mode.md": {
	id: "fetch-mock/usage/debug-mode.md";
  slug: "fetch-mock/usage/debug-mode";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/global-non-global.md": {
	id: "fetch-mock/usage/global-non-global.md";
  slug: "fetch-mock/usage/global-non-global";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/importing.md": {
	id: "fetch-mock/usage/importing.md";
  slug: "fetch-mock/usage/importing";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/installation.md": {
	id: "fetch-mock/usage/installation.md";
  slug: "fetch-mock/usage/installation";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/polyfilling.md": {
	id: "fetch-mock/usage/polyfilling.md";
  slug: "fetch-mock/usage/polyfilling";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/requirements.md": {
	id: "fetch-mock/usage/requirements.md";
  slug: "fetch-mock/usage/requirements";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/usage-with-jest.md": {
	id: "fetch-mock/usage/usage-with-jest.md";
  slug: "fetch-mock/usage/usage-with-jest";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/v6-v7-upgrade-guide.md": {
	id: "fetch-mock/usage/v6-v7-upgrade-guide.md";
  slug: "fetch-mock/usage/v6-v7-upgrade-guide";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/version-10-caveat.md": {
	id: "fetch-mock/usage/version-10-caveat.md";
  slug: "fetch-mock/usage/version-10-caveat";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"index.mdx": {
	id: "index.mdx";
  slug: "index";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../src/content/config.js");
}
