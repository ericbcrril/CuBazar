// Datos de ejemplo para maquetar las vistas.
// Cuando tengas la API (Node + Express), reemplaza estos imports por llamadas fetch.
export const currentUser = {
  id: "u1",
  nombre: "Sebino Sovretti",
  correo: "correo@alumnos.udg.mx",
};

export const posts = [
  {
    id: "p1",
    autor: "Sebino Sovretti",
    tipo: "Venta",
    hace: "Publicado hace 67 mins",
    descripcion:
      "Vendo laptop en excelente estado, ideal para clases en CUCEI. Entrega en persona dentro del plantel.",
    likes: 12,
    comentarios: 4,
  },
  {
    id: "p2",
    autor: "Joshua Salazar",
    tipo: "Venta",
    hace: "Publicado hace 2 hrs",
    descripcion: "Hago pedidos de comida para entregar entre clases. Escríbeme por chat.",
    likes: 8,
    comentarios: 1,
  },
];

const prod = (id: string, titulo: string, precio: number, autor: string) => ({
  id,
  titulo,
  precio,
  autor,
  estrellas: 5,
});

export const explorar = {
  nuevos: [prod("e1", "Producto 0", 1500, "Joshua Salazar"), prod("e2", "Producto 0", 300, "José Rivas")],
  tendencia: [prod("e3", "Producto 0", 9.99, "Sergio Daniel"), prod("e4", "Producto 0", 120, "Eric Rolando")],
  ofertas: [prod("e5", "Producto 0", 30, "Petris Petris"), prod("e6", "Producto 0", 1500, "Joshua Salazar")],
};

export const chats = [
  { id: "c1", usuario: "Eric Rolando", ultimo: "Hola, ¿sigue disponible?", noLeido: true },
  { id: "c2", usuario: "Joshua Salazar", ultimo: "Te dejo el precio final", noLeido: false },
  { id: "c3", usuario: "José Rivas", ultimo: "Gracias, quedo pendiente", noLeido: false },
];

export const mensajesIniciales = [
  { id: "m1", mio: false, texto: "Hola, ¿sigue disponible?" },
  { id: "m2", mio: true, texto: "Sí, claro. ¿Nos vemos en la biblioteca?" },
  { id: "m3", mio: false, texto: "Perfecto, voy en 10 minutos." },
];

export const compras = [
  { id: "k1", titulo: "Producto 0", vendedor: "Eric Rolando", fecha: "Comprado el 30 de feb", total: 69 },
  { id: "k2", titulo: "Producto 0", vendedor: "José Rivas", fecha: "Comprado 13 de oct", total: 30 },
  { id: "k3", titulo: "Producto 0", vendedor: "Sergio Daniel", fecha: "Comprado ayer", total: 176 },
];

export const misPublicaciones = {
  publicadas: [
    { id: "mp1", titulo: "PS5", precio: 6700, condicion: "Usado" },
    { id: "mp2", titulo: "Laptop", precio: 9500, condicion: "Usado" },
    { id: "mp3", titulo: "Snacks", precio: 20, condicion: "Nuevo" },
    { id: "mp4", titulo: "Comida", precio: 60, condicion: "Nuevo" },
  ],
  borradores: [] as { id: string; titulo: string; precio: number; condicion: string }[],
  total: 67,
  vistas24h: 45,
};

export const acercaDe = {
  version: "6.7.0",
  copyright: "Copyright 2026 - Los Joshuas Inc. y afiliados",
  soporte: [
    "cristian.tilina@alumnos.com.mx",
    "joseisao.xd@alumnos.com.mx",
    "+52 223 7463826 - +01 210 23829302",
  ],
};

export const condiciones = ["Nuevo", "Como nuevo", "Usado", "Para reparar"];
