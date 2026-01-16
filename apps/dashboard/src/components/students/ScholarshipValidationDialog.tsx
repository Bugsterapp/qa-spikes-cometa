import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@cometa/recreo/v2';
import Information from '/public/assets/icons/information.svg';
import { SponsoredOrder } from '/src/types/scholarship-validation';

interface ValidationData {
  error?: string;
  severity?: 'low' | 'medium' | 'high';
  affected_concept_types?: string[];
  estimated_count?: number;
  sample_size?: number;
  total_candidates?: number;
  sponsored_in_sample?: number;
  sponsored_ratio?: number;
  validation_method?: 'fast_path' | 'sampled' | 'complete';
  sample_details?: SponsoredOrder[];
  requires_confirmation?: boolean;
}

interface ScholarshipValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sponsoredOrders?: SponsoredOrder[];
  validationData?: ValidationData;
  isLoading?: boolean;
}

const ScholarshipValidationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  sponsoredOrders = [],
  validationData,
  isLoading = false,
}: ScholarshipValidationDialogProps) => {
  const isPartialValidation = validationData?.validation_method === 'sampled';
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowExpand = sponsoredOrders.length > 3;
  const visibleOrders = isExpanded ? sponsoredOrders : sponsoredOrders.slice(0, 3);

  const getOrderName = (order: SponsoredOrder) => order.concept_name ?? order.order_name ?? 'Orden sin nombre';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[520px] p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-semibold text-gray-900 mb-3">
            ¿Estás seguro de que deseas asignar esta beca?
          </DialogTitle>

          {isPartialValidation ? (
            <div>
              <DialogDescription className="text-gray-600 text-sm leading-relaxed mb-4">
                Hemos detectado que aproximadamente{' '}
                <strong className="text-gray-900">{validationData?.estimated_count ?? '{valor}'}</strong> órdenes de
                este estudiante podrían generar pagos patrocinados con esta asignación. Este número es una estimación.{' '}
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
                          Para darte una respuesta rápida, el sistema no revisó las{' '}
                          {validationData?.total_candidates ?? '{valor}'} órdenes de pago del estudiante. En su lugar,
                          analizó una muestra de {validationData?.sample_size ?? '{valor}'} de ellas y encontró{' '}
                          {validationData?.sponsored_in_sample ?? '{valor}'} que serían patrocinadas.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          2. El número real puede variar porque:
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Podrían existir otros pagos a patrocinar que no estaban en la muestra.</li>
                          <li>• Algunos pagos podrían no patrocinarse al calcular descuentos finales.</li>
                          <li>• El número final se determina al confirmar la asignación.</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          3. Ejemplos encontrados en la muestra:
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {validationData?.sample_details?.slice(0, 3).map((detail, index) => (
                            <li key={detail.fulfillment_id || index}>
                              • {detail.order_name}: ${detail.display_base_total?.toLocaleString()} → $
                              {detail.display_final_amount?.toLocaleString()} {detail.display_description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </DialogDescription>

              <div className="bg-[#E8F4FF] rounded-lg p-4 mb-6 flex items-center text-[#22283A]">
                <Information className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm">Podrás desasignar esta beca posteriormente si lo necesitas.</span>
              </div>
            </div>
          ) : (
            <div>
              <DialogDescription className="text-gray-600 text-sm leading-relaxed mb-6">
                Al aplicar esta beca, detectamos que las siguientes{' '}
                <strong className="text-gray-900">
                  {sponsoredOrders.length === 1 ? '1 orden' : `${sponsoredOrders.length} órdenes`}
                </strong>{' '}
                del estudiante quedarán patrocinadas y se marcarán como pagadas:
              </DialogDescription>

              {sponsoredOrders.length > 0 && (
                <div className="mb-6">
                  <div className="border border-[#D0D8E9] rounded-lg overflow-hidden">
                    <div className="bg-[#ECEFF6] px-4 py-3">
                      <h3 className="text-sm font-medium text-[#22283A]">Órdenes</h3>
                    </div>

                    <div className="bg-white">
                      {visibleOrders.map((order, index) => (
                        <div
                          key={order.fulfillment_id || order.order_id || index}
                          className="px-4 py-3 border-b border-[#D0D8E9] last:border-b-0"
                        >
                          <span className="text-sm text-[#22283A] font-normal">{getOrderName(order)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {shouldShowExpand && (
                    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                      <CollapsibleTrigger asChild>
                        <button
                          className="flex items-center justify-center w-full mt-4 text-purple-600 text-base font-medium hover:text-purple-700 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsExpanded(!isExpanded);
                          }}
                        >
                          <svg
                            className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {isExpanded ? 'Ver menos órdenes patrocinadas' : 'Ver todas las órdenes patrocinadas'}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent />
                    </Collapsible>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-center gap-4 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Asignando beca...' : isPartialValidation ? 'Confirmar y asignar beca' : 'Asignar beca'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScholarshipValidationDialog;
