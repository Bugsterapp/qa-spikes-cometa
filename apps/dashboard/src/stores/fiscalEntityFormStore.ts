import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BotFiscalEntityDTO, TaxingSystem } from '@cometa/trpc/src/bot/types';
import * as Sentry from '@sentry/nextjs';
import type { FiscalEntityForm } from '../components/school_config/fiscal_entities/FiscalEntityForm/types';
import { fileToSerializableFormat } from '../utils/file-utils';

export type FiscalEntityFormData = Omit<
  FiscalEntityForm,
  'fiscal_entity_file' | 'csd_key_file' | 'csd_certificate_file' | 'taxing_system'
> & {
  taxing_system: TaxingSystem | undefined;
};

export type FileData = {
  name: string;
  type: string;
  data: string;
};

export type FiscalEntityFormFiles = {
  fiscal_entity_file: FileData | null;
  csd_key_file: FileData | null;
  csd_certificate_file: FileData | null;
};

type EntityFormData = {
  formData: FiscalEntityFormData;
  files: FiscalEntityFormFiles;
};

type FiscalEntityFormState = {
  entities: Record<string, EntityFormData>;
  currentEntityId: string | null;
};

type FiscalEntityFormStore = FiscalEntityFormState & {
  setFormField: <K extends keyof FiscalEntityFormData>(field: K, value: FiscalEntityFormData[K]) => void;
  storeFile: <K extends keyof FiscalEntityFormFiles>(fileType: K, file: File | null) => Promise<void>;
  clearEntityForm: (entityId: string) => void;
  clearNewEntityForm: () => void;
  loadEntity: (entity?: BotFiscalEntityDTO | null) => void;
};

const initialFormData: FiscalEntityFormData = {
  name: '',
  tax_id: '',
  taxing_system: undefined,
  issued_at: '',
  csd_password: '',
  state: '',
  postal_code: '',
  city: '',
  district: '',
  address_name: '',
  address_number: '',
};

const initialFiles: FiscalEntityFormFiles = {
  fiscal_entity_file: null,
  csd_key_file: null,
  csd_certificate_file: null,
};

const initialEntityData: EntityFormData = {
  formData: initialFormData,
  files: initialFiles,
};

const initialState: FiscalEntityFormState = {
  entities: {},
  currentEntityId: null,
};

export const useFiscalEntityFormStore = create<FiscalEntityFormStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setFormField: (field, value) =>
        set((state) => {
          const { currentEntityId } = state;
          if (!currentEntityId) return state;

          return updateEntityInState(state, currentEntityId, {
            formData: {
              ...state.entities[currentEntityId]?.formData,
              [field]: value,
            },
          });
        }),

      storeFile: async (fileType, file) => {
        const state = get();
        const { currentEntityId } = state;
        if (!currentEntityId) return;

        let fileValue: FileData | null = null;
        if (file) {
          try {
            fileValue = await fileToSerializableFormat(file);
          } catch (error) {
            Sentry.captureException(error);
            fileValue = null;
          }
        }

        set((state) =>
          updateEntityInState(state, currentEntityId, {
            files: {
              ...state.entities[currentEntityId]?.files,
              [fileType]: fileValue,
            },
          })
        );
      },

      clearEntityForm: (entityId) => set((state) => removeEntityFromState(state, entityId)),

      clearNewEntityForm: () => set((state) => removeEntityFromState(state, 'new')),

      loadEntity: (entity) => {
        if (!entity) {
          set((state) => ({
            currentEntityId: 'new',
            entities: ensureEntityExists(state, 'new'),
          }));
          return;
        }

        if (!entity.id) return;

        const entityId = entity.id;
        set((state) => {
          if (state.entities[entityId]) {
            return { currentEntityId: entityId };
          }

          return {
            currentEntityId: entityId,
            entities: {
              ...state.entities,
              [entityId]: {
                formData: entityToFormData(entity),
                files: initialFiles,
              },
            },
          };
        });
      },
    }),
    {
      name: 'fiscal-entity-form-storage',
      partialize: (state) => ({
        entities: state.entities,
        currentEntityId: state.currentEntityId,
      }),
    }
  )
);

export const useFiscalEntityForm = () => {
  const store = useFiscalEntityFormStore();
  const { currentEntityId, entities } = store;

  const formData = currentEntityId ? entities[currentEntityId]?.formData || initialFormData : initialFormData;
  const files = currentEntityId ? entities[currentEntityId]?.files || initialFiles : initialFiles;

  return {
    ...store,
    formData,
    files,
  };
};

function updateEntityInState(state: FiscalEntityFormState, entityId: string, updates: Partial<EntityFormData>) {
  return {
    entities: {
      ...state.entities,
      [entityId]: {
        ...state.entities[entityId],
        ...updates,
      },
    },
  };
}

function removeEntityFromState(state: FiscalEntityFormState, entityId: string) {
  const newEntities = { ...state.entities };
  delete newEntities[entityId];

  return {
    entities: newEntities,
    currentEntityId: state.currentEntityId === entityId ? null : state.currentEntityId,
  };
}

function entityToFormData(entity: BotFiscalEntityDTO): FiscalEntityFormData {
  return {
    name: entity.name ?? '',
    tax_id: entity.tax_id ?? '',
    taxing_system: entity.taxing_system ?? undefined,
    issued_at: entity.issued_at ? entity.issued_at.split('T')[0] : '',
    csd_password: entity.csd_password ?? '',
    state: entity.state ?? '',
    postal_code: entity.postal_code ?? '',
    city: entity.city ?? '',
    district: entity.district ?? '',
    address_name: entity.address_name ?? '',
    address_number: entity.address_number ?? '',
  };
}

function ensureEntityExists(state: FiscalEntityFormState, entityId: string) {
  if (entityId === 'new') {
    return state.entities.new ? state.entities : { ...state.entities, new: { ...initialEntityData } };
  }
  return state.entities;
}
