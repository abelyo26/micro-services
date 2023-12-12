const amqplib = require("amqplib");

const exchangeName = "topicExchange";
const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("args required");
  process.exit(1);
}

const consumeMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "topic", { durable: false });

  const queue = await channel.assertQueue("", { exclusive: true });

  console.log("waiting for messages in queue,", queue.queue);

  args.forEach((key) => {
    channel.bindQueue(queue.queue, exchangeName, key);
  });
  /**
   * channel.bindQueue(queue.queue, exchangeName, 'error'); // we can bind the queue by one key or multiple keys
   * this consumer instance will listen for messages with the same key as the queue binding key
   * in topic exchange the keys should be separated by . eg- user.log.error
   *  * means the replacement word is only one eg- *.log.error, user.log.*, *.log.*
   *  # means the replacement word can be one or more eg- #.log.error, user.log.#, #.log.#
   *  * and # can be used together
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
