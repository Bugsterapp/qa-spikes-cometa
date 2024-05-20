import { useState } from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, MenuItem, Avatar } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import MenuPopover from '../../../MenuPopover';
import { IconButtonAnimate } from '../../../animate';
import { PATH_AUTH } from '../../../../routes/paths';
import { sidebarLogOut } from '../navbar/NavConfig';

export default function AccountPopover() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const logOut = () => {
    localStorage.clear();
    signOut({ redirect: true, callbackUrl: PATH_AUTH.login });
  };

  return (
    <>
      {session && (
        <>
          <IconButtonAnimate
            onClick={handleOpen}
            sx={{
              p: 0,
              ...(open && {
                '&:before': {
                  zIndex: 1,
                  content: "''",
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  position: 'absolute',
                  bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
                },
              }),
            }}
          >
            <Avatar
              // src="https://minimal-assets-api-dev.vercel.app/assets/images/avatars/avatar_5.jpg"
              alt={`${session?.user?.first_name} ${session?.user?.last_name}`}
            >{`${session?.user?.first_name.substring(0, 1)}${session?.user?.last_name.substring(0, 1)}`}</Avatar>
          </IconButtonAnimate>

          <MenuPopover
            open={Boolean(open)}
            anchorEl={open}
            onClose={handleClose}
            sx={{
              p: 0,
              mt: 1.5,
              ml: 0.75,
              '& .MuiMenuItem-root': {
                typography: 'body2',
                borderRadius: 0.75,
              },
            }}
          >
            <Box sx={{ my: 1.5, px: 2.5 }}>
              <Typography variant="subtitle2" noWrap>
                {session?.user?.first_name} {session?.user?.last_name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {session?.user?.email}
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <MenuItem onClick={logOut} sx={{ m: 1 }}>
              {sidebarLogOut.icon} {sidebarLogOut.title}
            </MenuItem>
          </MenuPopover>
        </>
      )}
    </>
  );
}
