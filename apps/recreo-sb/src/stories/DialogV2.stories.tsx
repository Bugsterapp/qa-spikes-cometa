import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
} from '@cometa/recreo/v2';

const meta: Meta<typeof Dialog> = {
  title: 'V2/Dialog',
  component: Dialog,
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir Diálogo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificar Email</DialogTitle>
          <DialogDescription>
            Para cambiar tu email, primero verifica tu identidad ingresando tu email actual.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Actual</Label>
            <Input id="email" type="email" placeholder="tu@email.actual" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button>Verificar Email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Ejemplo con formulario de validación
export const WithValidation: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Cambiar Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verificar Email</DialogTitle>
          <DialogDescription>
            Para cambiar tu email, primero verifica tu identidad ingresando tu email actual.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <div className="space-y-2">
            <Label htmlFor="current-email">Email Actual</Label>
            <Input id="current-email" type="email" placeholder="tu@email.actual" />
          </div>
          <div className="space-y-2 mt-3">
            <Label htmlFor="new-email">Nuevo Email</Label>
            <Input id="new-email" type="email" placeholder="nuevo@email.com" isError />
            <p className="text-sm text-destructive">Este email ya está en uso</p>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" className="mr-2">
            Cancelar
          </Button>
          <Button>Verificar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Ejemplo sin botón de cerrar
export const WithoutCloseButton: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Suscribirse</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Suscríbete al Newsletter</DialogTitle>
          <DialogDescription>
            Recibe actualizaciones semanales sobre nuevas características y noticias.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <div className="space-y-2">
            <Label htmlFor="subscribe-email">Correo Electrónico</Label>
            <Input id="subscribe-email" type="email" placeholder="tu@email.com" />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button>Suscribirse</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
