/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import SearchAutocomplete from '../../../molecules/dashboard/SearchAutocomplete';
import ApiClient from '../../../../services/ApiClient';
import { User } from 'lucide-react';
import { useSelectedSchoolId } from '/src/guards/AuthGuard';

export default function GuardianSelector(props) {
  // eslint-disable-next-line react/prop-types
  const { autocompleteKey, selectedGuardian, setSelectedGuardian, guardianFilterText, width, placeholder } = props;

  const selectedSchool = useSelectedSchoolId();
  const [guardians, setGuardians] = useState([]);
  const [searchGuardian, setSearchGuardian] = useState('');

  const getGuardiansOnSchool = async () => {
    if (searchGuardian.length > 0) {
      const guardiansOnSchool = await ApiClient.getGuardiansOnSchool(selectedSchool, searchGuardian);
      const results = guardiansOnSchool?.results;
      setGuardians(results);
    } else {
      const guardiansOnSchool = await ApiClient.getGuardiansOnSchool(selectedSchool);
      const results = guardiansOnSchool?.results;
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
    <li {...props} key={guardian.id}>
      <div className="ml-2">
        <p className="text-base font-normal">{`${guardian.first_name} ${guardian.last_name}`}</p>
        <p className="text-xs font-normal leading-[18px]">Email: {guardian.email}</p>
      </div>
    </li>
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
      icon={<User />}
    />
  );
}
