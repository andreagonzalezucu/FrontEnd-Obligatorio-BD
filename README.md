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
+ Proveer endpoint REST para su consumo desde un cliente móvil o web.

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

```
---

## 🛠️ Tecnologías Utilizadas

### Frontend
+ React Native
+ Expo
+ JavaScript


---
## Variables de Entorno (.env)

```
```
---

## 🛠 Instalación y Ejecución

Seguir los comandos:

1. Para instalar dependencias necesarias 
```
npm install
```

2. Para correr la aplicación:

```
npx expo start
```

--- 

## 📊 Módulos Disponibles

A continuación se detallan todos los endpoints expuestos por la API REST, organizados por módulo, incluyendo ruta, método HTTP y descripción.



## 🧩 Entregables Incluidos
  
- Instructivo completo para correr la aplicación de forma local 
- Documentación formal del proyecto + Bitácora
-  [Link a Workspace de Postman](https://mariabelenkanas.postman.co/workspace/ca3bb8cf-33a5-41fe-82f6-3788387c0468) 


---

## 📅 Facultad de Ingeniería y Tecnologías  
**Universidad Católica del Uruguay — 2025**
