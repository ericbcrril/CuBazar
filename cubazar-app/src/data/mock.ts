import type { Product } from '@/types/navigation';
import type { ImageSourcePropType } from 'react-native';

const productImage: ImageSourcePropType = require('../assets/images/download.jpg');

export const products: Product[] = [
  {
    id: '1',
    title: 'Cargador universal USB-C',
    price: 120,
    seller: 'Andrea López',
    rating: 5,
    reviews: 12,
    description: 'Cargador rápido, funciona con la mayoría de laptops y celulares. Entrega en CUCEI.',
    image: productImage,
  },
  {
    id: '2',
    title: 'Tacos de guisado',
    price: 45,
    seller: 'Jesús Rivas',
    rating: 4,
    reviews: 30,
    description: 'Orden de 3 tacos con salsa. Disponible de 10:00 a 15:00.',
    image: productImage,
  },
  {
    id: '3',
    title: 'Burritos de machaca',
    price: 60,
    seller: 'Sergio Duarte',
    rating: 5,
    reviews: 18,
    description: 'Burritos grandes, se entregan calientes en el punto de encuentro acordado.',
    image: productImage,
  },
];

export const currentUser = {
  nombre: 'Andrea López',
  correo: 'andrea@alumnos.udg.mx',
};

export const acercaDe = {
  version: '1.0.0',
  copyright: 'CuBazar · Proyecto universitario',
  soporte: ['Atención a usuarios', 'Disponible de lunes a viernes'],
};

export const condiciones = ['Nuevo', 'Usado', 'Reacondicionado'];

export const misPublicaciones = {
  total: 2,
  vistas24h: 24,
  publicadas: [
    { id: '1', titulo: products[0].title, precio: products[0].price, condicion: 'Usado' },
    { id: '2', titulo: products[1].title, precio: products[1].price, condicion: 'Nuevo' },
  ],
  borradores: [
    { id: '3', titulo: products[2].title, precio: products[2].price, condicion: 'Nuevo' },
  ],
};

export const posts = [
  {
    id: '1',
    autor: products[0].seller,
    tipo: 'Venta',
    hace: 'Publicado hace 47 min',
    descripcion: products[0].description,
    likes: 12,
    comentarios: 3,
  },
  {
    id: '2',
    autor: products[1].seller,
    tipo: 'Emprendimiento',
    hace: 'Publicado hace 2 h',
    descripcion: products[1].description,
    likes: 8,
    comentarios: 2,
  },
];

export const chats = [
  { id: 'c1', usuario: 'María Gómez', ultimo: '¿Sigue disponible?', noLeido: true },
  { id: 'c2', usuario: 'Luis Hernández', ultimo: 'Gracias por la información', noLeido: false },
];

export const mensajesIniciales = [
  { id: '1', mio: false, texto: 'Hola, ¿sigue disponible?' },
  { id: '2', mio: true, texto: 'Sí, podemos coordinar la entrega en el campus.' },
];

export const compras = [
  { id: '1', titulo: products[0].title, vendedor: products[0].seller, fecha: '12 de mayo', total: products[0].price },
  { id: '2', titulo: products[1].title, vendedor: products[1].seller, fecha: '8 de mayo', total: products[1].price },
  { id: '3', titulo: products[2].title, vendedor: products[2].seller, fecha: '2 de mayo', total: products[2].price },
];

export const explorar = {
  nuevos: [products[0]],
  tendencia: [products[1]],
  ofertas: [products[2]],
};

export const featured = {
  nuevos: products[0],
  tendencia: products[1],
  ofertas: products[2],
};
