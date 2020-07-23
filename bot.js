// fs é um modulo do Node que ajuda com arquivos
// discord.js é a lib do discord e config vai pegar as variáveis do arquivo pra utilizar aqui. Basicamente, quase sempre que vocês olharem para
//essa estrutura imaginem uma importação
const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
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
  //Reinos.sync();
});


client.on('message', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (!client.commands.has(command)) return;
  
  client.commands.get(command).execute(message, args);
  
});

client.login(token);