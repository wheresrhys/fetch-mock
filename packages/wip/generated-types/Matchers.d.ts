declare var _default: ({
    name: string;
    matcher: (route: any) => any;
    usesBody: boolean;
} | {
    name: string;
    matcher: ({ functionMatcher }: {
        functionMatcher: any;
    }) => (...args: any[]) => any;
    usesBody?: undefined;
} | {
    name: string;
    matcher: (route: any) => any;
    usesBody?: undefined;
})[];
export default _default;
