'use strict';
import nconf from 'nconf';
import { Client as EventHubClient } from 'azure-event-hubs';
import logger from './logger';
import Twitter from 'twitter';

export class Receiver {
	constructor() {
		const connectionString = `HostName=${nconf.get('HOSTNAME')};SharedAccessKeyName=${nconf.get('HUB_ACCESS_KEY_NAME')};SharedAccessKey=${nconf.get('HUB_ACCESS_KEY')}`;

		this.client = EventHubClient.fromConnectionString(connectionString);

		this.twitter_client = new Twitter({
			consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
			consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
			access_token_key: nconf.get('TWITTER_ACCESS_TOKEN_KEY'),
			access_token_secret: nconf.get('TWITTER_ACCESS_TOKEN_SECRET')
		});

		this.twitter_client.stream('statuses/filter', {track: 'EnchenteSorocaba'}, function(stream) {
  			stream.on('data', function(event) {
  				console.log(event && event.text);
  			});
   			stream.on('error', function(error) {
  				throw error;
  			});
  		});

  		this.twitter_client.stream('statuses/filter', {track: 'TerremotoSorocaba'}, function(stream) {
  			stream.on('data', function(event) {
  				console.log(event && event.text);
  			});
   			stream.on('error', function(error) {
  				throw error;
  			});
  		});

	}

	printError(err) {
		logger.error(err.message);
	}

	printMessage(message) {
		logger.warn(`Message received: ${JSON.stringify(message.body)}`);
	}

	run() {
		let that = this;
		let client = this.client;
		client.open()
		.then(client.getPartitionIds.bind(client))
	    .then(function (partitionIds) {
	        return partitionIds.map(function (partitionId) {
	            return client.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
	                logger.info(`Created partition receiver: ${partitionId}`)
	                receiver.on('errorReceived', that.printError);
	                receiver.on('message', that.printMessage);
	            });
	        });
	    })
	    .catch(this.printError);
	}
}
