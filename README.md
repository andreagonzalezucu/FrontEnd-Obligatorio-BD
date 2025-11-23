# BDI-Obligatorio — V. Blanco · A. González · B. Kanas  
**Trabajo Obligatorio - Segundo Semestre 2025 - Base de Datos I**  
**Docentes:** Prof. Juan Kosut | Sofía Guerrico  

---

## 📘 Sistema para la Gestión de Reserva de Salas de Estudio

El objetivo central del trabajo obligatorio es diseñar, modelar e implementar un sistema que permita digitalizar el proceso de reserva, control de asistencia y administración de salas utilizado en los distintos edificios de la Universidad Católica del Uruguay, reemplazando los registros manuales en papel actualmente empleados en biblioteca, secretaría y administración.

---

## 🏫 Descripción General

El sistema implementado permite:

+ Registrar y gestionar salas, edificios, programas académicos, turnos y usuarios.
+ Realizar, modificar y cancelar reservas.
+ Controlar automáticamente reglas de uso (horarios, capacidades, restricciones diarias y semanales)
+ Registrar asistencia de participantes por reserva
+ Generar sanciones automáticas cuando se incumplen determinadas condiciones de uso
+ Proveer un API REST para ser consumido por un cliente móvil o web

### Modelado y Reglas del Sistema
El sistema implementa las reglas definidas en la consigna:

+ Horario disponible: 08:00 a 23:00
+ Reservas por bloques de 1 hora
+ Límite de 2 horas diarias por usuario
+ Límite de 3 reservas activas por semana
+ Excepciones para docentes y estudiantes de posgrado al utilizar salas exclusivas
+ Control de asistencia por participante
+ Generación automática de sanciones por inasistencia

---

## 📁 Estructura del Proyecto Frontend

```
FRONTEND-OBLIGATORIO-BD/
└── front-obligatorio/
    ├── .expo/
    ├── .vscode/
    ├── app/
    │   ├── (tabs)/
    │   │   ├── _layout.jsx
    │   │   ├── estadisticas.jsx
    │   │   ├── index.jsx
    │   │   ├── login.tsx
    │   │   ├── misReservas.jsx
    │   │   ├── panelDeControl.jsx
    │   │   └── reservasGenerales.jsx
    │   │
    │   ├── components/
    │   │   ├── Accordion.jsx
    │   │   ├── ModalConfirmar.tsx
    │   │   ├── ModalConfirmarReserva.tsx
    │   │   └── ModalResultado.tsx
    │   │
    │   ├── principal/
    │   │   ├── edificio/
    │   │   │   ├── sala/
    │   │   │   │   ├── _layout.tsx
    │   │   │   │   └── [sal].tsx
    │   │   │   ├── [edi].tsx
    │   │   │   └── index.tsx
    │   │   │
    │   │   ├── _layout.tsx
    │   │   ├── estadisticas.tsx
    │   │   ├── index.tsx
    │   │   ├── misReservas.tsx
    │   │   ├── panelDeControl.tsx
    │   │   └── reservasGenerales.tsx
    │   │
    │   ├── types/
    │   │
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   └── login.jsx
    │
    ├── assets/
    ├── node_modules/
    │
    ├── .gitignore
    ├── app.json
    ├── eslint.config.js
    ├── expo-env.d.ts
    ├── package.json
    └── package-lock.json

```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
+ React Native
+ Expo
+ JavaScript / TypeScript
+ Expo Router para la navegación
+ Fetch API para consumo del backend REST


---

## 🛠 Instalación y Ejecución

Seguir los comandos:

Desde la ruta `.\FrontEnd-Obligatorio-BD\front-obligatorio`, en el cmd ejecutar:

1. Para instalar dependencias necesarias 
```
npm install
```

-  Dentro del proyecto, es necesario instalar también las siguientes librerías

```
npx expo install react-native-calendars
npx expo install @react-native-async-storage/async-storage
npm install @react-native-picker/picker
```

2. Para correr la aplicación:

```
npx expo start -c
```

Se podrá ejecutar la app desde
+ Expo Go (Android / iOS)
+ Emulador Android
+ Navegador Web

#### ⚠️IMPORTANTE: Asegurarse de tener en ejecución la parte de backend (Ver repositorio https://github.com/belenkanas/BDI-Obligatorio---V.Blanco-A.Gonzalez-B.Kanas.git )
--- 

## 📊 Módulos Disponibles

El frontend implementa los siguientes flujos principales:

### 🔐 Autenticación (_login.tsx_)

+ Inicio de sesión de usuarios registrados
+ Validación mediante backend

### 🏢 Gestión de Edificios y Salas (_principal_ --> _[edi].tsx_ --> _[sal].tsx_)

+ Listado de edificios disponibles
+ Selección de salas según edificio
+ Visualización de información de la sala

### 📅 Reservas (Dentro de _[sal].tsx_)

+ Consulta de disponibilidad
+ Creación de reservas
+ Reglas aplicadas (límite diario/semanal)
+ Lógica en base a reglas del sistema (siempre controlada por el backend)

### 📘 Mis Reservas (_misReservas.tsx_)

+ Listado de reservas activas y canceladas
+ Detalle de cada reserva
+ Cancelación de reservas
+ Marcado de asistencia de reserva (dentro del horario establecido)

### 📘 Reservas Generales (_misReservas.tsx_)

+ Módulo habilitado solo para administradores
+ Listado de todas las reservas activas y canceladas del sistema
+ Detalle de cada reserva
+ Cancelación y eliminación de reservas

### 📶 Estadísticas (_estadisticas.tsx_)

+ Módulo habilitado solo para admin.
+ Reportes en base a consultas asignadas en la consigna
+ Visualización de estado de asistencia
+ Reportes según edificios, salas, cantidad de reservas, etc.

### 💻 Panel de control (_panelDeControl.tsx_)

+ Módulo habilitado solo para admin.
+ Permite crear, modificar y eliminar elementos del programa (edificios, salas, facultades, programas académicos, usuarios).
+ El admin puede registrar nuevos participantes, como también monitorear sus asistencias y sanciones.

---

## 🧩 Entregables Incluidos
  
- Instructivo completo para correr la aplicación de forma local
- Documentación formal del proyecto
- Bitácora del proceso de desarrollo
- Scripts SQL de creación e inserción (en el repositorio backend)


---

## 📅 Facultad de Ingeniería y Tecnologías  
**Universidad Católica del Uruguay — 2025**
