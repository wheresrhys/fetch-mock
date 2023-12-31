import { writeFile } from 'fs/promises';
function createCommonJsPackage() {
	const pkg = { type: 'commonjs' };

	return {
		name: 'cjs-package',
		buildEnd: async () => {
			console.log('oh yeh');
			// await mkdir('./dist', { recursive: true })
			await writeFile('./dist/package.json', JSON.stringify(pkg, null, 2));
		},
	};
}

export default {
	minify: false,
	input: 'src/index.js',
	output: {
		dir: 'dist',
		entryFileNames: 'commonjs.js',
		format: 'commonjs',
	},
	plugins: [
		// resolve({ preferBuiltins: true }),
		// commonjs(),
		createCommonJsPackage(),
		// sourcemaps(),
		// builtins(),
		// globals(),
	],
};
