const noble = require('@abandonware/noble');
const Promise = require("bluebird");

const abTraceTogetherServiceUuid = '70f34cb2888211eabc550242ac130003';
const abTraceTogetherV2CharacteristicUuid = "7bee419e888211eabc550242ac130003";

function startCentral(logger) {
  noble.on('warning', (msg) => {
    logger.info(`nobel warning: ${msg}`);
  });

  noble.on('stateChange', async (nobelState) => {
    logger.info('event stateChange', nobelState);
    if (nobelState === 'poweredOn') {
      logger.info('action startScanningAsync');
      await noble.startScanningAsync([abTraceTogetherServiceUuid], false);
    }
  });
    
  noble.on('discover', async (peripheral) => {
    logger.info(`event discover peripheral.id ${peripheral.id}`);
    startPeripheralManagement(logger.child({ peripheral: peripheral.id }), peripheral);
  });
}

async function startPeripheralManagement(logger, peripheral) {
  logger.info(`connecting to peripheral ${peripheral.address}`);
  await peripheral.connectAsync();
  logger.info(`connect successful to peripheral ${peripheral.address}`);

  while (true) {
    const { services, characteristics } = await peripheral.discoverAllServicesAndCharacteristicsAsync();
    let foundCharacteristic = false;
    for (const characteristic of characteristics) {
      if (characteristic.uuid !== abTraceTogetherV2CharacteristicUuid) {
        continue;
      }

      const traceDataBuffer = await characteristic.readAsync();
      if (traceDataBuffer.length === 0) {
        logger.info(`characteristic returned no data`);
      } else {
        const traceData = JSON.parse(traceDataBuffer.toString("utf-8"));
        // traceData: {id: string, mp: string (Android|iPhone), o: string (CA_AB), v: int (2)}
        logger.info(`peripheral type ${traceData.mp} has id ${traceData.id.substr(0,30)}`);
      }

      foundCharacteristic = true;
      break;
    }

    if (!foundCharacteristic) {
      logger.info(`peripheral didn't have the trace characteristic`);
    }

    await Promise.delay(30000);
  }
}

module.exports = { startCentral };
