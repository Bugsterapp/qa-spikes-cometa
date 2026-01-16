import { useCredential } from '../../../credential-context';

export function CredentialFrontSide() {
  const { config, studentData, schoolData } = useCredential();

  const primaryColor = config.color_scheme.background.primary;
  const secondaryColor = config.color_scheme.background.secondary;
  const textColor = config.color_scheme.text_color;

  return (
    <>
      {/* Background layer */}
      <div className="absolute h-[307px] left-0 top-[205px] w-full" style={{ backgroundColor: primaryColor }} />

      {/* Student info section */}
      <div className="absolute flex flex-col h-[233px] items-center justify-between left-0 top-[279px] w-full">
        {config.front_fields.name.show && config.front_fields.last_name.show ? (
          <div className="flex flex-col gap-[2px] items-center w-[294px]">
            {/* Student name */}
            <div className="flex flex-col gap-[2px] items-center w-full">
              <p className="font-semibold text-[20px] text-center leading-[26px] w-full" style={{ color: textColor }}>
                {studentData.name}
              </p>
              <p className="font-semibold text-[20px] text-center leading-[26px] w-full" style={{ color: textColor }}>
                {studentData.lastName}
              </p>
            </div>

            {/* Unified container - distributes visible elements with consistent spacing */}
            <div className="flex flex-col gap-[6px] items-center justify-center w-full min-h-[120px]">
              {/* Level badge */}
              {config.front_fields.level.show ? (
                <div className="flex flex-col gap-[6px] items-center justify-center px-[64px] py-[5px] w-full">
                  <div className="bg-white flex gap-[10px] h-[26px] items-center justify-center px-[20px] py-[10px] rounded-[100px] w-[134px]">
                    <p className="font-semibold text-[14px] leading-[20px]" style={{ color: primaryColor }}>
                      {studentData.level}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* CCT field */}
              {config.front_fields.cct_identifier.show ? (
                <p className="font-normal text-[14px] leading-[20px] text-center w-full" style={{ color: textColor }}>
                  CCT: {studentData.cct}
                </p>
              ) : null}

              {/* Student details container - keeps grid aligned to left */}
              <div className="w-full flex justify-start">
                {/* Student details grid - 2x2 layout */}
                <div className="grid grid-cols-2 gap-x-[24px] gap-y-[8px] w-full [&>div:nth-child(odd)]:justify-self-start [&>div:nth-child(even)]:justify-self-end">
                  {/* Enrollment - top left */}
                  {config.front_fields.enrollment_code.show ? (
                    <div
                      className="flex gap-[2px] items-center text-[14px] leading-[20px]"
                      style={{ color: textColor }}
                    >
                      <p className="font-normal w-[63px]">Matrícula:</p>
                      <p className="font-semibold">{studentData.enrollment}</p>
                    </div>
                  ) : null}

                  {/* Grade - top right */}
                  {config.front_fields.grade.show ? (
                    <div
                      className="flex gap-[2px] items-center text-[14px] leading-[20px]"
                      style={{ color: textColor }}
                    >
                      <p className="font-normal w-[45px]">Grado:</p>
                      <p className="font-semibold">{studentData.grade}</p>
                    </div>
                  ) : null}

                  {/* CURP - bottom left */}
                  {config.front_fields.identifier.show ? (
                    <div
                      className="flex gap-[2px] items-center text-[14px] leading-[20px]"
                      style={{ color: textColor }}
                    >
                      <p className="font-normal w-[46px]">CURP :</p>
                      <p className="font-semibold">{studentData.curp}</p>
                    </div>
                  ) : null}

                  {/* Cycle - bottom right */}
                  {config.front_fields.school_cycle.show ? (
                    <div
                      className="flex gap-[2px] items-center text-[14px] leading-[20px]"
                      style={{ color: textColor }}
                    >
                      <p className="font-normal">Ciclo:</p>
                      <p className="font-semibold">{studentData.cycle}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Validity badge */}
        {config.front_fields.expires_at.show && studentData.expires_at ? (
          <div className="h-[39px] w-full flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
            <div className="flex gap-[2px] items-center text-[14px] leading-[20px]" style={{ color: textColor }}>
              <p className="font-normal w-[60px]">Vigencia:</p>
              <p className="font-semibold">{studentData.expires_at}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Header section */}
      <div className="absolute left-1/2 top-[15px] -translate-x-1/2">
        <div className="flex flex-col gap-[8px] items-center min-h-[100px]">
          <div className="h-[36px] w-[57px] overflow-hidden rounded-[8.6px] flex items-center justify-center">
            <img src={schoolData.logo} alt="Logo" className="w-[57px] h-[36px] object-contain" />
          </div>

          <p
            className="mt-3 font-semibold leading-[26px] text-[20px] text-center w-[294px]"
            style={{ color: '#22283a' }}
          >
            {schoolData.name}
          </p>
        </div>
      </div>

      {/* Photo section */}
      <div className="absolute left-1/2 top-[135px] -translate-x-1/2">
        <div
          className="border-[6px] border-solid rounded-[200px] w-[130px] h-[130px] overflow-hidden"
          style={{ borderColor: primaryColor }}
        >
          <img src={studentData.photo} alt={studentData.name} className="w-full h-full object-cover rounded-[200px]" />
        </div>
      </div>
    </>
  );
}
