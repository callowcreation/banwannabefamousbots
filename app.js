require('dotenv').config();

const fs = require('fs');
const tmi = require('tmi.js');

/*
    Basic framework can be found here https://dev.twitch.tv/docs/irc
*/

const opts = {
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: process.env.BOT_USERNAME,
		password: process.env.OAUTH_TOKEN
	},
	channels: [
		process.env.CHANNEL_NAME
	]
};

const client = new tmi.client(opts);

if (module === require.main) {

	client.on('message', onMessageHandler);
	client.on('connected', onConnectedHandler);

	client.connect();
}

async function onMessageHandler(channel, user, message, self) {
	if (self) return;

	const path = ".\\data\\spam-patterns.json";
	const patterns = (JSON.parse(fs.readFileSync(path, 'utf8'))).map(x => x.toLowerCase());

	for (let i = 0; i < patterns.length; i++) {
		const norm = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		if (norm.toLowerCase().includes(patterns[i])) {
			console.log({ channel, user, message });
			return client.timeout(channel, user.username, 1);
		}
	}
}

function onConnectedHandler(addr, port) {
	console.log(`* Connected to ${addr}:${port}`);
}

