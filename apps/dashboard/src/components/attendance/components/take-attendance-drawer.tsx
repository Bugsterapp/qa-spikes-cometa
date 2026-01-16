import { XIcon, ArrowLeftIcon } from 'lucide-react';
import Sheet from '/src/components/atoms/Sheet';
import { useTakeAttendanceForm } from '../hooks/use-take-attendance-form';
import { AttendanceFormView } from './attendance-form-view';
import { AttendanceContextDetailView } from './attendance-context-detail-view';
import { Button } from '@cometa/recreo/v2';

type TakeAttendanceDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendanceSessionId?: string;
};

type DrawerHeaderProps = {
  currentStep: 'form' | 'contextDetail';
  isProcessing: boolean;
  isEditMode: boolean;
  onBack: () => void;
  onClose: () => void;
};

function DrawerHeader({ currentStep, isProcessing, isEditMode, onBack, onClose }: DrawerHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex items-center gap-3">
        {currentStep !== 'form' && !isEditMode && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            disabled={isProcessing}
          >
            <ArrowLeftIcon size={20} />
            <span className="text-sm font-medium">Volver</span>
          </button>
        )}
        {currentStep === 'form' && !isEditMode && (
          <h2 className="text-lg font-semibold text-gray-900">Tomar asistencia</h2>
        )}
        {isEditMode && <h2 className="text-lg font-semibold text-gray-900">Ver asistencia</h2>}
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <XIcon size={20} />
      </button>
    </div>
  );
}

type DrawerFooterProps = {
  isProcessing: boolean;
  hasStudents: boolean;
  isEditMode: boolean;
  onRegister: () => void;
};

function DrawerFooter({ isProcessing, hasStudents, isEditMode, onRegister }: DrawerFooterProps) {
  return (
    <div className="p-4 flex justify-end">
      <Button onClick={onRegister} disabled={isProcessing || !hasStudents} variant="neutral">
        {isProcessing
          ? isEditMode
            ? 'Actualizando...'
            : 'Registrando...'
          : isEditMode
          ? 'Actualizar asistencias'
          : 'Registrar inasistencias'}
      </Button>
    </div>
  );
}

export function TakeAttendanceDrawer({ open, onOpenChange, attendanceSessionId }: TakeAttendanceDrawerProps) {
  const hookData = useTakeAttendanceForm({ onOpenChange, attendanceSessionId });
  const isEditMode = !!attendanceSessionId;

  return (
    <Sheet open={open} onOpenChange={hookData.handleClose}>
      <Sheet.Content className="max-h-[calc(100vh-16px)] h-full m-2 rounded-2xl font-lota antialiased overflow-hidden shadow-[0px_20px_40px_-4px_rgba(145,158,171,0.16)]">
        <div className="flex flex-col h-full">
          <DrawerHeader
            currentStep={hookData.currentStep}
            isProcessing={hookData.isProcessing}
            isEditMode={isEditMode}
            onBack={hookData.handleBack}
            onClose={hookData.handleClose}
          />

          <div className="flex-1 overflow-y-auto">
            {isEditMode && (hookData.isLoadingSession || hookData.isLoadingRecords) ? (
              <div className="flex flex-col gap-6 p-6">
                <div>
                  <div className="h-8 bg-gray-200 rounded-lg w-2/3 animate-pulse mb-3" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-7 bg-gray-200 rounded-md w-20 animate-pulse" />
                    <div className="h-7 bg-gray-200 rounded-md w-24 animate-pulse" />
                    <div className="h-7 bg-gray-200 rounded-md w-32 animate-pulse" />
                  </div>
                </div>

                <div>
                  <div className="h-5 bg-gray-200 rounded w-40 animate-pulse mb-4" />
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse" />
                        </div>
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : hookData.currentStep === 'form' ? (
              <AttendanceFormView
                form={hookData.form}
                searchText={hookData.searchText}
                setSearchText={hookData.setSearchText}
                levels={hookData.levels || []}
                contexts={hookData.contexts}
                contextType={hookData.contextType}
                hasAttendanceConfig={hookData.hasAttendanceConfig}
                isLoadingLevelConfig={hookData.isLoadingLevelConfig}
                selectedLevel={hookData.selectedLevel}
                isLoadingLevels={hookData.isLoadingLevels}
                isLoadingContexts={hookData.isLoadingContexts}
                onContextSelect={hookData.handleContextSelect}
              />
            ) : (
              <AttendanceContextDetailView
                context={hookData.selectedContext}
                contextType={hookData.contextType}
                date={hookData.form.getValues('date')}
                availableStudents={hookData.availableStudents}
                absentStudentIds={hookData.absentStudentIds}
                isLoadingStudents={hookData.isLoadingStudents}
                isProcessing={hookData.isProcessing}
                onRecordingComplete={hookData.handleRecordingComplete}
                onToggleStudentAbsence={hookData.toggleStudentAbsence}
                onRecordingStarted={hookData.trackAiRecordingStarted}
              />
            )}

            {hookData.currentStep === 'contextDetail' && (
              <DrawerFooter
                isProcessing={hookData.isProcessing}
                hasStudents={!!hookData.availableStudents && hookData.availableStudents.length > 0}
                isEditMode={isEditMode}
                onRegister={hookData.handleRegisterAttendance}
              />
            )}
          </div>
        </div>
      </Sheet.Content>
    </Sheet>
  );
}
