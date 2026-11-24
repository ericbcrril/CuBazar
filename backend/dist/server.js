"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const node_http_1 = require("node:http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const chats_gateway_1 = require("./modules/chats/chats.gateway");
async function startServer() {
    await (0, database_1.connectToDatabase)();
    const httpServer = (0, node_http_1.createServer)(app_1.app);
    const io = (0, chats_gateway_1.initSocketServer)(httpServer);
    httpServer.listen(env_1.env.PORT, () => {
        console.info(`CU-bazar API disponible en el puerto ${env_1.env.PORT}`);
    });
    const shutdown = () => {
        io.close(() => {
            void (0, database_1.disconnectFromDatabase)().then(() => process.exit(0));
        });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}
void startServer().catch(async (error) => {
    console.error('No se pudo iniciar CU-bazar:', error);
    await (0, database_1.disconnectFromDatabase)();
    process.exitCode = 1;
});
//# sourceMappingURL=server.js.map