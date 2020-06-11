const Territorios = require('../models/TerritorioModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'treinar',
    description: 'Para treinar as tropas corretamente digite:\n!treinar quantidadedetropas nomedoterritorio',
    async execute(message, args) {
        const { commands } = message.client;
        if (!args.length) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara cadastrar corretamente digite:\n!treinar quantidadedetropas nomedoterritorio`);
        } else {
            
            const ntropas = args[0].toLowerCase();
            const loc = args[1].toLowerCase();
                    
            const Territorio = Territorios(sequelize, Sequelize);

            let temouro = await Territorio.findOne({ where: { localizacao: `${loc}` } });
            
            //let temreino = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${args[0]}` } });
            if (args[0] <= temouro.dataValues.ouro){

                Territorio.update({ouro: temouro.dataValues.ouro - ntropas}, {where: {localizacao: `${loc}`}});
                Territorio.update({tropas: ntropas}, {where: {localizacao: `${loc}`}});
                message.channel.send(`Tropas treinadas com sucesso`);

            } else {

                return message.channel.send(`Você não possui recursos suficiente ou o territorio não é seu`);
            }
        }
    },
};