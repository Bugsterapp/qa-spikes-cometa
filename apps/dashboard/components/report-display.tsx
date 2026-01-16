'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Response } from './response';

interface BackgroundJob {
  job_id: string;
  status: string;
  status_endpoint: string;
  download_endpoint: string;
}

interface ReportDisplayProps {
  backgroundJob: BackgroundJob;
  query: string;
}

function csvToMarkdown(csvData: string): string {
  const lines = csvData.trim().split('\n');
  if (lines.length === 0) return '';

  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map((line) => line.split(',').map((cell) => cell.trim().replace(/"/g, '')));

  let markdown = '| ' + headers.join(' | ') + ' |\n';
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

  rows.forEach((row) => {
    markdown += '| ' + row.join(' | ') + ' |\n';
  });

  return markdown;
}

export function ReportDisplay({ backgroundJob, query }: ReportDisplayProps) {
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [csvData, setCsvData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollJobStatus = async () => {
    try {
      const response = await fetch(`/api/chat?endpoint=${encodeURIComponent(backgroundJob.status_endpoint)}`);

      if (!response.ok) {
        setError('Error al consultar el estado del reporte');
        setStatus('failed');
        return;
      }

      const data = await response.json();

      if (data.status === 'completed') {
        const csvResponse = await fetch(`/api/chat?endpoint=${encodeURIComponent(backgroundJob.download_endpoint)}`);

        if (csvResponse.ok) {
          const csvText = await csvResponse.text();
          setCsvData(csvText);
          setStatus('completed');
        } else {
          setError('Error al descargar el reporte');
          setStatus('failed');
        }
      } else if (data.status === 'failed') {
        setError('Error al generar el reporte');
        setStatus('failed');
      } else {
        setTimeout(pollJobStatus, 2000);
      }
    } catch (err) {
      setError('Error de conexión');
      setStatus('failed');
    }
  };

  useEffect(() => {
    pollJobStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'processing') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
          <motion.div
            className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Generando reporte</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">"{query}"</div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">Error al generar el reporte</span>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
      </div>
    );
  }

  if (status === 'completed' && csvData) {
    const markdownTable = csvToMarkdown(csvData);

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 max-h-[500px]">
          <div className="overflow-y-scroll">
            <Response className="[&_table]:w-full [&_tbody]:max-h-[500px] [&_tbody]:overflow-scroll [&_table]:border-collapse [&_th]:bg-gray-50 [&_th]:dark:bg-gray-800 [&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-gray-900 [&_th]:dark:text-gray-100 [&_th]:sticky [&_th]:top-0 [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td]:text-gray-700 [&_td]:dark:text-gray-300 ">
              {markdownTable}
            </Response>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
