import { BillingStudent, GuardianStudent } from '@cometa/trpc/src/types';

export interface Color {
  color?: {
    text: string;
    background: string;
  };
}

export type StudentWithColor = (BillingStudent | GuardianStudent) & Color;

export const getDependentColor = (dependentsWithColors: StudentWithColor[] = [], id: string) => {
  const dependent = dependentsWithColors.find((dependent) => dependent.id === id);
  return (
    dependent?.color || {
      text: undefined,
      background: undefined,
    }
  );
};

export const addColorsToDependents = <T = BillingStudent | GuardianStudent>(dependents: T[] = []) => {
  const colors = [
    {
      text: 'rgba(202, 50, 205, 1)',
      background: 'rgba(230, 114, 233, 0.29)',
    },
    {
      text: 'rgba(84, 170, 112, 1)',
      background: 'rgba(133, 224, 163, 0.35)',
    },
    {
      text: 'rgba(108, 97, 224, 1)',
      background: 'rgba(149, 141, 233, 0.26)',
    },
    {
      background: 'rgba(141, 211, 233, 0.26)',
      text: 'rgba(68, 153, 201, 1)',
    },
  ];
  return dependents.map((dependent, index) => ({
    ...dependent,
    color: colors[index],
  }));
};
