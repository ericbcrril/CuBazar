"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertConversationParticipant = assertConversationParticipant;
exports.createConversation = createConversation;
exports.createDirectConversation = createDirectConversation;
exports.listConversations = listConversations;
exports.getMessages = getMessages;
exports.markMessagesRead = markMessagesRead;
exports.sendMessage = sendMessage;
exports.getPurchaseState = getPurchaseState;
exports.deleteConversation = deleteConversation;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../../models");
const AppError_1 = require("../../shared/errors/AppError");
const objectId_1 = require("../../shared/utils/objectId");
async function assertConversationParticipant(conversationId, userId) {
    const conversation = await models_1.Conversation.findById((0, objectId_1.toObjectId)(conversationId)).select('buyerId sellerId deletedBy');
    if (!conversation)
        throw new AppError_1.AppError(404, 'Conversación no encontrada', 'NOT_FOUND');
    if (String(conversation.buyerId) !== userId && String(conversation.sellerId) !== userId) {
        throw new AppError_1.AppError(403, 'No tienes acceso a esta conversación', 'FORBIDDEN');
    }
    if (conversation.deletedBy.some((id) => String(id) === userId)) {
        throw new AppError_1.AppError(404, 'Conversación eliminada', 'NOT_FOUND');
    }
    return conversation;
}
async function createConversation(buyerId, productId) {
    const productObjectId = (0, objectId_1.toObjectId)(productId);
    const buyerObjectId = (0, objectId_1.toObjectId)(buyerId);
    const product = await models_1.Product.findOne({
        _id: productObjectId,
        status: models_1.ProductStatus.PUBLISHED,
    }).select('sellerId title price');
    if (!product)
        throw new AppError_1.AppError(404, 'Producto no disponible', 'NOT_FOUND');
    if (String(product.sellerId) === buyerId) {
        throw new AppError_1.AppError(400, 'No puedes iniciar una conversación con tu propia publicación', 'INVALID_CONVERSATION');
    }
    const conversationKey = {
        buyerId: buyerObjectId,
        sellerId: product.sellerId,
        productId: productObjectId,
    };
    let conversation = await models_1.Conversation.findOne(conversationKey);
    if (!conversation) {
        try {
            conversation = await models_1.Conversation.create(conversationKey);
        }
        catch (error) {
            if (!(error instanceof mongoose_1.default.mongo.MongoServerError) || error.code !== 11000)
                throw error;
            conversation = await models_1.Conversation.findOne(conversationKey);
            if (!conversation)
                throw error;
        }
        if (conversation.deletedBy.some((id) => String(id) === buyerId)) {
            await models_1.Conversation.updateOne({ _id: conversation._id }, { $pull: { deletedBy: buyerObjectId } });
        }
    }
    const transaction = await models_1.Transaction.findOneAndUpdate({ conversationId: conversation._id }, {
        $setOnInsert: {
            conversationId: conversation._id,
            productId: productObjectId,
            buyerId: buyerObjectId,
            sellerId: product.sellerId,
            status: models_1.TransactionStatus.PENDING_CONFIRMATION,
        },
    }, { new: true, upsert: true, setDefaultsOnInsert: true });
    const [buyer, seller] = await Promise.all([
        models_1.User.findById(buyerObjectId).select('fullName profilePictureUrl'),
        models_1.User.findById(product.sellerId).select('fullName profilePictureUrl'),
    ]);
    return {
        ...conversation.toJSON(),
        buyer,
        seller,
        product: await models_1.Product.findById(productObjectId)
            .select('title price images')
            .populate({ path: 'images', options: { sort: { order: 1 } } }),
        transaction,
    };
}
async function createDirectConversation(currentUserId, otherUserId) {
    if (currentUserId === otherUserId) {
        throw new AppError_1.AppError(400, 'No puedes iniciar un chat contigo mismo', 'INVALID_CONVERSATION');
    }
    const a = (0, objectId_1.toObjectId)(currentUserId);
    const b = (0, objectId_1.toObjectId)(otherUserId);
    if (!(await models_1.User.exists({ _id: b }))) {
        throw new AppError_1.AppError(404, 'Usuario no encontrado', 'NOT_FOUND');
    }
    const ordered = [String(a), String(b)].sort();
    const directPairKey = `${ordered[0]}:${ordered[1]}`;
    let conversation = await models_1.Conversation.findOne({ directPairKey });
    if (!conversation) {
        try {
            conversation = await models_1.Conversation.create({
                buyerId: a,
                sellerId: b,
                productId: null,
                directPairKey,
            });
        }
        catch (error) {
            if (!(error instanceof mongoose_1.default.mongo.MongoServerError) || error.code !== 11000)
                throw error;
            conversation = await models_1.Conversation.findOne({ directPairKey });
            if (!conversation)
                throw error;
        }
        if (conversation.deletedBy.some((id) => String(id) === currentUserId)) {
            await models_1.Conversation.updateOne({ _id: conversation._id }, { $pull: { deletedBy: a } });
        }
    }
    const [buyer, seller] = await Promise.all([
        models_1.User.findById(conversation.buyerId).select('fullName profilePictureUrl'),
        models_1.User.findById(conversation.sellerId).select('fullName profilePictureUrl'),
    ]);
    return {
        ...conversation.toJSON(),
        buyer,
        seller,
        product: null,
    };
}
async function listConversations(userId, filter) {
    const ownerId = (0, objectId_1.toObjectId)(userId);
    const query = {
        $or: [{ buyerId: ownerId }, { sellerId: ownerId }],
    };
    if (filter === 'UNREAD') {
        const unreadConversationIds = await models_1.Message.distinct('conversationId', {
            senderId: { $ne: ownerId },
            isRead: false,
        });
        query._id = { $in: unreadConversationIds };
    }
    query.deletedBy = { $ne: ownerId };
    return models_1.Conversation.find(query)
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
async function getMessages(conversationId, userId, page, limit) {
    await assertConversationParticipant(conversationId, userId);
    const filter = { conversationId: (0, objectId_1.toObjectId)(conversationId) };
    const [messages, total] = await Promise.all([
        models_1.Message.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({ path: 'sender', select: 'fullName profilePictureUrl' }),
        models_1.Message.countDocuments(filter),
    ]);
    return {
        messages: messages.reverse(),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
}
async function markMessagesRead(conversationId, userId) {
    await assertConversationParticipant(conversationId, userId);
    await models_1.Message.updateMany({
        conversationId: (0, objectId_1.toObjectId)(conversationId),
        senderId: { $ne: (0, objectId_1.toObjectId)(userId) },
        isRead: false,
    }, { $set: { isRead: true } });
}
async function sendMessage(conversationId, senderId, content) {
    await assertConversationParticipant(conversationId, senderId);
    const conversationObjectId = (0, objectId_1.toObjectId)(conversationId);
    const message = await models_1.Message.create({
        conversationId: conversationObjectId,
        senderId: (0, objectId_1.toObjectId)(senderId),
        content,
    });
    await models_1.Conversation.updateOne({ _id: conversationObjectId }, { $set: { updatedAt: new Date() } });
    await models_1.Transaction.updateOne({ conversationId: conversationObjectId }, { $inc: { messageCount: 1 } });
    return {
        id: message.id,
        conversationId: String(message.conversationId),
        senderId: String(message.senderId),
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
    };
}
async function getPurchaseState(conversationId) {
    const transaction = await models_1.Transaction.findOne({ conversationId: (0, objectId_1.toObjectId)(conversationId) })
        .populate({ path: 'product', select: 'title price' });
    if (!transaction)
        return null;
    return {
        messageCount: transaction.messageCount,
        buyerConfirmed: transaction.buyerConfirmed,
        sellerConfirmed: transaction.sellerConfirmed,
        status: transaction.status,
    };
}
async function deleteConversation(conversationId, userId) {
    const conversationObjectId = (0, objectId_1.toObjectId)(conversationId);
    const conversation = await models_1.Conversation.findById(conversationObjectId).select('buyerId sellerId deletedBy');
    if (!conversation)
        throw new AppError_1.AppError(404, 'Conversación no encontrada', 'NOT_FOUND');
    if (String(conversation.buyerId) !== userId &&
        String(conversation.sellerId) !== userId) {
        throw new AppError_1.AppError(403, 'No tienes acceso a esta conversación', 'FORBIDDEN');
    }
    const userObjectId = (0, objectId_1.toObjectId)(userId);
    await models_1.Conversation.updateOne({ _id: conversationObjectId }, { $addToSet: { deletedBy: userObjectId } });
    const refreshed = await models_1.Conversation.findById(conversationObjectId).select('buyerId sellerId deletedBy');
    if (refreshed &&
        refreshed.deletedBy.length >= 2 &&
        refreshed.deletedBy.some((id) => String(id) === String(refreshed.buyerId)) &&
        refreshed.deletedBy.some((id) => String(id) === String(refreshed.sellerId))) {
        await Promise.all([
            models_1.Message.deleteMany({ conversationId: conversationObjectId }),
        ]);
    }
    return { id: conversationId };
}
//# sourceMappingURL=chats.service.js.map