/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Box, Typography, ListItem } from '@mui/material';
import SearchAutocomplete from '../../../molecules/dashboard/SearchAutocomplete';
import ApiClient from '../../../../services/ApiClient';
import { useSession } from 'next-auth/react';
import PersonIcon from '@mui/icons-material/Person';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';

export default function GuardianSelector(props) {
  // eslint-disable-next-line react/prop-types
  const { autocompleteKey, selectedGuardian, setSelectedGuardian, guardianFilterText, width, placeholder } = props;

  const { data: session } = useSession();
  const selectedSchool = useSelectedSchoolId();
  const [guardians, setGuardians] = useState([]);
  const [searchGuardian, setSearchGuardian] = useState('');

  const getGuardiansOnSchool = async () => {
    if (searchGuardian.length > 0) {
      const token = session?.token;
      const guardiansOnSchool = await ApiClient.getGuardiansOnSchool(token, selectedSchool, searchGuardian);
      const results = guardiansOnSchool?.data?.results;
      setGuardians(results);
    } else {
      const token = session?.token;
      const guardiansOnSchool = await ApiClient.getGuardiansOnSchool(token, selectedSchool);
      const results = guardiansOnSchool?.data?.results;
      setGuardians(results);
    }
  };

  const onChangeSearchGuardian = (event) => {
    const inputText = event?.target?.value;
    setSearchGuardian(inputText);
  };

  const handleAutocomplete = (event, value, reason) => {
    setSelectedGuardian(value);
    if (reason === 'clear') {
      setGuardians([]);
      setSearchGuardian('');
    }
  };

  const renderGuardian = (props, guardian) => (
    <ListItem {...props} key={guardian.id} disablePadding>
      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle1">{`${guardian.first_name} ${guardian.last_name}`}</Typography>
        <Typography
          variant="subtitle2"
          sx={{
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
          }}
        >
          Email: {guardian.email}
        </Typography>
      </Box>
    </ListItem>
  );

  const getFullName = (guardian) => `${guardian?.first_name} ${guardian?.last_name}`;
  const optionLabel = (guardian) => `${getFullName(guardian)} ${guardian?.email}`;

  useEffect(() => {
    if (searchGuardian) {
      getGuardiansOnSchool();
    }
  }, [searchGuardian]);

  useEffect(() => {
    if (autocompleteKey) {
      setGuardians([]);
      setSearchGuardian('');
      setSelectedGuardian(null);
    }
  }, [autocompleteKey]);

  return (
    <SearchAutocomplete
      autocompleteKey={autocompleteKey}
      data={guardians}
      optionLabel={optionLabel}
      renderOption={renderGuardian}
      onChangeTextField={onChangeSearchGuardian}
      onClickAutocomplete={getGuardiansOnSchool}
      onChangeAutocomplete={handleAutocomplete}
      inputText={selectedGuardian ? getFullName(selectedGuardian) : searchGuardian}
      labelTextField={guardianFilterText}
      placeholderTextField={placeholder || 'Buscar por nombre'}
      width={width}
      icon={<PersonIcon />}
    />
  );
}
