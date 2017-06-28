'use strict';

//https://docs.microsoft.com/pt-br/azure/iot-hub/iot-hub-node-node-direct-methods

import './setup-config';
import Mqtt from 'azure-iot-device-mqtt';
import {Client as DeviceClient} from 'azure-iot-device';

var connectionString = 'HostName=AqueleHubLa.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=QkrX/R/Z6N4lVXDaLo4eCSq0xGYgr8NUPuRLLFRj3Qc=';
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

function onWriteLine(request, response) {
    console.log(request.payload);

    response.send(200, 'Input was written to log.', function(err) {
        if(err) {
            console.error('An error ocurred when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.' );
        }
    });
}

client.open(function(err) {
    if (err) {
        console.error('could not open IotHub client');
    }  else {
        console.log('client opened');
        client.onDeviceMethod('writeLine', onWriteLine);
    }
});
