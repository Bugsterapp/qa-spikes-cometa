import { useState } from 'react';
import { useRouter } from 'next/router';
import { Download, Filter, Search, Check, BadgeCheck, Clock, ArrowUpDown } from 'lucide-react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@cometa/recreo/v2';
import { api } from '/src/utils/api';
import { StudentsServiceClient } from '/src/utils/apiStudents';
import { DocumentInstanceStatus, DocumentInstanceEntity } from '@cometa/trpc/src/students/types';
import * as Sentry from '@sentry/nextjs';

const API_TOKEN = process.env.NEXT_PUBLIC_SCHOOLS_API_TOKEN;

export function TemplateSignaturesTab() {
  const router = useRouter();
  const { templateId } = router.query;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: documents, isPending: isLoading } = api.students.listTemplateDocuments.useQuery(
    { template_id: String(templateId) },
    {
      enabled: !!templateId,
    }
  );

  const handleSort = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response =
        await StudentsServiceClient.downloadDocumentFileApiV1SignaturesDocumentsInstancesDocumentIdFileDownloadGet(
          documentId,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
            format: 'blob',
          }
        );

      if (response.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${documentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      Sentry.captureException(error);
      alert('Error al descargar el documento. Por favor, inténtalo de nuevo.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <img src="/assets/loading.svg" alt="loading" className="mx-auto" />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-[#919EAB] text-sm mb-4">No hay firmas registradas para este template todavía.</p>
        <p className="text-[#919EAB] text-xs">
          Las firmas aparecerán aquí cuando se creen documentos a partir de este template.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: DocumentInstanceStatus) => {
    switch (status) {
      case DocumentInstanceStatus.Signed:
        return {
          label: 'Firmado',
          icon: <BadgeCheck className="w-3 h-3" />,
          className: 'bg-[#20B137] text-white border border-transparent',
        };
      case DocumentInstanceStatus.Pending:
      default:
        return {
          label: 'Pendiente',
          icon: <Clock className="w-3 h-3" />,
          className: 'bg-purple-50 text-purple-600 border border-purple-200',
        };
    }
  };

  const getModuleLabel = (module: string | null | undefined) => {
    if (!module) return '-';
    const moduleLabels: Record<string, string> = {
      admissions: 'Admisiones',
      enrollment: 'Inscripciones',
      reenrollment: 'Reinscripciones',
      general: 'General',
    };
    return moduleLabels[module.toLowerCase()] || module;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  let filteredDocuments = documents.filter((doc: DocumentInstanceEntity) => {
    const matchesSearch =
      !searchTerm ||
      String(doc.document_metadata?.student_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(doc.document_metadata?.signer_name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (doc.external_id || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = !statusFilter || statusFilter === 'all';
    if (!matchesStatus) {
      matchesStatus = doc.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  if (sortOrder) {
    filteredDocuments = [...filteredDocuments].sort((a, b) => {
      const nameA = String(a.document_metadata?.signer_name || a.signer_id || '').toLowerCase();
      const nameB = String(b.document_metadata?.signer_name || b.signer_id || '').toLowerCase();

      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB, 'es');
      } else {
        return nameB.localeCompare(nameA, 'es');
      }
    });
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-shrink-0 px-8">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-[#F3F6FB] border-[#D0D8E9] text-sm h-9 rounded-full px-4 py-[9px] shadow-[0_1px_2px_0_rgba(34,40,58,0.05)]"
            >
              <Filter size={16} />
              Filtrar
              {statusFilter && statusFilter !== 'all' && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Estado</div>
              <div className="space-y-1">
                {[
                  { value: '', label: 'Todos' },
                  { value: DocumentInstanceStatus.Signed, label: 'Firmado' },
                  { value: DocumentInstanceStatus.Pending, label: 'Pendiente' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent ${
                      statusFilter === option.value ? 'bg-primary/10 text-primary font-medium' : ''
                    }`}
                  >
                    <span>{option.label}</span>
                    {statusFilter === option.value && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="relative w-[267px]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#454D64]" size={16} />
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-10 pr-4 py-[9px] bg-[#F3F6FB] border border-gray-300 rounded-full text-sm text-[#454D64] placeholder:text-[#454D64] font-['Lota_Grotesque'] font-normal leading-5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full table-fixed">
          <thead className="bg-[#F3F6FB]">
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 pl-6 pr-4 text-sm font-semibold text-[#637381] font-['Lota_Grotesque'] leading-5 whitespace-nowrap w-[22%]">
                <div className="flex items-center justify-between">
                  <span>Firmante</span>
                  <button onClick={handleSort} className="text-[#374957] hover:text-[#212B36] transition-colors">
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[#637381] font-['Lota_Grotesque'] leading-5 relative whitespace-nowrap w-[22%]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-[#919EAB] opacity-24" />
                Estudiante
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[#637381] font-['Lota_Grotesque'] leading-5 relative whitespace-nowrap w-[16%]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-[#919EAB] opacity-24" />
                Estado
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[#637381] font-['Lota_Grotesque'] leading-5 relative whitespace-nowrap w-[16%]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-[#919EAB] opacity-24" />
                Etiqueta
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[#637381] font-['Lota_Grotesque'] leading-5 relative whitespace-nowrap w-[18%]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-[#919EAB] opacity-24" />
                Fecha de firma
              </th>
              <th className="text-left py-4 pl-4 pr-6 text-sm font-semibold text-[#637381] font-['Lota_Grotesque'] leading-5 whitespace-nowrap w-[6%]" />
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc: DocumentInstanceEntity) => {
              const status = getStatusBadge(doc.status);
              return (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 pl-6 pr-4 text-sm text-gray-900 truncate w-[22%]">
                    {doc.document_metadata?.signer_name || doc.signer_id}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 truncate w-[22%]">
                    {doc.document_metadata?.student_name || '-'}
                  </td>
                  <td className="py-4 px-4 w-[16%]">
                    <span
                      className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${status.className}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 w-[16%]">{getModuleLabel(doc.module)}</td>
                  <td className="py-4 px-4 text-sm text-gray-900 w-[18%]">
                    {doc.signed_at ? formatDate(doc.signed_at) : '-'}
                  </td>
                  <td className="py-4 pl-4 pr-6 w-[6%]">
                    {doc.status === DocumentInstanceStatus.Signed && (
                      <button
                        onClick={() => handleDownload(doc.id)}
                        className="flex w-9 h-9 justify-center items-center gap-2 flex-shrink-0 rounded-full bg-[#ECEFF6] text-gray-600 hover:text-purple-600 hover:bg-[#E4D2FF] transition-colors shadow-[0_1px_2px_0_rgba(34,40,58,0.05)]"
                        title="Descargar documento firmado"
                      >
                        <Download size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12 flex-shrink-0 px-8">
          <p className="text-gray-500 text-sm">No se encontraron resultados para tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
