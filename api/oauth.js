"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRequests = exports.oAuthHandler = exports.getUserData = exports.getAuthToken = void 0;
const pending_1 = __importDefault(require("./schema/pending"));
const authSchema_1 = __importDefault(require("../schema/authSchema"));
const axios_1 = __importDefault(require("axios"));
const client_1 = __importDefault(require("../client"));
const config_json_1 = require("../config.json");
const express_1 = require("express");
let oAuthHandler = express_1.Router();
exports.oAuthHandler = oAuthHandler;
async function getAuthToken(client_id, client_secret, code, redirect_uri) {
    let res = await axios_1.default.post('https://auth.vatsim.net/oauth/token', {
        client_id,
        client_secret,
        code,
        redirect_uri,
        grant_type: "authorization_code"
    });
    if (res.data.access_token) {
        return res.data.access_token;
    }
    else {
        return null;
    }
}
exports.getAuthToken = getAuthToken;
async function getUserData(access_token) {
    let res = await axios_1.default.get('https://auth.vatsim.net/api/user', {
        headers: {
            "Authorization": "Bearer " + access_token,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        data: {
            access_token
        }
    });
    if (res.data.data) {
        return res.data.data;
    }
    else {
        return null;
    }
}
exports.getUserData = getUserData;
oAuthHandler.post('/', async (req, res) => {
    const discordID = req.body.discordID;
    const guildID = req.body.guildID;
    if (!discordID) {
        return res.status(400).json({
            success: false,
            message: 'Bad Request!'
        });
    }
    const pendingRequests = await pending_1.default.find();
    if (pendingRequests.length > 0) {
        return res.status(200).json({
            success: false,
            message: 'There is a pending request already, stand by.'
        });
    }
    const newPendingUser = new pending_1.default({
        discordUserID: discordID,
        guildID,
        expires: new Date().getTime() + (1000 * 60 * 5)
    });
    try {
        await newPendingUser.save();
        return res.status(200).json({
            success: true
        });
    }
    catch (err) {
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
        const pendingRequests = await pending_1.default.find();
        if (pendingRequests.length !== 1) {
            return res.status(200).json({
                success: false,
                message: 'Something went wrong in the request queue!'
            });
        }
        await pending_1.default.findOneAndUpdate({
            discordUserID: pendingRequests[0].discordUserID
        }, {
            code
        }, {
            upsert: false
        });
        const requestedGuild = client_1.default.guilds.cache.get(pendingRequests[0].guildID);
        const requestedMember = requestedGuild?.members.cache.get(pendingRequests[0].discordUserID);
        const authToken = await getAuthToken(config_json_1.oauthCfg.client_id, config_json_1.oauthCfg.client_secret, code, config_json_1.oauthCfg.redirect_uri);
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
        const newMember = new authSchema_1.default({
            cid: vatsimUserData.cid,
            discordID: pendingRequests[0].discordUserID,
            guildID: pendingRequests[0].guildID,
            full_vatsim_data: vatsimUserData
        });
        await newMember.save();
        requestedMember?.roles.add(vatRole);
        requestedMember?.setNickname(`${vatsimUserData.personal.name_first} ${vatsimUserData.personal.name_last} - ${vatsimUserData.cid}`).catch(() => null);
        await pending_1.default.findOneAndRemove({
            discordUserID: pendingRequests[0].discordUserID
        });
        return res.redirect('https://urrv.me');
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});
function clearRequests() {
    pending_1.default.remove({
        expires: {
            $lte: new Date().getTime()
        }
    });
}
exports.clearRequests = clearRequests;
