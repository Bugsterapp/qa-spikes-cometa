import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// next
import NextLink from 'next/link';
// @mui
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

const LogoCollapse = forwardRef(({ disabledLink = false, sx }, ref) => {
  const logo = (
    <Box ref={ref} sx={{ width: 31, height: 30, cursor: 'pointer', ...sx }}>
      <svg width="31" height="30" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="13.8333" width="26.6667" height="26.6667" fill="url(#paint0_radial_1675_118163)" />
        <rect x="0.5" y="26.6667" width="13.3333" height="13.3333" fill="url(#paint1_linear_1675_118163)" />
        <defs>
          <radialGradient
            id="paint0_radial_1675_118163"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(14.3889 26.1111) rotate(-45) scale(36.9267)"
          >
            <stop stopColor="#FF63AF" />
            <stop offset="0.135417" stopColor="#FF63AF" />
            <stop offset="0.296875" stopColor="#FF7E87" />
            <stop offset="0.473958" stopColor="#FE985F" />
            <stop offset="1" stopColor="#F89857" />
          </radialGradient>
          <linearGradient
            id="paint1_linear_1675_118163"
            x1="0.5"
            y1="40"
            x2="14.9444"
            y2="26.6667"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F863AA" />
            <stop offset="1" stopColor="#FF63B0" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return <NextLink href="/">{logo}</NextLink>;
});

LogoCollapse.displayName = 'LogoCollapse';

LogoCollapse.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default LogoCollapse;
