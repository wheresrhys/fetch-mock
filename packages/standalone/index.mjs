import {FetchMock} from '@fetch-mock/core';

// TODO
// Maybe this IS part of fetch-mock
// fetch mock exports fetchMock (instanceof FetchMockStandalone), and FetchMock,
// which is extended by the other wrappers
class FetchMockStandalone extends FetchMock {
	mockGlobal() {
		this.#originalFetch = globalThis.fetch;
		globalThis.fetch = this.fetchHandler.bind(this);
		return this
	}

	restoreGlobal() {
		globalThis.fetch = this.#originalFetch
		return this
	}

	spyGlobal() {
		this.#originalFetch = globalThis.fetch;
		globalThis.fetch = this.fetchHandler.bind(this);

		this.catch(({arguments}) => this.#originalFetch(...arguments))
		return this
	}

	spyLocal(fetchImplementation) {
		this.#originalFetch = fetchImplementation;
		this.catch(({arguments}) => this.#originalFetch(...arguments))
		return this
	}

	createInstance() {
		return new FetchMockStandalone({ ...this.config }, this.router);
	}
}
