import { createContext, useContext, useRef, useMemo, useState, useCallback, useEffect } from 'react';

export type FormAction = {
  submitForm?: () => Promise<{ success: boolean }>;
  restoreForm: () => void;
  validate?: () => Promise<boolean>;
  setIsEditing?: (value: boolean) => void;
  isEditing?: boolean;
  isDirty?: boolean;
};

export enum FormActionKeys {
  PersonalForm = 'personalForm',
  PhoneForm = 'phoneForm',
  AddressForm = 'addressForm',
  PersonalStep = 'personalStep',
  MedicalStep = 'medicalStep',
  ConsentmentsStep = 'consentments',
  DocumentsStep = 'documentsStep',
  EmergencyContactForm = 'emergencyContactForm',
  GeneralForm = 'generalForm',
  BackgroundForm = 'backgroundForm',
  AllergiesForm = 'allergiesForm',
  MedicalAuthorizationForm = 'medicalAuthorizationForm',
  AdditionalCommentsForm = 'additionalCommentsForm',
}

export type FormValues = Record<string, unknown>;

type FormActionsContextType = {
  register: (key: string, action: FormAction) => void;
  getAction: (key: string) => FormAction | null;
  subscribe: (key: string, callback: () => void) => () => void;
  updateIsEditing: (key: string, isEditing: boolean) => void;
  updateIsDirty: (key: string, isDirty: boolean) => void;
  updatePersonalValues: (values: FormValues) => void;
  getPersonalValues: () => FormValues | undefined;
  updateMedicalValues: (values: FormValues) => void;
  getMedicalValues: () => FormValues | undefined;
  isEditingMap: Record<string, boolean>;
  isDirtyMap: Record<string, boolean>;
};

const FormActionsContext = createContext<FormActionsContextType | undefined>(undefined);

export function FormActionsProvider({ children }: { children: React.ReactNode }) {
  const actions = useRef<Record<string, FormAction>>({});
  const subscribers = useRef<Record<string, Set<() => void>>>({});

  const [isDirtyMap, setIsDirtyMap] = useState<Record<string, boolean>>({});
  const [isEditingMap, setIsEditingMap] = useState<Record<string, boolean>>({});
  const [personalValues, setPersonalValues] = useState<FormValues>({});
  const [medicalValues, setMedicalValues] = useState<FormValues>({});

  const personalValuesRef = useRef(personalValues);
  const medicalValuesRef = useRef(medicalValues);

  const register = useCallback((key: string, action: FormAction) => {
    actions.current[key] = action;
  }, []);

  const getAction = useCallback(
    (key: string) => {
      const action = actions.current[key] || null;
      if (action) {
        return {
          ...action,
          isDirty: isDirtyMap[key] ?? action.isDirty,
          isEditing: isEditingMap[key] ?? action.isEditing,
        };
      }
      return null;
    },
    [isDirtyMap, isEditingMap]
  );

  const subscribe = useCallback((key: string, callback: () => void) => {
    if (!subscribers.current[key]) {
      subscribers.current[key] = new Set();
    }
    subscribers.current[key].add(callback);
    return () => {
      subscribers.current[key].delete(callback);
    };
  }, []);

  const updateIsDirty = useCallback((key: string, isDirty: boolean) => {
    setIsDirtyMap((prev) => {
      const newMap = { ...prev, [key]: isDirty };
      if (subscribers.current[key]) {
        subscribers.current[key].forEach((cb) => cb());
      }
      return newMap;
    });
  }, []);

  const updateIsEditing = useCallback((key: string, isEditing: boolean) => {
    setIsEditingMap((prev) => {
      const newMap = { ...prev, [key]: isEditing };
      if (subscribers.current[key]) {
        subscribers.current[key].forEach((cb) => cb());
      }
      return newMap;
    });
  }, []);

  const updatePersonalValues = useCallback((values: FormValues) => {
    setPersonalValues((prev) => ({ ...prev, ...values }));
  }, []);

  const getPersonalValues = useCallback(() => personalValuesRef.current, []);

  const updateMedicalValues = useCallback((values: FormValues) => {
    setMedicalValues((prev) => ({ ...prev, ...values }));
  }, []);

  const getMedicalValues = useCallback(() => medicalValuesRef.current, []);

  const value = useMemo(
    () => ({
      register,
      getAction,
      subscribe,
      updateIsDirty,
      updateIsEditing,
      updatePersonalValues,
      updateMedicalValues,
      getMedicalValues,
      getPersonalValues,
      isDirtyMap,
      isEditingMap,
    }),
    [
      register,
      getAction,
      subscribe,
      updateIsDirty,
      updateIsEditing,
      updatePersonalValues,
      updateMedicalValues,
      getMedicalValues,
      getPersonalValues,
      isDirtyMap,
      isEditingMap,
    ]
  );

  useEffect(() => {
    personalValuesRef.current = personalValues;
  }, [personalValues]);

  useEffect(() => {
    medicalValuesRef.current = medicalValues;
  }, [medicalValues]);

  return <FormActionsContext.Provider value={value}>{children}</FormActionsContext.Provider>;
}

export const useFormActions = () => {
  const context = useContext(FormActionsContext);

  if (!context) {
    throw new Error('useFormActions must be used within a FormActionsProvider');
  }

  return context;
};
