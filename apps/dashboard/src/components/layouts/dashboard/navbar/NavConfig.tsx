import { PATH_AUTH, PATH_PORTAL } from '../../../../routes/paths';
import SvgIconStyle from '../../../SvgIconStyle';
import { ExitToApp } from '@mui/icons-material';
import Delinquency from '/public/assets/icons/navigation/delinquency.svg';

const getIcon = (name: string) => (
  <SvgIconStyle src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: getIcon('ic_user'),
  ecommerce: getIcon('ic_ecommerce'),
  payments: getIcon('ri_hand-coin-line'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  invoice: getIcon('ic_invoice'),
  page: getIcon('ic_page'),
  close: getIcon('ic_close'),
  delinquency: <Delinquency />,
  logout: <ExitToApp />,
  concepts: getIcon('ic_concepts'),
};

const sidebarConfig = [
  { title: 'Cobranzas', path: PATH_PORTAL.charge.root, icon: ICONS.dashboard },
  { title: 'Morosidad', path: '/delinquency', icon: ICONS.delinquency },
  { title: 'Pagos recibidos', path: PATH_PORTAL.payments.root, icon: ICONS.payments },
  { title: 'Ingresos', path: PATH_PORTAL.income.root, icon: ICONS.analytics },
  { title: 'Estudiantes', path: PATH_PORTAL.student.root, icon: ICONS.user },
  { title: 'Conceptos', path: PATH_PORTAL.concepts.root, icon: ICONS.concepts },
];

const sidebarLogOut = { title: 'Cerrar Sesión', path: PATH_AUTH.logout, icon: ICONS.logout };

export { getIcon, sidebarConfig, sidebarLogOut };
