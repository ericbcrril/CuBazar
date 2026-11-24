import type { ImageSourcePropType } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Chats: undefined;
  Chat: { userName: string };
  Publish: undefined;
  MyPurchases: undefined;
  MyProducts: undefined;
  About: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Search: undefined;
  Activity: undefined;
  Account: undefined;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  seller: string;
  rating: number;
  reviews: number;
  description: string;
  image: ImageSourcePropType;
};
