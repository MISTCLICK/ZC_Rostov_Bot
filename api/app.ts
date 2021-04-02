import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import API from './api';
import authenticationScript from './schema/authenticationScript';
import cleanBooks from './util/cleanBookings';
import fs from 'fs';
import https from 'https';
import { allowedSources } from './security/cfg.json';

export default function createServer() {
  let app = express();

  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use('/v1', API);

  //Automatic action execution
  setInterval(() => cleanBooks(), 1000 * 60);
  
  app.all('/', (_req, res) => res.status(200).send('Hallo!'));
  app.post('/access', async (req, res) => {
    const source = req.body.source;
    const privileges = req.body.privileges;

    if (!source || !allowedSources.find(s => s === source)) {
      return res.status(400).json({
        success: false,
        message: 'Bad Request!'
      });
    }

    let newToken = bcrypt.hashSync(`${source}.${privileges ?? 0}.margarita`, 10).slice(7);

    const newTokenWriting = new authenticationScript({
      token: newToken,
      allowedSource: source,
      privileges: privileges ?? 0
    });

    await newTokenWriting.save().catch((err) => {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error!'
      });
    });
    return res.status(200).json({
      success: true,
      token: newToken,
      allowedSource: source,
      message: 'Your token has been created, but not activated yet. You\'ll be notified, when your token will be ready to use.'
    });
  });
  
  https.globalAgent.options.ca = require('ssl-root-cas').create();

  https.createServer({
    key: fs.readFileSync('/var/www/httpd-cert/www-root/api.veuroexpress.org_le2.key'),
    cert: fs.readFileSync('/var/www/httpd-cert/www-root/server.pem'),
  }, app).listen(5000, () => console.log('Server running on port 5000...'));
}