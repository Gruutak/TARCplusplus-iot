'use strict';
import nconf from 'nconf';

//https://docs.microsoft.com/pt-br/azure/iot-hub/iot-hub-node-node-direct-methods

import {Client as EventHubClient} from 'azure-event-hubs';

//const connectionString = 'HostName=AqueleHubLa.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=QkrX/R/Z6N4lVXDaLo4eCSq0xGYgr8NUPuRLLFRj3Qc=';
const connectionString = `HostName=${nconf.get('HOSTNAME')};SharedAccessKeyName=${nconf.get('HUB_ACCESS_KEY_NAME')};SharedAccessKey=${nconf.get('HUB_ACCESS_KEY')}`;


function printError(err) {
	console.log(err.message);
};

function printMessage(message) {
	console.log('Message received: ');
	console.log(JSON.stringify(message.body));
	console.log('');
};

let client = EventHubClient.fromConnectionString(connectionString);

export function openClient() {
	client.open()
	.then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
                console.log(`Created partition receiver: ${partitionId}`)
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
            });
        });
    })
    .catch(printError);
}
