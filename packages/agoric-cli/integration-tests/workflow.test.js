import { test } from '@agoric/swingset-vat/tools/prepare-test-env-ava.js';

import { gettingStartedWorkflowTest } from '../tools/getting-started.js';

test('"getting started" workflow', async t => gettingStartedWorkflowTest(t));
