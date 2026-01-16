import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@cometa/recreo/v2';
import Information from '/public/assets/icons/information.svg';
import { SponsoredOrder } from '/src/types/scholarship-validation';

interface RepresentativeStudent {
  student_id: string;
  full_name: string;
  sponsored_found: number;
  sample_size: number;
  base_rate: number;
}

interface RiskMetrics {
  overall_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  total_students: number;
  students_with_payments: number;
  students_with_scholarships: number;
  payment_rate: number;
  scholarship_rate: number;
  avg_pending_fulfillments: number;
}

interface MassiveValidationData {
  error?: string;
  severity?: 'high' | 'medium' | 'low';
  affected_concept_types?: string[];
  estimated_affected_students?: number;
  total_students?: number;
  sponsored_ratio?: number;
  sponsored_in_sample?: number;
  sample_size?: number;
  total_candidates?: number;
  validation_method?: 'hybrid_aggregate_plus_representative';
  representative_student?: RepresentativeStudent;
  risk_metrics?: RiskMetrics;
  adjustment_factor?: number;
  sample_details?: SponsoredOrder[];
  requires_confirmation?: boolean;
}

interface MassiveScholarshipValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  validationData?: MassiveValidationData;
  isLoading?: boolean;
}

const MassiveScholarshipValidationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  validationData,
  isLoading = false,
}: MassiveScholarshipValidationDialogProps) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-[520px] px-8 py-6">
      <DialogHeader className="text-left">
        <DialogTitle className="text-xl font-semibold text-gray-900 mb-3">
          ¿Estás seguro de que deseas asignar masivamente esta beca?
        </DialogTitle>

        <div>
          <DialogDescription className="text-gray-600 text-sm leading-relaxed mb-4">
            Hemos detectado que aproximadamente{' '}
            <strong className="text-gray-900">{validationData?.estimated_affected_students ?? '{valor}'}</strong> de{' '}
            <strong className="text-gray-900">{validationData?.total_students ?? '{total}'}</strong> estudiantes podrían
            generar pagos patrocinados con esta asignación. Este número es una estimación.{' '}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="link" className="h-auto p-0">
                  Ver detalles del cálculo
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[480px] p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">¿Por qué es una estimación?</h3>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">1. Cómo lo hicimos</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Para darte una respuesta rápida, el sistema no revisó a fondo los{' '}
                      {validationData?.total_students ?? '{valor}'} estudiantes. En su lugar, hizo dos cosas:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 mb-3">
                      <li>
                        • Un{' '}
                        <span className="font-semibold" style={{ color: '#697086' }}>
                          análisis general
                        </span>{' '}
                        de todos los estudiantes.
                      </li>
                      <li>
                        • Un{' '}
                        <span className="font-semibold" style={{ color: '#697086' }}>
                          análisis profundo
                        </span>{' '}
                        de 1 estudiante representativo:{' '}
                        {validationData?.representative_student?.full_name ?? '{student}'}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">2. El número real puede variar porque:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Cada estudiante tiene una situación financiera y descuentos únicos.</li>
                      <li>• El sistema no revisó los pagos parciales ya realizados por cada estudiante.</li>
                      <li>• Las condiciones finales se calculan al momento de asignar.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      3. Resultado del estudiante representativo
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>
                        • Estudiante con más órdenes de pago pendientes:{' '}
                        {validationData?.representative_student?.full_name ?? '{student}'}
                      </li>
                      <li>
                        • Resultado: {validationData?.representative_student?.sponsored_found ?? '{valor}'} de sus{' '}
                        {validationData?.representative_student?.sample_size ?? '{valor}'} órdenes quedarían
                        patrocinadas.
                      </li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </DialogDescription>

          <div className="bg-[#FFE28D] rounded-lg p-4 mb-6 flex items-center text-[#22283A]">
            <Information className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-sm">
              Esta operación es irreversible y afectará a los {validationData?.total_students ?? '{total}'} estudiantes
              seleccionados
            </span>
          </div>
        </div>
      </DialogHeader>

      <DialogFooter className="flex flex-row justify-center gap-4 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Asignando beca...' : 'Confirmar y asignar beca'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default MassiveScholarshipValidationDialog;
