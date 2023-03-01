# AMQP Communication with RabbitMQ
This repository contains the implementation of a server and a client that communicate via AMQP using RabbitMQ, written in TypeScript.

## Requirements
Node.js
RabbitMQ server running locally or remote access to a RabbitMQ server
AMQP client library for Node.js (amqplib)

## Setup
1. Clone the repository:
```bash
git clone https://github.com/jcanadilla/amqp-rpc.git
```

2. Install the required libraries:
```bash
npm install
```

3. Start the RabbitMQ server.

4. Open two terminal windows, one for the server and another for the client.

5. Then, start the server:
```bash
npm run start:server
```

1. Then, start the client:
```bash
npm run start:client
```

## Usage
The server and the client exchange messages using a queue named "example". When the client sends a message to the server, the server responds to this message.
