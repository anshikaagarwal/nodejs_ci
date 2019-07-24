const mongoose = require("mongoose");
const redis = require('redis');
const keys = require('../config/keys');
const util = require('util');
const client = redis.createClient(keys.redisurl);

client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.use_cache = true;
    this.hash_keys = JSON.stringify(options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.use_cache) {
        return exec.apply(this, arguments);
    }

    const key = Object.assign({}, this.getQuery(), { collection: this.mongooseCollection.name });
    console.log("key=", key);
    const cache = await client.hget(this.hash_keys, JSON.stringify(key));
    if (cache) {
        console.log("cache=", JSON.parse(cache));
        return JSON.parse(cache);
    }
    else {
        const result = await exec.apply(this, arguments);
        client.hset(this.hash_keys, JSON.stringify(key), JSON.stringify(result));
        console.log("result=", result);
        return result;
    }
}


module.exports = {
    clearCache(hash_keys) {
        client.del(JSON.stringify(hash_keys));
    }
}