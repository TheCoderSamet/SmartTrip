const amqp = require("amqplib");

let connection;
let channel;

const connectQueue = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    channel = await connection.createChannel();

    await channel.assertQueue("route.generate", {
      durable: true,
    });

    console.log("RabbitMQ connected");
  } catch (error) {
    console.error("RabbitMQ connection failed:", error.message);
  }
};

const publishRouteJob = async (data) => {
  if (!channel) {
    throw new Error("RabbitMQ channel is not ready");
  }

  const message = Buffer.from(
    JSON.stringify(data)
  );

  channel.sendToQueue(
    "route.generate",
    message,
    {
      persistent: true,
    }
  );
};

const getChannel = () => {
  return channel;
};

module.exports = {
  connectQueue,
  publishRouteJob,
  getChannel,
};