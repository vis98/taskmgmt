require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'us-east-1',  credentials: new AWS.Credentials(process.env.AWS_ACCESS_KEY, process.env.AWS_SECRET_KEY)
});

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const MAX_RETRIES = 3; // Maximum number of retry attempts
let queueUrl=process.env.SQS_QUEUE_URL
// Function to process messages from the queue
const processMessage = async () => {

    console.log("at 9",queueUrl)

  const params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,  // Fetch up to 10 messages
    VisibilityTimeout: 30,     // Time message is invisible to others
    WaitTimeSeconds: 15        // Long-polling to wait for messages
  };

  try {
    const data = await sqs.receiveMessage(params).promise();
   
    if (data.Messages && data.Messages.length > 0) {
      for (const message of data.Messages) {
        const body = JSON.parse(message.Body);
        console.log('Processing message:', body);

        // Check for retry count, handle retries
        const retryCount = getRetryCount(message.Attributes);

        if (retryCount >= MAX_RETRIES) {
          console.log(`Max retries reached for message: ${message.MessageId}`);
          // Optionally move to a Dead Letter Queue (DLQ)
          await moveToDeadLetterQueue(message);
        } else {
          try {
            // Try processing the message
            await createNotificationLog(body.userId, body.taskId, body.status);
            
            // If successful, delete the message from the queue
            await deleteMessage(message.ReceiptHandle);
          } catch (err) {
            console.error('Error processing message:', err);

            // Increment retry count by making message visible again for retry
            await changeMessageVisibility(message.ReceiptHandle, retryCount + 1);
          }
        }
      }
    } else {
      console.log('No messages to process');
    }
  } catch (err) {
    console.error('Error receiving or processing message:', err);
  }
};

// Function to delete a message from the queue
const deleteMessage = async (receiptHandle) => {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle
  };

  try {
    await sqs.deleteMessage(params).promise();
    console.log('Message deleted');
  } catch (err) {
    console.error('Error deleting message:', err);
  }
};

const createNotificationLog = async (userId, taskId, status) => {
    const query = `
      INSERT INTO notification_logs (user_id, task_id, status)
      VALUES ($1, $2, $3)
      RETURNING id, created_at;
    `;
  
    const values = [userId, taskId, status];
  
    try {
      const res = await pool.query(query, values);
      console.log('Notification log created with ID:', res.rows[0].id);
    } catch (err) {
      console.error('Error inserting notification log:', err);
    }
  };

// Function to move a message to a Dead Letter Queue (DLQ)
const moveToDeadLetterQueue = async (message) => {
  // Implement DLQ logic (e.g., send the message to another queue or log it)
  console.log(`Moving message to Dead Letter Queue: ${message.MessageId}`);
  await deleteMessage(message.ReceiptHandle);  // Clean up the message from the original queue
};

// Function to increase visibility timeout and track retry attempts
const changeMessageVisibility = async (receiptHandle, retryCount) => {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
    VisibilityTimeout: 30,  // Time for next retry
    MessageAttributes: {
      retryCount: {
        DataType: "Number",
        StringValue: retryCount.toString()
      }
    }
  };

  try {
    await sqs.changeMessageVisibility(params).promise();
    console.log(`Increased visibility timeout for retry #${retryCount}`);
  } catch (err) {
    console.error('Error changing message visibility:', err);
  }
};

// Function to get retry count from message attributes
const getRetryCount = (attributes) => {
  return attributes.retryCount ? parseInt(attributes.retryCount.StringValue) : 0;
};

//  poll for new messages
setInterval(processMessage, 10000);  // Run the consumer every 10 seconds
