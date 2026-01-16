import React from 'react';

interface FooterProps {
  context: {
    hasNextPage: boolean;
    isEmptyTable: boolean;
  };
}

const TableFooter = ({ context: { hasNextPage, isEmptyTable } }: FooterProps) => {
  if (isEmptyTable) return null;

  if (!hasNextPage) {
    return (
      <div className=" bottom-[52px] w-full">
        <div className="mx-auto w-full py-8 text-[#919EAB] text-center">No hay más estudiantes con morosidad</div>
      </div>
    );
  }
  return (
    <div className=" bottom-[52px] w-full">
      <div className="mx-auto w-full py-16 text-[#919EAB] text-center">
        {' '}
        <img src="/assets/loading.svg" alt="loading" data-state="show" className="mx-auto" />
      </div>
    </div>
  );
};

export default TableFooter;
