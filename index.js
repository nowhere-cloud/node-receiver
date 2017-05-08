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
    ch.assertQueue(listen).then(() => {
      ch.consume(listen, (msg) => {
        return Mongo.Task.update({
          uuid: msg.properties.correlationId.toString()
        }, {
          result: JSON.parse(msg.content.toString())
        });
      }, {noAck: true})
      .then((rsvp) => {
        console.log(rsvp);
      });
    });
  });
}).catch((e) => {
  console.warn(e);
});
