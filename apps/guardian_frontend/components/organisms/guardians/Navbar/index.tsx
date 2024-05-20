import { AppBar, Container, Toolbar } from '@mui/material';
import Menu from '../Menu';
import BackButton from '~/components/atoms/guardians/BackButton';
import dynamic from 'next/dynamic';

const SelectSchool = dynamic(() => import('./SelectSchool'), { ssr: false });

interface NavbarProps {
  backButton?: boolean;
  backButtonHref?: string;
  disabledTitle?: boolean;
  disabledMenu?: boolean;
  hideTour?: boolean;
}

const Navbar = ({
  backButton = false,
  backButtonHref = '',
  disabledTitle = false,
  disabledMenu = false,
  hideTour = false,
}: NavbarProps) => {
  const menuComponent = disabledMenu ? <div className="w-6" /> : <Menu hideTour={hideTour} />;
  return (
    <AppBar position="static" color="white" sx={{ boxShadow: 'none' }}>
      <Container maxWidth="sm">
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '58px' }}>
          {backButton ? <BackButton id="nav-back-button" href={backButtonHref} /> : menuComponent}
          <SelectSchool disabledTitle={disabledTitle} />
          {
            // TODO manejar notificaciones
            <div className="w-10" />
          }
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
