const Monitoring = require('@google-cloud/monitoring');

const gcpCredentials = JSON.parse(process.env.GCP_CREDENTIALS);
const projectId = gcpCredentials.project_id;

const monitoring = new Monitoring.MetricServiceClient({
  projectId: gcpCredentials.project_id,
  credentials: {
    client_email: gcpCredentials.client_email,
    private_key: gcpCredentials.private_key,
  },
});

async function sendMetricsToGCP(timeSeries) {
  const batchSize = 200;
  for (let i = 0; i < timeSeries.length; i += batchSize) {
    const batch = timeSeries.slice(i, i + batchSize);
    const request = {
      name: monitoring.projectPath(projectId),
      timeSeries: batch,
    };

    try {
      await monitoring.createTimeSeries(request);
      console.log(
        `Batch starting with metric ${batch[0].metric.type} sent successfully.`,
      );
    } catch (error) {
      console.error('Error sending batch:', error);
    }
  }
}

function makeTimeSeries(testData) {
  const timeSeries = testData.map(({ labels, value }) => ({
    metric: {
      type: `custom.googleapis.com/github-test/test-results`,
      labels,
    },
    resource: {
      type: 'global',
      labels: {
        project_id: projectId,
      },
    },
    points: [
      {
        interval: {
          endTime: {
            seconds: Math.floor(Date.now() / 1000),
          },
        },
        value: {
          doubleValue: value,
        },
      },
    ],
  }));
  return timeSeries;
}

module.exports = { sendMetricsToGCP, makeTimeSeries };
