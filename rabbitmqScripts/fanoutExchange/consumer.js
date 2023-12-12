const amqplib = require("amqplib");

const exchangeName = "exchange1";

const consumeMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "fanout", { durable: true });

  const queue = await channel.assertQueue("", { exclusive: true });
  /**
   * automatically generates queue name
   * exclusive means this queue will be deleted when this program closes
   */

  console.log("waiting for messages in queue,", queue.queue);

  channel.bindQueue(queue.queue, exchangeName, "");
  /**
   * this is just binding the queue created above to the exchange created
   * fanout exchange ignores binding keys
   * fanout = broadcast son any queue bind to the same exchange will consume the same massage
   */
  channel.consume(
    queue.queue,
    (msg) => {
      const sec = msg.content.toString().split(".").length - 1;
      console.log("received massage-->", msg.content.toString());
    },
    { noAck: true } // automatic acknowledgement after receiving message
  );
};

consumeMessage();
