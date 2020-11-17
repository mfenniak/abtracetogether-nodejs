# abtracetogether-nodejs

This is a node.js console application that provides a Bluetooth Low Energy (BLE) Central and Peripheral implementation that acts similarly to the ABTraceTogether COVID-19 contact tracing iPhone & Android applicaton from the Alberta Government.

## Running

```
npm install
node index.js
```

Developed and tested on macOS.  The BLE libraries used say they support other OSes, but I haven't confirmed any.

## Central Mode

To use: uncomment the two lines of code for Central apps in index.js.  Best to only use one at a time or else the data gets confusing, but both do work in parallel.

How it works:

- Scans for peripheral devices running ABTraceTogether
- When it finds one, it performs a "read" operation on the contact tracing characteristic.

Expected behavior: Every time it reads from a peripheral, it should output a message line "peripheral type iPhone has id {...}", with a truncated ID message.  If this is appearing, then a well-functioning central ABTraceTogether app would successfully record an exposure.

Unexpected behavior: The id "{...}" should never appear consistently for more than 15 minutes.  If it does, this means that the peripheral device is not rotating its TempIDs, and it is subject to long-term tracking.

Unexpected behavior: The message "characteristic returned no data" means that the peripheral is not successfully returning a TempID, and therefore expoure cannot be recorded on the central device.

## Peripheral Mode

To use: uncomment the two lines of code for Peripheral apps in index.js.  Best to only use one at a time or else the data gets confusing, but both do work in parallel.

How it works:

- Advertises itself as an ABTraceTogether app
- Well-functioning central devices should reach out, read from, and write to, the contact tracing characteristic with their IDs

Expected behavior: Every time a central finds this app, it should perform a "read" followed by a "write".  The read will be displayed as "onReadRequest received", and the write will be displayed as "central wrote at me, type (iPhone/Android) has id {...}".  For every ABTraceTogether app in proximity to the desktop, you should see both messages appear frequently.

Unexpected behavior: The id "{...}" should never appear consistently for more than 15 minutes.  If it does, this means that the peripheral device is not rotating its TempIDs, and it is subject to long-term tracking.

Unexpected behavior: Devices in proximity should never stop reading and writing.  This indicates a failure of some nature on them.

## License

This code is released under the terms of the GNU GPL.

## Contributions

This is rough test code.  I'd welcome contributions to make it cooler, or test better, or work with other contact tracing apps (COVID Alert?).
