import { emptyDir, build } from 'dnt/mod.ts';
import { SpecifierMappings } from 'dnt/transform.ts';

type ModuleOption = {
  name: string;
  version: string;
  description?: string;
  mappings?: SpecifierMappings;
};

const name = Deno.args[0];
if (!name) throw new Error('No name provided');

const buildModule = async ({ name, version, description, mappings }: ModuleOption) => {
  await emptyDir(`./npm/${name}`);
  await build({
    entryPoints: [`./modules/${name}/mod.ts`],
    outDir: `./npm/${name}`,
    package: {
      name: `@sentium/${name}`,
      version,
      description,
      author: 'Lukas Heizmann <lukas@heizmann.dev>',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/sentium-js/sentium.git',
        directory: `modules/${name}`,
      },
      bugs: {
        url: 'https://github.com/sentium-js/sentium/issues',
      },
    },
    shims: {},
    test: false,
    mappings,
  });

  // copy README.md
  await Deno.copyFile(`./docs/${name}.md`, `./npm/${name}/README.md`).catch(() =>
    console.log('No README.md found')
  );

  console.log(`Built ${name}@${version}`);
};

switch (name) {
  case 'common':
    await buildModule({ name: 'common', version: '0.1.0' });
    break;
  case 'metadata':
    await buildModule({ name: 'metadata', version: '0.1.0' });
    break;
  case 'injectable':
    await buildModule({
      name: 'injectable',
      version: '0.1.0',
      mappings: {
        './modules/common/mod.ts': {
          name: '@sentium/common',
          version: '^0.1.0',
        },
        './modules/metadata/mod.ts': {
          name: '@sentium/metadata',
          version: '^0.1.0',
        },
      },
    });
    break;
  default:
    throw new Error(`Unknown module: ${name}`);
}
