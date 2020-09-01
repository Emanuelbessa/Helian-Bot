const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodada = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'coletar',
    description: 'Foca o território em produzir riquezas. Na próxima rodada irá conceder ouro a quem for o dono deste território. Quanto mais territórios possuir, menos ouro dará. Para usar digite !coletar território',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length != 1) {
            return message.channel.send('Comando utilizado de forma incorreta, digite !coletar território.');
        } else {
            const territorio = args[0].toLowerCase();

            const Acao = Acoes(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acao = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${territorio}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${territorio}` } });

            //verificando se já existe outra ação para esse território
            if (acao) {
                return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar`);
            }
            //verificando se é o dono do território
            if (dono) {
                Acao.create({
                    rei: `${message.author.username}`,
                    nome_acao: "coletar",
                    origem: `${territorio}`,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                return message.channel.send(`Ação de coletar registrada`);
            } else {
                return message.channel.send(`Você não é o dono do território`)
            }
        }
    }
};