import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';

describe('express path parameter matching', () => {
	it('can match a path parameters', () => {
		const route = new Route({
			matcher: 'express:/type/:instance',
			response: 200,
			params: { instance: 'b' },
		});
		expect(route.matcher('/')).toBe(false);
		expect(route.matcher('/type/a')).toBe(false);
		expect(route.matcher('/type/b')).toBe(true);
	});

	it('can match multiple path parameters', () => {
		const route = new Route({
			matcher: 'express:/:type/:instance',
			response: 200,
			params: { instance: 'b', type: 'cat' },
		});
		expect(route.matcher('/')).toBe(false);
		expect(route.matcher('/dog/a')).toBe(false);
		expect(route.matcher('/cat/a')).toBe(false);
		expect(route.matcher('/dog/b')).toBe(false);
		expect(route.matcher('/cat/b')).toBe(true);
	});

	it('can match a path parameter on a full url', () => {
		const route = new Route({
			matcher: 'express:/type/:instance',
			response: 200,
			params: { instance: 'b' },
		});
		expect(route.matcher('http://site.com/')).toBe(false);
		expect(route.matcher('http://site.com/type/a')).toBe(false);
		expect(route.matcher('http://site.com/type/b')).toBe(true);
	});

	it('can match fully qualified url',  () => {
		const route = new Route({ matcher: 'express:/apps/:id', response: 200 });

		expect(route.matcher('https://api.example.com/apps/abc')).toBe(true);
	});
});
