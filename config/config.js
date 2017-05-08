'use strict';

module.exports = {
  'mongo': {
    'development': 'mongodb://localhost/nowhere',
    'test': 'mongodb://localhost/nowhere-test',
    'production': process.env.MONGODB_URI
  }
};
