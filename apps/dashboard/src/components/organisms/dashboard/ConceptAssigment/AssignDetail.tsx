import { useEffect, useState } from 'react';
import { FormValuesAssignDetail, StepAssingProps } from '/src/pages/concepts/[conceptId]';
import { formatDateShort, formatPrice } from '/src/utils/general';
import IcArrow from '/public/assets/icons/ic_arrow_downward.svg';
import { cn } from '/src/utils/cn';
import { GlobalSearch } from '/src/components/atoms/GlobalSearch';
import { FormattedNode } from './StudentSelected';

export function Step3AssignDetail({
  formData,
  onNext,
  onBack,
  concept,
  saving,
}: StepAssingProps<FormValuesAssignDetail>) {
  const [openConceptDetail, setOpenConceptDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [studentSelected, setStudentSelected] = useState<FormattedNode[]>([]);

  useEffect(() => {
    const students =
      formData?.students?.filter((student) => !student.total_student_by_section && !student.total_student_by_level) ||
      [];
    setStudentSelected(students);
  }, [formData?.students]);

  const studentsSelectedForm = formData?.students?.filter(
    (student) => !student.total_student_by_section && !student.total_student_by_level
  );

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();

  const handleSearch = (value: string) => {
    setSearch(value);
    const studentSearch =
      formData?.students?.filter(
        (student) =>
          !student.total_student_by_section &&
          !student.total_student_by_level &&
          (normalize(student.name).includes(value.toLowerCase()) ||
            normalize(student.last_name).includes(value.toLowerCase()))
      ) || [];
    setStudentSelected(studentSearch);
  };
  return (
    <div className="min-h-[90vh] flex flex-col p-8">
      <div className="">
        <p className="text-xl font-bold">Resumen</p>
        <p className="font-normal text-sm text-[#637381] mt-2 mb-8">
          Revisa y confirma que el concepto y estudiantes elegidos sean los correctos:
        </p>
      </div>
      <div className="bg-[#F9FAFB] rounded-lg p-4">
        <div className="flex justify-between flex-col gap-2 border-b border-[#919EAB3D] pb-4">
          <p className="text-xs font-normal text-[#637381]">Concepto:</p>
          <p className="text-base font-normal">{concept?.name}</p>
        </div>
        <div className="flex justify-between flex-col gap-2 border-b border-[#919EAB3D] py-4">
          <div className="flex justify-between items-center">
            <p className="text-xs font-normal text-[#637381]">Ciclo escolar:</p>
            <p className="text-base font-normal">
              {concept?.school_cycle?.year_start} -{' '}
              {concept?.school_cycle?.year_end && concept?.school_cycle?.year_end % 100}
            </p>
          </div>
          {!concept?.optional && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-xs font-normal text-[#637381]">Precio base:</p>
                <p className="text-base font-normal">{formatPrice(concept?.price || '')} MXN</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs font-normal text-[#637381]">Día de vencimiento:</p>
                <p className="text-base font-normal">{concept?.payday} de cada mes</p>
              </div>
            </>
          )}
        </div>
        {openConceptDetail && (
          <div>
            {concept?.interest_schema && !!concept?.interest_schema.length && (
              <div className="flex justify-between flex-col gap-2 border-b border-[#919EAB3D] py-4">
                <p className="text-xs font-normal text-[#637381]">Recargo por morosidad:</p>
                {concept?.interest_schema.map((interest, index) => (
                  <div key={`interest_${index}`} className="flex gap-6">
                    <span className="px-2 py-1 rounded-md bg-[#FF48421F] text-xs font-bold text-[#FF4842] w-[10%] h-fit text-center">
                      {interest?.value} {interest?.type === 'PERCENT' ? '%' : 'MXN'}
                    </span>
                    <p className="text-sm font-medium text-left justify-start items-start">
                      {interest?.compounding === 'MONTHLY'
                        ? 'Cada mes'
                        : interest?.compounding === 'SINGLE'
                        ? 'Una única vez'
                        : interest?.compounding === 'DAILY'
                        ? 'Cada día'
                        : 'Cada semana'}
                      , empezando {interest?.day_offset} días después de la fecha de vencimiento
                    </p>
                  </div>
                ))}
              </div>
            )}
            {concept?.early_bird_discounts && !!concept?.early_bird_discounts.length && (
              <div className="flex justify-between flex-col gap-2 border-b border-[#919EAB3D] py-4">
                <p className="text-xs font-normal text-[#637381]">Descuentos pronto pago:</p>
                {concept?.early_bird_discounts.map((discount, index) => (
                  <div key={`discount_${index}`} className="flex gap-6">
                    <span className="px-2 py-1 rounded-md bg-[#54D62C29] text-xs font-bold text-[#229A16] w-[18%] h-fit text-center">
                      {discount?.discount_value} {discount?.discount_type === 'PERCENT' ? '%' : 'MXN'}
                    </span>
                    <p className="text-sm font-medium text-left justify-start items-start">
                      Hasta{' '}
                      {discount?.up_to_days > 0
                        ? `${discount?.up_to_days} días antes de la fecha de vencimiento.`
                        : 'la misma fecha de vencimiento.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!!concept?.interest_schema?.length && !!concept?.early_bird_discounts?.length && (
          <div className="flex justify-center items-center py-4">
            <button
              onClick={() => setOpenConceptDetail(!openConceptDetail)}
              className="text-sm font-bold text-[#3366FF] flex items-center gap-4"
            >
              <IcArrow
                fill="currentColor"
                className={cn('text-blue-secondary-200', {
                  'transform rotate-180': openConceptDetail,
                })}
              />
              <span>{openConceptDetail ? 'Ocultar detalle' : 'Ver más detalle'}</span>
            </button>
          </div>
        )}
      </div>
      <div className="py-8 gap-2 flex flex-col border-b border-[#919EAB3D]">
        <div className="flex gap-2 items-center">
          <p className="font-semibold text-base">Órdenes a cobrar</p>
          <p className="text-sm font-normal">({formData?.orders?.length} órdenes)</p>
        </div>
        <p className="text-xs text-[#637381]">Puedes revisar las órdenes que estarán disponibles para los alumnos.</p>
        <div className="mt-8 border border-[#3366FF] rounded-lg">
          {formData?.orders?.map((order, index) => (
            <div
              key={`order_${index}`}
              className={cn('flex justify-between items-center my-4', {
                'border-b border-[#919EAB3D] pb-4': formData?.orders && index !== formData?.orders?.length - 1,
              })}
            >
              <div className="px-4 flex justify-between items-center w-full">
                <div>
                  <p className="text-base font-normal">{order?.name}</p>
                  {order?.due && (
                    <p className="text-xs font-normal text-[#637381]">{formatDateShort(order?.due, true)}</p>
                  )}
                </div>
                <p className="text-sm font-normal">{formatPrice(order?.price)} MXN</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="py-8 gap-2 flex flex-col">
        <div className="flex gap-2 items-center">
          <p className="font-semibold text-base">Alumnos seleccionados</p>
          <p className="text-sm font-normal">({studentsSelectedForm?.length} alumnos)</p>
        </div>
        <p className="text-xs text-[#637381] pb-7">
          Puedes revisar los alumnos a los que se les asignará este concepto.
        </p>
        <GlobalSearch search={search} setSearch={handleSearch} placeholder="Buscar estudiantes" typeButton="button" />
        <div className="mt-8 border border-[#3366FF] rounded-lg">
          {studentSelected?.map((student, index) => (
            <div
              key={`student_${index}`}
              className={cn('flex justify-between items-center my-4 px-4', {
                'border-b border-[#919EAB3D] pb-4': index < studentSelected?.length - 1,
              })}
            >
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">
                  {student?.name} {student?.last_name}
                </p>
                <p className="text-xs font-normal text-[#454D64]">
                  {student?.enrollment_code} | {student?.section}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 flex justify-between border-t-2 border-gray-100 bg-white w-full p-6">
        <button
          className="bg-white px-20 py-3 text-[#00AB55] hover:text-green-500 text-base font-bold disabled:text-[#919EABCC] rounded-lg"
          onClick={() => {
            onBack();
          }}
        >
          Volver
        </button>
        <button
          className="text-white text-base font-bold px-16 py-3 rounded-lg bg-[#00AB55] hover:bg-green-500 disabled:bg-[#919EAB3D] disabled:text-[#919EABCC] whitespace-nowrap box-shadow-greenButton"
          onClick={onNext}
          disabled={saving}
        >
          {saving ? 'Guardando...' : `Asignar ${studentsSelectedForm?.length} alumnos`}
        </button>
      </div>
    </div>
  );
}
