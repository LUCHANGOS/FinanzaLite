# FinanzaLite v2.0 ✨
**by L.A.N.G.**

> Una aplicación móvil moderna y elegante para el control de finanzas personales, completamente rediseñada con gradientes, animaciones fluidas y un sistema de temas avanzado.

![FinanzaLite Logo](./assets/icon.png)

## 🎨 **Novedades v2.0 - Diseño Renovado**

### ✨ **Mejoras Visuales**
- 🌈 **Gradientes dinámicos** en cards y botones
- 🎭 **Animaciones fluidas** con transiciones naturales
- 📱 **Feedback háptico** en cada interacción
- 🎯 **Iconos SVG vectoriales** personalizados
- 🌙 **Temas claro/oscuro** optimizados
- 💎 **Componentes modernos** reutilizables

### 🚀 **Características Principales**

#### 💰 **Gestión Financiera Completa**
- ✅ **Registro inteligente** de ingresos y gastos
- ✅ **Categorías personalizables** con 16+ iconos y colores
- ✅ **Balance en tiempo real** con indicadores visuales
- ✅ **Análisis mensual y quincenal** detallado
- ✅ **Top categorías** con rankings automáticos

#### 📊 **Visualización Avanzada**
- ✅ **Gráficos con gradientes** animados y responsivos
- ✅ **Dashboard interactivo** con métricas clave
- ✅ **Cards con sombras** y efectos de profundidad
- ✅ **Animaciones escalonadas** para mejor UX
- ✅ **Transiciones suaves** entre pantallas

#### 🔐 **Seguridad y Privacidad**
- ✅ **PIN personalizable** con bloqueo automático
- ✅ **Autenticación biométrica** (huella digital/FaceID)
- ✅ **Almacenamiento local** sin dependencias externas
- ✅ **Cifrado de datos** sensibles

#### 🎯 **Experiencia de Usuario**
- ✅ **Tutorial interactivo** con gradientes dinámicos
- ✅ **Navegación fluida** con iconos animados
- ✅ **Notificaciones inteligentes** programables
- ✅ **Exportación CSV** para análisis externo
- ✅ **Interfaz responsive** y adaptable

## 🛠️ **Stack Tecnológico**

### 📱 **Frontend & UI**
- **Expo SDK**: 51.0.39
- **React**: 18.2.0
- **React Native**: 0.74.5
- **React Navigation**: 6.x (Stack + Bottom Tabs)
- **React Native Animatable**: Animaciones fluidas
- **Expo Linear Gradient**: Gradientes nativos

### 🎨 **Diseño & Gráficos**
- **React Native SVG**: Gráficos vectoriales personalizados
- **Sistema de temas**: Colores y espaciado centralizados
- **Expo Haptics**: Retroalimentación táctil
- **Iconos SVG**: Biblioteca personalizada

### 💾 **Almacenamiento & Datos**
- **AsyncStorage**: Persistencia de transacciones y configuración
- **Expo Secure Store**: Almacenamiento cifrado para PIN
- **Day.js**: Manejo optimizado de fechas

### 🔔 **Funcionalidades Nativas**
- **Expo Notifications**: Sistema de recordatorios
- **Expo Local Authentication**: Biometría nativa
- **Expo File System + Sharing**: Exportación y compartición

## 🚀 **Instalación y Desarrollo**

### 📱 **Desarrollo Local**
1. **Clona el repositorio**:
   ```bash
   git clone <repository-url>
   cd FinanzaLite
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   # Para Expo Go (recomendado para desarrollo)
   npx expo start
   
   # Con túnel (si tienes problemas de red)
   npx expo start --tunnel
   ```

4. **Prueba en tu dispositivo**:
   - Descarga **Expo Go** desde tu store
   - Escanea el código QR generado
   - ¡Disfruta probando la app!

### 📲 **Compilación de APK**

1. **Configurar EAS Build** (primera vez):
   ```bash
   npm install -g @expo/cli
   npx expo install --fix
   ```

2. **Compilar APK para Android**:
   ```bash
   # APK de desarrollo
   npx expo build:android --type=apk
   
   # O usando EAS Build (recomendado)
   npx eas build --platform android --profile development
   ```

3. **APK de producción**:
   ```bash
   npx eas build --platform android --profile production
   ```

## Estructura del proyecto 📁

```
FinanzaLite/
├── App.js                              # Componente principal con navegación
├── app.json                            # Configuración de Expo
├── package.json                        # Dependencias y scripts
├── src/
│   ├── constants/
│   │   └── Theme.js                   # ✨ Sistema de temas y colores
│   ├── context/
│   │   └── FinanceContext.js          # Context para estado global
│   ├── components/                     # 💫 Componentes reutilizables
│   │   ├── Card.js                    # ✨ Card con gradientes y sombras
│   │   ├── Button.js                  # ✨ Botón con animaciones y haptics
│   │   ├── Icon.js                    # ✨ Iconos SVG personalizados
│   │   ├── Loading.js                 # ✨ Pantalla de carga animada
│   │   ├── TransactionItem.js         # ✨ Item de transacción mejorado
│   │   └── BarChart.js               # ✨ Gráfico con gradientes
│   └── screens/                        # 📱 Pantallas de la aplicación
│       ├── DashboardScreen.js         # ✨ Dashboard completamente renovado
│       ├── TransactionsScreen.js      # Lista de movimientos
│       ├── AddEditTransactionScreen.js # Formulario de transacciones
│       ├── CategoriesScreen.js        # Gestión de categorías
│       ├── SettingsScreen.js          # Configuraciones
│       ├── PinLockScreen.js           # Pantalla de bloqueo
│       └── OnboardingScreen.js        # ✨ Tutorial con gradientes
└── assets/                            # Imágenes, iconos y recursos
    ├── icon.png                       # Icono principal de la app
    ├── adaptive-icon.png              # Icono adaptativo Android
    ├── splash.png                     # Pantalla de carga
    └── notification-icon.png          # Icono para notificaciones
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
