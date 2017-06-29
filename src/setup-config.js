import fs from 'fs';
import path from 'path';
import nconf from 'nconf';

// Config
nconf.use(`memory`);
nconf.argv().env();

const confpath = path.join(__dirname, `../config.js`);
if (fs.existsSync(confpath)) {
	nconf.defaults(require(confpath));
}
