const amqplib = require("amqplib");

const queueName = "workQueues";

const consumeMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(queueName, { durable: true });
  channel.prefetch(1);
  /**
   * this is important to fair distribute tasks between multiple instances of this file
   * fetch one queue at a time
   */
  console.log("waiting for messages in queue ");
  channel.consume(
    queueName,
    (msg) => {
      const sec = msg.content.toString().split(".").length - 1;
      console.log("received massage-->", msg.content.toString());
      setTimeout(() => {
        console.log("*** done ***");
        channel.ack(msg); // manual acknowledgement after a process is done
      }, sec * 1000);
    },
    { noAck: false } // automatic acknowledgement after receiving message
  );
};

consumeMessage();
