import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import * as controller from './chats.controller';
import { chatIdSchema, chatListSchema, chatMessagesSchema, createChatSchema } from './chats.schemas';

export const chatsRoutes = Router();

chatsRoutes.use(requireAuth);
chatsRoutes.post('/', validateRequest(createChatSchema), controller.create);
chatsRoutes.get('/', validateRequest(chatListSchema), controller.list);
chatsRoutes.delete('/:id', validateRequest(chatIdSchema), controller.remove);
chatsRoutes.get('/:id/messages', validateRequest(chatMessagesSchema), controller.messages);
