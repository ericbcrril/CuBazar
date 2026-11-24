import mongoose, { Types } from 'mongoose';
import {
  Conversation,
  Message,
  Product,
  ProductStatus,
  Transaction,
  TransactionStatus,
  User,
} from '../../models';
import { AppError } from '../../shared/errors/AppError';
import { toObjectId } from '../../shared/utils/objectId';

export async function assertConversationParticipant(conversationId: string, userId: string) {
  const conversation = await Conversation.findById(toObjectId(conversationId)).select(
    'buyerId sellerId deletedBy',
  );
  if (!conversation) throw new AppError(404, 'Conversación no encontrada', 'NOT_FOUND');
  if (String(conversation.buyerId) !== userId && String(conversation.sellerId) !== userId) {
    throw new AppError(403, 'No tienes acceso a esta conversación', 'FORBIDDEN');
  }
  if (conversation.deletedBy.some((id) => String(id) === userId)) {
    throw new AppError(404, 'Conversación eliminada', 'NOT_FOUND');
  }
  return conversation;
}

export async function createConversation(buyerId: string, productId: string) {
  const productObjectId = toObjectId(productId);
  const buyerObjectId = toObjectId(buyerId);
  const product = await Product.findOne({
    _id: productObjectId,
    status: ProductStatus.PUBLISHED,
  }).select('sellerId title price');
  if (!product) throw new AppError(404, 'Producto no disponible', 'NOT_FOUND');
  if (String(product.sellerId) === buyerId) {
    throw new AppError(400, 'No puedes iniciar una conversación con tu propia publicación', 'INVALID_CONVERSATION');
  }

  const conversationKey = {
    buyerId: buyerObjectId,
    sellerId: product.sellerId,
    productId: productObjectId,
  };
  let conversation = await Conversation.findOne(conversationKey);
  if (!conversation) {
    try {
      conversation = await Conversation.create(conversationKey);
    } catch (error) {
      if (!(error instanceof mongoose.mongo.MongoServerError) || error.code !== 11000) throw error;
      conversation = await Conversation.findOne(conversationKey);
      if (!conversation) throw error;
    }
    if (conversation.deletedBy.some((id) => String(id) === buyerId)) {
      await Conversation.updateOne(
        { _id: conversation._id },
        { $pull: { deletedBy: buyerObjectId } },
      );
    }
  }

  const transaction = await Transaction.findOneAndUpdate(
    { conversationId: conversation._id },
    {
      $setOnInsert: {
        conversationId: conversation._id,
        productId: productObjectId,
        buyerId: buyerObjectId,
        sellerId: product.sellerId,
        status: TransactionStatus.PENDING_CONFIRMATION,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  const [buyer, seller] = await Promise.all([
    User.findById(buyerObjectId).select('fullName profilePictureUrl'),
    User.findById(product.sellerId).select('fullName profilePictureUrl'),
  ]);
  return {
    ...conversation.toJSON(),
    buyer,
    seller,
    product: await Product.findById(productObjectId)
      .select('title price images')
      .populate({ path: 'images', options: { sort: { order: 1 } } }),
    transaction,
  };
}

export async function createDirectConversation(currentUserId: string, otherUserId: string) {
  if (currentUserId === otherUserId) {
    throw new AppError(400, 'No puedes iniciar un chat contigo mismo', 'INVALID_CONVERSATION');
  }
  const a = toObjectId(currentUserId);
  const b = toObjectId(otherUserId);
  if (!(await User.exists({ _id: b }))) {
    throw new AppError(404, 'Usuario no encontrado', 'NOT_FOUND');
  }
  const ordered = [String(a), String(b)].sort();
  const directPairKey = `${ordered[0]}:${ordered[1]}`;
  let conversation = await Conversation.findOne({ directPairKey });
  if (!conversation) {
    try {
      conversation = await Conversation.create({
        buyerId: a,
        sellerId: b,
        productId: null,
        directPairKey,
      });
    } catch (error) {
      if (!(error instanceof mongoose.mongo.MongoServerError) || error.code !== 11000) throw error;
      conversation = await Conversation.findOne({ directPairKey });
      if (!conversation) throw error;
    }
    if (conversation.deletedBy.some((id) => String(id) === currentUserId)) {
      await Conversation.updateOne(
        { _id: conversation._id },
        { $pull: { deletedBy: a } },
      );
    }
  }
  const [buyer, seller] = await Promise.all([
    User.findById(conversation.buyerId).select('fullName profilePictureUrl'),
    User.findById(conversation.sellerId).select('fullName profilePictureUrl'),
  ]);
  return {
    ...conversation.toJSON(),
    buyer,
    seller,
    product: null,
  };
}

export async function listConversations(userId: string, filter: 'ALL' | 'UNREAD') {
  const ownerId = toObjectId(userId);
  const query: Record<string, unknown> = {
    $or: [{ buyerId: ownerId }, { sellerId: ownerId }],
  };
  if (filter === 'UNREAD') {
    const unreadConversationIds = await Message.distinct('conversationId', {
      senderId: { $ne: ownerId },
      isRead: false,
    });
    query._id = { $in: unreadConversationIds };
  }
  query.deletedBy = { $ne: ownerId };
  return Conversation.find(query)
    .sort({ updatedAt: -1 })
    .populate({ path: 'buyer', select: 'fullName profilePictureUrl' })
    .populate({ path: 'seller', select: 'fullName profilePictureUrl' })
    .populate({
      path: 'product',
      select: 'title price status',
      populate: { path: 'images', options: { sort: { order: 1 } } },
    })
    .populate({
      path: 'transaction',
      populate: { path: 'reviews' },
    })
    .populate({
      path: 'messages',
      options: { sort: { createdAt: -1 }, limit: 1 },
    });
}

export async function getMessages(
  conversationId: string,
  userId: string,
  page: number,
  limit: number,
) {
  await assertConversationParticipant(conversationId, userId);
  const filter = { conversationId: toObjectId(conversationId) };
  const [messages, total] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'sender', select: 'fullName profilePictureUrl' }),
    Message.countDocuments(filter),
  ]);
  return {
    messages: messages.reverse(),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function markMessagesRead(conversationId: string, userId: string) {
  await assertConversationParticipant(conversationId, userId);
  await Message.updateMany(
    {
      conversationId: toObjectId(conversationId),
      senderId: { $ne: toObjectId(userId) },
      isRead: false,
    },
    { $set: { isRead: true } },
  );
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  await assertConversationParticipant(conversationId, senderId);
  const conversationObjectId = toObjectId(conversationId);
  const message = await Message.create({
    conversationId: conversationObjectId,
    senderId: toObjectId(senderId),
    content,
  });
  await Conversation.updateOne(
    { _id: conversationObjectId },
    { $set: { updatedAt: new Date() } },
  );
  await Transaction.updateOne(
    { conversationId: conversationObjectId },
    { $inc: { messageCount: 1 } },
  );
  return {
    id: message.id,
    conversationId: String(message.conversationId),
    senderId: String(message.senderId),
    content: message.content,
    isRead: message.isRead,
    createdAt: message.createdAt,
  };
}

export async function getPurchaseState(conversationId: string) {
  const transaction = await Transaction.findOne({ conversationId: toObjectId(conversationId) })
    .populate({ path: 'product', select: 'title price' });
  if (!transaction) return null;
  return {
    messageCount: transaction.messageCount,
    buyerConfirmed: transaction.buyerConfirmed,
    sellerConfirmed: transaction.sellerConfirmed,
    status: transaction.status,
  };
}

export async function deleteConversation(conversationId: string, userId: string) {
  const conversationObjectId = toObjectId(conversationId);
  const conversation = await Conversation.findById(conversationObjectId).select(
    'buyerId sellerId deletedBy',
  );
  if (!conversation) throw new AppError(404, 'Conversación no encontrada', 'NOT_FOUND');
  if (
    String(conversation.buyerId) !== userId &&
    String(conversation.sellerId) !== userId
  ) {
    throw new AppError(403, 'No tienes acceso a esta conversación', 'FORBIDDEN');
  }
  const userObjectId = toObjectId(userId);
  await Conversation.updateOne(
    { _id: conversationObjectId },
    { $addToSet: { deletedBy: userObjectId } },
  );
  const refreshed = await Conversation.findById(conversationObjectId).select('buyerId sellerId deletedBy');
  if (
    refreshed &&
    refreshed.deletedBy.length >= 2 &&
    refreshed.deletedBy.some((id) => String(id) === String(refreshed.buyerId)) &&
    refreshed.deletedBy.some((id) => String(id) === String(refreshed.sellerId))
  ) {
    await Promise.all([
      Message.deleteMany({ conversationId: conversationObjectId }),
    ]);
  }
  return { id: conversationId };
}
