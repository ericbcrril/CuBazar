"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmTransaction = confirmTransaction;
exports.listMyTransactions = listMyTransactions;
exports.createReview = createReview;
const models_1 = require("../../models");
const socket_1 = require("../../config/socket");
const AppError_1 = require("../../shared/errors/AppError");
const objectId_1 = require("../../shared/utils/objectId");
const chats_gateway_1 = require("../chats/chats.gateway");
async function confirmTransaction(userId, conversationId, confirmed) {
    const conversationObjectId = (0, objectId_1.toObjectId)(conversationId);
    const current = await models_1.Transaction.findOne({ conversationId: conversationObjectId });
    if (!current)
        throw new AppError_1.AppError(404, 'Transacción no encontrada', 'NOT_FOUND');
    if ((current.messageCount ?? 0) < 5) {
        throw new AppError_1.AppError(409, 'La confirmación estará disponible después de 5 mensajes', 'CONFIRMATION_NOT_READY');
    }
    const isBuyer = String(current.buyerId) === userId;
    const isSeller = String(current.sellerId) === userId;
    if (!isBuyer && !isSeller) {
        throw new AppError_1.AppError(403, 'No puedes confirmar esta transacción', 'FORBIDDEN');
    }
    if (current.status === models_1.TransactionStatus.CANCELLED) {
        throw new AppError_1.AppError(409, 'La transacción está cancelada', 'TRANSACTION_CANCELLED');
    }
    if (current.status === models_1.TransactionStatus.MUTUAL_CONFIRMED && confirmed !== null && !confirmed) {
        throw new AppError_1.AppError(409, 'La confirmación bilateral ya fue completada', 'TRANSACTION_CONFIRMED');
    }
    const confirmationUpdate = isBuyer
        ? { $set: { buyerConfirmed: confirmed, ...(confirmed === null ? { status: models_1.TransactionStatus.PENDING_CONFIRMATION } : {}) } }
        : { $set: { sellerConfirmed: confirmed, ...(confirmed === null ? { status: models_1.TransactionStatus.PENDING_CONFIRMATION } : {}) } };
    let updated = await models_1.Transaction.findByIdAndUpdate(current._id, confirmationUpdate, {
        new: true,
        runValidators: true,
    });
    if (!updated)
        throw new AppError_1.AppError(404, 'Transacción no encontrada', 'NOT_FOUND');
    if (updated.buyerConfirmed && updated.sellerConfirmed) {
        updated =
            (await models_1.Transaction.findOneAndUpdate({
                _id: updated._id,
                buyerConfirmed: true,
                sellerConfirmed: true,
                status: { $ne: models_1.TransactionStatus.CANCELLED },
            }, { $set: { status: models_1.TransactionStatus.MUTUAL_CONFIRMED } }, { new: true })) ?? updated;
        await models_1.Product.updateOne({ _id: updated.productId }, { $set: { status: models_1.ProductStatus.SOLD } });
    }
    const canRate = updated.status === models_1.TransactionStatus.MUTUAL_CONFIRMED;
    const event = {
        transactionId: updated.id,
        status: updated.status,
        buyerConfirmed: updated.buyerConfirmed,
        sellerConfirmed: updated.sellerConfirmed,
        canRate,
    };
    (0, socket_1.getSocketServer)()?.to((0, chats_gateway_1.conversationRoom)(conversationId)).emit('transaction_updated', event);
    return event;
}
async function listMyTransactions(userId) {
    return models_1.Transaction.find({
        $or: [{ buyerId: (0, objectId_1.toObjectId)(userId) }, { sellerId: (0, objectId_1.toObjectId)(userId) }],
    })
        .sort({ updatedAt: -1 })
        .populate({
        path: 'product',
        populate: { path: 'images', options: { sort: { order: 1 } } },
    })
        .populate({ path: 'buyer', select: 'fullName profilePictureUrl' })
        .populate({ path: 'seller', select: 'fullName profilePictureUrl' })
        .populate({ path: 'conversation', select: 'buyerId sellerId productId' })
        .populate({ path: 'reviews' });
}
async function createReview(userId, transactionId, input) {
    const transaction = await models_1.Transaction.findById((0, objectId_1.toObjectId)(transactionId)).select('buyerId sellerId productId status');
    if (!transaction)
        throw new AppError_1.AppError(404, 'Transacción no encontrada', 'NOT_FOUND');
    if (transaction.status !== models_1.TransactionStatus.MUTUAL_CONFIRMED) {
        throw new AppError_1.AppError(409, 'La transacción requiere confirmación bilateral para calificar', 'TRANSACTION_NOT_CONFIRMED');
    }
    const isBuyer = String(transaction.buyerId) === userId;
    const isSeller = String(transaction.sellerId) === userId;
    if (!isBuyer && !isSeller) {
        throw new AppError_1.AppError(403, 'No puedes calificar esta transacción', 'FORBIDDEN');
    }
    if (isBuyer && input.targetType === 'BUYER') {
        throw new AppError_1.AppError(403, 'El comprador no puede calificar al comprador', 'INVALID_REVIEW_TARGET');
    }
    if (isBuyer && input.targetType !== 'SELLER' && input.targetType !== 'PRODUCT') {
        throw new AppError_1.AppError(403, 'El comprador solo puede calificar al vendedor o al producto', 'INVALID_REVIEW_TARGET');
    }
    if (isSeller && input.targetType !== 'BUYER') {
        throw new AppError_1.AppError(403, 'El vendedor solo puede calificar al comprador', 'INVALID_REVIEW_TARGET');
    }
    const alreadySubmitted = await models_1.Review.exists({
        transactionId: transaction._id,
        reviewerId: (0, objectId_1.toObjectId)(userId),
        targetType: input.targetType,
    });
    if (alreadySubmitted) {
        throw new AppError_1.AppError(409, 'Esta calificación ya fue enviada', 'REVIEW_ALREADY_EXISTS');
    }
    const targetUserId = input.targetType === 'BUYER'
        ? transaction.buyerId
        : input.targetType === 'SELLER'
            ? transaction.sellerId
            : null;
    if (input.targetType === 'BUYER' && String(transaction.buyerId) === userId) {
        throw new AppError_1.AppError(400, 'No puedes calificarte a ti mismo como comprador', 'INVALID_REVIEW_TARGET');
    }
    if (input.targetType === 'SELLER' && String(transaction.sellerId) === userId) {
        throw new AppError_1.AppError(400, 'No puedes calificarte a ti mismo como vendedor', 'INVALID_REVIEW_TARGET');
    }
    return models_1.Review.create({
        transactionId: transaction._id,
        reviewerId: (0, objectId_1.toObjectId)(userId),
        targetUserId,
        targetProductId: input.targetType === 'PRODUCT' ? transaction.productId : null,
        targetType: input.targetType,
        rating: input.rating,
        comment: input.comment ?? null,
    });
}
//# sourceMappingURL=transactions.service.js.map