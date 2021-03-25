const func = require('./funcoes.js');
const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const AcoesBarcos = require('../models/AcoesBarcoModel.js');
const Rodada = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'coletar',
    description: 'Foca o território em produzir riquezas. Na próxima rodada irá conceder ouro a quem for o dono deste território. Quanto mais territórios possuir, menos ouro dará. Para usar digite !coletar território',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length != 1 && args.length != 3) {
            return message.channel.send('Comando utilizado de forma incorreta, digite !coletar território.');
        } else if (args.length == 1) {
            const territorio = args[0].toLowerCase();

            const Acao = Acoes(sequelize, Sequelize);
            const AcaoBarco = AcoesBarcos(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acoes_barco = await AcaoBarco.findAll({ where: { rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }, order: [['rei', 'DESC']], attributes: ['rei'], raw: true });           
            let acoes = await Acao.findAll({ where: { rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }, order: [['rei', 'DESC']], attributes: ['rei'], raw: true });
            let acao = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${territorio}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${territorio}` } });
            let todosterritorios = await Territorio.findAll({ order: [['rei', 'DESC']], attributes: ['rei'], where: { rei: `${message.author.username}` }, raw: true });
            
            var acoes_totais = (acoes_barco ? acoes_barco.length : 0) + (acoes ? acoes.length : 0)

            if (acoes_totais >= func.quantidadeAcoes(todosterritorios.length)) {
                return message.channel.send(`Você atingiu o limite de ações nessa rodada`);
            }

            // //verificando se já existe outra ação para esse território
            // if (acao) {
            //     return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar`);
            // }
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
        } else if (args.length == 3) {

            const territorio = args[0].toLowerCase();

            const Acao = Acoes(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Barco = Barcos(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acoes_barco = await Barco.findAll({ where: { nome_rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }, order: [['rei', 'DESC']], attributes: ['rei'], raw: true });           
            let acoes = await Acao.findAll({ where: { nome_rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }, order: [['rei', 'DESC']], attributes: ['rei'], raw: true });
            let acao = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${territorio}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${territorio}` } });

            var acoes_totais = (acoes_barco ? acoes_barco.length : 0) + (acoes ? acoes.length : 0)

            if (acoes_totais >= func.quantidadeAcoes(todosterritorios.length)) {
                return message.channel.send(`Você atingiu o limite de ações nessa rodada`);
            }
            //verificando se já existe outra ação para esse território
            // if (acao) {
            //     return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar`);
            // }
            //verificando se é o dono do território
            if (dono) {
                Acao.create({
                    rei: `${message.author.username}`,
                    nome_acao: "coletar_barco",
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