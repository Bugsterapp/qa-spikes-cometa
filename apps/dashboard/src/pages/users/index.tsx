import { Button, Dialog } from '@cometa/recreo';
import type { UserDTO, Membership } from '@cometa/trpc';
import { cn } from '@cometa/utils';
import { createColumnHelper } from '@tanstack/react-table';
import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import IcDeleteTrash from '/public/assets/icons/ic_delete_trash.svg';
import IcEditPencil from '/public/assets/icons/ic_pencil.svg';
import IcRefresh from '/public/assets/icons/ic_refresh.svg';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import Sheet from '/src/components/atoms/Sheet';
import { DropdownActionItem } from '/src/components/concepts/DropdownActionItem';
import Layout from '/src/components/layouts';
import MultipleFilters, {
  formFilterDataToParams,
  MultipleFiltersChips,
  normalizeFilters,
} from '/src/components/MultipleFilters';
import SettingsDropDown from '/src/components/SettingsDropDown';
import { TableVirtualized } from '/src/components/TableInfinityScroll';
import { Button as LegacyButton } from '/src/components/ui/Button';
import UserForm from '/src/components/users/UserForm';
import { type UserFormDTO } from '/src/hooks/useUserForm';
import { useSelectedSchool } from '/src/guards/AuthGuard';
import useAlert from '/src/hooks/useAlert';
import { useFilters } from '/src/hooks/useFilters';
import useSendPageViewedEvent from '/src/hooks/useSendPageViewedEvent';
import useSendTrackEventWithUserName from '/src/hooks/useSendTrackEventWithUserName';
import { api } from '/src/utils/api';
import { formatDateShortWithHour } from '/src/utils/general';
import IcUserAdd from '/public/assets/icons/ic_user_add_m.svg';
import UserPermissionsForm from '/src/components/users/UserPermissionsForm';
import IcBadge from '/public/assets/icons/ic_badge.svg';
import { MEMBERSHIPS } from '/src/constants/memberships';

export default function UsersPage() {
  const selectedSchool = useSelectedSchool();

  useSendPageViewedEvent('Usuarios', selectedSchool);

  return <Users />;
}

UsersPage.getLayout = function getLayout(page: JSX.Element) {
  return (
    <Layout title="Usuarios" dashboardVariant="stretch">
      {page}
    </Layout>
  );
};

UsersPage.auth = true;

