const { createLogger, format, transports } = require('winston');

const { combine, timestamp, label, printf } = format;
const myFormat = printf(({ mode, message, peripheral, timestamp }) => {
  return `${timestamp} ${mode}/${peripheral || 'root'} ${message}`;
});
const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'index.log' })
  ]
});

// const central = require('./central.js');
// central.startCentral(logger.child({ mode: 'central' }));

const peripheral = require('./peripheral.js');
peripheral.startPeripheral(logger.child({ mode: 'peripheral' }));
