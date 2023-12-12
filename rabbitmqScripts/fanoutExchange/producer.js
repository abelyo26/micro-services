const amqplib = require("amqplib");

const exchangeName = "exchange1";
const message = process.argv.slice(2).join(" ") || "hello world";

const sendMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "fanout", { durable: true }); // fanout = broadcasting

  channel.publish(exchangeName, "", Buffer.from(message), { persistent: true });
  /**
   * instead of asserting in to queue we publish it to the exchange then queue name
   */
  console.log("--->message sent");

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
};

sendMessage();
