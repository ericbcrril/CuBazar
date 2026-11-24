export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  profilePictureUrl: string | null;
  role: 'STUDENT' | 'ADMIN';
}

export type ApiPublicUser = Pick<ApiUser, 'id' | 'fullName' | 'profilePictureUrl'>;

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: ApiUser;
}

export interface ApiImage {
  id?: string;
  _id?: string;
  imageUrl: string;
  order: number;
}

export interface ApiComment {
  id?: string;
  _id?: string;
  content: string;
  createdAt: string;
  user?: ApiPublicUser | string;
  userId?: string;
}

export interface ApiProduct {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  condition: 'NUEVO' | 'USADO_COMO_NUEVO' | 'USADO_BUEN_ESTADO' | 'USADO_ACEPTABLE';
  type: 'VENTA' | 'PUBLICACION';
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED';
  seller?: ApiPublicUser | string;
  sellerId?: string;
  images?: ApiImage[];
  likeCount?: number;
  commentCount?: number;
  isLikedByMe?: boolean;
  likedByMe?: boolean;
  comments?: ApiComment[];
  viewCount24h?: number;
  createdAt?: string;
}

export interface ProductPage {
  products: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ExploreResponse {
  newVentures: ApiProduct[];
  trending: ApiProduct[];
  greatDeals: ApiProduct[];
}

export interface MyProfile extends ApiUser {
  isAvailable: boolean;
  availability: { isAvailable: boolean; updatedAt: string } | null;
  metrics: {
    publishedProducts: number;
    drafts: number;
    views24h: number;
  };
}

export interface PublicProfile {
  id: string;
  fullName: string;
  profilePictureUrl: string | null;
  isAvailable: boolean;
  ratingAverage: number | null;
  reviewCount: number;
  products: ApiProduct[];
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: ApiPublicUser;
}

export interface ApiConversation {
  id?: string;
  _id?: string;
  buyerId: string;
  sellerId: string;
  buyer?: ApiPublicUser;
  seller?: ApiPublicUser;
  product?: Pick<ApiProduct, 'id' | '_id' | 'title' | 'price' | 'status' | 'images'> | null;
  directPairKey?: string | null;
  productId?: string | null;
  messages?: ApiMessage[];
  updatedAt: string;
  transaction?: ApiTransaction;
}

export interface ApiActivityLike {
  id?: string;
  _id?: string;
  createdAt?: string;
  user?: ApiPublicUser;
  product?: Pick<ApiProduct, 'id' | '_id' | 'title' | 'type' | 'price'>;
}

export interface ApiActivity {
  likes: ApiActivityLike[];
  conversations: ApiConversation[];
}

export interface ApiTransaction {
  id?: string;
  _id?: string;
  status: 'PENDING_CONFIRMATION' | 'MUTUAL_CONFIRMED' | 'CANCELLED';
  buyerConfirmed: boolean | null;
  sellerConfirmed: boolean | null;
  messageCount?: number;
  buyerId: string;
  sellerId: string;
  product?: ApiProduct;
  buyer?: ApiPublicUser;
  seller?: ApiPublicUser;
  review?: ApiReview | null;
  reviews?: ApiReview[];
  conversationId?: string;
  conversation?: ApiConversation | null;
  updatedAt: string;
}

export interface ApiReview {
  id?: string;
  _id?: string;
  transactionId: string;
  reviewerId: string;
  targetUserId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  targetType?: 'BUYER' | 'SELLER' | 'PRODUCT';
  targetProductId?: string | null;
}

export type ApiProductStatus = ApiProduct['status'];
export type ApiProductCondition = ApiProduct['condition'];
