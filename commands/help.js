const prefix = require('../config.json');
module.exports = {
	name: 'help',
	description: 'Lista com todos os comandos do bot.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Lista com todos os comandos do bot:');
			data.push(commands.map(command => command.name).join(', '));
			
			return message.channel.send(data, { split: true })
				.then(() => {
					if (message.channel.type === 'dm') return;
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
				});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('Este não é um comando válido.');
		}

		data.push(`**Name:** ${command.name}`);

		if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		message.channel.send(data, { split: true });
	},
};