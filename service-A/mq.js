const amqplib = require("amqplib");
const { v4 } = require("uuid");

const uniqueId = v4();

const sendMessage = (message) => {
  return new Promise(async (resolve, reject) => {
    const connection = await amqplib.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const queue = await channel.assertQueue("", { exclusive: true });

    channel.sendToQueue("rpc_queue", Buffer.from(message), {
      replyTo: queue.queue,
      correlationId: uniqueId,
    });

    channel.consume(
      queue.queue,
      (msg) => {
        if (uniqueId === msg.properties.correlationId) {
          console.log("received message: ", msg.content.toString());
          channel.ack(msg);
          connection.close();
          resolve(msg.content.toString());
        }
      },
      { noAck: false }
    );
  });
};

module.exports = sendMessage;
