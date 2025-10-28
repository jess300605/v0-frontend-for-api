# Sistema de Ventas e Inventario - Frontend

Sistema completo de gestión de ventas e inventario con interfaz pública de e-commerce y panel de administración.

## 🚀 Características

### Tienda Pública
- **Catálogo de productos** con búsqueda y filtros por categoría
- **Página de ofertas** con productos destacados
- **Carrito de compras** funcional
- **Proceso de checkout** completo
- **Registro e inicio de sesión** de usuarios
- **Perfil de usuario** y historial de pedidos

### Panel de Administración
- **Dashboard** con métricas en tiempo real
- **Gestión de productos** (crear, editar, eliminar)
- **Gestión de ventas** con vista detallada
- **Reportes** de ventas y productos
- **Edición inline** en catálogo y ofertas
- **Carga de imágenes** mediante URL de Google

## 📋 Requisitos Previos

- **Node.js** 18.x o superior
- **npm** o **yarn**
- **API Laravel** corriendo en el backend (ver configuración más abajo)

## 🔧 Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone <url-del-repositorio>
cd sales-inventory-system
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
# o
yarn install
\`\`\`

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`env
# URL de tu API Laravel
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

**Nota:** La variable debe tener el prefijo `NEXT_PUBLIC_` para estar disponible en el cliente.

### 4. Configurar la API Laravel (Backend)

Tu API Laravel debe tener los siguientes endpoints configurados:

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual (opcional)

#### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto

#### Ventas
- `GET /api/ventas` - Listar ventas
- `GET /api/ventas/{id}` - Ver detalle de venta
- `POST /api/ventas` - Crear venta

#### Reportes
- `GET /api/reportes/ventas` - Reporte de ventas
- `GET /api/reportes/productos` - Reporte de productos

#### Estructura de la tabla `productos`

Tu tabla de productos debe tener las siguientes columnas:

