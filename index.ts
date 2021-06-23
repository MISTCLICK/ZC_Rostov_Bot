import client, { setupClient } from './client';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import { token } from './config.json';

setupClient();
client.login(token);

process.on('uncaughtException', (err) => fs.appendFileSync(path.join('log', `${moment(new Date().getTime()).utc().format('DD.MM.YYYY')}_log.txt`), `At ${moment(new Date().getTime()).utc().format('DD.MM.YYYY HH:mm:ss')} - ${err.toString()}\n`));
process.on('unhandledRejection', (err) => fs.appendFileSync(path.join('log', `${moment(new Date().getTime()).utc().format('DD.MM.YYYY')}_log.txt`), `At ${moment(new Date().getTime()).utc().format('DD.MM.YYYY HH:mm:ss')} - ${err?.toString()}\n` || `Some promise was rejected at ${moment(new Date().getTime()).utc().format('DD.MM.YYYY HH:mm:ss')}\n`));