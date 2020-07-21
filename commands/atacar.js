const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
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
            const Rodada = Rodadas(sequelize, Sequelize);

            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${origem}` } });
            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            console.log(rodadaatual[0].rodada_atual)
            let ataque = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${origem}`, rodada: `${rodadaatual[0].rodada_atual}`} });
            

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
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
               return message.channel.send(`Ação de ataque registrada. Para ver suas ações nesta rodada, digite !acao ver`);

            } else {

                return message.channel.send(`Você não possui tropas suficientes ou o territorio não é seu`);
            }
        }
    },
};