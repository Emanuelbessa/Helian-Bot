module.exports = {
    name: 'mapa',
    description: 'Manda o mapa',
    execute(message, args) {

        message.channel.send('Mapa do jogo\n');
        message.channel.send('\n', {files: ["https://trello-attachments.s3.amazonaws.com/5eb2f41abd6e80113f281250/1000x666/e11e667d7b0e9c6117b816192370eef3/Mapa.png"]});
    },
};