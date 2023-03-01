import amqp, { Channel, Connection } from "amqplib";
import { v4 as uuidv4 } from "uuid";

const RABBITMQ = "amqp://guest:guest@localhost:5672";

// pseudo-queue for direct reply-to
const REPLY_QUEUE = "amq.rabbitmq.reply-to";
const q = "example";

// Create a new client
const createClient = (rabbitmqconn: string): Promise<Channel> =>
  // Connect to RabbitMQ
  amqp
    .connect(rabbitmqconn)
    // Create a new channel
    .then((conn: Connection) => conn.createChannel())
    // Create a channel
    .then((channel: Channel) => {
      channel.setMaxListeners(0);

      channel.consume(
        REPLY_QUEUE,
        (msg) => {
          channel.emit(
            msg?.properties.correlationId,
            msg?.content.toString("utf8")
          );
        },
        { noAck: true }
      );

      // Return the channel
      return channel;
    });

const sendRPCMessage = (channel: Channel, message: string, rpcQueue: string) =>
  new Promise((resolve) => {
    // Create a unique correlationId for this call
    const correlationId = uuidv4();

    // Listen for a response in the reply queue
    channel.once(correlationId, resolve);

    // Send the message, including the correlationId and the reply queue
    channel.sendToQueue(rpcQueue, Buffer.from(message), {
      correlationId,
      replyTo: REPLY_QUEUE,
    });
  });

const init = async () => {
  // 1. Connect to RabbitMQ
  const channel = await createClient(RABBITMQ);

  // 2. Create a message to send
  const message = { uuid: uuidv4() };

  // 3. Log the message to the console
  console.log(`[ ${new Date()} ] Message sent: ${JSON.stringify(message)}`);

  // 4. Send the message and wait for a response
  const respone = await sendRPCMessage(channel, JSON.stringify(message), q);

  // 5. Log the response to the console
  console.log(`[ ${new Date()} ] Message received: ${respone}`);

  // 6. Exit the process
  process.exit();
};

try {
  init();
} catch (e) {
  console.log(e);
}
