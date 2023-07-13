const Discord = require('discord.js');
const { Client, WebhookClient, GatewayIntentBits, Partials } = require('discord.js');
const weeknumber = require('weeknumber');

const client = new Client({
  partials: [Partials.Channel],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
  ],
});

const config = {
  prefix: '!',
  webhook: {
    id: '1128419134540087299',
    token: 'adFafAhTW84K1x9ZH4IiDgkA6qz_qry7qbc_4d0drvIHOPDznuhUqG2sKJLxfZ6_wLEw',
  },
};

client.once('ready', () => {
  console.log('Bot está online!');

  const meuUsuario = 'devdinho';

  client.user.setActivity(`Desenvolvido por ${meuUsuario}`, { type: 'PLAYING' });
  client.user.setStatus('online');
});



// Variáveis para controle das horas semanais
const tempoPorSemana = {}; // Armazena as horas semanais de cada usuário
let semanaAtual = getSemanaAtual(); // Identifica a semana atual
const usuariosEmServico = new Map();

client.on('messageCreate', message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'entrar') {
    const user = message.author;
    const hora = new Date().toLocaleTimeString();

    if (usuariosEmServico.has(user.id)) {
      sendWebhookMessage(
        `**__[Negado]❌__**\n**Usuária(o): <@${user.id}>**\n**Você já está em serviço.**`
      );
    } else {
      usuariosEmServico.set(user.id, Date.now());

      sendWebhookMessage(
        `**__[Entrou em serviço]✅__**\n**Usuária(o): <@${user.id}>**\n**Horário: ${hora}**`
      );
    }
  }

  if (command === 'sair') {
    const user = message.author;
    const hora = new Date().toLocaleTimeString();

    if (usuariosEmServico.has(user.id)) {
      const tempoEmServico = Date.now() - usuariosEmServico.get(user.id);
      tempoPorSemana[user.id] = (tempoPorSemana[user.id] || 0) + tempoEmServico;

      usuariosEmServico.delete(user.id);

      const tempoTotalFormatado = formatarTempo(tempoPorSemana[user.id]);

      sendWebhookMessage(
        `**__[Saiu de serviço]✅__**\n**Usuária(o): <@${user.id}>**\n**Horário: ${hora}**\n**__Tempo total de serviço: ${tempoTotalFormatado}__**`
      );
    } else {
      sendWebhookMessage(
        `**__[Negado]❌__**\n**Usuária(o): <@${user.id}>**\n**__HAHAHAHA! Engraçadinha(o), né? Não tente burlar o sistema. Você não está em serviço!__**`
      );
    }
  }

  if (command === 'tempototal') {
    const users = Object.keys(tempoPorSemana);

    // Verifica se a semana atual é diferente da semana armazenada
    if (semanaAtual !== getSemanaAtual()) {
      semanaAtual = getSemanaAtual(); // Atualiza a semana armazenada
      // Reinicia o tempo total para todos os usuários
      for (const user of users) {
        tempoPorSemana[user] = 0;
      }
    }

    let messageContent = '';
    for (const user of users) {
      const tempoTotalFormatado = formatarTempo(tempoPorSemana[user]);
      messageContent += `<@${user}>: ${tempoTotalFormatado}\n`;
    }

    message.reply(`**Tempo total de horas na semana ${semanaAtual}:**\n\n${messageContent}`);
  }
});

async function sendWebhookMessage(content) {
  try {
    const webhook = new WebhookClient({
      id: config.webhook.id,
      token: config.webhook.token,
    });

    await webhook.send({
      content: content,
    });

    //console.log('Mensagem enviada com sucesso');
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
  }
}

function formatarTempo(tempo) {
  const horas = Math.floor(tempo / 3600000);
  const minutos = Math.floor((tempo % 3600000) / 60000);
  const segundos = Math.floor((tempo % 60000) / 1000);

  return `${horas}h ${minutos}m ${segundos}s`;
}

function getSemanaAtual() {
  const dataAtual = new Date();
  const semanaAtual = weeknumber.weekNumber(dataAtual);

  return semanaAtual;

};

client.login('MTEyODQwNTQ1MzM0OTU5NzIzNQ.GtXGBf.eQlkoNuiLCTanl7-d-3TvilJgYMGtdLqBKqia0');