\`\`\`sql
CREATE TABLE productos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    codigo_sku VARCHAR(100) NULL UNIQUE,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    url_imagen VARCHAR(500) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
\`\`\`

#### Modelo Laravel

Asegúrate de que tu modelo `Producto` tenga estos campos en `$fillable`:

\`\`\`php
protected $fillable = [
    'nombre',
    'descripcion',
    'precio',
    'categoria',
    'codigo_sku',
    'stock',
    'stock_minimo',
    'url_imagen', // ← Importante para las imágenes personalizadas
    'activo',
];
\`\`\`

#### Validación

En tu controlador de productos, incluye `url_imagen` en las reglas de validación:

\`\`\`php
$request->validate([
    'nombre' => 'required|string|max:150',
    'descripcion' => 'nullable|string',
    'precio' => 'required|numeric|min:0',
    'categoria' => 'required|string|max:100',
    'codigo_sku' => 'nullable|string|max:100|unique:productos,codigo_sku,' . $id,
    'stock' => 'required|integer|min:0',
    'stock_minimo' => 'required|integer|min:0',
    'url_imagen' => 'nullable|string|max:500', // ← Agregar esta línea
    'activo' => 'boolean',
]);
\`\`\`

### 5. Ejecutar el proyecto

\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

## 🏗️ Estructura del Proyecto

\`\`\`
├── app/
│   ├── (public)/          # Rutas públicas (tienda)
│   │   ├── page.tsx       # Página principal
│   │   ├── catalogo/      # Catálogo de productos
│   │   ├── ofertas/       # Ofertas especiales
│   │   ├── checkout/      # Proceso de compra
│   │   ├── login/         # Inicio de sesión
│   │   ├── registro/      # Registro de usuarios
│   │   ├── perfil/        # Perfil de usuario
│   │   └── mis-pedidos/   # Historial de pedidos
│   │
│   └── admin/             # Rutas de administración
│       ├── dashboard/     # Panel de control
│       ├── productos/     # Gestión de productos
│       ├── ventas/        # Gestión de ventas
│       └── reportes/      # Reportes y estadísticas
│
├── components/
│   ├── ui/                # Componentes de shadcn/ui
│   ├── app-sidebar.tsx    # Sidebar de administración
│   ├── public-header.tsx  # Header de la tienda
│   ├── product-dialog.tsx # Diálogo de productos
│   ├── cart-sheet.tsx     # Carrito de compras
│   └── ...
│
├── lib/
│   ├── api.ts             # Cliente de API
│   ├── auth-context.tsx   # Contexto de autenticación
│   ├── cart-context.tsx   # Contexto del carrito
│   ├── product-images.ts  # Gestión de imágenes
│   └── utils.ts           # Utilidades
│
└── public/                # Archivos estáticos
\`\`\`

## 🎨 Tecnologías Utilizadas

- **Next.js 16** - Framework de React
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **shadcn/ui** - Componentes de UI
- **SWR** - Gestión de estado y caché
- **Lucide React** - Iconos

## 👤 Roles de Usuario

### Usuario Regular
- Ver catálogo y ofertas
- Agregar productos al carrito
- Realizar compras
- Ver historial de pedidos
- Editar perfil

### Administrador (`rol: "admin"`)
- Todas las funciones de usuario regular
- Acceso al panel de administración
- Gestión completa de productos
- Gestión de ventas
- Visualización de reportes
- Edición inline en catálogo y ofertas

## 🔐 Autenticación

El sistema utiliza autenticación basada en tokens JWT:

1. El usuario inicia sesión con email y contraseña
2. La API devuelve un token JWT y los datos del usuario
3. El token se almacena en `localStorage`
4. Todas las peticiones incluyen el token en el header `Authorization: Bearer {token}`
5. El contexto de autenticación gestiona el estado del usuario

## 🛒 Carrito de Compras

El carrito se gestiona mediante un contexto de React:

- Los productos se almacenan en `localStorage`
- Persiste entre sesiones
- Calcula totales automáticamente
- Permite modificar cantidades
- Se limpia después de completar la compra

## 📸 Gestión de Imágenes

El sistema soporta dos formas de mostrar imágenes de productos:

1. **Imágenes predeterminadas**: Basadas en el nombre del producto
2. **URLs personalizadas**: Campo `url_imagen` en la base de datos

Para agregar una imagen personalizada:
1. Busca la imagen en Google
2. Copia la URL de la imagen
3. En el formulario de edición, pega la URL en el campo "URL de Imagen"
4. Guarda los cambios

## 🚀 Scripts Disponibles

\`\`\`bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm start

# Linter
npm run lint
\`\`\`

## 🐛 Solución de Problemas

### Error 404 en endpoints
- Verifica que tu API Laravel esté corriendo
- Confirma que la URL en `NEXT_PUBLIC_API_URL` sea correcta
- Revisa que los endpoints estén configurados correctamente

### Las imágenes no se actualizan
- Asegúrate de que la columna `url_imagen` exista en la tabla `productos`
- Verifica que el campo esté en el array `$fillable` del modelo
- Confirma que las reglas de validación incluyan `url_imagen`

### Error de autenticación
- Verifica que el token se esté guardando en `localStorage`
- Confirma que el endpoint `/api/auth/login` devuelva el token y los datos del usuario
- Revisa que el rol del usuario sea correcto (`admin` para administradores)

### Panel de administración no carga
- Abre la consola del navegador y busca logs con `[v0]`
- Verifica que el usuario tenga `rol: "admin"`
- Confirma que el token sea válido

## 📝 Notas Importantes

- El campo `codigo_sku` debe ser único en la base de datos
- Los productos con `stock <= stock_minimo` se marcan como "stock bajo"
- Solo los administradores pueden editar productos desde el catálogo y ofertas
- Las imágenes personalizadas tienen prioridad sobre las predeterminadas
- El carrito se limpia automáticamente después de completar una compra

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 📧 Contacto

Para soporte o consultas, contacta al equipo de desarrollo.
