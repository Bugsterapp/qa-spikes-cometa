import { Button } from '@cometa/recreo';
import { Membership, UserDTO } from '@cometa/trpc';
import { FC, useMemo, useState, useEffect } from 'react';
import SidebarActions from '/src/components/atoms/SidebarActions';
import SidebarHeader from '/src/components/molecules/dashboard/SidebarHeader';
import { Checkbox } from '/src/components/atoms/RadixCheckbox';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import { api } from '/src/utils/api';

interface UserPermissionsFormProps {
  user?: UserDTO;
  onClose: () => void;
  onSave: (permissions: Membership) => void;
  isLoading?: boolean;
}

type PermissionKey = keyof Membership;

const PERMISSION_LABELS: Partial<Record<PermissionKey, string>> = {
  can_view_collections_page: 'Puede acceder a sección Cobranzas',
  can_view_delinquency_page: 'Puede acceder a sección Morosidad',
  can_view_received_payment_page: 'Puede acceder a sección Pagos y Facturas',
  can_perform_invoicing: 'Puede cancelar facturas y refacturarlas',
  can_view_income_page: 'Puede acceder a sección Ingresos',
  can_add_payment: 'Puede registrar pagos',
  can_delete_manual_payment: 'Puede eliminar pagos',
  can_add_discount: 'Puede otorgar descuentos, recargos y modificar el valor original',
  can_assign_billing_guardian: 'Puede modificar la información de facturación del tutor',

  can_add_student: 'Puede crear estudiantes',
  can_edit_student: 'Puede editar estudiantes',
  can_assign_guardian: 'Puede asignar tutores',
  can_deassign_guardian: 'Puede desasignar tutores',
  can_edit_guardian: 'Puede editar información de tutores',
  can_send_whatsapp: 'Puede enviar enlaces del portal a través de WhatsApp',

  can_view_inscriptions_page: 'Puede acceder a sección Inscripciones',
  can_view_inscriptions_quotas_page: 'Puede acceder a configuración de cupos de inscripción',
  can_view_admissions_page: 'Puede acceder a sección Admisiones',
  can_view_concepts_page: 'Puede acceder a sección Conceptos',
  can_add_concept: 'Puede crear conceptos',
  can_edit_stock: 'Puede editar stock de conceptos',
  can_add_concept_assignment: 'Puede asignar conceptos',
  can_edit_concept_assignment: 'Puede modificar la asignación de conceptos',
  can_delete_concept_assignment: 'Puede eliminar la asignación de conceptos',

  can_view_scholarships_and_discounts: 'Puede acceder a sección Becas y Descuentos',
  can_assign_scholarship: 'Puede asignar becas',
  can_deassign_scholarship: 'Puede desasignar becas',
};

const ALL_PERMISSION_KEYS = Object.keys(PERMISSION_LABELS) as PermissionKey[];

type Category = {
  key: 'payments' | 'students' | 'inscriptions' | 'scholarships';
  label: string;
  permissions: readonly PermissionKey[];
};

const PERMISSION_CATEGORIES: readonly Category[] = [
  {
    key: 'payments',
    label: 'Pagos y Finanzas',
    permissions: [
      'can_view_collections_page',
      'can_view_delinquency_page',
      'can_view_received_payment_page',
      'can_perform_invoicing',
      'can_view_income_page',
      'can_add_payment',
      'can_delete_manual_payment',
      'can_add_discount',
      'can_assign_billing_guardian',
    ],
  },
  {
    key: 'students',
    label: 'Estudiantes y Tutores',
    permissions: [
      'can_add_student',
      'can_edit_student',
      'can_assign_guardian',
      'can_deassign_guardian',
      'can_edit_guardian',
      'can_send_whatsapp',
    ],
  },
  {
    key: 'inscriptions',
    label: 'Inscripciones, Admisiones y Conceptos',
    permissions: [
      'can_view_inscriptions_page',
      'can_view_inscriptions_quotas_page',
      'can_view_admissions_page',
      'can_view_concepts_page',
      'can_add_concept',
      'can_edit_stock',
      'can_add_concept_assignment',
      'can_edit_concept_assignment',
      'can_delete_concept_assignment',
    ],
  },
  {
    key: 'scholarships',
    label: 'Becas y Descuentos',
    permissions: ['can_view_scholarships_and_discounts', 'can_assign_scholarship', 'can_deassign_scholarship'],
  },
] as const;

