"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = getMyProfile;
exports.getPublicProfile = getPublicProfile;
exports.updateAvailability = updateAvailability;
exports.getActivity = getActivity;
exports.updateAvatar = updateAvatar;
const models_1 = require("../../models");
const socket_1 = require("../../config/socket");
const AppError_1 = require("../../shared/errors/AppError");
const objectId_1 = require("../../shared/utils/objectId");
const uploadImage_1 = require("../../shared/utils/uploadImage");
async function getMyProfile(userId) {
    const ownerId = (0, objectId_1.toObjectId)(userId);
    const [user, availability, publishedProducts, drafts, viewMetrics] = await Promise.all([
        models_1.User.findById(ownerId).select('email fullName profilePictureUrl role'),
        models_1.UserAvailability.findOne({ userId: ownerId }).select('isAvailable updatedAt'),
        models_1.Product.countDocuments({ sellerId: ownerId, status: models_1.ProductStatus.PUBLISHED }),
        models_1.Product.countDocuments({ sellerId: ownerId, status: models_1.ProductStatus.DRAFT }),
        models_1.Product.aggregate([
            { $match: { sellerId: ownerId } },
            { $group: { _id: null, totalViews: { $sum: '$viewCount24h' } } },
        ]),
    ]);
    if (!user)
        throw new AppError_1.AppError(404, 'Usuario no encontrado', 'NOT_FOUND');
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
async function getPublicProfile(userId) {
    const ownerId = (0, objectId_1.toObjectId)(userId);
    const [user, availability, products, ratingMetrics] = await Promise.all([
        models_1.User.findById(ownerId).select('fullName profilePictureUrl'),
        models_1.UserAvailability.findOne({ userId: ownerId }).select('isAvailable'),
        models_1.Product.find({ sellerId: ownerId, status: models_1.ProductStatus.PUBLISHED })
            .sort({ createdAt: -1 })
            .populate({ path: 'images', options: { sort: { order: 1 } } }),
        models_1.Review.aggregate([
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
    if (!user)
        throw new AppError_1.AppError(404, 'Usuario no encontrado', 'NOT_FOUND');
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
async function updateAvailability(userId, isAvailable) {
    const availability = await models_1.UserAvailability.findOneAndUpdate({ userId: (0, objectId_1.toObjectId)(userId) }, { $set: { isAvailable } }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    (0, socket_1.getSocketServer)()?.emit('availability_changed', {
        userId,
        isAvailable: availability.isAvailable,
    });
    return availability;
}
async function getActivity(userId) {
    const ownerId = (0, objectId_1.toObjectId)(userId);
    const ownedProducts = await models_1.Product.find({ sellerId: ownerId }).select('_id title');
    const ownedIds = ownedProducts.map((product) => product._id);
    const [likes, conversations] = await Promise.all([
        models_1.ProductLike.find({ productId: { $in: ownedIds } })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate({ path: 'user', select: 'fullName profilePictureUrl' })
            .populate({ path: 'product', select: 'title type price' }),
        models_1.Conversation.find({
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
async function updateAvatar(userId, buffer) {
    const uploaded = await (0, uploadImage_1.uploadImage)(buffer, `cubazar/avatars/${userId}`);
    const user = await models_1.User.findByIdAndUpdate((0, objectId_1.toObjectId)(userId), { $set: { profilePictureUrl: uploaded.secure_url } }, { new: true, runValidators: true }).select('profilePictureUrl');
    if (!user)
        throw new AppError_1.AppError(404, 'Usuario no encontrado', 'NOT_FOUND');
    return { id: user.id, profilePictureUrl: user.profilePictureUrl };
}
//# sourceMappingURL=users.service.js.map