export function Users() {
  const selectedSchool = useSelectedSchool();
  const utils = api.useUtils();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [onEdit, setOnEdit] = useState<UserDTO | undefined>();
  const [onCreate, setOnCreate] = useState<boolean>(false);
  const [onDelete, setOnDelete] = useState<string | undefined>();
  const [onPermissions, setOnPermissions] = useState<UserDTO | undefined>();
  const trackEvent = useSendTrackEventWithUserName();
  const { setAlertState } = useAlert();

  const { formFilterData, handleFilter, handleChangeChipFilter, handleClearFilter, itemsCount, setItemsCount } =
    useFilters();

  const schoolId = selectedSchool?.id as string;

  const { data: filters } = api.schools.getUsersFilters.useQuery({ schoolId }, { enabled: !!schoolId });

  const params = useMemo(() => formFilterDataToParams(formFilterData), [formFilterData]);
  const hasFilters = Object.keys(formFilterData).length > 0;

  const usersFilters = useMemo(() => {
    if (!filters) return undefined;
    return normalizeFilters(filters);
  }, [filters]);

  const filterItems = [
    {
      header: 'Rol',
      watchKey: 'membership',
      contents: usersFilters?.membership,
    },
  ];

  const userCreateMutation = api.auth.createUser.useMutation({
    onSuccess: async () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Usuario creado con éxito!',
      });
      await utils.schools.getUsers.invalidate();
      setOnCreate(false);
    },
    onError: (error) => {
      const message = error.data?.code === 'CONFLICT' ? error.message : 'Error al crear el usuario';
      setAlertState({
        severity: 'error',
        open: true,
        message,
      });
      setOnCreate(false);
    },
  });

  const userUpdateMutation = api.auth.updateUser.useMutation({
    onSuccess: async () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Usuario actualizado con éxito!',
      });
      await utils.schools.getUsers.invalidate();
      setOnEdit(undefined);
    },
    onError: (error) => {
      const message = error.data?.code === 'CONFLICT' ? error.message : 'Error al actualizar el usuario';
      setAlertState({
        severity: 'error',
        open: true,
        message,
      });
      setOnEdit(undefined);
    },
  });

  const updateUserPermissionsMutation = api.schools.updateUserPermissions.useMutation({
    onSuccess: async () => {
      setAlertState({ severity: 'success', open: true, message: '¡Permisos actualizados con éxito!' });
      await utils.schools.getUsers.invalidate();
      setOnPermissions(undefined);
    },
    onError: () => {
      setAlertState({ severity: 'error', open: true, message: 'Error al actualizar permisos' });
      setOnPermissions(undefined);
    },
  });

  const updateUser = (data: UserFormDTO) => {
    userUpdateMutation.mutate({
      school_id: selectedSchool?.id || '',
      user_id: onEdit?.id || '',
      data,
    });
  };

  const updatePermissions = (permission_set: Membership) => {
    updateUserPermissionsMutation.mutate({
      school_id: selectedSchool?.id || '',
      user_id: onPermissions?.id || '',
      data: permission_set,
    });
  };

  const userDeleteMutation = api.schools.deleteUser.useMutation({
    onSuccess: async () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: '¡Usuario dado de baja con éxito!',
      });
      await utils.schools.getUsers.invalidate();
      setOnDelete(undefined);
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al dar de baja el usuario',
      });
      setOnDelete(undefined);
    },
  });

  const deleteUser = (id: string) => {
    userDeleteMutation.mutate({
      school_id: selectedSchool?.id || '',
      user_id: id,
    });
  };

  const createUser = (data: UserFormDTO) => {
    userCreateMutation.mutate({
      ...data,
      school_id: selectedSchool?.id || '',
    });
  };

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative w-full h-full font-lota">
      <div
        className={cn('w-full top-0 sticky z-10 bg-white', {
          static: offset > 500,
        })}
      >
        <div className="flex items-center justify-between px-8 py-3 transition-all transform-gpu">
          <h1 className="text-[#212B36] text-2xl font-bold">Usuarios</h1>

          <Button
            onClick={() => {
              setOnCreate(true);
            }}
            className="justify-center leading-none "
            variant="solid"
            color="legacy"
          >
            <IcUserAdd fill="currentColor" />
            Nuevo usuario
          </Button>
        </div>

        <div className="flex items-center gap-2 px-8 pb-3 transition-all duration-300 bg-white opacity-100">
          <MultipleFilters
            filterItems={filterItems}
            handleFilter={handleFilter}
            onClearFilter={handleClearFilter}
            itemsCount={itemsCount}
            setItemsCount={setItemsCount}
          />
          <GlobalSearch placeholder="Buscar" search={search} setSearch={setSearch} />
        </div>

        <MultipleFiltersChips
          onChange={handleChangeChipFilter}
          formFilterData={formFilterData}
          itemsCount={itemsCount}
          setItemsCount={setItemsCount}
          className="px-8 py-0 pb-2"
        />
      </div>

      <UsersList
        clearFilters={handleClearFilter}
        hasFilters={hasFilters}
        search={search}
        params={params}
        setOnEdit={setOnEdit}
        setOnDelete={setOnDelete}
        setOnPermissions={setOnPermissions}
      />

      <Sheet
        open={onCreate}
        onOpenChange={(open) => {
          if (!open) setOnCreate(false);
        }}
      >
        <Sheet.Content>
          <UserForm
            user={onEdit}
            onClose={() => setOnCreate(false)}
            onSave={createUser}
            mode="create"
            isLoading={userCreateMutation.isPending}
          />
        </Sheet.Content>
      </Sheet>

      <Sheet
        open={onEdit !== undefined}
        onOpenChange={(open) => {
          if (!open) setOnEdit(undefined);
        }}
      >
        <Sheet.Content>
          <UserForm
            user={onEdit}
            onClose={() => setOnEdit(undefined)}
            onSave={updateUser}
            isLoading={userUpdateMutation.isPending}
          />
        </Sheet.Content>
      </Sheet>

      <Sheet
        open={onPermissions !== undefined}
        onOpenChange={(open) => {
          if (!open) setOnPermissions(undefined);
        }}
      >
        <Sheet.Content>
          <UserPermissionsForm
            user={onPermissions}
            onClose={() => setOnPermissions(undefined)}
            onSave={updatePermissions}
            isLoading={updateUserPermissionsMutation.isPending}
          />
        </Sheet.Content>
      </Sheet>

      <Dialog.Root
        open={onDelete !== undefined}
        onOpenChange={(open) => {
          if (!open) setOnDelete(undefined);
        }}
      >
        <Dialog.Title>¿Quieres dar de baja a este usuario?</Dialog.Title>
        <div className="flex justify-between max-w-[calc(433px_-_(48px_*_2))] mx-auto gap-2 mt-8">
          <Dialog.Close
            onClick={() => {
              trackEvent('dashboard: leave delete user');
              setOnDelete(undefined);
            }}
            asChild
          >
            <LegacyButton className="w-full" variant="ghost">
              No, volver
            </LegacyButton>
          </Dialog.Close>
          <LegacyButton
            className="w-full bg-[#FF4842] shadow-[#FF4842] hover:bg-[#c73833] text-white"
            onClick={() => {
              trackEvent('dashboard: confirm delete user');
              deleteUser(onDelete as string);
            }}
          >
            Si, dar de baja
          </LegacyButton>
        </div>
      </Dialog.Root>
    </div>
  );
}

