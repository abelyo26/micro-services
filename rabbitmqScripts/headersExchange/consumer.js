const amqplib = require("amqplib");

const exchangeName = "headersExchange";

const consumeMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "headers", { durable: false });

  const queue = await channel.assertQueue("", { exclusive: true });

  console.log("waiting for messages in queue,", queue.queue);

  channel.bindQueue(queue.queue, exchangeName, "", {
    type: "error",
    location: "user",
    "x-match": "any", // any = or, all = and
  });
  /**
   * x-match key is needed to tell what kind of matching operation is done the value can be either "any" or "all"
   *
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
