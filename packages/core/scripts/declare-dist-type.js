import { writeFile } from 'fs/promises';
const longFormatNames = {
	cjs: 'commonjs',
	esm: 'module',
};

async function createPackageJson(format) {
	const pkg = { type: longFormatNames[format] };

	const location = `./dist/${format}`;
	await writeFile(`${location}/package.json`, JSON.stringify(pkg, null, 2));
}

await createPackageJson('esm');
await createPackageJson('cjs');
