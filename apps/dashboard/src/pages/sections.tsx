import React from 'react';
import { Sections, SuccessMessage } from '../components/sections/FormSections';
import { api } from '../utils/api';
import { useSelectedSchool } from '../guards/AuthGuard';
import Layout from '../components/layouts';

const SectionsPage = () => {
  const selectedSchool = useSelectedSchool();
  const {
    data: formData,
    isPending: isLoading,
    isError,
  } = api.sections.getSectionsFormData.useQuery(
    {
      schoolId: selectedSchool?.id ?? '',
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  if (isLoading)
    return (
      <div className="flex justify-center bg-[#F4F4F4] pb-24 min-h-[calc(100vh-100px)] p-4">
        <div className="p-8 max-w-4xl bg-white rounded-xl shadow-card w-full">
          <div className="flex flex-col gap-4 justify-between h-full animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-4/5 mb-4" />
            <div className="h-10 bg-gray-200 rounded w-full mb-4" />
            <div className="h-10 bg-gray-200 rounded w-full mb-4" />
            <div className="h-10 bg-gray-200 rounded w-1/2 mt-4" />
            <div className="h-12 bg-gray-200 rounded w-full mb-4" />
            <div className="h-12 bg-gray-200 rounded w-full mb-4" />
            <div className="h-12 bg-gray-200 rounded w-full mb-4" />
            <div className="h-12 bg-gray-200 rounded w-full mb-4" />
            <div className="h-12 bg-gray-200 rounded w-full mb-4" />
            <div className="h-12 bg-gray-200 rounded w-full" />
            <div className="flex justify-end mt-6">
              <div className="h-10 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  if (formData?.school_id && !isError && formData?.hasCycleChange !== undefined) return <SuccessMessage />;

  return <Sections />;
};

SectionsPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Layout dashboardVariant="stretch" title="Sections">
      {page}
    </Layout>
  );
};
SectionsPage.auth = true;

export default SectionsPage;
