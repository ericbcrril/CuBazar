# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Conexión con el backend

1. Copia `.env.example` como `.env` y configura `EXPO_PUBLIC_API_URL`.
2. Inicia el backend en el puerto indicado por `PORT` (por defecto `3000`).
3. Ejecuta `pnpm start` y abre la app en el emulador o dispositivo.

La URL debe apuntar a la raíz versionada del API, por ejemplo `http://10.0.2.2:3000/api/v1`.
Usa `10.0.2.2` desde el emulador Android, `localhost` desde el simulador iOS y la IP LAN
de tu computadora desde un teléfono físico. El backend debe escuchar en una interfaz accesible
por el dispositivo y el firewall debe permitir el puerto del API.

Para producción, configura `EXPO_PUBLIC_API_URL` con una URL HTTPS pública antes de compilar.
Las variables `EXPO_PUBLIC_*` se incluyen en el bundle de la app: no guardes secretos en ellas.
En Expo web, permite el origen del frontend en `CORS_ORIGIN` del backend (por ejemplo,
`http://localhost:8081`). Las apps nativas no envían un origen CORS.

El JWT de acceso (8 horas) se almacena con SecureStore en iOS/Android; el backend no ofrece
refresh token. En web, el token solo permanece en memoria y se pierde al recargar la página.
El catálogo del backend solo devuelve productos de vendedores marcados como disponibles; activa
“Disponible para vender” en Cuenta para incluir tus publicaciones en el catálogo.
Las publicaciones nuevas pueden incluir una imagen JPEG, PNG o WebP; editar imágenes existentes
requiere una ruta de actualización que el backend aún no expone. La autenticación con Google
requiere todavía configurar un cliente OAuth para la app.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
