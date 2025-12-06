#!/bin/bash

echo "🚀 Configurando Backend Finanzas Conductor..."

# 1. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# 2. Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  Por favor edita el archivo .env con tus configuraciones"
fi

# 3. Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p logs
mkdir -p uploads/transactions
mkdir -p uploads/users
mkdir -p uploads/vehicles
mkdir -p reports

# 4. Iniciar MongoDB (si está instalado localmente)
if command -v mongod &> /dev/null; then
    echo "🗄️  Iniciando MongoDB..."
    mongod --fork --logpath /tmp/mongod.log --dbpath /data/db
fi

# 5. Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
node src/utils/migrations.js

# 6. Ejecutar seeders (datos de prueba)
read -p "¿Deseas cargar datos de prueba? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Cargando datos de prueba..."
    node src/utils/seeders.js
fi

echo "✅ Configuración completada!"
echo "📝 Para iniciar el servidor:"
echo "   Modo desarrollo: npm run dev"
echo "   Modo producción: npm start"
