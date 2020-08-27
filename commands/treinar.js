const Territorios = require('../models/TerritorioModel.js');
const Reinos = require('../models/ReinoModel.js');
const Acoes = require('../models/AcoesModel.js');
const Rodadas = require('../models/RodadaModel.js');

const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'treinar',
    description: 'Para treinar as tropas corretamente digite:\n!treinar quantidade_de_tropas localização',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length != 3) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara treinar corretamente digite:\n!treinar tipodatropa quantidadedetropas localização`);
        } else {

            var Tipos = ["sol", "arq", "a", "arqueiro", "s", "soldado"]

            const tipotropa = args[0].toLowerCase();
            const ntropas = args[1].toLowerCase();
            const loc = args[2].toLowerCase();

            const Territorio = Territorios(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);

            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acao = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${loc}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${loc}` } });
            let destino = await Territorio.findOne({ where: { localizacao: `${loc}` } });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` }, attributes: ['ouro', 'rei', 'nome_reino'], raw: true });

            // Checar se existe ação realizada com esse território.
            if (acao) {
                return message.channel.send(`Já existe uma ação feita para esse território, para treinar tropas nesse território é necessário antes apagar as suas ações. Para apagar sua ação digite !acao apagar`)
            }

            //Check se Tropa existe
            if (!Tipos.includes(tipotropa)) {
                return message.channel.send(`Tipo de tropa inválido`)
            }

            //Check dono do território
            if (dono) {
                //Check de ouro no reino para arqueiro
                if (tipotropa === "arq" || tipotropa === "a" || tipotropa === "arqueiro") {
                    var custototal = parseInt(ntropas) * 2
                    if (custototal <= reino.ouro) {
                        var novas = destino.arqueiros + parseInt(ntropas)
                        console.log(novas);
                        Reino.update({ ouro: reino.ouro - custototal }, { where: { rei: `${message.author.username}` } });
                        Territorio.update({ arqueiros: novas }, { where: { localizacao: `${loc}` } });
                        return message.channel.send(`Tropas treinadas com sucesso`);
                    } else {
                        return message.channel.send(`Você não possui ouro suficiente`);
                    }
                }
                //Check de ouro no reino para soldado
                if (tipotropa === "sol" || tipotropa === "s" || tipotropa === "soldado") {
                    var custototal = parseInt(ntropas)
                    if (custototal <= reino.ouro) {
                        var novas = destino.tropas + parseInt(ntropas)
                        Reino.update({ ouro: reino.ouro - ntropas }, { where: { rei: `${message.author.username}` } });
                        Territorio.update({ tropas: novas }, { where: { localizacao: `${loc}` } });
                        return message.channel.send(`Tropas treinadas com sucesso`);
                    } else {
                        return message.channel.send(`Você não possui ouro suficiente`);
                    }
                }
            } else {
                return message.channel.send(`Você não é o dono do território`)
            }
        }
    },
};