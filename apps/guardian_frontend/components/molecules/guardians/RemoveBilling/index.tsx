import { Link } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useAlert } from '~/hooks';
import useUpdateSession from '~/hooks/useUpdateSession';
import DialogRemoveBilling from '../dialogs/DialogRemoveBilling';
import { api } from '~/utils/api';

interface RemoveBillingProps {
  onAgree: () => void;
}

const RemoveBilling = ({ onAgree }: RemoveBillingProps) => {
  const [open, setOpen] = useState(false);
  const { setAlert } = useAlert();
  const { data: session } = useSession();
  const updateSession = useUpdateSession();
  const { mutateAsync } = api.guardian.update.useMutation();
  const removeBilling = () => {
    const formValues = {
      tax_id: '',
      billing_name: '',
      taxing_system: '',
      address_name: '',
      address_number: '',
      address_complement: '',
      postal_code: '',
      state: '',
      city: '',
      district: '',
      billable_dependents: [],
      cfdi_config: {
        monthly_fee: null,
        inscription: null,
        transport: null,
        other: null,
      },
    };
    return mutateAsync({ id: session?.user.id ?? '', data: formValues, query: { force: true } });
  };
  const handleAgree = () => {
    removeBilling()
      .then(async (res) => {
        if (res.error) throw res.data;

        await updateSession.mutate();
        setAlert('Tus datos han sido borrados', 'success');
        onAgree();
      })
      .catch(() => {
        setAlert('Tus datos no pueden ser borrados en estos momentos');
      });
  };

  return (
    <>
      <Link
        id="remove-billing"
        href="#"
        color="error.main"
        fontWeight={500}
        underline="none"
        onClick={() => {
          setOpen(true);
        }}
      >
        Dejar de facturar a mi RFC
      </Link>
      <DialogRemoveBilling
        open={open}
        onAgree={() => {
          handleAgree();
        }}
        handleClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
};

export default RemoveBilling;
