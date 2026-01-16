import PropTypes from 'prop-types';
import BackButton from '~/components/atoms/guardians/BackButton';

const TitleBackButton = ({ title, onClick }) => (
  <div className="flex py-3 border-b border-[#E3E0FF]">
    <div className="mx-3">
      <BackButton onClick={onClick} />
    </div>
    <div className="flex flex-col justify-center">
      <h1 className="text-blue-600 text-base leading-8 font-semibold">{title}</h1>
    </div>
  </div>
);

TitleBackButton.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default TitleBackButton;
