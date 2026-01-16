import PropTypes from 'prop-types';
// components
import Logo from '../Logo';

// ----------------------------------------------------------------------

LogoOnlyLayout.propTypes = {
  children: PropTypes.node,
};

export default function LogoOnlyLayout({ children }) {
  return (
    <>
      <header className="absolute top-0 left-0 w-full leading-none p-6 pt-0 sm:p-10 sm:pt-0">
        <Logo />
      </header>
      {children}
    </>
  );
}
