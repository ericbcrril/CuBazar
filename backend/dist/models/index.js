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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = exports.Transaction = exports.Message = exports.Conversation = exports.ProductComment = exports.ProductLike = exports.ProductImage = exports.Product = exports.UserAvailability = exports.User = exports.TransactionStatus = exports.ProductStatus = exports.PublicationType = exports.Condition = exports.Role = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.Role = {
    STUDENT: 'STUDENT',
    ADMIN: 'ADMIN',
};
exports.Condition = {
    NUEVO: 'NUEVO',
    USADO_COMO_NUEVO: 'USADO_COMO_NUEVO',
    USADO_BUEN_ESTADO: 'USADO_BUEN_ESTADO',
    USADO_ACEPTABLE: 'USADO_ACEPTABLE',
};
exports.PublicationType = {
    VENTA: 'VENTA',
    PUBLICACION: 'PUBLICACION',
};
exports.ProductStatus = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    SOLD: 'SOLD',
    ARCHIVED: 'ARCHIVED',
};
exports.TransactionStatus = {
    PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
    MUTUAL_CONFIRMED: 'MUTUAL_CONFIRMED',
    CANCELLED: 'CANCELLED',
};
const commonOptions = {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
};
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    credHash: { type: String, default: null, select: false },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    profilePictureUrl: { type: String, default: null },
    role: { type: String, enum: Object.values(exports.Role), default: exports.Role.STUDENT },
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String, default: undefined },
}, { ...commonOptions, collection: 'users', timestamps: true });
userSchema.index({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } });
userSchema.virtual('availability', {
    ref: 'UserAvailability',
    localField: '_id',
    foreignField: 'userId',
    justOne: true,
});
userSchema.virtual('products', { ref: 'Product', localField: '_id', foreignField: 'sellerId' });
userSchema.virtual('likes', { ref: 'ProductLike', localField: '_id', foreignField: 'userId' });
userSchema.virtual('comments', { ref: 'ProductComment', localField: '_id', foreignField: 'userId' });
userSchema.virtual('boughtTransactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'buyerId',
});
userSchema.virtual('soldTransactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'sellerId',
});
userSchema.virtual('givenReviews', { ref: 'Review', localField: '_id', foreignField: 'reviewerId' });
userSchema.virtual('receivedReviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'targetUserId',
});
userSchema.virtual('sentMessages', { ref: 'Message', localField: '_id', foreignField: 'senderId' });
const availabilitySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isAvailable: { type: Boolean, default: false },
}, { ...commonOptions, collection: 'user_availabilities', timestamps: { createdAt: false, updatedAt: true } });
availabilitySchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});
const productSchema = new mongoose_1.Schema({
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, minlength: 10, maxlength: 2000 },
    price: { type: Number, required: true, min: 0, max: 99_999_999.99 },
    condition: { type: String, enum: Object.values(exports.Condition), default: exports.Condition.NUEVO },
    type: { type: String, enum: Object.values(exports.PublicationType), default: exports.PublicationType.VENTA },
    status: { type: String, enum: Object.values(exports.ProductStatus), default: exports.ProductStatus.PUBLISHED },
    viewCount24h: { type: Number, default: 0, min: 0 },
}, { ...commonOptions, collection: 'products', timestamps: true });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ status: 1, viewCount24h: -1 });
productSchema.virtual('seller', {
    ref: 'User',
    localField: 'sellerId',
    foreignField: '_id',
    justOne: true,
});
productSchema.virtual('images', { ref: 'ProductImage', localField: '_id', foreignField: 'productId' });
productSchema.virtual('likeCount', {
    ref: 'ProductLike',
    localField: '_id',
    foreignField: 'productId',
    count: true,
});
productSchema.virtual('commentCount', {
    ref: 'ProductComment',
    localField: '_id',
    foreignField: 'productId',
    count: true,
});
productSchema.virtual('comments', { ref: 'ProductComment', localField: '_id', foreignField: 'productId' });
productSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'productId',
});
const productImageSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0, min: 0 },
}, { ...commonOptions, collection: 'product_images', timestamps: false });
productImageSchema.virtual('product', {
    ref: 'Product',
    localField: 'productId',
    foreignField: '_id',
    justOne: true,
});
const productLikeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { ...commonOptions, collection: 'product_likes', timestamps: { createdAt: true, updatedAt: false } });
productLikeSchema.index({ userId: 1, productId: 1 }, { unique: true });
productLikeSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});
productLikeSchema.virtual('product', {
    ref: 'Product',
    localField: 'productId',
    foreignField: '_id',
    justOne: true,
});
const productCommentSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, minlength: 1, maxlength: 500 },
}, { ...commonOptions, collection: 'product_comments', timestamps: { createdAt: true, updatedAt: false } });
productCommentSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true,
});
productCommentSchema.virtual('product', {
    ref: 'Product',
    localField: 'productId',
    foreignField: '_id',
    justOne: true,
});
const conversationSchema = new mongoose_1.Schema({
    buyerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', default: null },
    directPairKey: { type: String, default: null },
    deletedBy: { type: [mongoose_1.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { ...commonOptions, collection: 'conversations', timestamps: true });
conversationSchema.index({ buyerId: 1, sellerId: 1, productId: 1 }, { unique: true, partialFilterExpression: { productId: { $type: 'objectId' } } });
conversationSchema.index({ directPairKey: 1 }, { unique: true, partialFilterExpression: { directPairKey: { $type: 'string' } } });
conversationSchema.virtual('buyer', {
    ref: 'User',
    localField: 'buyerId',
    foreignField: '_id',
    justOne: true,
});
conversationSchema.virtual('seller', {
    ref: 'User',
    localField: 'sellerId',
    foreignField: '_id',
    justOne: true,
});
conversationSchema.virtual('product', {
    ref: 'Product',
    localField: 'productId',
    foreignField: '_id',
    justOne: true,
});
conversationSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'conversationId',
});
conversationSchema.virtual('transaction', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'conversationId',
    justOne: true,
});
const messageSchema = new mongoose_1.Schema({
    conversationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 4000 },
    isRead: { type: Boolean, default: false },
}, { ...commonOptions, collection: 'messages', timestamps: { createdAt: true, updatedAt: false } });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.virtual('sender', {
    ref: 'User',
    localField: 'senderId',
    foreignField: '_id',
    justOne: true,
});
messageSchema.virtual('conversation', {
    ref: 'Conversation',
    localField: 'conversationId',
    foreignField: '_id',
    justOne: true,
});
const transactionSchema = new mongoose_1.Schema({
    conversationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Conversation', required: true, unique: true },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    buyerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerConfirmed: { type: Boolean, default: null },
    sellerConfirmed: { type: Boolean, default: null },
    messageCount: { type: Number, default: 0, min: 0 },
    status: {
        type: String,
        enum: Object.values(exports.TransactionStatus),
        default: exports.TransactionStatus.PENDING_CONFIRMATION,
    },
}, { ...commonOptions, collection: 'transactions', timestamps: true });
transactionSchema.index({ buyerId: 1, updatedAt: -1 });
transactionSchema.index({ sellerId: 1, updatedAt: -1 });
transactionSchema.virtual('product', {
    ref: 'Product',
    localField: 'productId',
    foreignField: '_id',
    justOne: true,
});
transactionSchema.virtual('buyer', {
    ref: 'User',
    localField: 'buyerId',
    foreignField: '_id',
    justOne: true,
});
transactionSchema.virtual('seller', {
    ref: 'User',
    localField: 'sellerId',
    foreignField: '_id',
    justOne: true,
});
transactionSchema.virtual('conversation', {
    ref: 'Conversation',
    localField: 'conversationId',
    foreignField: '_id',
    justOne: true,
});
transactionSchema.virtual('review', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'transactionId',
    justOne: true,
});
transactionSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'transactionId',
});
const reviewSchema = new mongoose_1.Schema({
    transactionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    reviewerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    targetProductId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', default: null },
    targetType: { type: String, enum: ['BUYER', 'SELLER', 'PRODUCT'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    comment: { type: String, default: null, maxlength: 500 },
}, { ...commonOptions, collection: 'reviews', timestamps: { createdAt: true, updatedAt: false } });
reviewSchema.virtual('transaction', {
    ref: 'Transaction',
    localField: 'transactionId',
    foreignField: '_id',
    justOne: true,
});
reviewSchema.virtual('reviewer', {
    ref: 'User',
    localField: 'reviewerId',
    foreignField: '_id',
    justOne: true,
});
reviewSchema.virtual('targetUser', {
    ref: 'User',
    localField: 'targetUserId',
    foreignField: '_id',
    justOne: true,
});
reviewSchema.index({ targetUserId: 1 });
reviewSchema.index({ transactionId: 1, reviewerId: 1, targetType: 1 }, { unique: true });
function modelFor(name, schema, collection) {
    return mongoose_1.default.models[name] ??
        mongoose_1.default.model(name, schema, collection);
}
exports.User = modelFor('User', userSchema, 'users');
exports.UserAvailability = modelFor('UserAvailability', availabilitySchema, 'user_availabilities');
exports.Product = modelFor('Product', productSchema, 'products');
exports.ProductImage = modelFor('ProductImage', productImageSchema, 'product_images');
exports.ProductLike = modelFor('ProductLike', productLikeSchema, 'product_likes');
exports.ProductComment = modelFor('ProductComment', productCommentSchema, 'product_comments');
exports.Conversation = modelFor('Conversation', conversationSchema, 'conversations');
exports.Message = modelFor('Message', messageSchema, 'messages');
exports.Transaction = modelFor('Transaction', transactionSchema, 'transactions');
exports.Review = modelFor('Review', reviewSchema, 'reviews');
//# sourceMappingURL=index.js.map