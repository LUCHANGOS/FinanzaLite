# FinanzaLite - Instrucciones de Instalación

## 📦 Crear el proyecto desde estos archivos

1. **Descargar todos los archivos** del proyecto FinanzaLite
2. **Crear el archivo ZIP** que contenga toda la carpeta FinanzaLite con su estructura

## 🚀 Inicializar el proyecto

1. Extrae el ZIP en tu directorio preferido
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta los comandos:

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npx expo start --tunnel
```

## 📱 Probar en dispositivo

1. Descarga **Expo Go** desde:
   - iOS: App Store
   - Android: Google Play Store

2. Escanea el código QR que aparece en la terminal

3. ¡La app debería cargar en tu dispositivo!

## 🛠️ Configuración adicional

### Para las notificaciones:
- En iOS: Las notificaciones funcionarán automáticamente
- En Android: Acepta los permisos cuando se soliciten

### Para la autenticación biométrica:
- Configura huella digital o Face ID en tu dispositivo
- La app detectará automáticamente si está disponible

### Para la exportación CSV:
- Los archivos se guardan en el directorio de documentos
- Se pueden compartir usando el sistema nativo del dispositivo

## 📋 Estructura completa del proyecto

```
FinanzaLite/
├── App.js                           # Archivo principal
├── app.json                         # Configuración de Expo
├── babel.config.js                  # Configuración de Babel
├── package.json                     # Dependencias
├── README.md                        # Documentación
├── .gitignore                       # Archivos ignorados por Git
├── INSTRUCCIONES.md                 # Este archivo
├── src/
│   ├── context/
│   │   └── FinanceContext.js        # Context global
│   ├── screens/
│   │   ├── DashboardScreen.js       # Pantalla principal
│   │   ├── TransactionsScreen.js    # Lista de transacciones
│   │   ├── AddEditTransactionScreen.js # Formulario
│   │   ├── CategoriesScreen.js      # Gestión de categorías
│   │   ├── SettingsScreen.js        # Configuraciones
│   │   ├── PinLockScreen.js         # Pantalla de PIN
│   │   └── OnboardingScreen.js      # Tutorial inicial
│   └── components/
│       ├── TransactionItem.js       # Componente de transacción
│       └── BarChart.js             # Gráfico de barras
└── assets/                          # Iconos e imágenes
    ├── icon.png                     # Icono de la app
    ├── splash.png                   # Pantalla de carga
    ├── adaptive-icon.png            # Icono Android
    ├── favicon.png                  # Favicon web
    └── notification-icon.png        # Icono notificaciones
```

## 🎯 Características implementadas

✅ **Registro de ingresos y gastos**
✅ **Categorías personalizables**  
✅ **Resumen mensual y quincenal**
✅ **Gráficos SVG interactivos**
✅ **Modo oscuro automático**
✅ **PIN y autenticación biométrica**
✅ **Notificaciones programadas**
✅ **Exportación a CSV**
✅ **Tutorial de onboarding**
✅ **Navegación con tabs**
✅ **Persistencia local de datos**

## 🔧 Troubleshooting

### Si tienes problemas con las dependencias:
```bash
npm install --legacy-peer-deps
```

### Si Expo no inicia:
```bash
npx expo install --fix
```

### Si las notificaciones no funcionan:
- Verifica que tengas permisos habilitados
- Reinicia la app desde Expo Go

## 📞 Soporte

Si encuentras algún problema:
1. Revisa que tengas Node.js instalado (versión 16+)
2. Verifica que Expo CLI esté actualizado: `npm install -g @expo/cli`
3. Asegúrate de que tu dispositivo y computadora estén en la misma red WiFi

---

¡Disfruta usando FinanzaLite para organizar tus finanzas! 💰📊
