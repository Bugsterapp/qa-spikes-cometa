import { XIcon } from 'lucide-react';
import { Button } from '@cometa/recreo/v2';
import { api } from '/src/utils/api';
import { unstable_EmbedUpdateTemplate as EmbedUpdateTemplate } from '@documenso/embed-react';
import useAlert from '/src/hooks/useAlert';

const documensoEditTemplateOverrideCss = `
  /* This is a hack to hidde non-used fields */
  /* if we change the documenso version we need to check these indexes */
  .grid.grid-cols-2.gap-2 button:nth-of-type(2),  /* Initials */
  .grid.grid-cols-2.gap-2 button:nth-of-type(3),  /* Email */
  .grid.grid-cols-2.gap-2 button:nth-of-type(4),  /* Name */
  .grid.grid-cols-2.gap-2 button:nth-of-type(5),  /* Date */
  .grid.grid-cols-2.gap-2 button:nth-of-type(7),  /* Number */
  .grid.grid-cols-2.gap-2 button:nth-of-type(8),  /* Radio */
  .grid.grid-cols-2.gap-2 button:nth-of-type(9),  /* Checkbox */
  .grid.grid-cols-2.gap-2 button:nth-of-type(10) /* Dropdown */ {
    display: none !important;
  }

  /* User combobox: we just have one signer, this config is not necessary */
  button[role='combobox'] {
    display: none !important;
  }

  label + button[role='combobox'] {
    display: unset !important;
  }

  /* Divider between fields and user combobox */
  hr {
    display: none !important;
  }

  .bg-documenso {
    background-color: #000;
  }

  div.sticky.top-4 {
    height: 100%;
    background: white;
    border: none;
  }

  div.sticky.top-4 > div > button[type='button'] {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    width: 155px;
    border-radius: 9999px;
  }

  body > div.relative.mx-auto {
    padding: 1rem 0;
  }
`;

// Helper function to extract numeric ID from "template_N" format
const extractTemplateNumber = (id: string): number => {
  const match = id.match(/^template_(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
};

interface TemplateEditViewProps {
  templateId: string;
  onClose?: () => void;
}

export function TemplateEditView({ templateId, onClose }: TemplateEditViewProps) {
  // const [fillFieldsOpen, setFillFieldsOpen] = useState(false);
  const { setAlertState } = useAlert();

  const { data: template, isPending: isLoading } = api.students.getTemplate.useQuery(
    { template_id: templateId },
    {
      enabled: !!templateId,
    }
  );

  const { data: presignTokenData, isPending: isLoadingToken } = api.students.generateEditTemplateAccess.useQuery(
    { template_id: templateId },
    {
      enabled: !!templateId,
    }
  );

  const numericTemplateId = presignTokenData?.id ? extractTemplateNumber(presignTokenData.id) : 0;

  function handleSave() {
    setAlertState({
      severity: 'success',
      message: 'Contrato guardado',
      open: true,
      alertTime: 3000,
    });
    onClose?.();
  }

  if (isLoading || isLoadingToken) {
    return (
      <div className="flex justify-center items-center h-full">
        <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
      </div>
    );
  }

  if (!template || !presignTokenData) {
    return null;
  }

  return (
    <div className="h-full w-full flex flex-col">
      {onClose && (
        <div className="px-7 py-4 flex flex-col gap-2 border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Editar contrato</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon size={16} />
            </Button>
          </div>
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            💡 Tip: Asegúrate de que los campos tengan un tamaño visible antes de guardar
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <EmbedUpdateTemplate
          onlyEditFields
          darkModeDisabled
          presignToken={presignTokenData.token}
          templateId={numericTemplateId}
          externalId={templateId}
          host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST}
          className="w-full h-full"
          cssVars={{
            primary: '#000',
            primaryForeground: '#fff',
            ring: '#000',
          }}
          css={documensoEditTemplateOverrideCss}
          onTemplateUpdated={handleSave}
        />
      </div>

      {/*<FillFieldsDrawer open={fillFieldsOpen} onOpenChange={setFillFieldsOpen} templateId={templateId} />*/}
    </div>
  );
}
