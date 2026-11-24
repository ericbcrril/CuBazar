import { Types } from 'mongoose';
import {
  Product,
  ProductComment,
  ProductImage,
  ProductLike,
  ProductStatus,
  Transaction,
  UserAvailability,
  type ProductRecord,
  type PublicationType,
} from '../../models';
import { AppError } from '../../shared/errors/AppError';
import { toObjectId } from '../../shared/utils/objectId';
import { uploadImage } from '../../shared/utils/uploadImage';

type ProductInput = Pick<
  ProductRecord,
  'title' | 'description' | 'price' | 'condition' | 'type' | 'status'
>;
type ProductPatch = Partial<ProductInput>;

async function availableSellerIds(): Promise<Types.ObjectId[]> {
  return UserAvailability.distinct('userId', { isAvailable: true });
}

function populateCatalogProduct(query: ReturnType<typeof Product.find>) {
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

export async function getFeed(page: number, limit: number) {
  const sellerIds = await availableSellerIds();
  const filter = { status: ProductStatus.PUBLISHED, sellerId: { $in: sellerIds } };
  const [products, total] = await Promise.all([
    populateCatalogProduct(Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)),
    Product.countDocuments(filter),
  ]);
  return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getExplore(viewerId?: string) {
  const sellerIds = await availableSellerIds();
  const filter = { status: ProductStatus.PUBLISHED, sellerId: { $in: sellerIds } };
  const filteredSellerIds = viewerId
    ? sellerIds.filter((sellerId) => String(sellerId) !== viewerId)
    : sellerIds;
  const catalogFilter = { status: ProductStatus.PUBLISHED, sellerId: { $in: filteredSellerIds } };
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [newVentures, trending, greatDeals] = await Promise.all([
    populateCatalogProduct(
      Product.find({ ...catalogFilter, createdAt: { $gte: sevenDaysAgo } })
        .sort({ createdAt: -1 })
        .limit(10),
    ),
    populateCatalogProduct(Product.find(catalogFilter).sort({ viewCount24h: -1 }).limit(10)),
    populateCatalogProduct(
      Product.find({
        ...catalogFilter,
        $or: [
          { type: 'VENTA' satisfies PublicationType },
          { type: 'PUBLICACION' satisfies PublicationType, price: { $gt: 0 } },
        ],
      })
        .sort({ price: 1 })
        .limit(10),
    ),
  ]);
  return { newVentures, trending, greatDeals };
}

export async function getMyProducts(
  userId: string,
  status: ProductStatus | undefined,
  page: number,
  limit: number,
) {
  const filter = {
    sellerId: toObjectId(userId),
    ...(status ? { status } : {}),
  };
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: 'images', options: { sort: { order: 1 } } })
      .populate('likeCount')
      .populate('commentCount'),
    Product.countDocuments(filter),
  ]);
  return { products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getProduct(productId: string, viewerId: string) {
  const id = toObjectId(productId);
  const existing = await Product.findById(id);
  if (!existing) throw new AppError(404, 'Producto no encontrado', 'NOT_FOUND');
  if (existing.status === ProductStatus.DRAFT && String(existing.sellerId) !== viewerId) {
    throw new AppError(404, 'Producto no encontrado', 'NOT_FOUND');
  }
  if (String(existing.sellerId) !== viewerId) {
    await Product.updateOne({ _id: id }, { $inc: { viewCount24h: 1 } });
  }
  const [product, isLikedByMe] = await Promise.all([
    Product.findById(id)
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
    ProductLike.exists({ productId: id, userId: toObjectId(viewerId) }),
  ]);
  if (!product) throw new AppError(404, 'Producto no encontrado', 'NOT_FOUND');
  return { ...product.toJSON(), isLikedByMe: Boolean(isLikedByMe) };
}

export async function createProduct(
  sellerId: string,
  input: ProductInput,
  files: Express.Multer.File[],
) {
  const productId = new Types.ObjectId();
  const uploads = await Promise.all(
    files.map((file) => uploadImage(file.buffer, `cubazar/products/${productId.toHexString()}`)),
  );
  const product = await Product.create({
    _id: productId,
    sellerId: toObjectId(sellerId),
    ...input,
  });
  if (uploads.length) {
    await ProductImage.insertMany(
      uploads.map((image, order) => ({
        productId,
        imageUrl: image.secure_url,
        order,
      })),
    );
  }
  return Product.findById(product._id).populate({
    path: 'images',
    options: { sort: { order: 1 } },
  });
}

export async function updateProduct(
  productId: string,
  sellerId: string,
  input: ProductPatch,
  files: Express.Multer.File[] = [],
) {
  const id = toObjectId(productId);
  const product = await Product.findById(id);
  if (!product) throw new AppError(404, 'Producto no encontrado', 'NOT_FOUND');
  if (String(product.sellerId) !== sellerId) {
    throw new AppError(403, 'No puedes modificar esta publicación', 'FORBIDDEN');
  }
  if (input.status && input.status !== product.status) {
    const transitions: Record<ProductStatus, ProductStatus[]> = {
      [ProductStatus.DRAFT]: [ProductStatus.PUBLISHED, ProductStatus.SOLD, ProductStatus.ARCHIVED],
      [ProductStatus.PUBLISHED]: [ProductStatus.SOLD, ProductStatus.ARCHIVED],
      [ProductStatus.SOLD]: [],
      [ProductStatus.ARCHIVED]: [],
    };
    if (!transitions[product.status].includes(input.status)) {
      throw new AppError(400, 'La publicación no puede cambiar a ese estado', 'INVALID_STATUS_TRANSITION');
    }
  }
  Object.assign(product, input);
  await product.save();
  if (files.length) {
    const uploads = await Promise.all(
      files.map((file) => uploadImage(file.buffer, `cubazar/products/${id.toHexString()}`)),
    );
    const lastImage = await ProductImage.findOne({ productId: id }).sort({ order: -1 }).select('order');
    let nextOrder = (lastImage?.order ?? -1) + 1;
    await ProductImage.insertMany(
      uploads.map((image) => ({
        productId: id,
        imageUrl: image.secure_url,
        order: nextOrder++,
      })),
    );
  }
  return product.populate({ path: 'images', options: { sort: { order: 1 } } });
}

export async function setSold(productId: string, sellerId: string, isSold: boolean) {
  const id = toObjectId(productId);
  const product = await Product.findById(id);
  if (!product) throw new AppError(404, 'Producto no encontrado', 'NOT_FOUND');
  if (String(product.sellerId) !== sellerId) {
    throw new AppError(403, 'Solo el vendedor puede cambiar el estado', 'FORBIDDEN');
  }
  product.status = isSold ? ProductStatus.SOLD : ProductStatus.PUBLISHED;
  await product.save();
  return product.populate({ path: 'images', options: { sort: { order: 1 } } });
}

export async function deleteProductImage(productId: string, imageId: string, sellerId: string) {
  const productObjectId = toObjectId(productId);
  const imageObjectId = toObjectId(imageId);
  const product = await Product.findById(productObjectId).select('sellerId');
  if (!product) throw new AppError(404, 'Producto no encontrado', 'NOT_FOUND');
  if (String(product.sellerId) !== sellerId) {
    throw new AppError(403, 'No puedes modificar esta publicación', 'FORBIDDEN');
  }
  const deleted = await ProductImage.findOneAndDelete({ _id: imageObjectId, productId: productObjectId });
  if (!deleted) throw new AppError(404, 'Imagen no encontrada', 'NOT_FOUND');
}

export async function deleteProduct(productId: string, sellerId: string) {
  const id = toObjectId(productId);
  const product = await Product.findById(id).select('sellerId');
  if (!product) throw new AppError(404, 'Producto no encontrado', 'NOT_FOUND');
  if (String(product.sellerId) !== sellerId) {
    throw new AppError(403, 'No puedes eliminar esta publicación', 'FORBIDDEN');
  }
  if (await Transaction.exists({ productId: id })) {
    throw new AppError(409, 'No se puede eliminar una publicación con transacciones registradas', 'PRODUCT_HAS_TRANSACTIONS');
  }
  await Promise.all([
    ProductImage.deleteMany({ productId: id }),
    ProductLike.deleteMany({ productId: id }),
    ProductComment.deleteMany({ productId: id }),
    Product.deleteOne({ _id: id }),
  ]);
}

export async function toggleLike(productId: string, userId: string) {
  const id = toObjectId(productId);
  const userObjectId = toObjectId(userId);
  const product = await Product.findOne({ _id: id, status: ProductStatus.PUBLISHED }).select('_id');
  if (!product) throw new AppError(404, 'Publicación no disponible', 'NOT_FOUND');

  const existing = await ProductLike.findOneAndDelete({ productId: id, userId: userObjectId });
  if (existing) {
    return {
      liked: false,
      totalLikes: await ProductLike.countDocuments({ productId: id }),
    };
  }
  await ProductLike.create({ productId: id, userId: userObjectId });
  return {
    liked: true,
    totalLikes: await ProductLike.countDocuments({ productId: id }),
  };
}

export async function createComment(productId: string, userId: string, content: string) {
  const id = toObjectId(productId);
  const product = await Product.findOne({ _id: id, status: ProductStatus.PUBLISHED }).select('_id');
  if (!product) throw new AppError(404, 'Publicación no disponible', 'NOT_FOUND');
  return ProductComment.create({
    productId: id,
    userId: toObjectId(userId),
    content,
  }).then((comment) => comment.populate({ path: 'user', select: 'fullName profilePictureUrl' }));
}
