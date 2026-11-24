# Implementación de Tokens JWT - Guía de Uso

## 📋 Resumen de Cambios

Se ha implementado autenticación basada en tokens JWT para mantener sesiones activas. El servidor ahora genera un token al hacer login que el frontend debe usar para acceder a rutas protegidas.

---

## 🔧 Configuración Requerida

### 1. Instalar dependencias
```bash
npm install
```

Esto instalará `jsonwebtoken` que fue agregado a package.json

### 2. Variables de Entorno (.env)
Asegúrate de que tu archivo `.env` tenga:
```
JWT_SECRET=tu-clave-secreta-super-segura-cambiar-en-produccion
PORT=5000
ORIGIN_URL=http://localhost:3000
# ...resto de variables
```

**IMPORTANTE:** En producción, cambia `JWT_SECRET` por una cadena aleatoria segura.

---

## 📡 Flujo de Autenticación

### 1. Login
**Endpoint:** `POST /login`

**Request:**
```json
{
  "user_name": "user123",
  "password_hash": "contraseña",
  "client": "web",
  "device": "desktop"
}
```

**Response (Exitoso):**
```json
{
  "message": "Login exitoso",
  "user": {
    "_id": "123456789",
    "user_name": "user123",
    "email": "user@example.com",
    // ... otros datos del usuario
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

### 2. Usar el Token

El frontend debe guardar el token (en localStorage, sessionStorage o cookies) y enviarlo en cada request protegido:

```javascript
// Guardando el token
localStorage.setItem('authToken', response.token);

// Enviando en requests posteriores
const token = localStorage.getItem('authToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('/api/ruta-protegida', {
  method: 'GET',
  headers: headers
})
```

---

## 🔐 Rutas Protegidas

### Cómo proteger una ruta:

En el archivo de rutas (ej: `apps/bsites/routes/index.js`):

```javascript
const authenticateToken = require('../../../middlewares/authToken');
const controller = require('../controllers/controller');

module.exports = (app) => {
  // Ruta pública (sin protección)
  app.post('/login', controller.login);

  // Ruta protegida (requiere token)
  app.get('/api/profile', authenticateToken, controller.getProfile);
  
  // Otra ruta protegida
  app.post('/api/update-user', authenticateToken, controller.updateUser);
};
```

El middleware `authenticateToken` verificará automáticamente que el token sea válido antes de ejecutar el controlador.

---

## 💾 Almacenamiento del Token en Frontend

### Opción 1: localStorage (Persistente)
```javascript
// Guardar
localStorage.setItem('authToken', token);

// Recuperar
const token = localStorage.getItem('authToken');

// Eliminar (logout)
localStorage.removeItem('authToken');
```

### Opción 2: sessionStorage (Solo sesión)
```javascript
sessionStorage.setItem('authToken', token);
const token = sessionStorage.getItem('authToken');
sessionStorage.removeItem('authToken');
```

### Opción 3: Cookies (Automático con cada request)
```javascript
// Al hacer login, configura la cookie
document.cookie = `authToken=${token}; path=/; max-age=86400`;

// El navegador la enviará automáticamente en cada request
```

---

## ⏱️ Duración del Token

- **Duración actual:** 24 horas (86400 segundos)
- **Ubicación:** `generateToken(payload, 86400)` en `functions.js`

Para cambiar la duración:
```javascript
// 7 días
generateToken(userData, 604800);

// 30 minutos
generateToken(userData, 1800);
```

---

## ❌ Manejo de Errores

### Token Expirado
**Response:** 401 Unauthorized
```json
{
  "error": "Token expirado, inicia sesión nuevamente"
}
```

### Token Inválido
**Response:** 403 Forbidden
```json
{
  "error": "Token inválido"
}
```

### Token No Proporcionado
**Response:** 401 Unauthorized
```json
{
  "error": "Token no proporcionado"
}
```

---

## 🧪 Pruebas con Postman

1. **Login:**
   - URL: `http://localhost:5000/login`
   - Method: POST
   - Body (raw JSON):
   ```json
   {
     "user_name": "user123",
     "password_hash": "password",
     "client": "postman",
     "device": "desktop"
   }
   ```
   - Copia el `token` de la respuesta

2. **Acceder a ruta protegida:**
   - URL: `http://localhost:5000/api/profile` (ejemplo)
   - Method: GET
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer <tu-token-aqui>`
   - Enviar

---

## 📝 Información Codificada en el Token

El token contiene:
```javascript
{
  userId: "123456789",      // ID del usuario en BD
  userName: "user123",      // Nombre de usuario
  email: "user@example.com" // Email del usuario
}
```

Accede a esto en rutas protegidas via `req.user`:
```javascript
async getProfile(req, res) {
  const userId = req.user.userId;
  const userName = req.user.userName;
  // ... usar datos del token
}
```

---

## 🔄 Refresh Token (Opcional - Implementación Futura)

Para mayor seguridad, se puede implementar:
- **Access Token:** Corta duración (15 minutos)
- **Refresh Token:** Larga duración (7 días)

Permite renovar el acceso sin hacer login nuevamente.

---

## ✅ Checklist de Implementación

- [x] Instalar jsonwebtoken
- [x] Agregar JWT_SECRET a .env
- [x] Crear funciones generateToken y verifyToken
- [x] Crear middleware authenticateToken
- [x] Actualizar función login para generar token
- [ ] Proteger rutas del frontend con autenticación
- [ ] Implementar lógica de logout en frontend
- [ ] Agregar refresh token (opcional)

