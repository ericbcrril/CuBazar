import {
  Conversation,
  Product,
  ProductLike,
  ProductStatus,
  Review,
  User,
  UserAvailability,
} from '../../models';
import { getSocketServer } from '../../config/socket';
import { AppError } from '../../shared/errors/AppError';
import { toObjectId } from '../../shared/utils/objectId';
import { uploadImage } from '../../shared/utils/uploadImage';

export async function getMyProfile(userId: string) {
  const ownerId = toObjectId(userId);
  const [user, availability, publishedProducts, drafts, viewMetrics] = await Promise.all([
    User.findById(ownerId).select('email fullName profilePictureUrl role'),
    UserAvailability.findOne({ userId: ownerId }).select('isAvailable updatedAt'),
    Product.countDocuments({ sellerId: ownerId, status: ProductStatus.PUBLISHED }),
    Product.countDocuments({ sellerId: ownerId, status: ProductStatus.DRAFT }),
    Product.aggregate([
      { $match: { sellerId: ownerId } },
      { $group: { _id: null, totalViews: { $sum: '$viewCount24h' } } },
    ]),
  ]);
  if (!user) throw new AppError(404, 'Usuario no encontrado', 'NOT_FOUND');
  return {
    ...user.toJSON(),
    availability,
    isAvailable: availability?.isAvailable ?? false,
    metrics: {
      publishedProducts,
      drafts,
      views24h: viewMetrics[0]?.totalViews ?? 0,
    },
  };
}

export async function getPublicProfile(userId: string) {
  const ownerId = toObjectId(userId);
  const [user, availability, products, ratingMetrics] = await Promise.all([
    User.findById(ownerId).select('fullName profilePictureUrl'),
    UserAvailability.findOne({ userId: ownerId }).select('isAvailable'),
    Product.find({ sellerId: ownerId, status: ProductStatus.PUBLISHED })
      .sort({ createdAt: -1 })
      .populate({ path: 'images', options: { sort: { order: 1 } } }),
    Review.aggregate([
      { $match: { targetUserId: ownerId } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);
  if (!user) throw new AppError(404, 'Usuario no encontrado', 'NOT_FOUND');
  return {
    id: user.id,
    fullName: user.fullName,
    profilePictureUrl: user.profilePictureUrl,
    isAvailable: availability?.isAvailable ?? false,
    ratingAverage: ratingMetrics[0]?.average ?? null,
    reviewCount: ratingMetrics[0]?.count ?? 0,
    products,
  };
}

export async function updateAvailability(userId: string, isAvailable: boolean) {
  const availability = await UserAvailability.findOneAndUpdate(
    { userId: toObjectId(userId) },
    { $set: { isAvailable } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  getSocketServer()?.emit('availability_changed', {
    userId,
    isAvailable: availability.isAvailable,
  });
  return availability;
}

export async function getActivity(userId: string) {
  const ownerId = toObjectId(userId);
  const ownedProducts = await Product.find({ sellerId: ownerId }).select('_id title');
  const ownedIds = ownedProducts.map((product) => product._id);
  const [likes, conversations] = await Promise.all([
    ProductLike.find({ productId: { $in: ownedIds } })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate({ path: 'user', select: 'fullName profilePictureUrl' })
      .populate({ path: 'product', select: 'title type price' }),
    Conversation.find({
      $or: [{ buyerId: ownerId }, { sellerId: ownerId }],
    })
      .sort({ updatedAt: -1 })
      .limit(30)
      .populate({ path: 'buyer', select: 'fullName profilePictureUrl' })
      .populate({ path: 'seller', select: 'fullName profilePictureUrl' })
      .populate({ path: 'product', select: 'title type price' }),
  ]);
  return { likes, conversations };
}

export async function updateAvatar(userId: string, buffer: Buffer) {
  const uploaded = await uploadImage(buffer, `cubazar/avatars/${userId}`);
  const user = await User.findByIdAndUpdate(
    toObjectId(userId),
    { $set: { profilePictureUrl: uploaded.secure_url } },
    { new: true, runValidators: true },
  ).select('profilePictureUrl');
  if (!user) throw new AppError(404, 'Usuario no encontrado', 'NOT_FOUND');
  return { id: user.id, profilePictureUrl: user.profilePictureUrl };
}
