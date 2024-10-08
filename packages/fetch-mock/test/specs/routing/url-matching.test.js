import { afterEach, describe, expect, it, beforeAll } from 'vitest';

import fetchMock from '../../../src/index.js';

describe('url matching', () => {
	let fm;
	beforeAll(() => {
		fm = fetchMock.createInstance();
		fm.config.warnOnUnmatched = false;
	});

	afterEach(() => fm.restore());

	it('match exact strings', async () => {
		fm.mock('http://a.com/path', 200).catch();
		await fm.fetchHandler('http://a.com/pat');
		await fm.fetchHandler('http://a.com/paths');
		await fm.fetchHandler('http://a.co/path');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com/path');
		await fm.fetchHandler('//a.com/path');
		expect(fm.calls(true).length).toEqual(2);
	});

	it('match string objects', async () => {
		fm.mock('http://a.com/path', 200).catch();
		await fm.fetchHandler(new String('http://a.com/path'));
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match exact strings with relative url', async () => {
		fm.mock('/path', 200).catch();
		await fm.fetchHandler('/pat');
		await fm.fetchHandler('/paths');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/path');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match exact string against URL object', async () => {
		fm.mock('http://a.com/path', 200).catch();
		const url = new URL('http://a.com/path');
		await fm.fetchHandler(url);
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match using URL object as matcher', async () => {
		const url = new URL('http://a.com/path');
		fm.mock(url, 200).catch();

		await fm.fetchHandler('http://a.com/path');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match begin: keyword', async () => {
		fm.mock('begin:http://a.com/path', 200).catch();

		await fm.fetchHandler('http://b.com/path');
		await fm.fetchHandler('http://a.com/pat');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com/path');
		await fm.fetchHandler('http://a.com/paths');
		expect(fm.calls(true).length).toEqual(2);
	});

	it('match end: keyword', async () => {
		fm.mock('end:com/path', 200).catch();
		await fm.fetchHandler('http://a.com/paths');
		await fm.fetchHandler('http://a.com/pat');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com/path');
		await fm.fetchHandler('http://b.com/path');
		expect(fm.calls(true).length).toEqual(2);
	});

	it('match glob: keyword', async () => {
		fm.mock('glob:/its/*/*', 200).catch();
		await fm.fetchHandler('/its/alive');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/its/a/boy');
		await fm.fetchHandler('/its/a/girl');
		expect(fm.calls(true).length).toEqual(2);
	});

	it('match express: keyword', async () => {
		fm.mock('express:/its/:word', 200).catch();

		await fm.fetchHandler('/its/a/boy');
		await fm.fetchHandler('/its/a/girl');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/its/alive');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match path: keyword', async () => {
		fm.mock('path:/its/:word', 200).catch();

		await fm.fetchHandler('/its/boy');
		await fm.fetchHandler('/its/:word/still');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('/its/:word');
		await fm.fetchHandler('/its/:word?brain=false');
		expect(fm.calls(true).length).toEqual(2);
	});

	it('match wildcard string', async () => {
		fm.mock('*', 200);

		await fm.fetchHandler('http://a.com');
		expect(fm.calls(true).length).toEqual(1);
	});

	it('match regular expressions', async () => {
		const rx = /http:\/\/a\.com\/\d+/;
		fm.mock(rx, 200).catch();

		await fm.fetchHandler('http://a.com/');
		expect(fm.calls(true).length).toEqual(0);
		await fm.fetchHandler('http://a.com/12345');
		expect(fm.calls(true).length).toEqual(1);
		await fm.fetchHandler('http://a.com/abcde');
		expect(fm.calls(true).length).toEqual(1);
	});

	describe('host normalisation', () => {
		it('match exact pathless urls regardless of trailing slash', async () => {
			fm.mock('http://a.com/', 200).mock('http://b.com', 200).catch();

			await fm.fetchHandler('http://a.com/');
			await fm.fetchHandler('http://a.com');
			expect(fm.calls(true).length).toEqual(2);
			await fm.fetchHandler('http://b.com/');
			await fm.fetchHandler('http://b.com');
			expect(fm.calls(true).length).toEqual(4);
		});
		it('match protocol-relative urls with catch-all', async () => {
			fm.any(200).catch();

			await fm.fetchHandler('//a.com/path');
			expect(fm.calls(true).length).toEqual(1);
		});
	});

	describe('data: URLs', () => {
		it('match exact strings', async () => {
			fm.mock('data:text/plain,path', 200).catch();
			await fm.fetchHandler('data:text/plain,pat');
			await fm.fetchHandler('data:text/plain,paths');
			await fm.fetchHandler('data:text/html,path');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('data:text/plain,path');
			expect(fm.calls(true).length).to.equal(1);
		});
		it('match exact string against URL object', async () => {
			fm.mock('data:text/plain,path', 200).catch();
			const url = new URL('data:text/plain,path');
			await fm.fetchHandler(url);
			expect(fm.calls(true).length).to.equal(1);
		});
		it('match using URL object as matcher', async () => {
			const url = new URL('data:text/plain,path');
			fm.mock(url, 200).catch();
			await fm.fetchHandler('data:text/plain,path');
			expect(fm.calls(true).length).to.equal(1);
		});
		it('match begin: keyword', async () => {
			fm.mock('begin:data:text/plain', 200).catch();
			await fm.fetchHandler('http://a.com/path');
			await fm.fetchHandler('data:text/html,path');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('data:text/plain,path');
			await fm.fetchHandler('data:text/plain;base64,cGF0aA');
			expect(fm.calls(true).length).to.equal(2);
		});
		it('match end: keyword', async () => {
			fm.mock('end:sky', 200).catch();
			await fm.fetchHandler('data:text/plain,blue lake');
			await fm.fetchHandler('data:text/plain,blue sky research');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('data:text/plain,blue sky');
			await fm.fetchHandler('data:text/plain,grey sky');
			expect(fm.calls(true).length).to.equal(2);
		});
		it('match glob: keyword', async () => {
			fm.mock('glob:data:* sky', 200).catch();
			await fm.fetchHandler('data:text/plain,blue lake');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('data:text/plain,blue sky');
			await fm.fetchHandler('data:text/plain,grey sky');
			expect(fm.calls(true).length).to.equal(2);
		});
		it('match wildcard string', async () => {
			fm.mock('*', 200);
			await fm.fetchHandler('data:text/plain,path');
			expect(fm.calls(true).length).to.equal(1);
		});
		it('match regular expressions', async () => {
			const rx = /data:text\/plain,\d+/;
			fm.mock(rx, 200).catch();
			await fm.fetchHandler('data:text/html,12345');
			expect(fm.calls(true).length).to.equal(0);
			await fm.fetchHandler('data:text/plain,12345');
			expect(fm.calls(true).length).to.equal(1);
			await fm.fetchHandler('data:text/plain,path');
			expect(fm.calls(true).length).to.equal(1);
		});
	});
});
