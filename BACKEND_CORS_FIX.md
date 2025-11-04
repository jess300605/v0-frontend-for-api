## 1. Instalar el paquete de CORS (si no está instalado)

\`\`\`bash
composer require fruitcake/laravel-cors
\`\`\`

## 2. Publicar la configuración de CORS

\`\`\`bash
php artisan vendor:publish --tag="cors"
\`\`\`

## 3. Configurar CORS en `config/cors.php`

Reemplaza el contenido con:

\`\`\`php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],
    
    // IMPORTANTE: Agrega tu URL del frontend aquí
    'allowed_origins' => [
        'http://172.20.176.1:3000',  // Tu frontend
        'http://localhost:3000',      // Para desarrollo local
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
\`\`\`


## 5. Configurar Sanctum para tu dominio

En `config/sanctum.php`:

\`\`\`php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1,172.20.176.1:3000',
    Sanctum::currentApplicationUrlWithPort(),
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
\`\`\`
