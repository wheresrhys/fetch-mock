type RequestConstructor = new (input: string | Request, init ?: RequestInit) => Request;

declare type FetchMockCore ={
    createInstance: () => FetchMock
    config: FetchMockConfig;
}

declare type FetchMock = FetchMockCore & Router

// 5. Declaration merging
// Unlike a type alias, an interface can be defined multiple times, and will be treated as a single interface(with members of all declarations being merged).

// // These two declarations become:
// // interface Point { x: number; y: number; }
// interface Point { x: number; }
// interface Point { y: number; }

// const point: Point = { x: 1, y: 2 };