#!/usr/bin/env node

'use strict';

const AMQP = require('amqplib');
const Mongo = require('./models-mongo/');

/**
 * AMQP Access
 *
 * @class Rabbit
 */
class Rabbit {
  /**
   * Creates an instance of Rabbit.
   *
   * @returns {void}
   * @memberOf Rabbit
   */
  constructor() {
    this.AURI = process.env.AMQP_URI || "amqp://localhost";
    this.listen = "out";
  }

  /**
   * message receiver
   * Workflow:
   *  1. Connect to RabbitMQ
   *  2. Parse Message
   *  3.
   * @returns {void}
   * @memberOf Rabbit
   */
  receiveMessage() {
    const listen = this.listen;
    AMQP.connect(this.AURI).then((conn) => {
      process.once("SIGINT", () => {
        conn.close();
      });
      return conn.createChannel().then((ch) => {
        ch.assertQueue(listen).then(() => {
          ch.consume(listen, (msg) => {
            let msgContent = JSON.parse(msg.content.toString());
            return Mongo.Task.update({
              uuid: msg.properties.correlationId.toString()
            }, {
              result: msgContent
            });
          }, {
              noAck: true
          });
        });
      });
    }).catch(console.warn);
  }
}

let Worker = new Rabbit();
Worker.receiveMessage();
