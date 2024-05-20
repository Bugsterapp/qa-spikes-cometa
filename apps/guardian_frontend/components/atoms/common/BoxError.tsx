import Box from './Box';
import InfoOutlinedIcon from '~/public/icons/info-outlined-icon.svg';
import { WHAT_TALK_TO_US } from '~/utils/linksWhatsapp';
import { EMAIL_TALK_TO_US } from '~/utils/linksEmail';

const BoxError = () => (
  <div className="col-span-full">
    <Box className="flex items-center justify-center w-full p-5 font-medium text-red-600 border border-red-600 border-solid">
      <InfoOutlinedIcon /> <span className="ml-2">Ha ocurrido un error inesperado</span>
    </Box>
    <div className="px-6">
      <span>
        {' '}
        Por favor comuníquese con el soporte técnico al{' '}
        <a href={WHAT_TALK_TO_US} target="_blank" rel="noreferrer">
          whatsapp
        </a>{' '}
        o por{' '}
        <a href={EMAIL_TALK_TO_US} target="_blank" rel="noreferrer">
          correo
        </a>
        .
      </span>
    </div>
  </div>
);

export default BoxError;
