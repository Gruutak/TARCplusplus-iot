`use strict`;
import nconf from 'nconf';
import { Client as EventHubClient } from 'azure-event-hubs';
import logger from './logger';
import Twitter from 'twitter';
import moment from 'moment';

export class Receiver {
	constructor() {
		const connectionString = `HostName=${nconf.get(`HOSTNAME`)};SharedAccessKeyName=${nconf.get(`HUB_ACCESS_KEY_NAME`)};SharedAccessKey=${nconf.get(`HUB_ACCESS_KEY`)}`;

		this.client = EventHubClient.fromConnectionString(connectionString);

		this.twitter_client = new Twitter({
			consumer_key: nconf.get(`TWITTER_CONSUMER_KEY`),
			consumer_secret: nconf.get(`TWITTER_CONSUMER_SECRET`),
			access_token_key: nconf.get(`TWITTER_ACCESS_TOKEN_KEY`),
			access_token_secret: nconf.get(`TWITTER_ACCESS_TOKEN_SECRET`)
		});

		this.tilt_warnings = 0;
		this.tilt_warning_timer;
	}

	printError(err) {
		logger.error(err.message);
	}


	run() {
		let that = this;
		let client = this.client;

		const flood_tags_for_alert = 2;
		const flood_alert_interval = 3600000;

		let flood_warning_tags = 0;
		let flood_warning_timer;

		const tremor_tags_for_alert = 2;
		const tremor_alert_interval = 3600000;

		let tremor_warning_tags = 0;
		let tremor_warning_timer;

		this.twitter_client.stream(`statuses/filter`, {track: `EnchenteSorocaba`}, function(stream) {
  			stream.on(`data`, function(event) {
				clearTimeout(flood_warning_timer);

				flood_warning_tags++;
				if(flood_warning_tags >= flood_tags_for_alert) {
					logger.warn(`ENCHENTE.`);

					that.twitter_client.post(`statuses/update`, {status: `[${moment().format(`YYYY-MM-DD HH:mm:ss`)}] ALERTA: Enchente em sorocaba!`}, function(error, tweet, response) {
						if (!error) {
							logger.info(`Tweet de alerta de enchente enviado.`);
						}
					});

					flood_warning_tags = 0;
				}

				flood_warning_timer = setTimeout(() => {
					flood_warning_tags = 0;
				}, flood_alert_interval);
  			});

   			stream.on(`error`, function(error) {
  				throw error;
  			});
  		});

  		this.twitter_client.stream(`statuses/filter`, {track: `TerremotoSorocaba`}, function(stream) {
  			stream.on(`data`, function(event) {
				clearTimeout(tremor_warning_timer);

				tremor_warning_tags++;
				if(tremor_warning_tags >= tremor_tags_for_alert) {
					logger.warn(`TERREMOTO.`);
					that.twitter_client.post(`statuses/update`, {status: `[${moment().format(`YYYY-MM-DD HH:mm:ss`)}] ALERTA TWEET: Terremoto em Sorocaba!`}, function(error, tweet, response) {
						if (!error) {
							logger.info(`Tweet de alerta de terremoto enviado.`);
						}
					});
					tremor_warning_tags = 0;
				}

				tremor_warning_timer = setTimeout(() => {
					tremor_warning_tags = 0;
				}, tremor_alert_interval);
  			});

   			stream.on(`error`, function(error) {
  				throw error;
  			});
  		});

		client.open()
		.then(client.getPartitionIds.bind(client))
	    .then(function (partitionIds) {
	        return partitionIds.map(function (partitionId) {
	            return client.createReceiver(`$Default`, partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
	                logger.info(`Created partition receiver: ${partitionId}`)
	                receiver.on(`errorReceived`, that.printError);
	                // receiver.on(`message`, that.handleMessage);
	                receiver.on(`message`, (message) => {
	                	logger.warn(`Message received: ${JSON.stringify(message.body)}`);

						const tilts_for_alert = 1;
						const tilt_interval = 10000;

						if(message.body.tilt == true) {
							clearTimeout(that.tilt_warning_timer);
							that.tilt_warnings++;

							if(that.tilt_warnings >= tilts_for_alert) {
								that.twitter_client.post(`statuses/update`, {status: `[${moment().format(`YYYY-MM-DD HH:mm:ss`)}] ALERTA SENSOR: Terremoto em Sorocaba!`}, function(error, tweet, response) {
									if (!error) {
										logger.info(`Tweet de alerta de terremoto enviado.`);
									}
								});

								that.tilt_warnings = 0;
							}

							that.tilt_warning_timer = setTimeout(() => {
								that.tilt_warnings = 0;
							}, that.tilt_warning_timer);
						}
	                });
	            });
	        });
	    })
	    .catch(this.printError);
	}
}
