import React from 'react';
import { Box, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Link, { LinkProps } from 'next/link';

interface BillingCardOptionProps {
  href: LinkProps['href'];
  title: string;
  subtitle?: string;
}

const BillingCardOption = ({ href, title, subtitle }: BillingCardOptionProps) => (
  <Link href={href}>
    <Box
      className="cursor-pointer"
      bgcolor="white.main"
      borderRadius={1}
      px={3}
      py={2}
      display="flex"
      justifyContent="space-between"
      minWidth={321}
      height={83}
    >
      <Box textAlign="start" display="flex" flexDirection="column" justifyContent="space-around">
        <Typography color="neutralDark.main" fontWeight={500}>
          {title}
        </Typography>
        <Typography color="neutralDark.main" fontSize={10}>
          {subtitle}
        </Typography>
      </Box>
      <Box ml={1} alignItems="center" justifyContent="center" display="flex">
        <ChevronRightIcon color="primary" />
      </Box>
    </Box>
  </Link>
);

export default BillingCardOption;
