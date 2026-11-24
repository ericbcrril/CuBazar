"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeed = getFeed;
exports.getExplore = getExplore;
exports.getMyProducts = getMyProducts;
exports.getProduct = getProduct;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.setSold = setSold;
exports.deleteProductImage = deleteProductImage;
exports.deleteProduct = deleteProduct;
exports.toggleLike = toggleLike;
exports.createComment = createComment;
const mongoose_1 = require("mongoose");
const models_1 = require("../../models");
const AppError_1 = require("../../shared/errors/AppError");
const objectId_1 = require("../../shared/utils/objectId");
const uploadImage_1 = require("../../shared/utils/uploadImage");
async function availableSellerIds() {
    return models_1.UserAvailability.distinct('userId', { isAvailable: true });
}
function populateCatalogProduct(query) {
    return query
        .populate({ path: 'images', options: { sort: { order: 1 } } })
        .populate({
        path: 'seller',
        select: 'fullName profilePictureUrl',
        populate: { path: 'availability', select: 'isAvailable' },
    })
        .populate('likeCount')
        .populate('commentCount');
}
async function getFeed(page, limit) {
    const sellerIds = await availableSellerIds();
    const filter = { status: models_1.ProductStatus.PUBLISHED, sellerId: { $in: sellerIds } };
    const [products, total] = await Promise.all([
        populateCatalogProduct(models_1.Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)),
        models_1.Product.countDocuments(filter),
    ]);
    return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
