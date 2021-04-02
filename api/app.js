"use strict";
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
const cfg_json_1 = require("./security/cfg.json");
function createServer() {
    let app = express_1.default();
    app.use(express_1.default.json());
    app.use(cors_1.default());
    app.use(helmet_1.default());
    app.use('/v1', api_1.default);
    //Automatic action execution
    setInterval(() => cleanBookings_1.default(), 1000 * 60);
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
        key: fs_1.default.readFileSync('/var/www/httpd-cert/www-root/api.veuroexpress.org_le2.key'),
        cert: fs_1.default.readFileSync('/var/www/httpd-cert/www-root/server.pem'),
    }, app).listen(5000, () => console.log('Server running on port 5000...'));
}
exports.default = createServer;
