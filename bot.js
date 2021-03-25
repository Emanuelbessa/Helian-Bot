// fs é um modulo do Node que ajuda com arquivos
// discord.js é a lib do discord e config vai pegar as variáveis do arquivo pra utilizar aqui. Basicamente, quase sempre que vocês olharem para
//essa estrutura imaginem uma importação
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token, prefix2 } = require('./config.json');
const Sequelize = require('sequelize');
const config = require('./database');

//Instanciando as classes do discord
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Conexão com o banco de dados
const sequelize = new Sequelize(config);

// Teste de Conexão
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

//Comando para "Ligar" o bot
client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity(`Pronto para o Combate!`);
  // client.channels.fetch('728760255152128060')
  // .then(channel => console.log(channel.name))
  // .catch(console.error);
  //console.log(client.channels.cache);

  const channel = client.channels.cache.find(channel => channel.name == 'bot-helian')
  //channel.send('O bot está online @everyone')
  //Reinos.sync();
});

client.on('message', async message => {

  if (message.content.startsWith(prefix2)) {

    const args = message.content.slice(prefix2.length).split(/ +/);
    const command = args.shift().toLowerCase();

    client.commands.get(command).execute(message, args);

  }

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.log(error);
    message.reply('ocorreu um erro nesse comando');
  }
});

client.login(token);