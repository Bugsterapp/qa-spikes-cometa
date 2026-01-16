# Template para Componentes Recreo V2

<!-- 
METADATA PARA AGENTES IA:
- Workspace: cometa-frontend
- Estructura principal:
  - packages/recreo/: Biblioteca de componentes
  - apps/recreo-sb/: Aplicación Storybook
- Convenciones:
  - Componentes v2: Basados en shadcn/ui
  - Ubicación: packages/recreo/v2/components/ui/
  - Historias: apps/recreo-sb/src/stories/[Name]V2.stories.ts
  - Exportaciones: Solo en v2.ts, no en tsup.config.ts
-->

Este template está diseñado para ayudarte a agregar componentes de shadcn/ui a la versión 2 de Recreo. Funciona tanto para usuarios como para agentes de IA en Cursor.

## 🎯 Propósito

- Mantener consistencia en la implementación de componentes v2
- Facilitar la documentación con Storybook
- Asegurar exportaciones correctas
- Mantener un proceso simple y repetible

## 📋 Checklist para agregar un componente

### 1. Agregar el componente de shadcn/ui

```bash
# Primero, asegúrate de estar en el directorio correcto
cd packages/recreo

# Opción A: Manual (recomendado)
# 1. Visita https://ui.shadcn.com/docs/components/[component-name]
# 2. Copia el código del componente
# 3. Crea el archivo: v2/components/ui/[component-name].tsx
# 4. Pega y adapta el código

# Opción B: CLI (alternativa)
npx shadcn@latest add [component-name]
```

### 2. Exportar desde v2.ts

```typescript
// Archivo: packages/recreo/v2.ts
// ⚠️ IMPORTANTE: Este es el ÚNICO punto de entrada para componentes v2
// NO crear archivos index.ts adicionales en la carpeta v2/

// Ejemplo de exportación simple
export { ComponentName } from './v2/components/ui/[component-name]';

// Ejemplo con múltiples exports
export { 
  ComponentName,
  ComponentNameProps, // Si tiene tipos
  componentNameVariants // Si tiene variantes
} from './v2/components/ui/[component-name]';
```

⚠️ **Importante**: 
- Los componentes v2 SOLO necesitan ser exportados en `v2.ts` en la raíz del paquete
- NO crear archivos index.ts adicionales en la carpeta v2/
- NO agregar a tsup.config.ts (eso es solo para componentes v1 con dependencias especiales)
- Usar PascalCase para nombres de componentes
- Mantener un orden alfabético en las exportaciones

### 3. Agregar dependencias

```json
// Archivo: packages/recreo/package.json
{
  "devDependencies": {
    "@radix-ui/react-[component]": "^x.x.x"
  },
  "peerDependencies": {
    "@radix-ui/react-[component]": "^x.x.x"
  }
}
```

**Notas sobre dependencias**:
- Agregar SOLO si el componente lo requiere
- Usar la misma versión en dev y peer dependencies
- Verificar compatibilidad con otros componentes

### 4. Crear historia de Storybook

```typescript
// Archivo: apps/recreo-sb/src/stories/[ComponentName]V2.stories.ts

import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '@cometa/recreo/v2';

// Metadata del componente
const meta: Meta<typeof ComponentName> = {
  title: 'V2/ComponentName', // Usar V2/ prefix
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'], // Habilita documentación automática
  argTypes: {
    // Props del componente
    variant: {
      control: 'select',
      options: ['default', 'outline'], // Ajustar según el componente
      description: 'Estilo visual del componente',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado',
    },
    // Props específicos del componente...
    
    // Props a ocultar
    ref: {
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - caso de uso básico
export const Default: Story = {
  args: {
    // Props mínimos necesarios
  },
};

// Variantes comunes
export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

// Ejemplos de uso real
export const WithCustomClass: Story = {
  args: {
    className: 'custom-styles',
  },
};
```

### 5. Verificación

```bash
# 1. Construir el paquete
cd packages/recreo
npm run build

# 2. Verificar en Storybook
cd ../../apps/recreo-sb
npm run storybook

# 3. Checklist de verificación:
# - ¿El componente aparece en Storybook?
# - ¿Las variantes funcionan correctamente?
# - ¿Los controles modifican el componente?
# - ¿La documentación es clara?
```

## 📂 Estructura Final

```
packages/recreo/
├── package.json           # Dependencias del componente
├── v2.ts                 # Exportación del componente
└── v2/components/ui/
    └── [component].tsx   # Implementación del componente

apps/recreo-sb/
└── src/stories/
    └── [Component]V2.stories.ts  # Historia de Storybook
```

## 🔍 Verificación Final

1. **Exportaciones**:
   ```typescript
   import { ComponentName } from '@cometa/recreo/v2';
   // ¿Funciona la importación?
   ```

2. **Uso del Componente**:
   ```typescript
   function Example() {
     return (
       <ComponentName
         variant="default"
         className="custom"
         // ...props específicos
       />
     );
   }
   ```

3. **Storybook**:
   - Historia visible en la sección V2
   - Controles funcionando
   - Documentación clara
   - Variantes visibles

## 🚫 Errores Comunes

1. Olvidar exportar en `v2.ts`
2. Intentar agregar al `tsup.config.ts` (no necesario para v2)
3. No actualizar dependencias en `package.json`
4. Nombres inconsistentes entre archivos
5. Falta de documentación en Storybook

## 🆘 Solución de Problemas

Si el componente no aparece:
1. Verificar exportación en `v2.ts`
2. Reconstruir el paquete (`npm run build`)
3. Verificar importación en la historia
4. Revisar consola de errores

Si los estilos no funcionan:
1. Verificar className en el componente
2. Confirmar que tailwind está procesando el archivo
3. Verificar conflictos de estilos 