#! /usr/bin/env node
const fs = require('node:fs');
const process = require('node:process');
const { sendMetricsToGCP, makeTimeSeries } = require('./gcp-monitoring.cjs');

const resultFiles = process.argv.slice(3);
const branchName = process.argv[2];

const tapResultRegex = new RegExp(
  `(^(?<status>not )?ok (?<num>[0-9]+) - (?<name>.+?)(?: %ava-dur=(?<duration>[0-9]+)ms)?(?:# (?<comments>.+?))?$(?<output>(\n^#.+?$)*)(?<failure>(\n^(?:(?!(?:not|ok) ))[^\n\r]+?$)*))`,
  'gms',
);
let timeSeriesData = [];

function processTAP(packageName, tapbody) {
  let m;
  const returnValue = [];
  // eslint-disable-next-line no-cond-assign
  while ((m = tapResultRegex.exec(tapbody))) {
    if (m.groups.name) {
      const testCaseName = `${m.groups.name}`.replace(/["<>]/g, '').trim();

      let skipped = false;
      let succeeded = true;
      let todo = false;
      if (m.groups.status) {
        succeeded = false;
      }
      if (m.groups.comments) {
        if (m.groups.comments.match(/SKIP/gi)) {
          skipped = true;
        }
        if (m.groups.comments.match(/TODO/gi)) {
          todo = true;
          skipped = true;
          succeeded = true;
        }
      }
      returnValue.push({
        labels: {
          test_name: testCaseName,
          package: packageName,
          branch: branchName,
          duration: m.groups.duration ? parseInt(m.groups.duration, 10) : null,
          test_status:
            succeeded && !(todo || skipped)
              ? 'succeeded'
              : !succeeded
                ? 'failed'
                : 'skipped',
        },
        value: Number(succeeded && !(todo || skipped)),
      });
    }
  }
  return returnValue;
}

for (const file of resultFiles) {
  const resultsBody = fs.readFileSync(file, 'utf-8');
  const packageName = file.split('/').at(-2);

  const response = processTAP(packageName, resultsBody);
  timeSeriesData.push(...response);
}

const timeSeries = makeTimeSeries(timeSeriesData);
sendMetricsToGCP(timeSeries);
