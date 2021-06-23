"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const api_1 = __importDefault(require("./api"));
const authenticationScript_1 = __importDefault(require("./schema/authenticationScript"));
const cleanBookings_1 = __importDefault(require("./util/cleanBookings"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const VATSIMoAuth = __importStar(require("./oauth"));
const cfg_json_1 = require("./security/cfg.json");
function createServer() {
    let app = express_1.default();
    app.use(express_1.default.json());
    app.use(cors_1.default());
    app.use(helmet_1.default());
    app.use('/v1', api_1.default);
    app.use('/oauth', VATSIMoAuth.oAuthHandler);
    //Automatic action execution
    setInterval(() => cleanBookings_1.default(), 1000 * 60);
    setInterval(() => VATSIMoAuth.clearRequests(), 1000 * 60 * 5);
    app.all('/', (_req, res) => res.status(200).send('Hallo!'));
    app.post('/access', async (req, res) => {
        const source = req.body.source;
        const privileges = req.body.privileges;
        if (!source || !cfg_json_1.allowedSources.find(s => s === source)) {
            return res.status(400).json({
                success: false,
                message: 'Bad Request!'
            });
        }
        let newToken = bcryptjs_1.default.hashSync(`${source}.${privileges ?? 0}.margarita`, 10).slice(7);
        const newTokenWriting = new authenticationScript_1.default({
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
    https_1.default.globalAgent.options.ca = require('ssl-root-cas').create();
    https_1.default.createServer({
        key: fs_1.default.readFileSync('/var/www/www-root/data/www/api.veuroexpress.org/cert/key.key'),
        cert: fs_1.default.readFileSync('/var/www/www-root/data/www/api.veuroexpress.org/cert/cert.pem'),
    }, app).listen(2087, () => console.log('Server running on port 2087...'));
}
exports.default = createServer;