const UserPermissionsForm: FC<UserPermissionsFormProps> = ({ user, onClose, onSave, isLoading }) => {
  const selectedSchool = useSelectedSchool();

  const { data: permissionsData } = api.schools.getUserPermissions.useQuery(
    { school_id: selectedSchool?.id || '', user_id: user?.id || '' },
    { enabled: Boolean(user?.id && selectedSchool?.id) }
  );

  const initialPermissions: Membership = useMemo(
    () => (permissionsData as any) || ({} as Membership),
    [permissionsData]
  );
  const [permissions, setPermissions] = useState<Membership>(initialPermissions);
  const [expanded, setExpanded] = useState<Category['key']>('payments');

  useEffect(() => {
    setPermissions(initialPermissions);
  }, [initialPermissions]);

  const computeCategoryState = (category: Category) => {
    const total = category.permissions.length;
    const checked = category.permissions.filter((p) => permissions[p as PermissionKey]).length;
    if (checked === 0) return false as const;
    if (checked === total) return true as const;
    return 'indeterminate' as const;
  };

  const toggleCategory = (category: Category) => {
    const currentState = computeCategoryState(category);
    const newValue = currentState !== true;
    setPermissions((prev) => {
      const copy = { ...prev } as Membership;
      category.permissions.forEach((p) => {
        copy[p as PermissionKey] = newValue;
      });
      return copy;
    });
  };

  const togglePermission = (key: PermissionKey, value: boolean) => {
    setPermissions((prev) => ({ ...prev, [key]: value }));
  };

  const getFullPermissions = (source: Membership): Membership => {
    const full: Membership = {} as Membership;
    ALL_PERMISSION_KEYS.forEach((key) => {
      full[key] = Boolean(source[key]);
    });
    return full;
  };

  const buildFullPermissions = (): Membership => getFullPermissions(permissions);

  const buildInitialFullPermissions = useMemo(() => getFullPermissions(initialPermissions), [initialPermissions]);

  const isDirty = useMemo(
    () => JSON.stringify(buildInitialFullPermissions) !== JSON.stringify(buildFullPermissions()),
    [buildInitialFullPermissions, permissions]
  );

  return (
    <div className="flex flex-col flex-auto px-8 min-h-[calc(100vh-135px)] justify-between">
      <div>
        <SidebarHeader title="Editar permisos" disabled={isLoading} boxClassName="px-0" onClose={onClose} />
        <p className="text-sm text-gray-600 mt-2">
          Selecciona los permisos que deseas otorgar para gestionar áreas específicas del sistema. Puedes expandir cada
          sección para ver todos los permisos disponibles.
        </p>
        <div className="border rounded-2xl p-4 mt-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {PERMISSION_CATEGORIES.map((cat) => {
            const state = computeCategoryState(cat);
            const open = expanded === cat.key;
            return (
              <div key={cat.key} className="mb-4 last:mb-0">
                {/* Header */}
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setExpanded(open ? (null as any) : cat.key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpanded(open ? (null as any) : cat.key);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={state} onCheckedChange={() => toggleCategory(cat)} />
                    <div className="flex flex-col">
                      <span className="text-base font-bold">{cat.label}</span>
                      <span className="text-xs text-gray-500">{cat.permissions.length} permisos disponibles</span>
                    </div>
                  </div>
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M1 1L6 6L11 1"
                      stroke="#637381"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {open && (
                  <div className="flex flex-col gap-3 mt-4 ml-8">
                    {cat.permissions.map((perm) => (
                      <label key={perm} className="flex items-center gap-3 cursor-pointer select-none">
                        <Checkbox
                          checked={permissions[perm as PermissionKey] || false}
                          onCheckedChange={(checked) => togglePermission(perm as PermissionKey, Boolean(checked))}
                        />
                        <span className="text-sm">{PERMISSION_LABELS[perm as PermissionKey]}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <SidebarActions className="grid grid-cols-2 px-0 shadow-none mt-4">
        <Button
          className="bg-white px-4 text-[#00AB55] text-base font-bold disabled:text-[#919EABCC] rounded-lg flex-1 hover:bg-[#00AB5514]/8"
          onClick={onClose}
          disabled={isLoading}
          variant="outline"
        >
          Cancelar
        </Button>
        <Button
          className="text-white text-base font-bold px-2 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap w-full flex-1"
          disabled={!isDirty || isLoading}
          onClick={() => onSave(buildFullPermissions())}
        >
          Guardar
        </Button>
      </SidebarActions>
    </div>
  );
};

export default UserPermissionsForm;
