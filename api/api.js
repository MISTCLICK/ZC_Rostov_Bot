"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = __importDefault(require("./security/validation"));
const bookingScript_1 = __importDefault(require("./schema/bookingScript"));
const authSchema_1 = __importDefault(require("../schema/authSchema"));
const axios_1 = __importDefault(require("axios"));
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
    const allBooks = await bookingScript_1.default.find().sort({ ver: 1 });
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
    //Arbitrary vars and actions
    let myArr = [];
    (await bookingScript_1.default.find()).forEach(booking => myArr.push(booking.ver));
    let thisBookingVer = myArr.length > 0 ? Math.max.apply(null, myArr) + 1 : 1;
    let VATSIMmemberData = await authSchema_1.default.findOne({ cid });
    let bookingDate = from.split(' ');
    let bookingDateData = bookingDate[0].split('.');
    let bookingStartTime = bookingDate[1].split(':');
    let bookingEndTime = till.split(' ')[1].split(':');
    //@ts-ignore
    let vatbookData = await axios_1.default.post(`http://vatbook.euroutepro.com/atc/insert.asp?Local_URL=noredir&Local_ID=${thisBookingVer}&b_day=${bookingDateData[0]}&b_month=${bookingDateData[1]}&b_year=${bookingDateData[2]}&Controller=${VATSIMmemberData?.dataType === 'old' ? VATSIMmemberData?.full_vatsim_data.name_first : VATSIMmemberData?.full_vatsim_data.personal.name_first} ${VATSIMmemberData?.dataType === 'old' ? VATSIMmemberData?.full_vatsim_data.name_last : VATSIMmemberData?.full_vatsim_data.personal.name_last}&Position=${pos}&sTime=${bookingStartTime[0] + bookingStartTime[1]}&eTime=${bookingEndTime[0] + bookingEndTime[1]}&T=0&E=0&voice=1&cid=${cid}`);
    const newBooking = new bookingScript_1.default({
        cid,
        pos,
        from,
        till,
        ver: thisBookingVer,
        vatbook_id: `${vatbookData.data.split('\n')[2].split('=')[1]}`
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
    await axios_1.default.post(`http://vatbook.euroutepro.com/atc/delete.asp?Local_URL=noredir&Local_ID=${ver}&EU_ID=${bookCheck.vatbook_id}`);
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
exports.default = API;
