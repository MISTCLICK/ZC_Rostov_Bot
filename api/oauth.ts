import pendingUsersModel from './schema/pending';
import authScript from '../schema/authSchema';
import axios from 'axios';
import discordClient from '../client';
import { oauthCfg } from '../config.json';
import { Router } from 'express';

let oAuthHandler = Router();

export async function getAuthToken(client_id: string, client_secret: string, code: string, redirect_uri: string) {
  let res = await axios.post('https://auth.vatsim.net/oauth/token', {
    client_id,
    client_secret,
    code,
    redirect_uri,
    grant_type: "authorization_code"
  });

  if (res.data.access_token) {
    return res.data.access_token;
  } else {
    return null;
  }
}

export async function getUserData(access_token: string) {
  let res = await axios.get('https://auth.vatsim.net/api/user', {
    headers: {
      "Authorization": "Bearer " + access_token,
      "Accept" : "application/json",
      "Content-Type": "application/json"
    },
    data: {
      access_token
    }
  });

  if (res.data.data) {
    return res.data.data;
  } else {
    return null;
  }
}

oAuthHandler.post('/', async (req, res) => {
  const discordID = req.body.discordID;
  const guildID = req.body.guildID;

  if (!discordID) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request!'
    });
  }

  const pendingRequests = await pendingUsersModel.find();
  if (pendingRequests.length > 0) {
    return res.status(200).json({
      success: false,
      message: 'There is a pending request already, stand by.'
    });
  }

  const newPendingUser = new pendingUsersModel({
    discordUserID: discordID,
    guildID,
    expires: new Date().getTime() + (1000 * 60 * 5)
  });

  try {
    await newPendingUser.save();
    return res.status(200).json({
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

oAuthHandler.get('/', async (req, res) => {
  const code = req.query.code?.toString();

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Bad Request!'
    });
  }

  try {
    const pendingRequests = await pendingUsersModel.find();

    if (pendingRequests.length !== 1) {
      return res.status(200).json({
        success: false,
        message: 'Something went wrong in the request queue!'
      });
    }

    await pendingUsersModel.findOneAndUpdate({
      discordUserID: pendingRequests[0].discordUserID
    }, {
      code
    }, {
      upsert: false
    });

    const requestedGuild = discordClient.guilds.cache.get(pendingRequests[0].guildID);
    const requestedMember = requestedGuild?.members.cache.get(pendingRequests[0].discordUserID);
    const authToken = await getAuthToken(oauthCfg.client_id, oauthCfg.client_secret, code, oauthCfg.redirect_uri);
    const vatRole = requestedGuild?.roles.cache.find(role => role.name === 'Member');

    if (!vatRole) {
      return res.status(200).json({
        success: false,
        message: 'Something went wrong...'
      });
    }
    
    if (authToken === null) {
      return res.status(200).json({
        success: false,
        message: 'Something went wrong...'
      });
    }

    const vatsimUserData = await getUserData(authToken);

    if (vatsimUserData === null) {
      return res.status(200).json({
        success: false,
        message: 'Something went wrong...'
      });
    }

    if (vatsimUserData.vatsim.rating.id < 1) {
      return res.status(200).json({
        success: false,
        message: 'Your account is either suspended or inactive. Please contact VATSIM Membership department.'
      });
    }

    const newMember = new authScript({
      cid: vatsimUserData.cid,
      discordID: pendingRequests[0].discordUserID,
      guildID: pendingRequests[0].guildID,
      full_vatsim_data: vatsimUserData
    });

    await newMember.save();

    requestedMember?.roles.add(vatRole);
    requestedMember?.setNickname(`${vatsimUserData.personal.name_first} ${vatsimUserData.personal.name_last} - ${vatsimUserData.cid}`).catch(() => null);

    await pendingUsersModel.findOneAndRemove({
      discordUserID: pendingRequests[0].discordUserID
    });

    return res.redirect('https://urrv.me');
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

export { oAuthHandler };
export function clearRequests() {
  pendingUsersModel.remove({
    expires: {
      $lte: new Date().getTime()
    }
  });
}