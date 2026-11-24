"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationRoom = exports.userRoom = void 0;
exports.initSocketServer = initSocketServer;
const models_1 = require("../../models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const env_1 = require("../../config/env");
const socket_1 = require("../../config/socket");
const chatsService = __importStar(require("./chats.service"));
const chats_schemas_1 = require("./chats.schemas");
const userRoom = (userId) => `user:${userId}`;
exports.userRoom = userRoom;
const conversationRoom = (conversationId) => `conversation:${conversationId}`;
exports.conversationRoom = conversationRoom;
async function handleSocketAction(socket, action) {
    try {
        await action();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo completar la acción';
        socket.emit('socket_error', { message });
    }
}
function initSocketServer(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.CORS_ORIGIN === '*' ? true : env_1.env.CORS_ORIGIN.split(',').map((item) => item.trim()),
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (typeof token !== 'string' || token.length === 0) {
            next(new Error('Se requiere un token de autenticación'));
            return;
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            if (typeof payload === 'string' ||
                typeof payload.id !== 'string' ||
                typeof payload.email !== 'string' ||
                (payload.role !== models_1.Role.STUDENT && payload.role !== models_1.Role.ADMIN)) {
                throw new Error('El token no contiene un perfil válido');
            }
            socket.data.user = {
                id: payload.id,
                email: payload.email,
                role: payload.role,
            };
            next();
        }
        catch {
            next(new Error('Token inválido o expirado'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.data.user;
        void socket.join(userRoom(user.id));
        socket.on('join_conversation', (payload) => {
            void handleSocketAction(socket, async () => {
                const { conversationId } = chats_schemas_1.conversationSocketSchema.parse(payload);
                await chatsService.markMessagesRead(conversationId, user.id);
                await socket.join(conversationRoom(conversationId));
            });
        });
        socket.on('send_message', (payload) => {
            void handleSocketAction(socket, async () => {
                const messageData = chats_schemas_1.sendMessageSchema.parse(payload);
                const message = await chatsService.sendMessage(messageData.conversationId, user.id, messageData.content);
                io.to(conversationRoom(messageData.conversationId)).emit('new_message', message);
                const purchaseState = await chatsService.getPurchaseState(messageData.conversationId);
                if (purchaseState && purchaseState.messageCount >= 5) {
                    io.to(conversationRoom(messageData.conversationId)).emit('purchase_confirmation', purchaseState);
                }
            });
        });
        socket.on('typing', (payload) => {
            void handleSocketAction(socket, async () => {
                const typing = chats_schemas_1.typingSchema.parse(payload);
                await chatsService.assertConversationParticipant(typing.conversationId, user.id);
                socket.to(conversationRoom(typing.conversationId)).emit('user_typing', {
                    conversationId: typing.conversationId,
                    userId: user.id,
                    isTyping: typing.isTyping,
                });
            });
        });
    });
    (0, socket_1.setSocketServer)(io);
    return io;
}
//# sourceMappingURL=chats.gateway.js.map