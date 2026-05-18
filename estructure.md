src/app/
│
├── core/                 # 🧠 EL CEREBRO (Servicios globales, Guards, Interceptors)
│   ├── guards/           # Protección de rutas (ej. auth.guard.ts)
│   ├── interceptors/     # Para inyectar el token en las peticiones HTTP
│   └── services/         # Servicios de estado global (auth.service, device.service, api.service)
│
├── shared/               # 🧩 LAS PIEZAS DE LEGO (Reutilizables en toda la app)
│   ├── components/       # Botones, inputs, tarjetas personalizadas
│   ├── ui-web/           # Componentes visuales EXCLUSIVOS para web
│   ├── ui-mobile/        # Componentes visuales EXCLUSIVOS para móvil
│   ├── interfaces/       # Modelos de datos (User, Project, Order)
│   └── utils/            # Funciones de ayuda (formatear fechas, validadores)
│
├── layouts/              # 🏗️ LOS CHASIS (Estructura principal de navegación)
│   ├── mobile-layout/    # Contiene el <ion-menu> (Banner lateral de Ionic)
│   └── web-layout/       # Contiene el Navbar lateral fijo para la Web
│
└── features/             # 🚀 LAS FUNCIONALIDADES (Tus pantallas)
    │
    ├── auth/             # 1. Login
    │   ├── pages/login/
    │   │   ├── login.component.ts         # (Smart) Maneja la lógica y decide qué UI cargar
    │   │   ├── login-mobile.component.ts  # (Dumb) Solo HTML/SCSS de UXPilot Móvil
    │   │   └── login-web.component.ts     # (Dumb) Solo HTML/SCSS de UXPilot Web
    │   └── auth.routes.ts
    │
    ├── home/             # 2. Home
    │   ├── pages/dashboard/
    │   ├── components/client-modal/       # 2.1 Modal para agregar clientes
    │   └── home.routes.ts
    │
    ├── settings/         # 3. Ajustes
    │   ├── pages/settings-main/
    │   ├── components/worker-modal/       # 3.1 Agregar nuevo trabajador
    │   └── settings.routes.ts
    │
    ├── projects/         # 4. Proyectos
    │   ├── pages/project-list/
    │   ├── components/project-modal/      # 4.1 Modal crear proyectos
    │   └── projects.routes.ts
    │
    ├── orders/           # 5 y 6. Pedidos
    │   ├── pages/order-list/              # Lista de pedidos
    │   ├── pages/order-detail/            # 6. Dentro de cada pedido
    │   ├── components/order-modal/        # 5.1 Modal nuevos pedidos
    │   ├── components/edit-piece-modal/   # 6.1 Modal editar piezas
    │   └── orders.routes.ts
    │
    └── catalog/          # 7 y 8. Catálogo / Piezas
        ├── pages/add-piece/               # 7. Agregar pieza a un pedido (Flujo)
        ├── pages/new-piece/               # 8. Crear pieza nueva en el sistema
        └── catalog.routes.ts