async function getExplore(viewerId) {
    const sellerIds = await availableSellerIds();
    const filter = { status: models_1.ProductStatus.PUBLISHED, sellerId: { $in: sellerIds } };
    const filteredSellerIds = viewerId
        ? sellerIds.filter((sellerId) => String(sellerId) !== viewerId)
        : sellerIds;
    const catalogFilter = { status: models_1.ProductStatus.PUBLISHED, sellerId: { $in: filteredSellerIds } };
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newVentures, trending, greatDeals] = await Promise.all([
        populateCatalogProduct(models_1.Product.find({ ...catalogFilter, createdAt: { $gte: sevenDaysAgo } })
            .sort({ createdAt: -1 })
            .limit(10)),
        populateCatalogProduct(models_1.Product.find(catalogFilter).sort({ viewCount24h: -1 }).limit(10)),
        populateCatalogProduct(models_1.Product.find({
            ...catalogFilter,
            $or: [
                { type: 'VENTA' },
                { type: 'PUBLICACION', price: { $gt: 0 } },
            ],
        })
            .sort({ price: 1 })
            .limit(10)),
    ]);
    return { newVentures, trending, greatDeals };
}
async function getMyProducts(userId, status, page, limit) {
    const filter = {
        sellerId: (0, objectId_1.toObjectId)(userId),
        ...(status ? { status } : {}),
    };
    const [products, total] = await Promise.all([
        models_1.Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({ path: 'images', options: { sort: { order: 1 } } })
            .populate('likeCount')
            .populate('commentCount'),
        models_1.Product.countDocuments(filter),
    ]);
    return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
async function getProduct(productId, viewerId) {
    const id = (0, objectId_1.toObjectId)(productId);
    const existing = await models_1.Product.findById(id);
    if (!existing)
        throw new AppError_1.AppError(404, 'Producto no encontrado', 'NOT_FOUND');
    if (existing.status === models_1.ProductStatus.DRAFT && String(existing.sellerId) !== viewerId) {
        throw new AppError_1.AppError(404, 'Producto no encontrado', 'NOT_FOUND');
    }
    if (String(existing.sellerId) !== viewerId) {
        await models_1.Product.updateOne({ _id: id }, { $inc: { viewCount24h: 1 } });
    }
    const [product, isLikedByMe] = await Promise.all([
        models_1.Product.findById(id)
            .populate({
            path: 'seller',
            select: 'fullName profilePictureUrl',
            populate: { path: 'availability', select: 'isAvailable' },
        })
            .populate({ path: 'images', options: { sort: { order: 1 } } })
            .populate({
            path: 'comments',
            options: { sort: { createdAt: 1 } },
            populate: { path: 'user', select: 'fullName profilePictureUrl' },
        })
            .populate('likeCount')
            .populate('commentCount'),
        models_1.ProductLike.exists({ productId: id, userId: (0, objectId_1.toObjectId)(viewerId) }),
    ]);
    if (!product)
        throw new AppError_1.AppError(404, 'Producto no encontrado', 'NOT_FOUND');
    return { ...product.toJSON(), isLikedByMe: Boolean(isLikedByMe) };
}
async function createProduct(sellerId, input, files) {
    const productId = new mongoose_1.Types.ObjectId();
    const uploads = await Promise.all(files.map((file) => (0, uploadImage_1.uploadImage)(file.buffer, `cubazar/products/${productId.toHexString()}`)));
    const product = await models_1.Product.create({
        _id: productId,
        sellerId: (0, objectId_1.toObjectId)(sellerId),
        ...input,
    });
    if (uploads.length) {
        await models_1.ProductImage.insertMany(uploads.map((image, order) => ({
            productId,
            imageUrl: image.secure_url,
            order,
        })));
    }
    return models_1.Product.findById(product._id).populate({
        path: 'images',
        options: { sort: { order: 1 } },
    });
}
async function updateProduct(productId, sellerId, input, files = []) {
    const id = (0, objectId_1.toObjectId)(productId);
    const product = await models_1.Product.findById(id);
    if (!product)
        throw new AppError_1.AppError(404, 'Producto no encontrado', 'NOT_FOUND');
    if (String(product.sellerId) !== sellerId) {
        throw new AppError_1.AppError(403, 'No puedes modificar esta publicación', 'FORBIDDEN');
    }
    if (input.status && input.status !== product.status) {
        const transitions = {
            [models_1.ProductStatus.DRAFT]: [models_1.ProductStatus.PUBLISHED, models_1.ProductStatus.SOLD, models_1.ProductStatus.ARCHIVED],
            [models_1.ProductStatus.PUBLISHED]: [models_1.ProductStatus.SOLD, models_1.ProductStatus.ARCHIVED],
            [models_1.ProductStatus.SOLD]: [],
            [models_1.ProductStatus.ARCHIVED]: [],
        };
        if (!transitions[product.status].includes(input.status)) {
            throw new AppError_1.AppError(400, 'La publicación no puede cambiar a ese estado', 'INVALID_STATUS_TRANSITION');
        }
    }
    Object.assign(product, input);
    await product.save();
    if (files.length) {
        const uploads = await Promise.all(files.map((file) => (0, uploadImage_1.uploadImage)(file.buffer, `cubazar/products/${id.toHexString()}`)));
        const lastImage = await models_1.ProductImage.findOne({ productId: id }).sort({ order: -1 }).select('order');
        let nextOrder = (lastImage?.order ?? -1) + 1;
        await models_1.ProductImage.insertMany(uploads.map((image) => ({
            productId: id,
            imageUrl: image.secure_url,
            order: nextOrder++,
        })));
    }
    return product.populate({ path: 'images', options: { sort: { order: 1 } } });
}
async function setSold(productId, sellerId, isSold) {
    const id = (0, objectId_1.toObjectId)(productId);
    const product = await models_1.Product.findById(id);
    if (!product)
        throw new AppError_1.AppError(404, 'Producto no encontrado', 'NOT_FOUND');
    if (String(product.sellerId) !== sellerId) {
        throw new AppError_1.AppError(403, 'Solo el vendedor puede cambiar el estado', 'FORBIDDEN');
    }
    product.status = isSold ? models_1.ProductStatus.SOLD : models_1.ProductStatus.PUBLISHED;
    await product.save();
    return product.populate({ path: 'images', options: { sort: { order: 1 } } });
}
async function deleteProductImage(productId, imageId, sellerId) {
    const productObjectId = (0, objectId_1.toObjectId)(productId);
    const imageObjectId = (0, objectId_1.toObjectId)(imageId);
    const product = await models_1.Product.findById(productObjectId).select('sellerId');
    if (!product)
        throw new AppError_1.AppError(404, 'Producto no encontrado', 'NOT_FOUND');
    if (String(product.sellerId) !== sellerId) {
        throw new AppError_1.AppError(403, 'No puedes modificar esta publicación', 'FORBIDDEN');
    }
    const deleted = await models_1.ProductImage.findOneAndDelete({ _id: imageObjectId, productId: productObjectId });
    if (!deleted)
        throw new AppError_1.AppError(404, 'Imagen no encontrada', 'NOT_FOUND');
}
async function deleteProduct(productId, sellerId) {
    const id = (0, objectId_1.toObjectId)(productId);
    const product = await models_1.Product.findById(id).select('sellerId');
    if (!product)
        throw new AppError_1.AppError(404, 'Producto no encontrado', 'NOT_FOUND');
    if (String(product.sellerId) !== sellerId) {
        throw new AppError_1.AppError(403, 'No puedes eliminar esta publicación', 'FORBIDDEN');
    }
    if (await models_1.Transaction.exists({ productId: id })) {
        throw new AppError_1.AppError(409, 'No se puede eliminar una publicación con transacciones registradas', 'PRODUCT_HAS_TRANSACTIONS');
    }
    await Promise.all([
        models_1.ProductImage.deleteMany({ productId: id }),
        models_1.ProductLike.deleteMany({ productId: id }),
        models_1.ProductComment.deleteMany({ productId: id }),
        models_1.Product.deleteOne({ _id: id }),
    ]);
}
async function toggleLike(productId, userId) {
    const id = (0, objectId_1.toObjectId)(productId);
    const userObjectId = (0, objectId_1.toObjectId)(userId);
    const product = await models_1.Product.findOne({ _id: id, status: models_1.ProductStatus.PUBLISHED }).select('_id');
    if (!product)
        throw new AppError_1.AppError(404, 'Publicación no disponible', 'NOT_FOUND');
    const existing = await models_1.ProductLike.findOneAndDelete({ productId: id, userId: userObjectId });
    if (existing) {
        return {
            liked: false,
            totalLikes: await models_1.ProductLike.countDocuments({ productId: id }),
        };
    }
    await models_1.ProductLike.create({ productId: id, userId: userObjectId });
    return {
        liked: true,
        totalLikes: await models_1.ProductLike.countDocuments({ productId: id }),
    };
}
async function createComment(productId, userId, content) {
    const id = (0, objectId_1.toObjectId)(productId);
    const product = await models_1.Product.findOne({ _id: id, status: models_1.ProductStatus.PUBLISHED }).select('_id');
    if (!product)
        throw new AppError_1.AppError(404, 'Publicación no disponible', 'NOT_FOUND');
    return models_1.ProductComment.create({
        productId: id,
        userId: (0, objectId_1.toObjectId)(userId),
        content,
    }).then((comment) => comment.populate({ path: 'user', select: 'fullName profilePictureUrl' }));
}
//# sourceMappingURL=products.service.js.map