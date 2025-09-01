# FinanzaLite 💰

Una aplicación móvil de organización económica mensual construida con React Native y Expo SDK 53.

## Características ✨

- **Registro de ingresos**: Sueldo, bonos, quincenas y otras fuentes
- **Control de gastos**: Categorización de gastos fijos y variables
- **Categorías personalizables**: Crear, editar y eliminar categorías
- **Resumen mensual**: Balance de ingresos vs gastos con gráficos
- **Vista quincenal**: Análisis por quincenas
- **Recordatorios**: Notificaciones para revisar finanzas
- **Exportación CSV**: Exportar movimientos usando expo-file-system + expo-sharing
- **Seguridad**: Bloqueo opcional con PIN y autenticación biométrica
- **Onboarding**: Tutorial inicial para nuevos usuarios
- **Modo oscuro**: Soporte automático según configuración del dispositivo

## Tecnologías 🛠️

- **Expo SDK**: 53.0.0
- **React**: 18.3.1
- **React Native**: 0.76.5
- **React Navigation**: Navegación con tabs y stack
- **AsyncStorage**: Persistencia de datos local
- **Expo Secure Store**: Almacenamiento seguro para PIN
- **Expo Notifications**: Sistema de recordatorios
- **React Native SVG**: Gráficos personalizados
- **Day.js**: Manejo de fechas

## Instalación 🚀

1. Clona o descarga el proyecto
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el proyecto:
   ```bash
   npx expo start --tunnel
   ```
4. Escanea el código QR con Expo Go (SDK 53)

## Estructura del proyecto 📁

```
FinanzaLite/
├── App.js                              # Componente principal con navegación
├── src/
│   ├── context/
│   │   └── FinanceContext.js          # Context para estado global
│   ├── screens/
│   │   ├── DashboardScreen.js         # Pantalla principal con resumen
│   │   ├── TransactionsScreen.js      # Lista de movimientos
│   │   ├── AddEditTransactionScreen.js # Formulario de transacciones
│   │   ├── CategoriesScreen.js        # Gestión de categorías
│   │   ├── SettingsScreen.js          # Configuraciones
│   │   ├── PinLockScreen.js           # Pantalla de bloqueo
│   │   └── OnboardingScreen.js        # Tutorial inicial
│   └── components/
│       ├── TransactionItem.js         # Item de transacción
│       └── BarChart.js               # Gráfico de barras SVG
├── assets/                            # Imágenes e iconos
└── package.json                       # Dependencias del proyecto
```

## Uso 📱

### Primera vez
1. Ve el tutorial de bienvenida
2. Opcionalmente configura un PIN de seguridad
3. Comienza agregando tus ingresos y gastos

### Funcionalidades principales
- **Dashboard**: Ve tu resumen mensual con gráficos
- **Movimientos**: Lista y filtra tus transacciones
- **Categorías**: Personaliza las categorías con iconos y colores
- **Ajustes**: Configura PIN, notificaciones y exporta datos

### Navegación
- Usa las pestañas inferiores para navegar
- El botón + flotante permite agregar transacciones rápidamente
- Mantén presionado en transacciones para eliminarlas
- Toca transacciones para editarlas

## Características técnicas 🔧

### Persistencia de datos
- Los datos se guardan localmente con AsyncStorage
- El PIN se almacena de forma segura con Expo Secure Store
- Backup automático en cada cambio

### Notificaciones
- Recordatorios mensuales (día 1 a las 9:00 AM)
- Recordatorios quincenales (día 15 a las 6:00 PM)
- Configurables desde Ajustes

### Exportación
- Formato CSV con todas las transacciones del mes
- Incluye fecha, tipo, categoría, descripción y monto
- Se comparte usando el sistema nativo del dispositivo

### Seguridad
- PIN de 4 dígitos opcional
- Soporte para autenticación biométrica (huella/facial)
- Datos almacenados localmente en el dispositivo

## Personalización 🎨

### Categorías
- Iconos: 16 emojis disponibles
- Colores: 16 colores predefinidos
- Tipos: Ingresos y gastos separados

### Interfaz
- Modo claro/oscuro automático
- Diseño minimalista y moderno
- Animaciones suaves

## Compatibilidad 📱

- iOS 13+
- Android 6.0+ (API 23)
- Expo Go SDK 53
- React Native 0.76.5

## Próximas características 🔮

- Metas de ahorro
- Presupuestos por categoría
- Más tipos de gráficos
- Sincronización en la nube
- Widget para pantalla principal

---

Desarrollado con ❤️ usando Expo y React Native
