import { describe, expect, it } from 'vitest';
import Route from '../../Route.js';

describe('url matching', () => {
	it('match exact strings', () => {
		const route = new Route({ matcher: 'http://a.com/path', response: 200 });
		expect(route.matcher('http://a.com/pat')).toBe(false);
		expect(route.matcher('http://a.com/paths')).toBe(false);
		expect(route.matcher('http://a.co/path')).toBe(false);
		expect(route.matcher('http://a.com/path')).toBe(true);
		expect(route.matcher('//a.com/path')).toBe(true);
	});

	it('match string objects', () => {
		const route = new Route({ matcher: 'http://a.com/path', response: 200 });
		expect(route.matcher(new String('http://a.com/path'))).toBe(true); // eslint-disable-line no-new-wrappers
	});

	it('match exact strings with relative url', () => {
		const route = new Route({ matcher: '/path', response: 200 });
		expect(route.matcher('/pat')).toBe(false);
		expect(route.matcher('/paths')).toBe(false);
		expect(route.matcher('/path')).toBe(true);
	});

	it('match exact string against URL object', () => {
		const route = new Route({ matcher: 'http://a.com/path', response: 200 });
		const url = new URL('http://a.com/path');
		expect(route.matcher(url)).toBe(true);
	});

	it('match using URL object as matcher', () => {
		const url = new URL('http://a.com/path');
		const route = new Route({ matcher: url, response: 200 });
		expect(route.matcher('http://a.com/path')).toBe(true);
	});

	it('match begin: keyword', () => {
		const route = new Route({
			matcher: 'begin:http://a.com/path',
			response: 200,
		});

		expect(route.matcher('http://b.com/path')).toBe(false);
		expect(route.matcher('http://a.com/pat')).toBe(false);
		expect(route.matcher('http://a.com/path')).toBe(true);
		expect(route.matcher('http://a.com/paths')).toBe(true);
	});

	it('match end: keyword', () => {
		const route = new Route({ matcher: 'end:com/path', response: 200 });
		expect(route.matcher('http://a.com/paths')).toBe(false);
		expect(route.matcher('http://a.com/pat')).toBe(false);
		expect(route.matcher('http://a.com/path')).toBe(true);
		expect(route.matcher('http://b.com/path')).toBe(true);
	});

	it('match glob: keyword', () => {
		const route = new Route({ matcher: 'glob:/its/*/*', response: 200 });
		expect(route.matcher('/its/alive')).toBe(false);
		expect(route.matcher('/its/a/boy')).toBe(true);
		expect(route.matcher('/its/a/girl')).toBe(true);
	});

	it('match express: keyword', () => {
		const route = new Route({ matcher: 'express:/its/:word', response: 200 });

		expect(route.matcher('/its')).toBe(false);
		expect(route.matcher('/its/')).toBe(false);
		expect(route.matcher('/its/a/girl')).toBe(false);
		expect(route.matcher('/its/alive')).toBe(true);
	});

	it('match path: keyword', () => {
		const route = new Route({ matcher: 'path:/its/:word', response: 200 });

		expect(route.matcher('/its/boy')).toBe(false);
		expect(route.matcher('/its/:word/still')).toBe(false);
		expect(route.matcher('/its/:word')).toBe(true);
		expect(route.matcher('/its/:word?brain=false')).toBe(true);
	});

	it('match wildcard string', () => {
		const route = new Route({ matcher: '*', response: 200 });

		expect(route.matcher('http://a.com')).toBe(true);
	});

	it('match regular expressions', () => {
		const rx = /http\:\/\/a\.com\/\d+/;
		const route = new Route({ matcher: rx, response: 200 });

		expect(route.matcher('http://a.com/')).toBe(false);
		expect(route.matcher('http://a.com/abcde')).toBe(false);
		expect(route.matcher('http://a.com/12345')).toBe(true);
	});

	it('match relative urls',  () => {
		const route = new Route({ matcher: '/a.com/', response: 200 });
		expect(route.matcher('/a.com/')).toBe(true);
	});

	it('match relative urls with dots',  () => {
		const route = new Route({ matcher: '/it.at/there/', response: 200 });
		expect(route.matcher('/it.at/not/../there/')).toBe(true);
		expect(route.matcher('./it.at/there/')).toBe(true);
	});

	it('match absolute urls with dots',  () => {
		const route = new Route({ matcher: 'http://it.at/there/', response: 200 });
		expect(route.matcher('http://it.at/not/../there/')).toBe(true);
	});

	describe('host normalisation', () => {
		it('match exact pathless urls regardless of trailing slash', () => {
			const route = new Route({ matcher: 'http://a.com/', response: 200 });

			expect(route.matcher('http://a.com/')).toBe(true);
			expect(route.matcher('http://a.com')).toBe(true);

			const route2 = new Route({ matcher: 'http://b.com', response: 200 });
			expect(route2.matcher('http://b.com/')).toBe(true);
			expect(route2.matcher('http://b.com')).toBe(true);
		});
	});

	describe('data: URLs', () => {
		it('match exact strings', () => {
			const route = new Route({
				matcher: 'data:text/plain,path',
				response: 200,
			});
			expect(route.matcher('data:text/plain,pat')).toBe(false);
			expect(route.matcher('data:text/plain,paths')).toBe(false);
			expect(route.matcher('data:text/html,path')).toBe(false);
			expect(route.matcher('data:text/plain,path')).toBe(true);
		});
		it('match exact string against URL object', () => {
			const route = new Route({
				matcher: 'data:text/plain,path',
				response: 200,
			});
			const url = new URL('data:text/plain,path');
			expect(route.matcher(url)).toBe(true);
		});
		it('match using URL object as matcher', () => {
			const url = new URL('data:text/plain,path');
			const route = new Route({ matcher: url, response: 200 });
			expect(route.matcher('data:text/plain,path')).toBe(true);
		});
		it('match begin: keyword', () => {
			const route = new Route({
				matcher: 'begin:data:text/plain',
				response: 200,
			});
			expect(route.matcher('http://a.com/path')).toBe(false);
			expect(route.matcher('data:text/html,path')).toBe(false);
			expect(route.matcher('data:text/plain,path')).toBe(true);
			expect(route.matcher('data:text/plain;base64,cGF0aA')).toBe(true);
		});
		it('match end: keyword', () => {
			const route = new Route({ matcher: 'end:sky', response: 200 });
			expect(route.matcher('data:text/plain,blue lake')).toBe(false);
			expect(route.matcher('data:text/plain,blue sky research')).toBe(false);
			expect(route.matcher('data:text/plain,blue sky')).toBe(true);
			expect(route.matcher('data:text/plain,grey sky')).toBe(true);
		});
		it('match glob: keyword', () => {
			const route = new Route({ matcher: 'glob:data:* sky', response: 200 });
			expect(route.matcher('data:text/plain,blue lake')).toBe(false);
			expect(route.matcher('data:text/plain,blue sky')).toBe(true);
			expect(route.matcher('data:text/plain,grey sky')).toBe(true);
		});
		it('match wildcard string', () => {
			const route = new Route({ matcher: '*', response: 200 });
			expect(route.matcher('data:text/plain,path')).toBe(true);
		});
		it('match regular expressions', () => {
			const rx = /data\:text\/plain,\d+/;
			const route = new Route({ matcher: rx, response: 200 });
			expect(route.matcher('data:text/html,12345')).toBe(false);
			expect(route.matcher('data:text/plain,path')).toBe(false);
			expect(route.matcher('data:text/plain,12345')).toBe(true);
		});
	});
});
