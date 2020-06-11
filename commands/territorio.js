const Territorios = require('../models/TerritorioModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'territorio',
    description: 'Para cadastrar corretamente digite:\n!territorio nomedoterritorio nomedoreino',
    async execute(message, args) {
        const { commands } = message.client;
        if (!args.length) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara cadastrar corretamente digite:\n!novoreino nomedoreino`);
        } else {

            const loc = args[0].toLowerCase();          
            const tirar = args.shift();           
            const name = args.join(" ");

            const Territorio = Territorios(sequelize, Sequelize);
            let temdono = await Territorio.findOne({ where: { localizacao: `${args[0]}` } });
            //let temreino = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${args[0]}` } });
            if (temdono){
                return message.channel.send(`Territorio já dominado`);
            } else {

                Territorio.create({
                    localizacao: `${loc}`,
                    rei: `${message.author.username}`,
                    nome_territorio: `${name}`,
                    ouro: `10`

                });

                return message.channel.send(`Territorio dominado com sucesso!\nO nome dele é: **${name}**\ne está localizado em: **${loc}**`);
            }
        }
    },
};