import amqp from "amqplib";
import { v4 as uuidv4 } from "uuid";

const RABBITMQ = "amqp://guest:guest@localhost:5672";

(async () => {
  const q = "example";

  // Create a connection to the RabbitMQ server
  const connection = await amqp.connect(RABBITMQ);

  // Create a new channel
  const channel = await connection.createChannel();
  console.log(`[ ${new Date()} ] Server started`);

  // Create a queue named example
  await channel.assertQueue(q);
  console.info(`[ ${new Date()} ] the queue ${q} exists. To exit press CTRL+C`);

  //this code is a consumer for the queue created earlier
  //it consumes messages from the queue, then sends a response to the replyTo queue specified in the message
  await channel.consume(q, function (msg) {
    console.log(
      `[ ${new Date()} ] Message received: ${JSON.stringify(
        JSON.parse(msg?.content.toString("utf8") ?? "")
      )}`
    );

    if (msg !== null) {
      const response = {
        uuid: uuidv4(),
      };

      console.log(
        `[ ${new Date()} ] Message sent: ${JSON.stringify(response)}`
      );

      channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(response)),
        {
          correlationId: msg.properties.correlationId,
        }
      );

      channel.ack(msg);
    }
  });
})();
