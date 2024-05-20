import { Autocomplete, ListItem, ListItemButton, ListItemText } from '@mui/material';

export const AutocompleteDivider = (props) => (
  <Autocomplete
    {...props}
    renderOption={(props, option) => (
      <ListItem {...props} divider disablePadding key={props['data-option-index']}>
        <ListItemButton>
          <ListItemText primary={option?.name && option?.value ? `${option?.value} - ${option.name}` : option} />
        </ListItemButton>
      </ListItem>
    )}
  />
);
