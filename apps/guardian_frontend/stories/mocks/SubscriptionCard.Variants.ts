import { OrderInfoStudent } from '~/components/OrderCard';

const BaseMock = {
  name: 'YADIRA',
  text: 'rgba(202, 50, 205, 1)',
  background: 'rgba(230, 114, 233, 0.29)',
};
export const StudentMock = (props: Partial<typeof BaseMock>) =>
  ({ ...BaseMock, ...props } as unknown as OrderInfoStudent);
