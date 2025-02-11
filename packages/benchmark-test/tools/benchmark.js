// import { performance } from 'perf_hooks';
const performance = { now: () => Date.now() };

async function benchmark(name, t, fn, expedtedTime, iterations = 10000) {
  await null;
  const start = performance.now(); // 3
  for (let i = 0; i < iterations; i += 1) {
    await fn();
  }
  const end = performance.now(); // 8
  const avgTime = (end - start) / iterations;

  console.log(`${name} | Average time: ${avgTime}ms`);
  t.assert(
    avgTime < expedtedTime,
    `Expected ${avgTime} to be less than ${expedtedTime}`,
  );
}

async function test(name, fn) {
  await null;
  try {
    console.log('Running test: ', name);
    await fn({ assert, truthy });
    console.log(`✅ Passed`);
  } catch (err) {
    console.log(`❌ Failed: ${err.message}`);
  }
}

function assert(condition, message = 'Assertion failed') {
  if (!condition) throw new Error(message);
}

function truthy(value, message = 'Expected a truthy value') {
  if (!value) throw new Error(message);
}

export { benchmark, test };
