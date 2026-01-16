import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@cometa/recreo/v2';

const meta: Meta<typeof Select> = {
  title: 'V2/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado del select',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - caso de uso básico
export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecciona una opción" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frutas</SelectLabel>
          <SelectItem value="manzana">Manzana</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="naranja">Naranja</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// Estado deshabilitado
export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select deshabilitado" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="opcion">Opción</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// Con múltiples grupos
export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecciona una comida" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frutas</SelectLabel>
          <SelectItem value="manzana">Manzana</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Verduras</SelectLabel>
          <SelectItem value="zanahoria">Zanahoria</SelectItem>
          <SelectItem value="lechuga">Lechuga</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// Con textos largos
export const WithLongText: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Selecciona un plan de estudios" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Planes Disponibles</SelectLabel>
          <SelectItem value="plan1">Plan de Estudios Avanzado de Matemáticas y Ciencias Naturales 2024</SelectItem>
          <SelectItem value="plan2">
            Programa Integral de Desarrollo Académico y Personal con Enfoque Multidisciplinario
          </SelectItem>
          <SelectItem value="plan3">
            Curso Especializado en Metodologías de Aprendizaje y Técnicas de Estudio
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

// Con descripciones largas y múltiples líneas
export const WithMultilineContent: Story = {
  render: () => (
    <div className="flex gap-4">
      <Select>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Selecciona un curso" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Cursos Disponibles</SelectLabel>
            <SelectItem value="curso1" className="whitespace-normal">
              Matemáticas Avanzadas
              <div className="text-xs text-muted-foreground mt-1">
                Curso diseñado para estudiantes que buscan profundizar en conceptos matemáticos complejos incluyendo
                cálculo diferencial e integral.
              </div>
            </SelectItem>
            <SelectItem value="curso2" className="whitespace-normal">
              Física Cuántica
              <div className="text-xs text-muted-foreground mt-1">
                Introducción a los principios fundamentales de la mecánica cuántica y sus aplicaciones en la tecnología
                moderna.
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecciona un estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Estados del Proceso</SelectLabel>
            <SelectItem value="estado1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Completado</span>
              </div>
            </SelectItem>
            <SelectItem value="estado2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>En Proceso</span>
              </div>
            </SelectItem>
            <SelectItem value="estado3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Pendiente</span>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};
