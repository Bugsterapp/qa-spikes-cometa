import type { Meta, StoryObj } from '@storybook/react';
import { Popover, PopoverTrigger, PopoverContent, Button, Input, Label } from '@cometa/recreo/v2';

const meta: Meta<typeof Popover> = {
  title: 'V2/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia principal - Caso de uso básico
export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensiones</h4>
            <p className="text-sm text-muted-foreground">Establece las dimensiones para el objeto.</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-1">
              <Label htmlFor="width" className="text-sm">
                Ancho
              </Label>
              <Input id="width" defaultValue="100%" className="col-span-2 h-10" />
            </div>
            <div className="grid grid-cols-3 items-center gap-1">
              <Label htmlFor="height" className="text-sm">
                Alto
              </Label>
              <Input id="height" defaultValue="25px" className="col-span-2 h-10" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// Ejemplo con formulario simple
export const WithForm: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Editar Perfil</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Editar Perfil</h4>
            <p className="text-sm text-muted-foreground">Actualiza tu información de perfil.</p>
          </div>
          <div className="grid gap-2">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm">
                Nombre
              </Label>
              <Input id="name" placeholder="Tu nombre" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm">
                Usuario
              </Label>
              <Input id="username" placeholder="@usuario" />
            </div>
          </div>
          <Button variant="secondary">Guardar Cambios</Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

// Ejemplo con diferentes alineaciones
export const WithAlignment: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Alineado al Inicio</Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-52">
          <p className="text-sm">Este popover está alineado al inicio del botón.</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Alineado al Centro</Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-52">
          <p className="text-sm">Este popover está alineado al centro del botón.</p>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Alineado al Final</Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-52">
          <p className="text-sm">Este popover está alineado al final del botón.</p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
