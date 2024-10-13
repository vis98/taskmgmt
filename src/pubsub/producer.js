require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const AWS = require('aws-sdk');
require('dotenv').config();


// Configure AWS
AWS.config.update({ region: 'us-east-1',  credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_KEY)
});
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });


// Function to send a message to the queue
const sendMessageToQueue = async (task) => {
  const queueUrl = process.env.SQS_QUEUE_URL;

  const { taskId, status, userId } = task;

  const params = {
    MessageBody: JSON.stringify({
      taskId,
      status,
      userId,
      timestamp: new Date().toISOString(),
    }),
    QueueUrl: queueUrl,
    MessageGroupId: `task_${taskId}`,  DelaySeconds: 0,  // If you want to add a delay before the message is consumed
  };

  try {
    const data = await sqs.sendMessage(params).promise();
    console.log(`Message sent, MessageID: ${data.MessageId}`);
  } catch (err) {
    console.error("Error sending message:", err);
    // Add error logging here (use a logging service, save in DB, etc.)
  }
};


module.exports={sendMessageToQueue}
