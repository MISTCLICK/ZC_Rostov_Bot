"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bookingSchema = new mongoose_1.default.Schema({
    cid: { type: String, required: true },
    pos: { type: String, required: true },
    from: { type: String, required: true },
    till: { type: String, required: true },
    ver: { type: Number, required: true },
    vatbook_id: { type: String, required: true },
});
exports.default = mongoose_1.default.model('bookings', bookingSchema);
