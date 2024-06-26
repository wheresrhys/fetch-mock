import { describe, expect, it } from 'vitest';
import fetchMock from '../../FetchMock';
describe('instance isolation', () => {
    
    it('not be the parent', () => {
        const child = fetchMock.createInstance();
        expect(child).not.toBe(fetchMock)
    })
    it('inherit settings from parent instance', () => {
        const parent = fetchMock.createInstance();
        parent.config.Headers = {example: true};
        const child = parent.createInstance();
        expect(child.config.Headers).toEqual({ example: true });
    });

    it('implement full fetch-mock api', () => {
        const child = fetchMock.createInstance();
        //eslint-disable-next-line guard-for-in
        for (const key in fetchMock) {
            expect(typeof child[key]).toEqual(typeof fetchMock[key]);
        }
    });

    it("has an isolated router", async () => {
        const parent = fetchMock.createInstance();
        const child = parent.createInstance();

        parent.route('http://a.com', 200).catch(404)
        child.route('http://b.com', 200).catch(404)

        await expect(parent.fetchHandler('http://a.com')).resolves.toMatchObject({ status: 200 });
        await expect(parent.fetchHandler('http://b.com')).resolves.toMatchObject({ status: 404 })
        await expect(child.fetchHandler('http://a.com')).resolves.toMatchObject({ status: 404 })
        await expect(child.fetchHandler('http://b.com')).resolves.toMatchObject({ status: 200 })
    });

    it('can extend a router', async () => {
        const parent = fetchMock.createInstance();
        parent.route('http://a.com', 200);
        const child = parent.createInstance();
        child.route('http://b.com', 200)
        await expect(parent.fetchHandler('http://a.com')).resolves.toMatchObject({status:200});
        await expect(parent.fetchHandler('http://b.com')).rejects;
        await expect(child.fetchHandler('http://a.com')).resolves.toMatchObject({status:200})
        await expect(child.fetchHandler('http://b.com')).resolves.toMatchObject({status:200})
    })

    it('inherits fallback routes', async () => {
        const parent = fetchMock.createInstance().catch(404);
        const child = parent.createInstance();
        console.log(child.router)
        await expect((await child.fetchHandler('http://a.com')).status).toBe(404);
    })

    it('has an isolated call history', async () => {
        const parent = fetchMock.createInstance().route('http://a.com', 200);
        const child = parent.createInstance();

        await parent.fetchHandler('http://a.com');
        expect(parent.callHistory.callLogs.length).toBe(1)
        expect(child.callHistory.callLogs.length).toBe(0)
        await child.fetchHandler('http://a.com');
        expect(parent.callHistory.callLogs.length).toBe(1)
        expect(child.callHistory.callLogs.length).toBe(1)
    })
    it('does not inherit call history', async () => {
        const parent = fetchMock.createInstance().route('http://a.com', 200);
        await parent.fetchHandler('http://a.com');
        const child = parent.createInstance();
        expect(parent.callHistory.callLogs.length).toBe(1)
        expect(child.callHistory.callLogs.length).toBe(0)
    })

    it('can have all its routes removed', async () => {
       // TODO what's the implication for call history
    });

    it('can have selected named routes removed', () => {
        // TODO what's the implication for call history
    })

});