const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const {name} = require('./fecharrodada');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'rodadafechada',
    description: 'Para treinar corretamente digite:\n!fecharrodada  para fechar a rodada',
    async execute(message, args) {
        const { commands } = message.client;
        if(message.author.username != 'Emanuel'){
            return message.channel.send('Você não tem permissão para usar o comando')
        }else {

          
        console.log("Start!")
        
		setInterval(function () {
			message.channel.send('Testando help a cada 15s');
			message.channel.send(`&${name}`);
		}, 1000 * 300)
        
        

        }
    },
};