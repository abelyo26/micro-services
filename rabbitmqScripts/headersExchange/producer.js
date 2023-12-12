const amqplib = require("amqplib");

const exchangeName = "headersExchange";
const args = process.argv.slice(2);
const message = args[0] || "hello world";

const sendMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "headers", { durable: false });

  channel.publish(exchangeName, "", Buffer.from(message), {
    headers: { type: "error", location: "user" },
  });
  /**
   * headers also ignore keys
   * the massage is published to the exchange using headers so the consumers can match the headers and consume the message
   */

  console.log("--->message sent");

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
};

sendMessage();
