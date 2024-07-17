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
"fetch-mock/API/Inspection/done.md": {
	id: "fetch-mock/API/Inspection/done.md";
  slug: "fetch-mock/api/inspection/done";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Inspection/flush.md": {
	id: "fetch-mock/API/Inspection/flush.md";
  slug: "fetch-mock/api/inspection/flush";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Inspection/inspecting-calls.md": {
	id: "fetch-mock/API/Inspection/inspecting-calls.md";
  slug: "fetch-mock/api/inspection/inspecting-calls";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Lifecycle/resetting.md": {
	id: "fetch-mock/API/Lifecycle/resetting.md";
  slug: "fetch-mock/api/lifecycle/resetting";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Lifecycle/sandbox.md": {
	id: "fetch-mock/API/Lifecycle/sandbox.md";
  slug: "fetch-mock/api/lifecycle/sandbox";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Mocking/Parameters/matcher.md": {
	id: "fetch-mock/API/Mocking/Parameters/matcher.md";
  slug: "fetch-mock/api/mocking/parameters/matcher";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Mocking/Parameters/options.md": {
	id: "fetch-mock/API/Mocking/Parameters/options.md";
  slug: "fetch-mock/api/mocking/parameters/options";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Mocking/Parameters/response.md": {
	id: "fetch-mock/API/Mocking/Parameters/response.md";
  slug: "fetch-mock/api/mocking/parameters/response";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Mocking/add-matcher.md": {
	id: "fetch-mock/API/Mocking/add-matcher.md";
  slug: "fetch-mock/api/mocking/add-matcher";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Mocking/catch.md": {
	id: "fetch-mock/API/Mocking/catch.md";
  slug: "fetch-mock/api/mocking/catch";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Mocking/mock.md": {
	id: "fetch-mock/API/Mocking/mock.md";
  slug: "fetch-mock/api/mocking/mock";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Mocking/shorthands.md": {
	id: "fetch-mock/API/Mocking/shorthands.md";
  slug: "fetch-mock/api/mocking/shorthands";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/API/Mocking/spy.md": {
	id: "fetch-mock/API/Mocking/spy.md";
  slug: "fetch-mock/api/mocking/spy";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/troubleshooting/cookies.md": {
	id: "fetch-mock/troubleshooting/cookies.md";
  slug: "fetch-mock/troubleshooting/cookies";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/troubleshooting/custom-classes.md": {
	id: "fetch-mock/troubleshooting/custom-classes.md";
  slug: "fetch-mock/troubleshooting/custom-classes";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/troubleshooting/debug-mode.md": {
	id: "fetch-mock/troubleshooting/debug-mode.md";
  slug: "fetch-mock/troubleshooting/debug-mode";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/troubleshooting/global-non-global.md": {
	id: "fetch-mock/troubleshooting/global-non-global.md";
  slug: "fetch-mock/troubleshooting/global-non-global";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/troubleshooting/importing.md": {
	id: "fetch-mock/troubleshooting/importing.md";
  slug: "fetch-mock/troubleshooting/importing";
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
"fetch-mock/usage/installation.md": {
	id: "fetch-mock/usage/installation.md";
  slug: "fetch-mock/usage/installation";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"fetch-mock/usage/quickstart.md": {
	id: "fetch-mock/usage/quickstart.md";
  slug: "fetch-mock/usage/quickstart";
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
"fetch-mock/usage/versions.md": {
	id: "fetch-mock/usage/versions.md";
  slug: "fetch-mock/usage/versions";
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
