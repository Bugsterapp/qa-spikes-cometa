import { useState, useEffect } from 'react';
import { FilePlus, Search, FileText, Pen } from 'lucide-react';
import Layout from '../../components/layouts';
import { useSignatureTemplates } from '../../hooks/useSignatureTemplates';
import useSendPageViewedEvent from '../../hooks/useSendPageViewedEvent';
import { Skeleton } from '../../components/atoms/Skeleton';
import { CreateTemplateDialog } from '../../components/signatures/components/create-template-dialog';

export default function SignatureTemplatesPage() {
  useSendPageViewedEvent('signature_templates');
  const { templates, loading, error } = useSignatureTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!mounted) return '-';
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  return (
    <Layout title="Contratos y documentos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!mounted ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Contratos y documentos</h1>
                <p className="mt-2 text-sm text-gray-600">Crea, envia y almacena tus documentas y contratos</p>
              </div>
              <button
                onClick={() => setCreateDialogOpen(true)}
                className="inline-flex items-center justify-center gap-2 h-10 px-8 py-2 text-sm font-medium rounded-full text-white bg-[#873AFF] hover:bg-[#732de6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#873AFF] transition-colors"
                style={{ boxShadow: '0 1px 2px 0 rgba(34, 40, 58, 0.05)' }}
              >
                <FilePlus className="h-4 w-4" />
                Crear documento
              </button>
            </div>

            <div className="mb-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Buscar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error: {error}</p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-20">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="h-14 w-14 text-orange-400" strokeWidth={1.5} />
                      <div className="absolute top-0 right-0">
                        <Pen className="h-8 w-8 text-orange-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Crea un nuevo contrato</h3>
                <p className="text-sm text-gray-600 mb-8 max-w-lg mx-auto">
                  Carga el documento y asigna los campos a llenar por parte de los tutores en dos simples pasos.
                </p>
                <button
                  onClick={() => setCreateDialogOpen(true)}
                  className="inline-flex items-center justify-center h-10 px-8 py-2 text-sm font-medium rounded-full text-[#873AFF] bg-[#f3ecff] hover:bg-[#e8dcff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#873AFF] transition-colors"
                  style={{ boxShadow: '0 1px 2px 0 rgba(34, 40, 58, 0.05)' }}
                >
                  Crear nuevo contrato
                </button>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Título
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha de creación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm text-gray-900">
                            {template.created_at ? formatDate(template.created_at) : '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <CreateTemplateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </Layout>
  );
}
