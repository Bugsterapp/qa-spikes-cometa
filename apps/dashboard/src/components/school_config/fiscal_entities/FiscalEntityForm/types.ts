import { TaxingSystem } from '@cometa/trpc/src/bot/types';
import { z } from 'zod';

const rfcRegex = /^[A-ZÑ&]{3,4}-?\d{6}-?[A-Z\d]{3}$/i;
const postalCodeRegex = /^\d{5}$/;

export const schema = z.object({
  name: z.string().min(1, 'La razón social es requerida'),
  tax_id: z.string().min(1, 'El RFC es requerido').regex(rfcRegex, 'El formato del RFC no es válido'),
  taxing_system: z.nativeEnum(TaxingSystem, { errorMap: () => ({ message: 'Selecciona un régimen fiscal' }) }),
  fiscal_entity_file: z.any().optional(),
  issued_at: z
    .string()
    .min(1, 'La fecha de emisión es requerida')
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'La fecha no es válida' }
    )
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const date = new Date(val);
        if (isNaN(date.getTime())) return true;
        const today = new Date();
        return date <= today;
      },
      { message: 'La fecha no puede ser futura' }
    ),
  expires_at: z.string().optional(),
  csd_key_file: z.any().optional(),
  csd_certificate_file: z.any().optional(),
  csd_password: z.string().min(1, 'La contraseña CSD es requerida'),
  state: z.string().min(1, 'Selecciona un estado'),
  postal_code: z.string().regex(postalCodeRegex, 'El código postal debe tener 5 números'),
  city: z.string().min(1, 'La ciudad es requerida').max(80, 'La ciudad debe tener máximo 80 caracteres'),
  district: z.string().min(1, 'La colonia es requerida').max(80, 'La colonia debe tener máximo 80 caracteres'),
  address_name: z
    .string()
    .min(1, 'El nombre de la vialidad es requerido')
    .max(80, 'La vialidad debe tener máximo 80 caracteres'),
  address_number: z
    .string()
    .min(1, 'El número exterior es requerido')
    .max(80, 'El número exterior debe tener máximo 80 caracteres'),
});

export type FiscalEntityForm = z.infer<typeof schema>;
