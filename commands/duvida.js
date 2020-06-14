module.exports = {
    name: 'duvida',
    description: 'Duvida de uso da 0.1v',
    execute(message, args) {
        message.channel.send('Para utilizar a 0.1v do bot você fará os seguintes passos:\nPrimeiro pegue um território para você utilizando o comando !território\n');
        message.channel.send('O comando !territorio tem 2 argumentos, você digita o comando, depois a localização dele no mapa e em seguida o nome que você gostaria de dar para esse território ex: territorio a1 Neverwinter\n');
        message.channel.send('Quando você cadastrar o seu território corretamente você vai ganhar 10 de ouro\n');
        message.channel.send('O ouro serve para treinar as tropas, para isso digite !treinar e em seguida a quantidade de tropas que você deseja e em seguida a localização, ex: treinar 6 c5\n');
        message.channel.send('Depois das tropas treinadas você deve realizar o ataque, para isso você deve digitar !atacar a localização do se territorio e destino do ataque, ex: atacar a1 b7\n');
        message.channel.send('Nesse primeiro momento não testo se o territorio atacado está adjacente, a lógica desse teste está pronta, mas irá entrar na 0.2v\n');
        message.channel.send('Também não temos a opção de ajudar e uma vez feito o ataque todas as tropas treinadas vão atacar o território alvo\n');
    },
};