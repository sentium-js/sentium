import { emptyDir, build } from 'dnt';

type ModuleOption = {
  name: string;
  dependencies?: Array<{ name: string; version: string }>;
};

await emptyDir('./npm');

const version = Deno.args[0] || '0.0.0';

const buildModule = async ({ name, dependencies }: ModuleOption) => {
  await build({
    entryPoints: [`./modules/${name}/mod.ts`],
    outDir: `./npm/${name}`,
    package: {
      name: `@sentium/${name}`,
      version,
      description: `Sentium ${name} module`,
      author: 'Lukas Heizmann <lukas@heizmann.dev>',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/sentium-js/sentium.git',
        directory: `modules/${name}`,
      },
      dependencies: dependencies?.reduce(
        (acc, { name, version }) => ({ ...acc, [`@sentium/${name}`]: version }),
        {}
      ),
    },
    shims: {},
    test: false,
    typeCheck: false,
  });

  // copy README.md
  await Deno.copyFile(`./docs/${name}.md`, `./npm/${name}/README.md`).catch(() =>
    console.log('No README.md found')
  );

  console.log(`Built ${name}@${version}`);
};

await buildModule({ name: 'common' });
await buildModule({ name: 'metadata' });
await buildModule({
  name: 'injectable',
  dependencies: [
    { name: 'common', version: '^0.1.0' },
    { name: 'metadata', version: '^0.1.0' },
  ],
});
