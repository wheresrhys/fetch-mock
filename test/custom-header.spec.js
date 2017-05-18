'use strict';
const expect = require('chai').expect;

module.exports = (fetchMock, theGlobal, Headers) => {

    describe('fetch-mock', () => {

        const dummyFetch = () => Promise.resolve(arguments);

        before(() => {
            theGlobal.fetch = dummyFetch;
        })

        describe('Interface', () => {

            it('handles Headers class configuration correctly', () => {
                fetchMock.mock({
                    name: 'route1',
                    headers: {
                        test: 'yes'
                    },
                    matcher: 'http://it.at.here/',
                    response: 'ok'
                }).catch();
                return Promise.all([
                    fetch('http://it.at.here/', {headers: {test: 'yes'}}),
                    fetch('http://it.at.here/', {headers: new Headers({test: 'yes'})}),
                    fetch('http://it.at.here/')
                ])
                    .then(() => {
                        expect(fetchMock.called()).to.be.true;
                        expect(fetchMock.called('route1')).to.be.true;
                        expect(fetchMock.calls('route1').length).to.equal(2);
                        expect(fetchMock.calls().matched.length).to.equal(2);
                        expect(fetchMock.calls().unmatched.length).to.equal(1);
                    });
            });

            it('handles headers with multiple values correctly', () => {
                fetchMock.mock({
                    name: 'route1',
                    headers: {
                        test: ['foo', 'bar']
                    },
                    matcher: 'http://it.at.here/',
                    response: 'ok'
                }).catch();
                return Promise.all([
                    fetch('http://it.at.here/', {headers: {test: 'yes'}}),
                    fetch('http://it.at.here/', {headers: {test: ['foo', 'bar']}}),
                    fetch('http://it.at.here/')
                ])
                    .then(() => {
                        expect(fetchMock.called()).to.be.true;
                        expect(fetchMock.called('route1')).to.be.true;
                        expect(fetchMock.calls('route1').length).to.equal(1);
                        expect(fetchMock.calls().matched.length).to.equal(1);
                        expect(fetchMock.calls().unmatched.length).to.equal(2);
                    });
            });
        })

        afterEach(() => {
            fetchMock.restore();
        })

    });
}
