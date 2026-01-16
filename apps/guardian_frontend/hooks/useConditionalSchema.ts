import { useMemo } from 'react';
import { z } from 'zod';

type SchemaShape = { [key: string]: z.ZodTypeAny };

interface UseConditionalSchemaOptions<T> {
  shouldMakeOptional: (fieldName: string, fieldSchema: z.ZodTypeAny) => boolean;
  shouldValidate: (fieldName: string, data: T) => boolean;
  refinement?: (data: T, ctx: z.RefinementCtx, shouldValidate: (fieldName: string, data: T) => boolean) => void;
}

export function useConditionalSchema<T extends z.ZodObject<SchemaShape>>(
  baseSchema: T,
  options: UseConditionalSchemaOptions<z.infer<T>>
): z.ZodType<z.infer<T>> {
  const { shouldMakeOptional, shouldValidate, refinement } = options;

  return useMemo(() => {
    const hiddenFields = Object.keys(baseSchema.shape).filter((key) => shouldMakeOptional(key, baseSchema.shape[key]));
    const schemaWithOptionals = makeFieldsOptional(baseSchema, hiddenFields);

    return refinement
      ? schemaWithOptionals.superRefine((data, ctx) => {
          refinement(data as z.infer<T>, ctx, shouldValidate);
        })
      : schemaWithOptionals;
  }, [baseSchema, shouldMakeOptional, shouldValidate, refinement]);
}

export function makeFieldsOptional(schema: z.AnyZodObject, hiddenFields: string[]) {
  if (!hiddenFields.length) return schema;

  const hidden = new Set(hiddenFields);
  const nextShape: Record<string, z.ZodTypeAny> = {};

  for (const key of Object.keys(schema.shape)) {
    const field = (schema.shape as Record<string, z.ZodTypeAny>)[key];

    if (!hidden.has(key)) {
      nextShape[key] = field;
      continue;
    }

    if (field instanceof z.ZodArray) {
      nextShape[key] = z.array(z.any()).optional();
    } else if (field instanceof z.ZodNumber) {
      nextShape[key] = z.coerce.number().optional().nullable();
    } else if (field instanceof z.ZodString) {
      nextShape[key] = z.string().optional().nullable();
    } else if (field instanceof z.ZodBoolean) {
      nextShape[key] = z.boolean().optional().nullable();
    } else {
      nextShape[key] = z.any().optional().nullable();
    }
  }

  return z.object(nextShape) as z.AnyZodObject;
}
