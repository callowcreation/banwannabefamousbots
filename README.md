Ban Wanna Be Famous Bots
=======================

Twitch chatbot to help combat the spam from chatbot offering follows and more for sale.

<!-- TOC -->

- [Motivation](#motivation)
- [Features](#features)
- [Installation](#installation)
- [Loading and configuration](#loading-and-configuration)
- [Common Usage](#common-usage)
- [Contact](#contact)

<!-- /TOC -->

## Motivation

If you see messages in you Twitch chat room similar to bellow.

 - Wanna become famous? Buy followers, primes and view...
 - In search of followers, primes and views...

## Features

- Quick setup and usage.

## Installation
[Get an oauth token](https://twitchapps.com/tmi/)

Suggested reading [Getting Started with the Twitch API](https://dev.twitch.tv/docs/irc)

```sh
git clone https://github.com/callowcreation/banwannabefamousbots.git
```

## Loading and configuration
An .env file is required.

Rename .env.sample to .env and replace the values

Example of .env file content:
```sh
BOT_USERNAME=botname
OAUTH_TOKEN=oauth:authtokenhere
CHANNEL_NAME=channelname
```
Create two files:
Navigate to the data folder there should be a spam-patterns.json there.
Create - channels.json
Create - messages.json

The messages.json file is only needed if you want to keep all the messages that was removed from chat.

## Common Usage
Open a command prompt to the banwannabefamousbots directory.
```sh
npm install
```

```sh
node app
```

## Contact
- [Contact caLLowCreation](http://callowcreation.com/home/contact-us/)
- [https://www.twitch.tv/callowcreation](https://www.twitch.tv/callowcreation)
- [https://twitter.com/callowcreation](https://twitter.com/callowcreation)

## License
MIT
