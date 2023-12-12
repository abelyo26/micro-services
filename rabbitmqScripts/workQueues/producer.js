const amqplib = require("amqplib");

const queueName = "workQueues";
const message = process.argv.slice(2).join() || "hello world";

const sendMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(queueName, { durable: true });
  // durable means that if there is a restart it will create the queue again
  // default exchange type is direct exchange
  // on default exchange the routing key will be the queue name

  channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });
  console.log("--->message sent");

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
};

sendMessage();
