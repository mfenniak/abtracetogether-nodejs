const bleno = require('@abandonware/bleno');
const util = require('util');
// const Promise = require("bluebird");

const abTraceTogetherServiceUuid = '70f34cb2888211eabc550242ac130003';
const abTraceTogetherV2CharacteristicUuid = "7bee419e888211eabc550242ac130003";

const name = 'ABTraceTogether-node';
const serviceUuids = [abTraceTogetherServiceUuid];

function startPeripheral(logger) {
  bleno.on('stateChange', async (nobelState) => {
    logger.info('event stateChange', nobelState);
    if (nobelState === 'poweredOn') {
      logger.info('startAdvertising');
      bleno.startAdvertising(name, serviceUuids, (err) => {
        if (err) {
          logger.error(`startAdvertising had error: ${err}`);
        }
      });
    }
  });

  bleno.on('advertisingStart', (err) => {
    if (err) {
      logger.error(`startAdvertising had error: ${err}`);
      return;
    }

    logger.info('advertisingStart received');
    bleno.setServices([
      new bleno.PrimaryService({
        uuid: abTraceTogetherServiceUuid,
        characteristics: [
          new EchoCharacteristic(logger)
        ]
      })
    ], (err) => {
      if (err) {
        logger.error(`setService had error: ${err}`);
      } else {
        logger.info('service set up');
      }
    });
  });
}

const BlenoCharacteristic = bleno.Characteristic;

const EchoCharacteristic = function(logger) {
  EchoCharacteristic.super_.call(this, {
    uuid: abTraceTogetherV2CharacteristicUuid,
    properties: ['read', 'write', 'notify'],
    value: null
  });

  this._value = Buffer.from([]);
  this._updateValueCallback = null;
  this.logger = logger;
};

util.inherits(EchoCharacteristic, BlenoCharacteristic);

EchoCharacteristic.prototype.onReadRequest = function(offset, callback) {
  this.logger.info('onReadRequest received');
  callback(this.RESULT_SUCCESS, this._value);
};

EchoCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  // this.logger.info(`onWriteRequest received: ${data}, ${offset}, ${withoutResponse}`);
  if (data) {
    const traceData = JSON.parse(data);
    this.logger.info(`central wrote at me, type ${traceData.mc} has id ${traceData.id.substr(0,30)}`);
  }
  callback(this.RESULT_SUCCESS);
};

EchoCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  this.logger.info('onSubscribe');
};

EchoCharacteristic.prototype.onUnsubscribe = function() {
  this.logger.info('onUnsubscribe');
};

module.exports = { startPeripheral };
