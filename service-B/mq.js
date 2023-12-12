const amqplib = require("amqplib");

const queueName = "rpc_queue";

const consumeMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(queueName, { durable: false });
  channel.prefetch(1);
  console.log("waiting for messages in queue ");
  channel.consume(
    queueName,
    (msg) => {
      console.log("received massage-->", msg.content.toString());
      setTimeout(() => {
        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from("a message from service-B"),
          { correlationId: msg.properties.correlationId }
        );
        channel.ack(msg);
      }, 5000);
    },
    { noAck: false }
  );
};

module.exports = consumeMessage;
