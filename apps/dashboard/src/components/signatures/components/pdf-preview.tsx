import { useState, useRef, useEffect, memo } from 'react';
import { Document, Page } from 'react-pdf';
import { Stage, Layer, Rect, Text } from 'react-konva';
import type { TemplateFieldEntity } from '@cometa/trpc/src/students/types';
import { getFieldLabel } from '/src/components/signatures/utils/field-helpers';
import '/src/components/signatures/utils/pdf-config';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

function percentToPixels(percent: string, containerSize: number): number {
  return (parseFloat(percent) / 100) * containerSize;
}

interface PDFFieldOverlayProps {
  field: TemplateFieldEntity;
  pageWidth: number;
  pageHeight: number;
}

const PDFFieldOverlay = memo(({ field, pageWidth, pageHeight }: PDFFieldOverlayProps) => {
  const x = percentToPixels(field.positionX, pageWidth);
  const y = percentToPixels(field.positionY, pageHeight);
  const width = percentToPixels(field.width, pageWidth);
  const height = percentToPixels(field.height, pageHeight);

  const primaryColor = '#7C3AED';
  const fillColor = `${primaryColor}33`; // 20% opacity

  const fontSize = Math.max(Math.min(height * 0.4, 14), 10);
  const label = getFieldLabel(field);

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        stroke={primaryColor}
        strokeWidth={2}
        cornerRadius={4}
      />

      <Text
        x={x}
        y={y}
        width={width}
        height={height}
        text={label}
        fontSize={fontSize}
        fontFamily="Arial, sans-serif"
        fill={primaryColor}
        align="center"
        verticalAlign="middle"
        padding={4}
        wrap="none"
      />
    </>
  );
});

PDFFieldOverlay.displayName = 'PDFFieldOverlay';

interface PDFPageWithFieldsProps {
  pageNumber: number;
  fields: TemplateFieldEntity[];
  pageWidth: number;
}

function PDFPageWithFields({ pageNumber, fields, pageWidth }: PDFPageWithFieldsProps) {
  const [pageHeight, setPageHeight] = useState(0);

  const handlePageLoad = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    const scale = pageWidth / viewport.width;
    setPageHeight(viewport.height * scale);
  };

  return (
    <div className="relative mb-6 shadow-lg overflow-hidden" style={{ width: pageWidth, height: pageHeight || 'auto' }}>
      <Page
        pageNumber={pageNumber}
        width={pageWidth}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        renderMode="canvas"
        onLoadSuccess={handlePageLoad}
      />

      {pageHeight > 0 && (
        <div className="absolute inset-0">
          <Stage width={pageWidth} height={pageHeight}>
            <Layer>
              {fields.map((field) => (
                <PDFFieldOverlay key={field.id} field={field} pageWidth={pageWidth} pageHeight={pageHeight} />
              ))}
            </Layer>
          </Stage>
        </div>
      )}
    </div>
  );
}

interface PDFPreviewProps {
  pdfUrl: string;
  fields: TemplateFieldEntity[];
}

export function PDFPreview({ pdfUrl, fields }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const padding = 32;
        setPageWidth(Math.min(containerWidth - padding, 800)); // Max 800px with padding
      }
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);
    updateWidth();

    return () => resizeObserver.disconnect();
  }, []);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const fieldsByPage = fields.reduce((acc, field) => {
    if (!acc[field.page]) {
      acc[field.page] = [];
    }
    acc[field.page].push(field);
    return acc;
  }, {} as Record<number, TemplateFieldEntity[]>);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <Document
        file={pdfUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        loading={
          <div className="flex justify-center items-center py-16">
            <img src="/assets/loading.svg" alt="loading" className="w-12 h-12" />
          </div>
        }
        error={
          <div className="flex justify-center items-center py-16">
            <p className="text-red-500 text-sm">Error al cargar el PDF</p>
          </div>
        }
      >
        {pageWidth > 0 && numPages > 0 && (
          <>
            {Array.from(new Array(numPages), (_, index) => (
              <PDFPageWithFields
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                fields={fieldsByPage[index + 1] || []}
                pageWidth={pageWidth}
              />
            ))}
          </>
        )}
      </Document>
    </div>
  );
}
