import Commando from 'discord.js-commando';
import mongoose from 'mongoose';
import path from 'path';
import createServer from './api/app';
import autoUpdateBooks from './util/autoUpdateBooks';
import autoNotifyATC from './util/autoNotifyATC';
import { token, mongoURI } from './config.json';

const client = new Commando.CommandoClient({
  owner: ['349553169035952140'],
  commandPrefix: '?'
});

client.once('ready', async () => {
  if (!mongoURI) throw new Error('Bot error > No MongoDB URI provided');
  try {
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true, 
      useFindAndModify: false
    });
    console.log('MongoDB connection successfully established.');
  } catch (err) {
    console.error('ERROR: MongoDB connection failed.');
    console.error(err);
  }

  try {
    createServer();
  } catch (err) {
    console.error('Express server couldn\'t start...');
    console.error(err);
  }

  //Automatic action functions
  autoUpdateBooks(client);
  autoNotifyATC(client);

  console.log(`${client.user?.username} is ready to perform their duties.`);
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['aviation', 'Разные команды связанные с авиацией'],
    ['admin', 'Команды для администраторов'],
    ['vatsim', 'Команды связаные с сетью VATSIM'],
    ['misc', 'Посторонние команды']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    ping: false,
    unknownCommand: false,
    prefix: false
  })
  .registerCommandsIn(path.join(__dirname, 'cmds'));

client.on('unknownCommand', m => console.log(`${m.author.username} tried to use an unknown command: "${m.content}"`));

client.login(token);