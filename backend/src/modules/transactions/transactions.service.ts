import {
  Product,
  ProductStatus,
  Review,
  Transaction,
  TransactionStatus,
} from '../../models';
import { getSocketServer } from '../../config/socket';
import { AppError } from '../../shared/errors/AppError';
import { toObjectId } from '../../shared/utils/objectId';
import { conversationRoom } from '../chats/chats.gateway';

export async function confirmTransaction(
  userId: string,
  conversationId: string,
  confirmed: boolean | null,
) {
  const conversationObjectId = toObjectId(conversationId);
  const current = await Transaction.findOne({ conversationId: conversationObjectId });
  if (!current) throw new AppError(404, 'Transacción no encontrada', 'NOT_FOUND');
  if ((current.messageCount ?? 0) < 5) {
    throw new AppError(409, 'La confirmación estará disponible después de 5 mensajes', 'CONFIRMATION_NOT_READY');
  }
  const isBuyer = String(current.buyerId) === userId;
  const isSeller = String(current.sellerId) === userId;
  if (!isBuyer && !isSeller) {
    throw new AppError(403, 'No puedes confirmar esta transacción', 'FORBIDDEN');
  }
  if (current.status === TransactionStatus.CANCELLED) {
    throw new AppError(409, 'La transacción está cancelada', 'TRANSACTION_CANCELLED');
  }
  if (current.status === TransactionStatus.MUTUAL_CONFIRMED && confirmed !== null && !confirmed) {
    throw new AppError(409, 'La confirmación bilateral ya fue completada', 'TRANSACTION_CONFIRMED');
  }

  const confirmationUpdate = isBuyer
    ? { $set: { buyerConfirmed: confirmed, ...(confirmed === null ? { status: TransactionStatus.PENDING_CONFIRMATION } : {}) } }
    : { $set: { sellerConfirmed: confirmed, ...(confirmed === null ? { status: TransactionStatus.PENDING_CONFIRMATION } : {}) } };
  let updated = await Transaction.findByIdAndUpdate(current._id, confirmationUpdate, {
    new: true,
    runValidators: true,
  });
  if (!updated) throw new AppError(404, 'Transacción no encontrada', 'NOT_FOUND');

  if (updated.buyerConfirmed && updated.sellerConfirmed) {
    updated =
      (await Transaction.findOneAndUpdate(
        {
          _id: updated._id,
          buyerConfirmed: true,
          sellerConfirmed: true,
          status: { $ne: TransactionStatus.CANCELLED },
        },
        { $set: { status: TransactionStatus.MUTUAL_CONFIRMED } },
        { new: true },
      )) ?? updated;
    await Product.updateOne(
      { _id: updated.productId },
      { $set: { status: ProductStatus.SOLD } },
    );
  }

  const canRate = updated.status === TransactionStatus.MUTUAL_CONFIRMED;
  const event = {
    transactionId: updated.id,
    status: updated.status,
    buyerConfirmed: updated.buyerConfirmed,
    sellerConfirmed: updated.sellerConfirmed,
    canRate,
  };
  getSocketServer()?.to(conversationRoom(conversationId)).emit('transaction_updated', event);
  return event;
}

export async function listMyTransactions(userId: string) {
  return Transaction.find({
    $or: [{ buyerId: toObjectId(userId) }, { sellerId: toObjectId(userId) }],
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

export async function createReview(
  userId: string,
  transactionId: string,
  input: { rating: number; comment?: string; targetType: 'BUYER' | 'SELLER' | 'PRODUCT' },
) {
  const transaction = await Transaction.findById(toObjectId(transactionId)).select(
    'buyerId sellerId productId status',
  );
  if (!transaction) throw new AppError(404, 'Transacción no encontrada', 'NOT_FOUND');
  if (transaction.status !== TransactionStatus.MUTUAL_CONFIRMED) {
    throw new AppError(409, 'La transacción requiere confirmación bilateral para calificar', 'TRANSACTION_NOT_CONFIRMED');
  }

  const isBuyer = String(transaction.buyerId) === userId;
  const isSeller = String(transaction.sellerId) === userId;
  if (!isBuyer && !isSeller) {
    throw new AppError(403, 'No puedes calificar esta transacción', 'FORBIDDEN');
  }
  if (isBuyer && input.targetType === 'BUYER') {
    throw new AppError(403, 'El comprador no puede calificar al comprador', 'INVALID_REVIEW_TARGET');
  }
  if (isBuyer && input.targetType !== 'SELLER' && input.targetType !== 'PRODUCT') {
    throw new AppError(403, 'El comprador solo puede calificar al vendedor o al producto', 'INVALID_REVIEW_TARGET');
  }
  if (isSeller && input.targetType !== 'BUYER') {
    throw new AppError(403, 'El vendedor solo puede calificar al comprador', 'INVALID_REVIEW_TARGET');
  }
  const alreadySubmitted = await Review.exists({
    transactionId: transaction._id,
    reviewerId: toObjectId(userId),
    targetType: input.targetType,
  });
  if (alreadySubmitted) {
    throw new AppError(409, 'Esta calificación ya fue enviada', 'REVIEW_ALREADY_EXISTS');
  }

  const targetUserId =
    input.targetType === 'BUYER'
      ? transaction.buyerId
      : input.targetType === 'SELLER'
        ? transaction.sellerId
        : null;
  if (input.targetType === 'BUYER' && String(transaction.buyerId) === userId) {
    throw new AppError(400, 'No puedes calificarte a ti mismo como comprador', 'INVALID_REVIEW_TARGET');
  }
  if (input.targetType === 'SELLER' && String(transaction.sellerId) === userId) {
    throw new AppError(400, 'No puedes calificarte a ti mismo como vendedor', 'INVALID_REVIEW_TARGET');
  }
  return Review.create({
    transactionId: transaction._id,
    reviewerId: toObjectId(userId),
    targetUserId,
    targetProductId: input.targetType === 'PRODUCT' ? transaction.productId : null,
    targetType: input.targetType,
    rating: input.rating,
    comment: input.comment ?? null,
  });
}