function UsersList({
  clearFilters,
  hasFilters,
  search,
  params,
  setOnEdit,
  setOnDelete,
  setOnPermissions,
}: {
  clearFilters: () => void;
  hasFilters: boolean;
  search: string;
  params: Record<string, boolean | string[]>;
  setOnEdit: Dispatch<SetStateAction<UserDTO | undefined>>;
  setOnDelete: Dispatch<SetStateAction<string | undefined>>;
  setOnPermissions: Dispatch<SetStateAction<UserDTO | undefined>>;
}) {
  const selectedSchool = useSelectedSchool();
  const { setAlertState } = useAlert();

  const {
    data: users,
    isFetching,
    isPending: isLoading,
  } = api.schools.getUsers.useQuery(
    {
      schoolId: selectedSchool?.id as string,
      query: {
        search,
        ...params,
      },
    },
    {
      enabled: !!selectedSchool?.id,
    }
  );

  const totalCount = useMemo(() => users?.length || 0, [users]);

  const noItems = totalCount === 0;
  const hasSearch = search.trim().length > 0;

  const noResults = noItems && !hasSearch && !hasFilters;
  const noResultsWithFilters = noItems && (hasSearch || hasFilters) && !isFetching;

  const resetPasswordMutation = api.auth.resetPassword.useMutation({
    onSuccess: () => {
      setAlertState({
        severity: 'success',
        open: true,
        message: 'Se envió el correo para restablecer la contraseña',
      });
    },
    onError: () => {
      setAlertState({
        severity: 'error',
        open: true,
        message: 'Error al solicitar restablecimiento de contraseña',
      });
    },
  });

  const handleResetPassword = (email: string) => {
    resetPasswordMutation.mutate({ email });
  };

  const [headerVisible, setHeaderVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const columnHelper = createColumnHelper<UserDTO>();
  const columns = [
    columnHelper.accessor('first_name', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate max-w-[800px]" title={info.getValue()}>
            {info.row.original.first_name} {info.row.original.last_name}
          </span>
        </div>
      ),
      header: () => <span>Nombre</span>,
    }),
    columnHelper.accessor('email', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate max-w-[800px]" title={info.getValue()}>
            {info.getValue()}
          </span>
        </div>
      ),
      header: () => <span>Correo</span>,
    }),
    columnHelper.accessor('membership', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate max-w-[800px]" title={info.getValue()}>
            {MEMBERSHIPS[info.getValue() as keyof typeof MEMBERSHIPS]}
          </span>
        </div>
      ),
      header: () => <span>Rol</span>,
    }),
    columnHelper.accessor('last_login', {
      cell: (info) => (
        <div className="flex flex-row min-w-[150px]">
          <span className="text-sm font-normal truncate max-w-[800px]" title={info.getValue()}>
            {formatDateShortWithHour(info.getValue())}
          </span>
        </div>
      ),
      header: () => <span>Última conexión</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex justify-end w-[150px]">
          <SettingsDropDown tooltipMessage="Opciones">
            <DropdownActionItem
              icon={<IcEditPencil />}
              label="Editar usuario"
              onClick={() => setOnEdit(info.row.original)}
            />
            <DropdownActionItem
              icon={<IcBadge />}
              label="Editar permisos"
              onClick={() => setOnPermissions(info.row.original)}
            />
            <DropdownActionItem
              icon={<IcRefresh />}
              label="Restablecer contraseña"
              onClick={() => handleResetPassword(info.row.original.email)}
            />
            <DropdownActionItem
              icon={<IcDeleteTrash />}
              label="Dar de baja"
              onClick={() => setOnDelete(info.row.original.id)}
            />
          </SettingsDropDown>
        </div>
      ),
    }),
  ];

  if (isFetching && noResults) {
    return (
      <div className="flex justify-center items-center px-4 py-2 bg-white border-t border-gray-200 w-[calc(100vw-255px) h-[80vh]">
        <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
      </div>
    );
  }

  if (noResults) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-300px)] flex-col">
        <div className="w-[350px] flex flex-col gap-2 text-center">
          <span className="text-xl font-bold">¡Aún no tienes usuarios creados!</span>
        </div>
      </div>
    );
  }

  if (noResultsWithFilters) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[calc(100vh-372px)] flex-col">
        <div className="w-[350px] flex flex-col gap-2">
          <span className="text-xl font-bold">No hemos encontrado resultados</span>
          <span>Prueba cambiando los filtros que has ingresado para hacer una nueva búsqueda.</span>

          {!hasSearch ? (
            <button className="flex items-center gap-2 text-green" onClick={clearFilters} type="button">
              <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Limpiar filtros</title>
                <path
                  d="M13.7379 4.76274C12.5154 3.54024 10.7829 2.83524 8.87794 3.03024C6.12544 3.30774 3.86044 5.54274 3.55294 8.29524C3.14044 11.9327 5.95294 15.0002 9.50044 15.0002C11.8929 15.0002 13.9479 13.5977 14.9079 11.5802C15.1479 11.0777 14.7879 10.5002 14.2329 10.5002C13.9554 10.5002 13.6929 10.6502 13.5729 10.8977C12.7254 12.7202 10.6929 13.8752 8.47294 13.3802C6.80794 13.0127 5.46544 11.6552 5.11294 9.99024C4.48294 7.08024 6.69544 4.50024 9.50044 4.50024C10.7454 4.50024 11.8554 5.01774 12.6654 5.83524L11.5329 6.96774C11.0604 7.44024 11.3904 8.25024 12.0579 8.25024H14.7504C15.1629 8.25024 15.5004 7.91274 15.5004 7.50024V4.80774C15.5004 4.14024 14.6904 3.80274 14.2179 4.27524L13.7379 4.76274Z"
                  fill="#00AB55"
                />
              </svg>
              <span className="font-bold">Limpiar filtros</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }
  return (
    <div ref={wrapperRef} className="w-full transition-opacity duration-300 pb-28">
      <TableVirtualized
        data={users || []}
        columns={columns}
        maxHeight={wrapperRef?.current?.offsetHeight || 500}
        totalCount={totalCount}
        totalFetched={totalCount}
        isLoading={isLoading}
        isFetching={isFetching}
        setHeaderVisible={setHeaderVisible}
        headerVisible={headerVisible}
        fetchNextPage={() => void 0}
        hasNextPage={false}
        addMorePaddingFirstRow
        useWindowScroll
        hideSum
      />

      <div className="fixed bottom-0 z-10 flex items-center w-full gap-1 px-8 py-5 text-gray-600 bg-white">
        <span className="font-semibold">{totalCount}</span> usuarios
      </div>
    </div>
  );
}
