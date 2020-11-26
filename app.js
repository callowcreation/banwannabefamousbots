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

const COMMAND_PREFIX = '!';

const commands = {
	'join': async ({ channel, user }) => {
		let target = channel.substr(1);
		if (target !== process.env.CHANNEL_NAME) return;

		try {
			await client.join(user.username);
			await client.say(target, `@${user.username} ${process.env.BOT_USERNAME} is joining your channel, please KIT.`);
		
			const path = ".\\data\\channels.json";
			const channels = (JSON.parse(fs.readFileSync(path, 'utf8'))).map(x => x.toLowerCase());
			if(channels.includes(user.username) === false) {
				channels.push(user.username);
				fs.writeFileSync(path, JSON.stringify(channels));
			}
		} catch (error) {
			console.log(error);
		}
	},
	'leave': async ({ channel, user }) => {
		let target = channel.substr(1);
		if (target !== user.username && target !== process.env.CHANNEL_NAME) return;

		try {
			target = target === process.env.CHANNEL_NAME ? process.env.CHANNEL_NAME : user.username;
			await client.part(user.username);
			await client.say(target, `@${user.username} ${process.env.BOT_USERNAME} is leaving your channel, please KIT.`);
			
			const path = ".\\data\\channels.json";
			let channels = (JSON.parse(fs.readFileSync(path, 'utf8'))).map(x => x.toLowerCase());
			if(channels.includes(user.username) === true) {
				channels = channels.filter(x => x !== user.username);
				fs.writeFileSync(path, JSON.stringify(channels));
			}
		} catch (error) {
			console.log(error);
		}
	}
};

if (module === require.main) {

	client.on('message', onMessageHandler);
	client.on('connected', onConnectedHandler);

	client.connect();
}

async function onMessageHandler(channel, user, message, self) {
	await Promise.all([
		onSpamHandler(channel, user, message, self),
		onCommandHandler(channel, user, message, self)
	]);
}

async function onSpamHandler(channel, user, message, self) {
	if (self) return;

	const path = ".\\data\\spam-patterns.json";
	const patterns = (JSON.parse(fs.readFileSync(path, 'utf8'))).map(x => x.toLowerCase());

	for (let i = 0; i < patterns.length; i++) {
		const norm = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		if (norm.toLowerCase().includes(patterns[i])) {
			console.log({ channel, user, message });
			
			const path = ".\\data\\messages.json";
			const messages = (JSON.parse(fs.readFileSync(path, 'utf8')));
			messages.push({ channel, user, message });
			fs.writeFileSync(path, JSON.stringify(messages));

			if(user.badges.broadcaster == '1' || user.mod === true) return;
			return client.timeout(channel, user.username, 1);
		}
	}
}

async function onCommandHandler(channel, user, message, self) {
	if (self) return;
	if (!message.startsWith(COMMAND_PREFIX)) return;

	const parts = message.trim().split(' ');
	const command = parts.shift().replace(COMMAND_PREFIX, '');
	const params = parts;

	if (commands.hasOwnProperty(command)) {
		const result = await commands[command]({ channel, user, message, command, params });
		console.log({ command, result: result || 'No result' });
	}
}

async function onConnectedHandler(addr, port) {
	console.log(`* Connected to ${addr}:${port}`);
	
	const path = ".\\data\\channels.json";
	const channels = (JSON.parse(fs.readFileSync(path, 'utf8'))).map(x => x.toLowerCase());

	for (let i = 0; i < channels.length; i++) {
		const channel = channels[i];
		const result = await client.join(channel);
		console.log(result);
	}
}
/*

12:075-Month Subscriber (3-Month Badge)MisterSyntax: now all we need is a json database that we keep on github aswell @caLLowCreation


*/