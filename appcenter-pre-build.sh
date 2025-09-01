#!/usr/bin/env bash

# Instalar dependencias globales
npm install -g @expo/cli eas-cli

# Instalar dependencias del proyecto
npm ci

# Configurar EAS
npx expo install --fix
