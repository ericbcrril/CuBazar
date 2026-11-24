# 🎉 AUTENTICACIÓN CON TOKENS JWT - IMPLEMENTACIÓN COMPLETADA

## ✅ Cambios Realizados

### 1. **Dependencias** (package.json)
- ✅ Agregado `jsonwebtoken@^9.0.0`

### 2. **Funciones de Utilidad** (functions.js)
Agregadas dos nuevas funciones de seguridad:

```javascript
// Generar token JWT
generateToken(payload, expiresIn = 86400)
// Genera un token válido por 24 horas

// Verificar token JWT
verifyToken(token)
// Valida y decodifica un token, lanza error si es inválido o expiró
```

### 3. **Middleware de Autenticación** (middlewares/authToken.js)
```javascript
authenticateToken(req, res, next)
// Verifica el token en el header Authorization
// Si es válido: agrega req.user con los datos del usuario
// Si es inválido: retorna error 401 o 403
```

### 4. **Función Login Actualizada** (apps/bsites/controllers/controllerCustomersAccounts.js)
La respuesta ahora incluye:
```json
{
  "message": "Login exitoso",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

---

## 🚀 PRÓXIMOS PASOS

### Paso 1: Configurar Variables de Entorno
Agrega a tu archivo `.env`:
```
JWT_SECRET=cambiar-esto-por-una-clave-segura-en-produccion
```

### Paso 2: Proteger Rutas
En `apps/bsites/routes/index.js`, importa y usa el middleware:

```javascript
const authenticateToken = require("../../../middlewares/authToken");

// Ruta protegida
router.get("/customers-accounts/getUser/:id", authenticateToken, controllerAccounts.getById);
```

Ver archivo `ROUTES_PROTECTION_EXAMPLE.js` para ejemplo completo.

### Paso 3: Integración en Frontend
Después de login, guarda el token y úsalo en cada request:

```javascript
// Guardar tras login
const { token } = response.data;
localStorage.setItem('authToken', token);

// Usar en requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
};

fetch('/api/endpoint-protegido', {
  method: 'GET',
  headers: headers
});
```

---

## 📊 Información del Token

**Datos codificados en el token:**
- `userId`: ID del usuario en la BD
- `userName`: Nombre de usuario
- `email`: Email del usuario
- `iat`: Fecha de emisión
- `exp`: Fecha de expiración

**Acceso en rutas protegidas:**
```javascript
async getProfile(req, res) {
  const { userId, userName, email } = req.user; // req.user viene del middleware
}
```

---

## 🔒 Seguridad

✅ **Implementado:**
- Tokens JWT con firma HMAC-SHA256
- Expiración de 24 horas
- Middleware de validación
- Protección contra tokens inválidos/expirados
- Registro de intentos de autenticación fallida

⚠️ **TODO en Producción:**
- Cambiar JWT_SECRET a valor aleatorio seguro
- Configurar HTTPS obligatorio
- Implementar refresh tokens
- Agregar rate limiting en endpoint de login
- Usar HTTPS en cookies (si aplica)

---

## 📚 Archivos de Referencia

1. **TOKEN_AUTH_GUIDE.md** - Guía completa de uso
2. **ROUTES_PROTECTION_EXAMPLE.js** - Ejemplo de protección de rutas
3. **middlewares/authToken.js** - Middleware de verificación
4. **functions.js** - Funciones generateToken() y verifyToken()

---

## 🧪 Prueba Rápida con cURL

**Login:**
```bash
curl -X POST http://localhost:5000/customers-accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "user123",
    "password_hash": "password",
    "client": "curl",
    "device": "cli"
  }'
```

**Usar token en ruta protegida:**
```bash
curl -X GET http://localhost:5000/customers-accounts/getUser/123 \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde guardo el token en el frontend?**
R: En localStorage (persistente) o sessionStorage (solo sesión)

**P: ¿Qué pasa si el token expira?**
R: El servidor retorna 401. El frontend debe pedir login nuevamente.

**P: ¿Puedo cambiar la duración del token?**
R: Sí, en `generateToken(payload, segundos)`. Ej: 7 días = 604800

**P: ¿Es seguro enviar el token en un header?**
R: Sí, si usas HTTPS. Sin HTTPS, el token podría ser interceptado.

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica que JWT_SECRET esté en .env
2. Revisa los logs en la consola del servidor
3. Asegúrate de enviar el token en format: `Bearer <token>`
4. Confirma que el token no haya expirado

¡Autenticación implementada con éxito! 🎊
