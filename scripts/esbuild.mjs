import { rm } from 'node:fs/promises';
import { build, context } from 'esbuild';

const watchMode = process.argv.includes('--watch');

const watchFeedbackPlugin = {
  name: 'watch-feedback',
  setup(buildContext) {
    buildContext.onStart(() => {
      if (watchMode) {
        console.log('[watch] build started');
      }
    });

    buildContext.onEnd((result) => {
      if (watchMode) {
        console.log(`[watch] build finished with ${result.errors.length} errors`);
      }
    });
  },
};

const baseConfig = {
  bundle: true,
  entryPoints: ['src/extension.ts'],
  external: ['vscode'],
  format: 'cjs',
  outfile: 'dist/extension.js',
  platform: 'node',
  plugins: [watchFeedbackPlugin],
  sourcemap: true,
  target: 'node20',
};

await rm('dist', { force: true, recursive: true });

if (watchMode) {
  const watchContext = await context(baseConfig);
  await watchContext.watch();
  console.log('[watch] ready');
} else {
  await build(baseConfig);
}
