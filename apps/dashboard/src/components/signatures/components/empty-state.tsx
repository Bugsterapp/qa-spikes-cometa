import { Button } from '@cometa/recreo/v2';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-48 px-4 gap-4">
      <img
        src="/assets/signatures/signatures-list-placeholder.png"
        alt="Crear contrato"
        className="w-36 h-36 object-contain"
      />

      <h2 className="font-bold text-base">Crea un nuevo contrato</h2>

      <p className="text-sm text-center max-w-md">
        Carga el documento y asigna los campos a llenar por parte de los tutores en dos simples pasos.
      </p>

      <Button onClick={onCreateClick} variant="secondary" className="mt-4">
        Crear nuevo contrato
      </Button>
    </div>
  );
}
