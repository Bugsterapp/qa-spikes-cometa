import { createRoot } from 'react-dom/client';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Dialog } from '../Dialog';
import { EyeIcon, XIcon } from 'lucide-react';

type FilePondPluginAPI = {
  addFilter: (event: string, handler: (viewAPI: FilePondViewAPI) => void) => void;
  utils: {
    createRoute: (
      events: Record<string, (args: { root: FilePondRoot; props: { id: string } }) => void>,
      handler: (args: { root: FilePondRoot; props: { id: string } }) => void
    ) => unknown;
    Type: Record<string, unknown>;
  };
};

type FilePondViewAPI = {
  is: (type: string) => boolean;
  view: {
    registerWriter: (route: unknown) => void;
  };
  query: (method: string, ...args: unknown[]) => unknown;
};

type FilePondRoot = {
  element: HTMLElement;
  dispatch: (event: string, data: Record<string, unknown>) => void;
  rect: {
    element: {
      hidden: boolean;
    };
  };
};

type FilePondItem = {
  file: File;
  filename: string;
  archived?: boolean;
};

const isImage = (file: File): boolean => /^image/.test(file.type);
const isVideo = (file: File): boolean => /^video/.test(file.type);
const isPdf = (file: File): boolean => file.type === 'application/pdf';

const IMAGE_CONTAINER_STYLE = { backgroundSize: 'contain' };

const getVideoComponent = (fileURL: string, fileType: string, filename: string) => (
  <video controls width="100%" height="auto" aria-label={`Video: ${filename}`}>
    <source src={fileURL} type={fileType} />
    Your browser does not support the video tag.
  </video>
);

const getPdfComponent = (fileURL: string, filename: string) => (
  <iframe
    src={fileURL}
    style={{ width: '100%', height: '600px', border: 'none' }}
    title={filename}
    aria-label={`PDF: ${filename}`}
  />
);

const getUnsupportedFileComponent = () => <div className="py-8">El archivo no puede ser visualizado</div>;

const getImageComponent = (fileURL: string, filename: string, imageOverlayStyles: React.CSSProperties) => (
  <img
    src={fileURL}
    style={imageOverlayStyles}
    alt={filename}
    aria-label={`Imagen: ${filename}`}
    className="max-w-[600px] max-h-[600px] mx-auto"
  />
);

function getImageSize(fileURL: string, callback: (width: number, height: number) => void) {
  const img = new Image();
  img.onload = function () {
    callback(img.width, img.height);
  };
  img.src = fileURL;
}

type FileViewerButtonProps = {
  file: File;
  filename: string;
};

function FileViewerButton({ file, filename }: FileViewerButtonProps) {
  const [open, setOpen] = useState(false);
  const [imageOverlayStyles, setImageOverlayStyles] = useState<React.CSSProperties>(IMAGE_CONTAINER_STYLE);
  const [imageSizeCalculated, setImageSizeCalculated] = useState(false);

  const fileURL = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    function cleanup() {
      URL.revokeObjectURL(fileURL);
    }

    return cleanup;
  }, [fileURL]);

  useEffect(() => {
    if (open && isImage(file) && !imageSizeCalculated) {
      getImageSize(fileURL, function (width, height) {
        const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        const newBackgroundSize = width > w || height > h ? 'contain' : 'auto';
        setImageOverlayStyles({ backgroundSize: newBackgroundSize });
        setImageSizeCalculated(true);
      });
    }
  }, [open, file, fileURL, imageSizeCalculated]);

  const generateModalContent = useCallback(() => {
    if (isImage(file)) {
      return getImageComponent(fileURL, filename, imageOverlayStyles);
    } else if (isVideo(file)) {
      return getVideoComponent(fileURL, file.type, filename);
    } else if (isPdf(file)) {
      return getPdfComponent(fileURL, filename);
    }
    return getUnsupportedFileComponent();
  }, [file, filename, fileURL, imageOverlayStyles]);

  const modalContent = generateModalContent();

  return (
    <>
      <EyeIcon onClick={() => setOpen(true)} className="cursor-pointer mt-1 absolute right-11 z-[999]" size={20} />
      <Dialog.Root open={open} onOpenChange={setOpen} className="min-w-[700px] p-0">
        <Dialog.Title className="flex items-center justify-between border-b-2 py-4 px-6">
          <span className="truncate pr-2">{filename}</span>
          <Dialog.Close onClick={() => setOpen(false)}>
            <XIcon size={18} />
          </Dialog.Close>
        </Dialog.Title>
        <Dialog.Description className="flex flex-col justify-center px-6">{modalContent}</Dialog.Description>
      </Dialog.Root>
    </>
  );
}

function registerFileViewerButton(item: { file: File; filename: string }, element: HTMLElement) {
  if (element.querySelector('[data-file-viewer-button]')) {
    return;
  }

  const container = document.createElement('div');
  container.setAttribute('data-file-viewer-button', 'true');
  element.appendChild(container);
  createRoot(container).render(<FileViewerButton file={item.file} filename={item.filename} />);
}

function plugin(filepondAPI: FilePondPluginAPI) {
  const {
    addFilter,
    utils: { createRoute, Type },
  } = filepondAPI;

  addFilter('CREATE_VIEW', function (viewAPI: FilePondViewAPI) {
    const { is, view, query } = viewAPI;

    if (!is('file')) {
      return;
    }

    function didLoadItem({ root, props }: { root: FilePondRoot; props: { id: string } }) {
      const { id } = props;
      const item = query('GET_ITEM', id) as FilePondItem | null;
      if (!item || item.archived || !item.file) {
        return;
      }

      if (query('GET_ALLOW_VISUALIZER')) {
        registerFileViewerButton(item, root.element);
        root.dispatch('DID_MEDIA_PREVIEW_CONTAINER_CREATE', { id });
      }
    }

    view.registerWriter(
      createRoute(
        {
          DID_LOAD_ITEM: didLoadItem,
        },
        function ({ root, props }: { root: FilePondRoot; props: { id: string } }) {
          const { id } = props;
          const item = query('GET_ITEM', id) as FilePondItem | null;

          if (!item?.file || root.rect.element.hidden) return;
        }
      )
    );
  });

  return {
    options: {
      allowVisualizer: [false, Type.BOOLEAN],
    },
  };
}

export default plugin;
