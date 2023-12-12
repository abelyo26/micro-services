const amqplib = require("amqplib");
const { v4 } = require("uuid");

const message = "hello world";
const uniqueId = v4();

const sendMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = await channel.assertQueue("", { exclusive: true });

  channel.sendToQueue("rpc_queue", Buffer.from(message), {
    replyTo: queue.queue,
    correlationId: uniqueId,
  });
  /**
   * the replyTo key accepts a queue name to accept reply from the consumer
   * correlation id is used to uniquely identify the messages transmitted between the consumer and producer
   */
  console.log("--->message sent");

  channel.consume(
    queue.queue,
    (msg) => {
      if (uniqueId === msg.properties.correlationId) {
        console.log("received message: ", msg.content.toString());
        channel.ack(msg);
      }
    },
    { noAck: false }
  );
};

sendMessage();
