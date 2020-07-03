const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Relatorios = require('../models/RelatorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'fecharrodada',
    description: 'Para treinar corretamente digite:\n!fecharrodada  para fechar a rodada',
    async execute(message, args) {
        const { commands } = message.client;
        if (message.author.username != "Emanuel") {
            return message.channel.send('Você não tem permissão para usar o comando')
        } else {

            const Acao = Acoes(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Relatorio = Relatorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);

            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acoes = await Acao.findAll({ where: { nome_acao: ['atacar', 'apoiar'] }, attributes: ['id_acao', 'tropas', 'rei', 'origem', 'destino', 'nome_acao'], raw: true });

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];
            var MotivoA = [];
            var MotivoB = [];

            for (var i = 0; i < acoes.length; i++) {

                if (acoes[i].nome_acao == 'atacar') {
                    ATACANTES.push(acoes[i].origem);
                    DEFENSORES.push(acoes[i].destino);
                }

                if (acoes[i].nome_acao == 'apoiar') {

                    APOIADOR.push(acoes[i].origem);
                    APOIADO.push(acoes[i].destino);
                }
            }

            for (var i = 0; i < acoes.length; i++) {

                if (ATACANTES.includes(acoes[i].origem) && DEFENSORES.includes(acoes[i].origem)) {
                    MotivoA.push(acoes[i]);
                }
            }

            let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)

            var defensorduplicado = findDuplicates(DEFENSORES)

            let MotB = await Acao.findAll({ where: { nome_acao: ['atacar'], destino: defensorduplicado }, attributes: ['id_acao', 'tropas', 'rei', 'origem', 'destino', 'nome_acao'], raw: true });

            for (var i = 0; i < acoes.length; i++) {

                for (var k = 0; k < defensorduplicado.length; k++) {
                    if (acoes[i].destino == defensorduplicado[k]) {

                        MotivoB.push(acoes[i])
                    }
                }
            }

            for (var i = 0; i < acoes.length; i++) {
                let territorio = await Territorio.findOne({ where: { localizacao: `${acoes[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });

                if (MotivoA.includes(acoes[i])) {
                    Relatorio.create({
                        rei: `${acoes[i].rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: `Enquanto se preparava para o ataque, seus batedores avistaram tropas em sua direção e por isso suas tropas ficaram na cidade para se defender`,
                        rodada: `${rodadaatual.rodada_atual}`
                    });
                } else if (MotivoB.includes(acoes[i])) {
                    Relatorio.create({
                        rei: `${acoes[i].rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: `Suas tropas decidiram recuar, pois encontraram outra nação marchando na mesma direção. Prudência é sempre bom`,
                        rodada: `${rodadaatual.rodada_atual}`
                    });
                    Relatorio.create({
                        rei: `${territorio.rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: `Foram vistos exércitos da nação ${acoes[i].origem} marchando em nossa direção mas retornaram devido a presença de outras tropas`,
                        rodada: `${rodadaatual.rodada_atual}`
                    });
                } else {

                    if (!territorio) {
                        // Primeiro Caso de ataque Bem sucedido, PVE
                        Relatorio.create({
                            rei: `${acoes[i].rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: `O território **${acoes[i].destino}** está vazio e não possui Rei. Você conseguiu consquistar seu PVE safado **${acoes[i].rei}**`,
                            rodada: `${rodadaatual.rodada_atual}`
                        });
                        Territorio.create({
                            localizacao: `${acoes[i].destino}`,
                            rei: `${acoes[i].rei}`,
                            nome_territorio: `MudeDepois`,
                            ouro: `6`,
                            tropas: `0`
                        });
                        continue;
                    }

                    if (acoes[i].tropas > territorio.tropas) {
                        Relatorio.create({
                            rei: `${acoes[i].rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: `Você conseguiu realizar o ataque e se saiu vencedor. Parabens pelo novo território`,
                            rodada: `${rodadaatual.rodada_atual}`
                        });
                        Relatorio.create({
                            rei: `${territorio.rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: `Você foi atacado e não é mais o dono desse território. Que pena`,
                            rodada: `${rodadaatual.rodada_atual}`
                        });
                        var novastropas = acoes[i].tropas - territorio.tropas
                        Territorio.update({
                            tropas: `${novastropas}`
                        }, {
                            where: { localizacao: `${acoes[i].origem}` }
                        });
                        Territorio.update({
                            rei: `${acoes[i].rei}`,
                            tropas: `0`
                        }, {
                            where: { localizacao: `${acoes[i].destino}` }
                        });
                    } else {
                        Relatorio.create({
                            rei: `${acoes[i].rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: `Você realizou o ataque, entretanto perdeu todas as tropas. Cuidado com a vingança...`,
                            rodada: `${rodadaatual.rodada_atual}`
                        });
                        Relatorio.create({
                            rei: `${territorio.rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: `Você foi atacado e suas tropas resistiram bravamente, tome cuidado, um novo ataque pode acontecer a qualquer momento`,
                            rodada: `${rodadaatual.rodada_atual}`
                        });
                        var novastropas2 = territorio.tropas - acoes[i].tropas
                        Territorio.update({
                            tropas: `0`
                        }, {
                            where: { localizacao: `${acoes[i].origem}` }
                        });
                        Territorio.update({
                            rei: `${acoes[i].rei}`,
                            tropas: `${novastropas2}`
                        }, {
                            where: { localizacao: `${acoes[i].destino}` }
                        });
                    }
                }
            }
            console.log("Estou aqui");
            console.log(rodadaatual[0].rodada_atual);
            console.log(rodadaatual);
            Rodada.update({
                rodada_atual: `${rodadaatual[0].rodada_atual}` + 1,
            }, {
                where: { id_rodada: 1 }
            });
            
            
        }

        message.channel.send(`Rodada encerrada, utilize os comandos !cenario e !relatorio para maiores informações`);
    },
};