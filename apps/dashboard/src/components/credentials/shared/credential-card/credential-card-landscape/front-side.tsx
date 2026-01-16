import type { CredentialConfig, StudentData, SchoolData } from '../../../types';

type CredentialFrontSideProps = {
  config: CredentialConfig;
  studentData: StudentData;
  schoolData: SchoolData;
};

export function CredentialFrontSide({ config, studentData, schoolData }: CredentialFrontSideProps) {
  const backgroundColor = config.color_scheme.background.primary;
  const secondaryColor = config.color_scheme.background.secondary;
  const textColor = config.color_scheme.text_color;

  return (
    <>
      <div
        className={`absolute left-0 top-[133px] w-full ${
          config.front_fields.expires_at.show ? 'bottom-[39px]' : 'bottom-0'
        }`}
        style={{ backgroundColor }}
      />

      <div className="absolute left-0 top-[20px] right-0 h-[93px]">
        <div
          className={`flex gap-[36px] items-center h-full ${
            schoolData.logo && schoolData.name ? 'justify-start' : 'justify-center'
          }`}
        >
          {schoolData.logo ? (
            <div className="h-[45px] w-[71px] overflow-hidden rounded-[11px] flex items-center justify-center shrink-0 ml-[65px]">
              <img src={schoolData.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : null}
          {schoolData.name ? (
            <div className={`mr-[47px] ${schoolData.logo ? 'flex-1' : ''}`}>
              <p className="font-semibold leading-[26px] text-[20px]" style={{ color: '#22283a' }}>
                {schoolData.name}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="absolute left-[20px] top-[115px] z-10">
        <div
          className="border-[5.26px] border-solid rounded-[175.342px] w-[116px] h-[116px] overflow-hidden"
          style={{ borderColor: backgroundColor }}
        >
          <img src={studentData.photo} alt={studentData.name} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="absolute left-[20px] top-[133px] right-[20px] bottom-[39px]">
        <div className="flex gap-[36px] h-full py-[20px]">
          <div className="flex flex-col items-center justify-end gap-[12px] w-[116px]">
            {config.front_fields.level.show ? (
              <div className="bg-white h-[26px] px-[20px] py-[10px] rounded-[100px] flex items-center justify-center">
                <p className="font-semibold text-[14px] leading-[20px]" style={{ color: backgroundColor }}>
                  {studentData.level}
                </p>
              </div>
            ) : null}

            {config.front_fields.cct_identifier.show ? (
              <p className="font-normal text-[14px] leading-[20px] text-center" style={{ color: textColor }}>
                CCT: {studentData.cct}
              </p>
            ) : null}
          </div>

          <div className="flex-1 flex flex-col justify-center gap-[36px]">
            {config.front_fields.name.show && config.front_fields.last_name.show ? (
              <div className="flex flex-col gap-[2px]">
                <p className="font-semibold text-[22px] leading-[29px]" style={{ color: textColor }}>
                  {studentData.name}
                </p>
                <p className="font-semibold text-[22px] leading-[29px]" style={{ color: textColor }}>
                  {studentData.lastName}
                </p>
              </div>
            ) : null}

            <div className="relative h-[56px] w-full">
              {config.front_fields.enrollment_code.show ? (
                <div
                  className="absolute left-0 top-0 flex gap-[2px] items-center text-[14px] leading-[20px]"
                  style={{ color: textColor }}
                >
                  <p className="font-normal w-[63px]">Matrícula:</p>
                  <p className="font-semibold">{studentData.enrollment}</p>
                </div>
              ) : null}

              {config.front_fields.grade.show ? (
                <div
                  className="absolute left-[168px] top-0 flex gap-[2px] items-center text-[14px] leading-[20px] w-[103px]"
                  style={{ color: textColor }}
                >
                  <p className="font-normal w-[45px]">Grado:</p>
                  <p className="font-semibold">{studentData.grade}</p>
                </div>
              ) : null}

              {config.front_fields.identifier.show ? (
                <div
                  className="absolute left-0 top-[28px] flex gap-[2px] items-center text-[14px] leading-[20px]"
                  style={{ color: textColor }}
                >
                  <p className="font-normal w-[46px]">CURP :</p>
                  <p className="font-semibold">{studentData.curp}</p>
                </div>
              ) : null}

              {config.front_fields.school_cycle.show ? (
                <div
                  className="absolute left-[168px] top-[28px] flex gap-[2px] items-center text-[14px] leading-[20px] w-[104px]"
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

      {config.front_fields.expires_at.show && studentData.expires_at ? (
        <div className="absolute left-0 bottom-0 w-full">
          <div className="h-[39px] w-full overflow-hidden relative" style={{ backgroundColor: secondaryColor }}>
            <div className="absolute flex gap-[59px] items-center left-[179px] top-[10px] w-[294px]">
              <div className="flex gap-[2px] items-center text-[14px] leading-[20px]" style={{ color: textColor }}>
                <p className="font-normal w-[60px]">Vigencia:</p>
                <p className="font-semibold">{studentData.expires_at}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
