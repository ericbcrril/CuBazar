import mongoose, { Schema, Types, type Model } from 'mongoose';

export const Role = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Condition = {
  NUEVO: 'NUEVO',
  USADO_COMO_NUEVO: 'USADO_COMO_NUEVO',
  USADO_BUEN_ESTADO: 'USADO_BUEN_ESTADO',
  USADO_ACEPTABLE: 'USADO_ACEPTABLE',
} as const;
export type Condition = (typeof Condition)[keyof typeof Condition];

export const PublicationType = {
  VENTA: 'VENTA',
  PUBLICACION: 'PUBLICACION',
} as const;
export type PublicationType = (typeof PublicationType)[keyof typeof PublicationType];

export const ProductStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SOLD: 'SOLD',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const TransactionStatus = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  MUTUAL_CONFIRMED: 'MUTUAL_CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRecord extends Timestamped {
  email: string;
  credHash: string | null;
  fullName: string;
  profilePictureUrl: string | null;
  role: Role;
  isEmailVerified: boolean;
  googleId?: string | null;
}

export interface UserAvailabilityRecord {
  userId: Types.ObjectId;
  isAvailable: boolean;
  updatedAt: Date;
}

export interface ProductRecord extends Timestamped {
  sellerId: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  type: PublicationType;
  status: ProductStatus;
  viewCount24h: number;
}

export interface ProductImageRecord {
  productId: Types.ObjectId;
  imageUrl: string;
  order: number;
}

export interface ProductLikeRecord {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
}

export interface ProductCommentRecord {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface ConversationRecord extends Timestamped {
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  productId: Types.ObjectId | null;
  directPairKey: string | null;
  deletedBy: Types.ObjectId[];
}

export interface MessageRecord {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface TransactionRecord extends Timestamped {
  conversationId: Types.ObjectId;
  productId: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  buyerConfirmed: boolean | null;
  sellerConfirmed: boolean | null;
  messageCount: number;
  status: TransactionStatus;
}

export interface ReviewRecord {
  transactionId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  targetUserId: Types.ObjectId | null;
  targetProductId: Types.ObjectId | null;
  targetType: 'BUYER' | 'SELLER' | 'PRODUCT';
  rating: number;
  comment: string | null;
  createdAt: Date;
}

const commonOptions = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const userSchema = new Schema<UserRecord>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    credHash: { type: String, default: null, select: false },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    profilePictureUrl: { type: String, default: null },
    role: { type: String, enum: Object.values(Role), default: Role.STUDENT },
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String, default: undefined },
  },
  { ...commonOptions, collection: 'users', timestamps: true },
);
userSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } },
);
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

const availabilitySchema = new Schema<UserAvailabilityRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isAvailable: { type: Boolean, default: false },
  },
  { ...commonOptions, collection: 'user_availabilities', timestamps: { createdAt: false, updatedAt: true } },
);
availabilitySchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

const productSchema = new Schema<ProductRecord>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, minlength: 10, maxlength: 2000 },
    price: { type: Number, required: true, min: 0, max: 99_999_999.99 },
    condition: { type: String, enum: Object.values(Condition), default: Condition.NUEVO },
    type: { type: String, enum: Object.values(PublicationType), default: PublicationType.VENTA },
    status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.PUBLISHED },
    viewCount24h: { type: Number, default: 0, min: 0 },
  },
  { ...commonOptions, collection: 'products', timestamps: true },
);
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

const productImageSchema = new Schema<ProductImageRecord>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0, min: 0 },
  },
  { ...commonOptions, collection: 'product_images', timestamps: false },
);
productImageSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});

const productLikeSchema = new Schema<ProductLikeRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { ...commonOptions, collection: 'product_likes', timestamps: { createdAt: true, updatedAt: false } },
);
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

const productCommentSchema = new Schema<ProductCommentRecord>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, minlength: 1, maxlength: 500 },
  },
  { ...commonOptions, collection: 'product_comments', timestamps: { createdAt: true, updatedAt: false } },
);
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

const conversationSchema = new Schema<ConversationRecord>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    directPairKey: { type: String, default: null },
    deletedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { ...commonOptions, collection: 'conversations', timestamps: true },
);
conversationSchema.index(
  { buyerId: 1, sellerId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { productId: { $type: 'objectId' } } },
);
conversationSchema.index(
  { directPairKey: 1 },
  { unique: true, partialFilterExpression: { directPairKey: { $type: 'string' } } },
);
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

const messageSchema = new Schema<MessageRecord>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 4000 },
    isRead: { type: Boolean, default: false },
  },
  { ...commonOptions, collection: 'messages', timestamps: { createdAt: true, updatedAt: false } },
);
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

const transactionSchema = new Schema<TransactionRecord>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, unique: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    buyerConfirmed: { type: Boolean, default: null },
    sellerConfirmed: { type: Boolean, default: null },
    messageCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING_CONFIRMATION,
    },
  },
  { ...commonOptions, collection: 'transactions', timestamps: true },
);
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

const reviewSchema = new Schema<ReviewRecord>(
  {
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    targetProductId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
    targetType: { type: String, enum: ['BUYER', 'SELLER', 'PRODUCT'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
    comment: { type: String, default: null, maxlength: 500 },
  },
  { ...commonOptions, collection: 'reviews', timestamps: { createdAt: true, updatedAt: false } },
);
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

function modelFor<T>(name: string, schema: Schema<T>, collection?: string): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ??
    mongoose.model<T>(name, schema, collection);
}

export const User = modelFor<UserRecord>('User', userSchema, 'users');
export const UserAvailability = modelFor<UserAvailabilityRecord>(
  'UserAvailability',
  availabilitySchema,
  'user_availabilities',
);
export const Product = modelFor<ProductRecord>('Product', productSchema, 'products');
export const ProductImage = modelFor<ProductImageRecord>('ProductImage', productImageSchema, 'product_images');
export const ProductLike = modelFor<ProductLikeRecord>('ProductLike', productLikeSchema, 'product_likes');
export const ProductComment = modelFor<ProductCommentRecord>(
  'ProductComment',
  productCommentSchema,
  'product_comments',
);
export const Conversation = modelFor<ConversationRecord>('Conversation', conversationSchema, 'conversations');
export const Message = modelFor<MessageRecord>('Message', messageSchema, 'messages');
export const Transaction = modelFor<TransactionRecord>('Transaction', transactionSchema, 'transactions');
export const Review = modelFor<ReviewRecord>('Review', reviewSchema, 'reviews');
