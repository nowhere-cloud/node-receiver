#!/usr/bin/env node

'use strict';

const AMQP = require('amqplib');
const Mongo = require('./models-mongo/');

const listen = 'out';
AMQP.connect(process.env.AMQP_URI).then((conn) => {
  process.once('SIGINT', () => {
    conn.close();
  });
  return conn.createChannel().then((ch) => {
    let ababa = ch.assertQueue(listen, { durable: true });

    ababa = ababa.then((_qReady) => {
      ch.consume(listen, (msg) => {
        console.log(msg.properties.correlationId);
        return Mongo.Task.update({
          uuid: msg.properties.correlationId
        }, {
          result: JSON.parse(msg.content.toString())
        });
      }, {noAck: true})
      .then((rsvp) => {
        console.log(rsvp);
      });
    });

    return ababa.then((_consumerReady) => {
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
  });
}).catch((e) => {
  console.warn(e);
});
