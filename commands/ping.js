module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {

		message.channel.send('Pong.');
		message.channel.send(message.author.username);

		//message.channel.send('&mapa');

	},
};