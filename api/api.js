"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = __importDefault(require("./security/validation"));
const bookingScript_1 = __importDefault(require("./schema/bookingScript"));
let API = express_1.default.Router();
API.all('*', async (req, res, next) => {
    if (typeof req.headers['x-api-key'] !== 'string' || typeof req.headers['application-source'] !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Bad Request!'
        });
    }
    const status = await validation_1.default(req.headers['x-api-key'], req.headers['application-source']);
    if (!status) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized!'
        });
    }
    next();
});
API.all('/', (_req, res) => res.status(200).send('Hallo!'));
API.get('/bookings', async (_req, res) => {
    const allBooks = await bookingScript_1.default.find();
    if (allBooks.length < 1) {
        return res.status(200).json({
            success: true,
            message: 'No bookings found!'
        });
    }
    else {
        return res.status(200).json({
            success: true,
            bookings: allBooks,
            message: 'Bookings found!'
        });
    }
});
API.post('/bookings', async (req, res) => {
    const cid = req.body.cid;
    const pos = req.body.pos;
    const from = req.body.from;
    const till = req.body.till;
    if (!cid || !pos || !from || !till) {
        return res.status(400).json({
            success: false,
            message: 'Bad Request!'
        });
    }
    const newBooking = new bookingScript_1.default({
        cid,
        pos,
        from,
        till,
        ver: (await bookingScript_1.default.count()) + 1
    });
    await newBooking.save().catch((err) => {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    });
    return res.status(200).json({
        success: true
    });
});
API.delete('/bookings', async (req, res) => {
    const ver = req.body.ver;
    if (typeof ver !== 'number') {
        return res.status(400).json({
            success: false,
            message: 'Bad Request!'
        });
    }
    const bookCheck = await bookingScript_1.default.findOne({
        ver
    });
    if (!bookCheck)
        return res.status(200).json({
            success: false,
            message: 'Booking not found...'
        });
    await bookingScript_1.default.findOneAndRemove({
        ver
    }).catch((err) => {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    });
    return res.status(200).json({
        success: true
    });
});
API.patch('/bookings', async (req, res) => {
    const ver = req.body.ver;
    const cid = req.body.cid;
    const pos = req.body.pos;
    const from = req.body.from;
    const till = req.body.till;
    if (!cid || !pos || !from || !till || typeof ver !== 'number') {
        return res.status(400).json({
            success: false,
            message: 'Bad Request!'
        });
    }
    const bookCheck = await bookingScript_1.default.findOne({
        ver
    });
    if (!bookCheck)
        return res.status(200).json({
            success: false,
            message: 'Booking not found...'
        });
    await bookingScript_1.default.findOneAndUpdate({
        ver
    }, {
        cid,
        pos,
        from,
        till
    }, {
        upsert: false
    }).catch((err) => {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    });
    return res.status(200).json({
        success: true
    });
});
exports.default = API;
