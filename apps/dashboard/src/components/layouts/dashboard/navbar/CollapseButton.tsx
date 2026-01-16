import CollapseIcon from '/public/assets/icons/navbar/Collapse.svg';
import ExpandIcon from '/public/assets/icons/navbar/Expand.svg';
import { motion } from 'framer-motion';

const buttonVariants = {
  hover: {
    backgroundColor: '#00AB5514',
    color: '#00AB55',
    transition: { duration: 0.2, delay: 0.075 },
  },
};

interface CollapseButtonProps {
  onToggleCollapse: () => void;
  collapseClick: boolean;
}

export default function CollapseButton({ onToggleCollapse, collapseClick }: CollapseButtonProps) {
  return (
    <motion.div
      className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer"
      onClick={onToggleCollapse}
      whileHover="hover"
    >
      {collapseClick ? (
        <motion.div className="rounded-lg text-[#454D64]" variants={buttonVariants}>
          <ExpandIcon />
        </motion.div>
      ) : (
        <motion.button className="rounded-lg text-[#454D64]" variants={buttonVariants}>
          <CollapseIcon />
        </motion.button>
      )}
    </motion.div>
  );
}
