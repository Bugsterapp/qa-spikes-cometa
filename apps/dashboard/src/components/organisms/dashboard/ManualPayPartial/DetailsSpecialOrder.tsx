import React, { useState } from 'react';
import Dialog from '/src/components/atoms/Dialog';
import IcTrash from '/public/assets/icons/ic_trash.svg';
import { Tooltip } from '/src/components/atoms/Tooltip';

type IDeleteModalSpecialOrder = {
  setDeleteOrder: (openDeleteModal: boolean) => void;
  openDeleteModal: boolean;
  orderDataValue: number;
  handleDelete: () => void;
  loading: boolean;
};

type IDetailsSpecialOrder = {
  name: string;
  id: string;
  value?: string;
  is_visible?: boolean;
  handleDestroyOrder: (orderData_id: string) => void;
  disableDelete: boolean;
};

export const DetailsSpecialOrder = ({
  name,
  id,
  value,
  is_visible,
  handleDestroyOrder,
  disableDelete,
}: IDetailsSpecialOrder) => {
  const [deleteOrder, setDeleteOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <div>
      <div className="flex items-center font-semibold justify-between">
        <div className="flex flex-col w-96">
          <div className="flex gap-3 flex-col">
            <div className="flex gap-2 items-center">
              <h2
                className="text-sm flex-wrap flex gap-2 items-center max-w-[300px]"
                data-testid={`${name}-discountName`}
              >
                "{name}"{' '}
                {!is_visible ? <p className="text-xs text-[#637381]">Recargo no visible para el tutor</p> : <></>}
              </h2>
              <Tooltip
                message="No puedes eliminar este recargo porque es mayor al monto pendiente a pagar. Ajusta el precio agregando otros recargos o descuentos."
                disableHover={!disableDelete}
              >
                <button
                  className="bg-transparent align-middle disabled:cursor-not-allowed"
                  data-testid={`${name}-trashIcon`}
                  onClick={() => setDeleteOrder(true)}
                  disabled={disableDelete}
                >
                  <IcTrash className={disableDelete ? 'text-gray-400' : 'text-error'} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm" data-testid={`${name}-discountValue`}>
            +${value}
          </p>
        </div>
      </div>
      <DeleteModalSpecialOrder
        openDeleteModal={deleteOrder}
        setDeleteOrder={setDeleteOrder}
        orderDataValue={Number(value)}
        loading={loading}
        handleDelete={() => {
          setLoading(true);
          handleDestroyOrder(id);
          setTimeout(() => {
            setDeleteOrder(false);
            setLoading(false);
          }, 10000);
        }}
      />
    </div>
  );
};
export const DeleteModalSpecialOrder = ({
  setDeleteOrder,
  openDeleteModal,
  orderDataValue,
  handleDelete,
  loading,
}: IDeleteModalSpecialOrder) => (
  <>
    <Dialog.Root open={openDeleteModal} position="right" centerWhenSidepanelIsOpen>
      <Dialog.Title>¿Estás seguro que deseas eliminar este recargo?</Dialog.Title>
      <Dialog.Description>Se eliminará el recargo de ${orderDataValue}</Dialog.Description>
      <div className="flex justify-center gap-x-10">
        <Dialog.Close
          onClick={() => setDeleteOrder(!openDeleteModal)}
          className="px-8 py-2 text-sm font-bold text-gray-600 bg-transparent hover:opacity-90 whitespace-nowrap"
          data-testid="cancel-button"
        >
          Cancelar
        </Dialog.Close>
        <button
          className="text-white font-bold	py-2 px-8 rounded-lg text-sm	hover:opacity-90 whitespace-nowrap bg-error shadow-[0_8px_16px_#FF48423D] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleDelete}
          disabled={loading}
          data-testid="delete-button"
        >
          Eliminar
        </button>
      </div>
    </Dialog.Root>
  </>
);
