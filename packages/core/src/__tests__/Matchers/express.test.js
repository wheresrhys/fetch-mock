import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';

describe('express path parameter matching', () => {
	it('can match a path parameters', () => {
		const route = new Route({
			url: 'express:/type/:instance',
			response: 200,
			params: { instance: 'b' },
		});
		expect(route.matcher({ url: '/' })).toBe(false);
		expect(route.matcher({ url: '/type/a' })).toBe(false);
		expect(route.matcher({ url: '/type/b' })).toBe(true);
	});

	it('can match multiple path parameters', () => {
		const route = new Route({
			url: 'express:/:type/:instance',
			response: 200,
			params: { instance: 'b', type: 'cat' },
		});
		expect(route.matcher({ url: '/' })).toBe(false);
		expect(route.matcher({ url: '/dog/a' })).toBe(false);
		expect(route.matcher({ url: '/cat/a' })).toBe(false);
		expect(route.matcher({ url: '/dog/b' })).toBe(false);
		expect(route.matcher({ url: '/cat/b' })).toBe(true);
	});

	it('can match a path parameter on a full url', () => {
		const route = new Route({
			url: 'express:/type/:instance',
			response: 200,
			params: { instance: 'b' },
		});
		expect(route.matcher({ url: 'http://site.com/' })).toBe(false);
		expect(route.matcher({ url: 'http://site.com/type/a' })).toBe(false);
		expect(route.matcher({ url: 'http://site.com/type/b' })).toBe(true);
	});

	it('can match fully qualified url', () => {
		const route = new Route({ url: 'express:/apps/:id', response: 200 });

		expect(route.matcher({ url: 'https://api.example.com/apps/abc' })).toBe(
			true,
		);
	});
});
