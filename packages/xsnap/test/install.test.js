// building xsnap locally and installing from npm follow different paths
// through build.js, since installation targets are not obliged to have a git
// toolchain.
// This test verifies the post-publish experience.

import test from 'ava';
import { spawn } from 'child_process';
import { makeCLI } from '../src/build.js';

test('pack and install xsnap', async t => {
  const npm = makeCLI('npm', { spawn });
  const tar = makeCLI('tar', { spawn });
  const npmRes = await npm.pipe(['pack', '--json']);
  const {
    0: { filename },
  } = JSON.parse(npmRes);
  await tar.run(['xf', filename]);
  await npm.run(['install'], { cwd: 'package' });
  t.pass();
});
