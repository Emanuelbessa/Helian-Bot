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
            var acoes = await Acao.findAll({ where: { nome_acao: ['atacar', 'apoiar'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'apoio', 'tropas', 'rei', 'origem', 'destino'], raw: true });

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
            // Testando quem vai cair no MotivoA para depois testar o MotivoB
            for (var i = 0; i < acoes.length; i++) {
                if (ATACANTES.includes(acoes[i].origem) && DEFENSORES.includes(acoes[i].origem)) {
                    MotivoA.push(acoes[i]);
                }
            }
            // Criando os Relatórios do Motivo A
            for (let i = 0; i < MotivoA.length; i++) {
                let territo = await Territorio.findOne({ where: { localizacao: `${MotivoA[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
                // Ataques PVP recuando por ser atacado
                Relatorio.create({
                    rei: `${MotivoA[i].rei}`,
                    origem: `${MotivoA[i].origem}`,
                    destino: `${MotivoA[i].destino}`,
                    mensagem: '4',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                // Defesa PVP quase ataque sem motivo aparente
                if (territo) {
                    Relatorio.create({
                        rei: `${territo.rei}`,
                        origem: `${MotivoA[i].origem}`,
                        destino: `${MotivoA[i].destino}`,
                        mensagem: '9',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                }

            }
            console.log("Ponto 1");
            // Removendo ações invalidadas pelo motivo A do Array de acoes
            acoes = acoes.filter(function (el, i) {
                return MotivoA.indexOf(el) < 0
            })
            console.log("Ponto 2");

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];

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

            // Começando fase de testes do Motivo B
            let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)

            var defensorduplicado = findDuplicates(DEFENSORES)

            for (var i = 0; i < acoes.length; i++) {
                for (var k = 0; k < defensorduplicado.length; k++) {
                    if (acoes[i].destino == defensorduplicado[k]) {
                        MotivoB.push(acoes[i])
                    }
                }
            }
            // Criando os Relatórios do Motivo B
            for (let i = 0; i < MotivoB.length; i++) {
                let territorio = await Territorio.findOne({ where: { localizacao: `${MotivoB[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
                // Ataque PVP recuando por ter outra nação atacando
                Relatorio.create({
                    rei: `${MotivoB[i].rei}`,
                    origem: `${MotivoB[i].origem}`,
                    destino: `${MotivoB[i].destino}`,
                    mensagem: '5',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                // Defesa PVP quase ataque 2x+
                if (territorio) {
                    Relatorio.create({
                        rei: `${territorio.rei}`,
                        origem: `${MotivoB[i].origem}`,
                        destino: `${MotivoB[i].destino}`,
                        mensagem: '8',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                }

            }
            console.log("Ponto 3");
            // Removendo ações invalidadas pelo motivo B do Array de acoes
            acoes = acoes.filter(function (el, i) {
                return MotivoB.indexOf(el) < 0
            })
            console.log("Ponto 4");


            var app = acoes.filter(function (a) {
                return a.nome_acao == 'atacar'
            })

            //Testando quem vai cair no Motivo C
            for (var i = 0; i < app.length; i++) {
                for (var k = 0; k < APOIADOR.length; k++) {
                    if (app[i].destino == APOIADOR[k]) {
                        MotivoC.push(app[i])
                    }
                }
            }
            // Criando os Relatórios do Motivo C
            for (let i = 0; i < MotivoC.length; i++) {
                // Tentativa de Apoio Falha - Fui atacado
                Relatorio.create({
                    rei: `${MotivoC[i].rei}`,
                    origem: `${MotivoC[i].origem}`,
                    destino: `${MotivoC[i].destino}`,
                    mensagem: '10',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
            }
            console.log("Ponto 5");
            // Removendo ações invalidadas pelo motivo C do Array de acoes
            acoes = acoes.filter(function (el) {
                return MotivoC.indexOf(el) < 0;
            });
            console.log("Ponto 6");

            var apoiadores = acoes.filter(function (a) {
                return a.nome_acao == 'apoiar'
            });

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];
            console.log("Ponto 7");
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

            console.log("Ponto 8");
            // Se o destino do apoio não é origem ou destino de um ataque, bem sucedido / apoiado
            // A conquista PVE deve ser parte do for do PVP, pois existe a possiblidade de alguém apoiar o território vazio

            for (let i = 0; i < apoiadores.length; i++) {
                if (!DEFENSORES.includes(apoiadores[i].destino)) {
                    let sup = await Territorio.findOne({ where: { localizacao: `${apoiadores[i].destino}` }, attributes: ['localizacao', 'rei'], raw: true });
                    Relatorio.create({
                        rei: `${apoiadores[i].rei}`,
                        origem: `${apoiadores[i].origem}`,
                        destino: `${apoiadores[i].destino}`,
                        mensagem: '11',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    Relatorio.create({
                        rei: `${sup.rei}`,
                        origem: `${apoiadores[i].origem}`,
                        destino: `${apoiadores[i].destino}`,
                        mensagem: '13',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                }
            }
            var atacantes = acoes.filter(function (a) {
                return a.nome_acao == 'atacar'
            });
            //
            console.log("Ponto 9");
            var testando = await Territorio.findOne({ where: { localizacao: `d3` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
            // PVPs que de fato aconteceram
            for (let i = 0; i < acoes.length; i++) {
                if (acoes[i].nome_acao == 'atacar') {
                    var terr = await Territorio.findOne({ where: { localizacao: acoes[i].destino }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });

                    var ataque = acoes[i].tropas
                    if (terr) {
                        var defesa = terr.tropas
                    } else {
                        var defesa = 0
                    }
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
                        if (!terr) {
                            // Primeiro Caso de ataque Bem sucedido, PVE
                            Relatorio.create({
                                rei: `${acoes[i].rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '1',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                            let terr2 = await Territorio.findOne({ where: { localizacao: `${acoes[i].origem}` }, attributes: ['localizacao', 'tropas', 'rei', 'nome_territorio'], raw: true });
                            Territorio.create({
                                localizacao: `${acoes[i].destino}`,
                                rei: `${acoes[i].rei}`,
                                nome_territorio: `${terr2.nome_territorio}`,
                                tropas: `0`
                            });
                            Reino.increment('ouro', { by: 6, where: { nome_reino: `${terr2.nome_territorio}` } });
                        } else {
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
                        }
                        if (apoiodef) {
                            auxdef.forEach(function (t, indice) {
                                if (terr) {
                                    Relatorio.create({
                                        rei: `${terr.rei}`,
                                        origem: `${t.origem}`,
                                        destino: `${acoes[i].destino}`,
                                        mensagem: '13',
                                        rodada: `${rodadaatual[0].rodada_atual}`
                                    });
                                }
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


                            var prejuizo = defesa

                            console.log('ponto 10');
                            while (prejuizo >= 1) {

                                if (acoes[i].tropas != 0) {
                                    acoes[i].tropas--
                                    prejuizo--
                                }

                                for (let q = 0; q < auxatq.length; q++) {
                                    if (prejuizo >= 1 && auxatq[q].tropas >= 1) {
                                        auxatq[q].tropas--
                                        prejuizo--
                                    }
                                }
                            }
                            //Pode melhorar performance, att mesmo com def = 0
                            auxatq.forEach(function (n, i) {
                                Territorio.update({
                                    tropas: `${n.tropas}`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })

                            Territorio.update({
                                tropas: `${acoes[i].tropas}`
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
                        if (terr) {
                            Relatorio.create({
                                rei: `${terr.rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '6',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                        }
                        if (apoiodef) {
                            auxdef.forEach(function (t, indice) {
                                if (terr) {
                                    Relatorio.create({
                                        rei: `${terr.rei}`,
                                        origem: `${t.origem}`,
                                        destino: `${acoes[i].destino}`,
                                        mensagem: '13',
                                        rodada: `${rodadaatual[0].rodada_atual}`
                                    });
                                }
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '11',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })

                            var prejuizo = ataque

                            if (!terr) {
                                while (prejuizo >= 1) {
                                    for (let q = 0; q < auxdef.length; q++) {
                                        auxdef[q].tropas--
                                        prejuizo--
                                    }
                                }
                            } else {
                                while (prejuizo >= 1) {

                                    if (terr.tropas != 0) {
                                        terr.tropas--
                                        prejuizo--
                                    }
                                    for (let q = 0; q < auxdef.length; q++) {
                                        if (prejuizo >= 1 && auxdef[q].tropas >= 1) {
                                            auxdef[q].tropas--
                                            prejuizo--

                                        }
                                    }
                                }
                            }

                            auxdef.forEach(function (n, i) {
                                Territorio.update({
                                    tropas: `${n.tropas}`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })
                            if (terr) {
                                Territorio.update({
                                    tropas: `${terr.tropas}`
                                }, {
                                    where: { localizacao: `${acoes[i].destino}` }
                                });
                            }

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
}