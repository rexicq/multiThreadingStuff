const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this._hashKey = JSON.stringify(options.key || '');
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    console.log('Cache is not working');
    return exec.apply(this, arguments)
  }
  const key = JSON.stringify(
  { ...this.getQuery(), collection: this.mongooseCollection.name }
  );

  const cacheValue = await client.hget(this._hashKey, key);

  if (cacheValue) {
    console.log('cached', cacheValue);
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)
  }
  /*Object.assign({}, this.getQuery(), {
  collection: this.mongooseCollection.name
  })*/
  const result = await exec.apply(this, arguments);
  console.log(this._hashKey, key);
  client.hset(this._hashKey, key, JSON.stringify(result));

  return result;
};

module.exports = {
  clearHash(hashKey) {
    console.log('asd');
    client.del(JSON.stringify(hashKey))
  }
}