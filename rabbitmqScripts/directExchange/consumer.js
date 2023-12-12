const amqplib = require("amqplib");

const exchangeName = "directExchange";
const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("args required");
  process.exit(1);
}

const consumeMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "direct", { durable: false });

  const queue = await channel.assertQueue("", { exclusive: true });

  console.log("waiting for messages in queue,", queue.queue);

  args.forEach((key) => {
    channel.bindQueue(queue.queue, exchangeName, key);
  });
  /**
   * channel.bindQueue(queue.queue, exchangeName, 'error'); // we can bind the queue by one key or multiple keys
   * this consumer instance will listen for messages with the same key as the queue binding key
   */

  channel.consume(
    queue.queue,
    (msg) => {
      console.log(
        "received massage--> key: ",
        msg.fields.routingKey,
        "message: ",
        msg.content.toString()
      );
    },
    { noAck: true } // automatic acknowledgement after receiving message
  );
};

consumeMessage();
