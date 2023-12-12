const amqplib = require("amqplib");

const queueName = "queue";

const consumeMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(queueName, { durable: false });
  // durable means that if there is a restart it will create the queue again
  // default exchange type is direct exchange
  // on default exchange the routing key will be the queue name
  console.log("waiting for messages in queue ");
  channel.consume(
    queueName,
    (msg) => {
      console.log("received massage-->", msg.content.toString());
    },
    { noAck: true }
  );
};

consumeMessage();
