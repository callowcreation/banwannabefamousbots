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
	'join': async ({ channel, user, params }) => {
		let target = channel.substr(1);
		if (target !== process.env.CHANNEL_NAME) return;
		let joinMsgPart = 'is joining';
		if(params.length === 1) {
			user.username = params[0].toLowerCase();
			target = user.username;
			joinMsgPart = 'has joined';
		}
		try {
			await client.join(user.username);
			await client.say(target, `@${user.username} ${process.env.BOT_USERNAME} ${joinMsgPart} your channel, please \\mod ${process.env.BOT_USERNAME} so it can timeout spam bots.`);

			const path = ".\\data\\channels.json";
			const channels = (JSON.parse(fs.readFileSync(path, 'utf8'))).map(x => x.toLowerCase());
			if (channels.includes(user.username) === false) {
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
			await client.say(target, `@${user.username} ${process.env.BOT_USERNAME} is leaving your channel, please KIT.`);
			await client.part(user.username);

			const path = ".\\data\\channels.json";
			let channels = (JSON.parse(fs.readFileSync(path, 'utf8'))).map(x => x.toLowerCase());
			if (channels.includes(user.username) === true) {
				channels = channels.filter(x => x !== user.username);
				fs.writeFileSync(path, JSON.stringify(channels));
			}
		} catch (error) {
			console.log(error);
		}
	},
	'famous': async ({ channel, user }) => {
		let target = channel.substr(1);
		await client.say(target, `@${user.username} I am is keeping ${target} from being famous, if ${target} has given me mod privileges.`);
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

	//if (user.badges && user.badges.broadcaster == '1') return;
	//if (user.mod === true) return;

	try {
		const path = ".\\data\\spam-patterns.json";
		const patterns = (JSON.parse(fs.readFileSync(path, 'utf8'))).map(x => x.toLowerCase());

		for (let i = 0; i < patterns.length; i++) {
			const norm = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
			if (norm.toLowerCase().includes(patterns[i])) {
				console.log({ channel, user, message });

				const path = ".\\data\\messages.json";
				if(fs.existsSync(path)) {
					const messages = (JSON.parse(fs.readFileSync(path, 'utf8')));
					messages.push({ channel, user, message });
					fs.writeFileSync(path, JSON.stringify(messages));
				}

				return client.timeout(channel, user.username, 1)
					.catch(e => console.error(e));
			}
		}
	} catch (error) {
		console.log({ error });
		const target = channel.substr(1);
		await client.say(target, `@${target} I need to be a mod to timeout spam users.`);
	}
}

async function onCommandHandler(channel, user, message, self) {
	if (self) return;
	if (!message.startsWith(COMMAND_PREFIX)) return;

	const parts = message.trim().split(' ').filter(x => x);
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
		try {
			const result = await client.join(channel);
			console.log(result);
		} catch (err) {
			console.error(err);
		}

	}
}
/*

12:075-Month Subscriber (3-Month Badge)MisterSyntax: now all we need is a json database that we keep on github aswell @caLLowCreation


*/