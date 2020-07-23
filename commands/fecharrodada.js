const Acoes = require('../models/AcoesModel.js');
const Reinos = require('../models/ReinoModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Relatorios = require('../models/RelatorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'fecharrodada',
    description: 'Digite:\n!fecharrodada  para fechar a rodada',
    async execute(message, args) {
        const { commands } = message.client;
        if (message.author.username != "Emanuel") {
            return message.channel.send('Você não tem permissão para usar o comando')
        } else {

            const Acao = Acoes(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Relatorio = Relatorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);

            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acoes = await Acao.findAll({ where: { nome_acao: ['atacar', 'apoiar'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'apoio', 'tropas', 'rei', 'origem', 'destino', 'nome_acao'], raw: true });

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];
            var MotivoA = []; // Atacar e Defender
            var MotivoB = []; // 2x No mesmo território
            var MotivoC = []; // Tentativa de Apoio falhou
            /*
            Tipos de relatório:
            1. Ataque sem resistencia (PVE)
            2. Ataques PVP sucesso
            3. Ataques PVP falha
            4. Ataques PVP recuando por ser atacado
            5. Ataque PVP recuando por ter outra nação atacando
            6. Defesa PVP sucesso
            7. Defesa PVP falha
            8. Defesa PVP quase ataque 2x+
            9. Defesa PVP quase ataque sem motivo aparente
            10. Tentativa de Apoio - Fui atacado
            11. Apoios Bem sucedidos
            12. Apoios Mal sucedidos
            13. Apoiado
            */
            console.log(acoes);

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

            console.log(ATACANTES);
            for (var i = 0; i < acoes.length; i++) {
                if (ATACANTES.includes(acoes[i].origem) && DEFENSORES.includes(acoes[i].origem)) {
                    MotivoA.push(acoes[i]);
                }
            }

            let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)

            var defensorduplicado = findDuplicates(DEFENSORES)

            for (var i = 0; i < acoes.length; i++) {
                for (var k = 0; k < defensorduplicado.length; k++) {
                    if (acoes[i].destino == defensorduplicado[k]) {
                        MotivoB.push(acoes[i])
                    }
                }
            }

            for (var i = 0; i < acoes.length; i++) {
                for (var k = 0; k < APOIADOR.length; k++) {
                    if (acoes[i].destino == APOIADOR[k]) {
                        MotivoC.push(acoes[i])
                    }
                }
            }

            for (var i = 0; i < acoes.length; i++) {
                let territorio = await Territorio.findOne({ where: { localizacao: `${acoes[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
                console.log(territorio)
                if (MotivoA.includes(acoes[i])) {
                    // Ataques PVP recuando por ser atacado
                    Relatorio.create({
                        rei: `${acoes[i].rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: '4',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    // Defesa PVP quase ataque sem motivo aparente
                    Relatorio.create({
                        rei: `${territorio.rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: '9',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                } else if (MotivoB.includes(acoes[i])) {
                    // Ataque PVP recuando por ter outra nação atacando
                    Relatorio.create({
                        rei: `${acoes[i].rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: '5',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    // Defesa PVP quase ataque 2x+
                    Relatorio.create({
                        rei: `${territorio.rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: '8',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                } else if (MotivoC.includes(acoes[i])) {
                    // Tentativa de Apoio Falha - Fui atacado
                    Relatorio.create({
                        rei: `${acoes[i].rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: '10',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                } else if (!territorio) {
                    // Primeiro Caso de ataque Bem sucedido, PVE
                    Relatorio.create({
                        rei: `${acoes[i].rei}`,
                        origem: `${acoes[i].origem}`,
                        destino: `${acoes[i].destino}`,
                        mensagem: '1',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    let terri = await Territorio.findOne({ where: { localizacao: `${acoes[i].origem}` }, attributes: ['localizacao', 'tropas', 'rei', 'nome_territorio'], raw: true });
                    Territorio.create({
                        localizacao: `${acoes[i].destino}`,
                        rei: `${acoes[i].rei}`,
                        nome_territorio: `${terri.nome_territorio}`,
                        tropas: `0`
                    });
                    Reino.increment('ouro', { by: 6, where: { nome_reino: `${terri.nome_territorio}` } });
                }
            }

            acoes = acoes.filter(function (el) {
                return MotivoA.indexOf(el) < 0;
            });
            acoes = acoes.filter(function (el) {
                return MotivoB.indexOf(el) < 0;
            });
            acoes = acoes.filter(function (el) {
                return MotivoC.indexOf(el) < 0;
            });


            var apoiadores = acoes.filter(function (a) {
                return a.nome_acao == 'apoiar'
            });

            var atacantes = acoes.filter(function (a) {
                return a.nome_acao == 'atacar'
            });

            // PVPs que de fato aconteceram
            for (var i = 0; i < acoes.length; i++) {
                let terr = await Territorio.findOne({ where: { localizacao: `${acoes[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });

                if (acoes[i].nome_acao === 'atacar') {

                    var ataque = acoes[i].tropas
                    var defesa = terr.tropas
                    var apoioatk = false
                    var apoiodef = false

                    if (APOIADO.includes(acoes[i].destino)) {

                        var auxatq = apoiadores.filter(function (a) {
                            return a.apoio === "ataque" && a.destino == acoes[i].destino
                        });

                        var auxdef = apoiadores.filter(function (a) {
                            return a.apoio === "defesa" && a.destino == acoes[i].destino
                        });

                        if (auxatq.length >= 1) {
                            var a = 0
                            auxatq.forEach(function (t, indice) {
                                a = a + t.tropas
                            })

                            ataque = ataque + a
                            apoioatk = true
                        }

                        if (auxdef.length >= 1) {
                            var d = 0
                            auxdef.forEach(function (t, indice) {
                                d = d + t.tropas
                            })

                            defesa = defesa + d
                            apoiodef = true
                        }
                    }

                    if (ataque > defesa) {
                        Relatorio.create({
                            rei: `${acoes[i].rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: '2',
                            rodada: `${rodadaatual[0].rodada_atual}`
                        });
                        Relatorio.create({
                            rei: `${terr.rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: '7',
                            rodada: `${rodadaatual[0].rodada_atual}`
                        });

                        if (apoiodef) {
                            auxdef.forEach(function (t, indice) {
                                Relatorio.create({
                                    rei: `${terr.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '13',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '12',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })
                            auxdef.forEach(function (v, i) {
                                Territorio.update({
                                    tropas: `0`
                                }, {
                                    where: { localizacao: `${v.origem}` }
                                });
                            })
                        }

                        Territorio.update({
                            rei: `${acoes[i].rei}`,
                            tropas: `0`
                        }, {
                            where: { localizacao: `${acoes[i].destino}` }
                        });

                        if (apoioatk) {
                            auxatq.forEach(function (t, indice) {
                                Relatorio.create({
                                    rei: `${acoes[i].rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '13',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });

                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '11',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })
                            var prejuizo = Math.round(defesa / (auxatq.length + 1))
                            var novastropas = acoes[i].tropas - prejuizo

                            auxatq.forEach(function (n, i) {
                                n.tropas = n.tropas - prejuizo
                                Territorio.update({
                                    tropas: `${n.tropas}`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })

                            Territorio.update({
                                tropas: `${novastropas}`
                            }, {
                                where: { localizacao: `${acoes[i].origem}` }
                            });
                        } else {
                            var novastropas = ataque - defesa
                            Territorio.update({
                                tropas: `${novastropas}`
                            }, {
                                where: { localizacao: `${acoes[i].origem}` }
                            });
                        }
                    } else {
                        // defesa ganhou
                        Relatorio.create({
                            rei: `${acoes[i].rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: '3',
                            rodada: `${rodadaatual[0].rodada_atual}`
                        });
                        Relatorio.create({
                            rei: `${terr.rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: '6',
                            rodada: `${rodadaatual[0].rodada_atual}`
                        });

                        if (apoiodef) {
                            auxdef.forEach(function (t, indice) {
                                Relatorio.create({
                                    rei: `${terr.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '13',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '11',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })

                            var prejuizo = Math.round(ataque / (auxdef.length + 1))
                            var novastropas = terr.tropas - prejuizo

                            auxatq.forEach(function (n, i) {
                                n.tropas = n.tropas - prejuizo
                                Territorio.update({
                                    tropas: `${n.tropas}`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })

                            Territorio.update({
                                tropas: `${novastropas}`
                            }, {
                                where: { localizacao: `${acoes[i].destino}` }
                            });
                        } else {
                            var novastropas = defesa - ataque
                            Territorio.update({
                                tropas: `${novastropas}`
                            }, {
                                where: { localizacao: `${acoes[i].destino}` }
                            });
                        }

                        if (apoioatk) {
                            auxatq.forEach(function (t, indice) {
                                Relatorio.create({
                                    rei: `${acoes[i].rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '13',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '12',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })
                            auxatq.forEach(function (n, i) {

                                Territorio.update({
                                    tropas: `0`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })

                        }

                        Territorio.update({
                            tropas: `0`
                        }, {
                            where: { localizacao: `${acoes[i].origem}` }
                        });

                    }


                }

                var novarodada = parseInt(rodadaatual[0].rodada_atual) + 1;
                Rodada.update({
                    rodada_atual: novarodada,
                }, {
                    where: { id_rodada: 1 }
                });

                return message.channel.send(`Rodada encerrada, utilize os comandos !cenario e !relatorio para maiores informações`);

                // IMPLEMENTAÇÃO SEM FAZER - RELATORIOS DE APOIO QUANDO N EXISTEM ATAQUES
            }
        }
    },
};