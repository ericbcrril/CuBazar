import type { Server as HttpServer } from 'node:http';
import { Role } from '../../models';
import jwt from 'jsonwebtoken';
import { Server, type Socket } from 'socket.io';
import { env } from '../../config/env';
import { setSocketServer } from '../../config/socket';
import * as chatsService from './chats.service';
import { conversationSocketSchema, sendMessageSchema, typingSchema } from './chats.schemas';

interface SocketUser {
  id: string;
  email: string;
  role: Role;
}

const userRoom = (userId: string) => `user:${userId}`;
const conversationRoom = (conversationId: string) => `conversation:${conversationId}`;

async function handleSocketAction(
  socket: Socket,
  action: () => Promise<void>,
): Promise<void> {
  try {
    await action();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo completar la acción';
    socket.emit('socket_error', { message });
  }
}

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((item) => item.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token: unknown = socket.handshake.auth.token;
    if (typeof token !== 'string' || token.length === 0) {
      next(new Error('Se requiere un token de autenticación'));
      return;
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET);
      if (
        typeof payload === 'string' ||
        typeof payload.id !== 'string' ||
        typeof payload.email !== 'string' ||
        (payload.role !== Role.STUDENT && payload.role !== Role.ADMIN)
      ) {
        throw new Error('El token no contiene un perfil válido');
      }
      socket.data.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      } satisfies SocketUser;
      next();
    } catch {
      next(new Error('Token inválido o expirado'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;
    void socket.join(userRoom(user.id));

    socket.on('join_conversation', (payload: unknown) => {
      void handleSocketAction(socket, async () => {
        const { conversationId } = conversationSocketSchema.parse(payload);
        await chatsService.markMessagesRead(conversationId, user.id);
        await socket.join(conversationRoom(conversationId));
      });
    });

    socket.on('send_message', (payload: unknown) => {
      void handleSocketAction(socket, async () => {
        const messageData = sendMessageSchema.parse(payload);
        const message = await chatsService.sendMessage(
          messageData.conversationId,
          user.id,
          messageData.content,
        );
        io.to(conversationRoom(messageData.conversationId)).emit('new_message', message);
        const purchaseState = await chatsService.getPurchaseState(messageData.conversationId);
        if (purchaseState && purchaseState.messageCount >= 5) {
          io.to(conversationRoom(messageData.conversationId)).emit('purchase_confirmation', purchaseState);
        }
      });
    });

    socket.on('typing', (payload: unknown) => {
      void handleSocketAction(socket, async () => {
        const typing = typingSchema.parse(payload);
        await chatsService.assertConversationParticipant(typing.conversationId, user.id);
        socket.to(conversationRoom(typing.conversationId)).emit('user_typing', {
          conversationId: typing.conversationId,
          userId: user.id,
          isTyping: typing.isTyping,
        });
      });
    });
  });

  setSocketServer(io);
  return io;
}

export { userRoom, conversationRoom };
