const {name} = require('./help');
module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {
		message.channel.send('Pong.');
		message.channel.send(message.author.username);
	},
};