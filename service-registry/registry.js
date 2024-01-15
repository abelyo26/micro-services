"use strict";

const is = require("is_js");
const pino = require("pino");
const redis = require("redis");

/**
 * @description Redis based service registry & service discovery
 * @class ServiceRegistry
 */
class ServiceRegistry {
  
  /**
   *Creates an instance of ServiceRegistry.
   * @param {Object} redis redis instance
   * @param {Object} options registry options
   * @memberof ServiceRegistry
   */
  constructor(options = {}) {
    if (is.not.undefined(options) && is.not.object(options))
      throw new Error("invalid options");

    this._options = Object.assign({ prefix: "Service" }, options || {});
    this._redis = redis.createClient();
    this._redis.connect();
    this._logger = pino();
  }

  /**
   * @description adds a new service instance
   * @param {String} service name
   * @param {String | Number} target address
   * @returns Promise
   * @memberof ServiceRegistry
   */
  add(service, address) {
    return new Promise(async (resolve, reject) => {
      try {
        const key = this._key(service);
        if (this._options.expire) {
          const extended = await this._ifExistUpdate(key, address);
          if (extended.exists) {
            resolve(extended);
          }
        }

        await this._redis.SADD(key, address);

        if (this._options.expire) this._redis.EXPIRE(key, this._options.expire);

        this._logger.info({ service, address }, "Service.up");
        resolve({ service, address });
      } catch (e) {
        this._logger.error(e, "Service.up");
        reject({ status: 400, message: e.message });
      }
    });
  }

  /**
   * @description removes an existing service instance
   * @param {String} service name
   * @param {String | Number} target address
   * @returns Promise
   * @memberof ServiceRegistry
   */
  remove(service, address) {
    return new Promise(async (resolve, reject) => {
      try {
        const key = this._key(service);
        await this._redis.SREM(key, address);
        this._logger.info({ deleted: true, service, address }, "Service.down");
        resolve({ deleted: true, service, address });
      } catch (e) {
        this._logger.error(e, "Service.down");
        reject({ status: 400, message: e.message });
      }
    });
  }
  
  /**
   * @description returns a random instance by service
   * @param {String} service name
   * @returns Promise
   * @memberof ServiceRegistry
   */
  get(serviceKey) {
    return new Promise(async (resolve, reject) => {
      try {
        const key = this._key(serviceKey);
        const service = await this._redis.SRANDMEMBER(key);
        if (is.null(service))
          reject({ status: 404, message: "SERVICE NOT FOUND" });

        this._logger.info({ service }, "Service.get");
        resolve({ service });
      } catch (e) {
        this._logger.error(e, "Service.get");
        reject({ status: 400, message: e.message });
      }
    });
  }

  /**
   * @description returns all instances by service
   * @param {String} service name
   * @returns Promise
   * @memberof ServiceRegistry
   */
  all(service) {
    return new Promise(async (resolve, reject) => {
      try {
        const key = this._key(service);
        const services = await this._redis.SMEMBERS(key);
        if (is.empty(services))
          reject({ status: 404, message: "SERVICES NOT FOUND" });
        this._logger.info({ services }, "Service.all");
        resolve({ services });
      } catch (e) {
        this._logger.error(e, "Service.all");
        reject(e);
      }
    });
  }

  /**
   * @description returns list of all services
   * @returns Promise
   * @memberof ServiceRegistry
   */
  services() {
    return new Promise(async (resolve, reject) => {
      try {
        const services = await this._redis.KEYS(`${this._options.prefix}*`);

        if (is.not.empty(services)) {
          const newServices = services.map((service) =>
            service.replace("Service::", "")
          );
          this._logger.info(newServices, "Service.services");
          resolve({ services: newServices });
        }
        reject({ status: 404, message: "SERVICES NOT FOUND" });
      } catch (e) {
        this._logger.error(e, "Service.services");
        reject(e);
      }
    });
  }
  
  /**
   * @description stops service registry
   * @memberof ServiceRegistry
   */
  stop() {
    this._redis.QUIT();
    this._logger.info("service registry is down");
  }
  
  /**
   * @description checks if a service exists and updates it
   * @param {String} service name
   * @param {String | Number} target address
   * @returns Promise
   */
  _ifExistUpdate(service, target) {
    return new Promise(async (resolve, reject) => {
      try {
        const keyExists = await this._redis.EXISTS(service);
        if (keyExists) {
          const valueExists = await this._redis.SISMEMBER(service, target);
          if (valueExists) {
            await this._redis.EXPIRE(service, this._options.expire);
            this._logger.info(
              {
                exists: true,
                extended: true,
                service,
                target,
                extensionTime: this._options.expire,
              },
              "Service.ifExistUpdate"
            );
            resolve({
              exists: true,
              extended: true,
              service,
              target,
              extensionTime: this._options.expire,
            });
          }
        }
        this._logger.info({ exists: false }, "Service.ifExistUpdate");
        resolve({ exists: false });
      } catch (e) {
        this._logger.error(e, "Service.ifExistUpdate");
        reject(e);
      }
    });
  }

  /**
   * @description builds key up
   * @private
   * @returns String
   * @memberof ServiceRegistry
   */
  _key(service) {
    const key = `${this._options.prefix}${this._options.delimiter || "::"}`;
    if (!service) return key;
    else return `${key}${service}`;
  }
}

module.exports = ServiceRegistry;
