"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bookingScript_1 = __importDefault(require("../schema/bookingScript"));
async function cleanBooks() {
    let allBooks = await bookingScript_1.default.find();
    for (const userBooking of allBooks) {
        const bookingExpiryFullTime = userBooking.till.split(' ');
        const bookingExpiryDate = bookingExpiryFullTime[0].split('.');
        const thisDay = new Date().getUTCDate();
        const thisMonth = new Date().getUTCMonth() + 1;
        const thisYear = new Date().getUTCFullYear();
        if (parseInt(bookingExpiryDate[2]) < thisYear ||
            (parseInt(bookingExpiryDate[1]) < thisMonth && parseInt(bookingExpiryDate[2]) === thisYear) ||
            (parseInt(bookingExpiryDate[0]) < thisDay && parseInt(bookingExpiryDate[1]) === thisMonth)) {
            await bookingScript_1.default.findByIdAndRemove(userBooking.id);
        }
    }
}
exports.default = cleanBooks;
