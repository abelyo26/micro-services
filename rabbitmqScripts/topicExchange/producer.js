const amqplib = require("amqplib");

const exchangeName = "topicExchange";
const args = process.argv.slice(2);
const message = args[1] || "hello world";
const logType = args[0];

const sendMessage = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange(exchangeName, "topic", { durable: false }); // topic exchange distributes based on the topic of the key

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
