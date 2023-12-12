const amqplib = require("amqplib");

const exchangeName = "directExchange";
const args = process.argv.slice(2);
const message = args[1] || "hello world";
const logType = args[0];

const sendMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "direct", { durable: false }); // fanout = broadcasting

  channel.publish(exchangeName, logType, Buffer.from(message));
  /**
   * the massage is published to the exchange using key so the consumer will get the message based on the specified key
   */

  console.log("--->message sent");

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
};

sendMessage();
