const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'atacar',
    description: 'Para treinar corretamente digite:\n!atacar origem destino',
    async execute(message, args) {
        const { commands } = message.client;
        if (!args.length || args.length > 2 || args.length == 1) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara cadastrar corretamente digite:\n!atacar origem destino`);
        } else {
            
            const origem = args[0].toLowerCase();
            const destino = args[1].toLowerCase();
                    
            const Acao = Acoes(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);

            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${origem}` } });
            let ataque = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${origem}` } });
            

            if(ataque){
                return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar`);
            }
            
            if (dono){
                Acao.create({
                    nome_acao: "atacar",
                    tropas: `${dono.dataValues.tropas}`,
                    origem: `${origem}`,
                    destino: `${destino}`,
                    rei: `${message.author.username}`,
                });
                message.channel.send(`Ação de ataque registrada`);

            } else {

                return message.channel.send(`Você não possui recursos suficiente ou o territorio não é seu`);
            }
        }
    },
};