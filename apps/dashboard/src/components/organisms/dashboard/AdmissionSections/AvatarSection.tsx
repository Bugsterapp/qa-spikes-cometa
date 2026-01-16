'use client';

import * as Sentry from '@sentry/nextjs';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { TrashIcon, XIcon, PencilIcon } from 'lucide-react';
import { Button, Dialog } from '@cometa/recreo';
import { cn } from '@cometa/utils';
import { ServiceClient } from '/src/utils/api';
import { useSession } from 'next-auth/react';
import { AdmissionsServiceClient } from '/src/utils/api-admissions';

type Point = {
  x: number;
  y: number;
};

export default function AvatarSection({
  id,
  borderColor,
  photoUrl,
  isLead,
}: {
  id: string;
  borderColor: string;
  photoUrl?: string | null;
  isLead?: boolean;
}) {
  const { data: session } = useSession();

  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(photoUrl || null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [deletedImage, setDeletedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!photoUrl) return;

    const url = new URL(photoUrl);
    const key = `${url.origin}${url.pathname}`;

    if (key === photoKey) return;

    setPhotoKey(key);
    setAvatar(photoUrl);
    setCurrentImage(photoUrl);
  }, [photoUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImage(reader.result as string);
        setDeletedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 3 * 1024 * 1024,
    multiple: false,
  });

  async function handleSave() {
    try {
      setIsSubmitting(true);

      const newPhoto = originalFile ?? '';

      let response;
      if (isLead) {
        response = await AdmissionsServiceClient.uploadPhotoApiV1AdmissionsPkUploadPhotoPatch(
          id,
          { file_in: newPhoto as File },
          {
            headers: { Authorization: `Token ${session?.token}` },
          }
        );
      } else {
        response = await ServiceClient.apiV2StudentsUploadPhotoUpdate(
          id,
          { photo: newPhoto as string },
          { headers: { Authorization: `Token ${session?.token}` } }
        );
      }

      if (response.ok) {
        const student = await response.json();
        setAvatar(student.photo);
        setDeletedImage(null);
        handleClose();
      } else {
        Sentry.captureException('Failed to upload image');
      }
    } catch (error) {
      Sentry.captureException(error);
    } finally {
      setCurrentImage(null);
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    if (deletedImage) {
      setCurrentImage(deletedImage);
      setDeletedImage(null);
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }

  function handleDelete(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    setDeletedImage(currentImage);
    setCurrentImage(null);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setIsOpen(true)}
        className="relative group overflow-hidden rounded-full w-20 h-20 bg-muted flex items-center justify-center border-2 border-muted-foreground/20"
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Uploaded photo"
            className={cn('w-full h-full rounded-full object-cover border-2 p-1', borderColor)}
          />
        ) : (
          <img
            src="/assets/avatar.jpg"
            alt="Default avatar photo"
            className={cn('w-full h-full rounded-full object-cover border-2 p-1', borderColor)}
          />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PencilIcon className="text-white text-2xl" />
        </div>
      </button>

      <Dialog.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex flex-col gap-6 p-0 max-w-lg w-full font-lota antialiased"
        disableCloseOutside
      >
        <div className="flex justify-between items-center border-b border-[#E9EEF7] px-8 py-5">
          <Dialog.Title className="font-bold text-[#1C1C1D] mb-0">Foto de perfil</Dialog.Title>
          <span onClick={handleClose} className="px-1.5 py-1 hover:cursor-pointer hover:bg-[#F0F0F0] rounded-full">
            <XIcon className="text-[#98A2B3] w-5" />
          </span>
        </div>

        <Dialog.Description className="px-8">
          <div
            {...getRootProps()}
            className="h-80 border border-dashed border-[#C0C9D8] rounded-xl px-6 py-10 text-center cursor-pointer relative flex flex-col items-center justify-center"
          >
            {currentImage ? (
              <div className="flex flex-col items-center justify-center gap-4 text-sm">
                <div className="h-44 w-44 relative">
                  <Cropper
                    image={currentImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    style={{
                      containerStyle: {
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#FFFFFF',
                      },
                      cropAreaStyle: {
                        border: 'none',
                        boxShadow: '0 0 0 9999px #FFFFFF',
                      },
                      mediaStyle: {
                        border: 'none',
                      },
                    }}
                  />
                </div>
                <input {...getInputProps()} />
                <p>
                  Arrastra el archivo o <span className="text-[#3366FF] underline">haz click aquí</span> para
                  seleccionar una nueva foto de perfil
                </p>
                <span
                  className="absolute top-4 right-4 z-10 hover:cursor-pointer text-[#FD6262] flex gap-1 items-center"
                  onClick={handleDelete}
                >
                  <TrashIcon className="h-4 w-4" /> Eliminar foto
                </span>
              </div>
            ) : (
              <>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Suelta la imagen aquí...</p>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 text-sm">
                    <UploadedIcon />
                    <p>
                      Arrastra la imagen o <span className="text-[#3366FF] underline">haz click aquí</span> para
                      seleccionar el archivo desde tu computadora
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-xs text-[#686F87] mt-2 text-start">
            Archivos permitidos .jpg, .jpeg, .png, .webp (Máximo 3 MB)
          </p>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full bg-[#00AB5514] text-[#00AB55] hover:bg-[#00AB5544] hover:no-underline px-5 py-2.5 font-semibold h-10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full px-5 py-2.5 font-semibold h-10"
              size="small"
              color="legacy"
              variant="solid"
            >
              Guardar
            </Button>
          </div>
        </Dialog.Description>
      </Dialog.Root>
    </div>
  );
}

function UploadedIcon() {
  return (
    <svg width="49" height="47" viewBox="0 0 49 47" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M37.3006 13.7575C36.9389 13.6543 36.6087 13.4623 36.34 13.1989C36.0714 12.9356 35.8729 12.6092 35.7626 12.2495C35.1502 10.1736 34.1229 8.24355 32.743 6.57612C31.3631 4.90869 29.6592 3.53856 27.7345 2.54865C25.8097 1.55874 23.7042 0.969623 21.5452 0.816954C19.3862 0.664286 17.2187 0.951237 15.1738 1.66044C13.1289 2.36965 11.2492 3.48637 9.64837 4.94302C8.04753 6.39968 6.75888 8.16598 5.86039 10.135C4.96189 12.1041 4.47224 14.235 4.42106 16.3988C4.36988 18.5625 4.75824 20.7142 5.56263 22.7235C5.74743 23.1464 5.78721 23.6185 5.6758 24.0663C5.56439 24.5141 5.30803 24.9126 4.94664 25.1995C3.35409 26.3815 2.11073 27.9721 1.34814 29.8028C0.585549 31.6336 0.332107 33.6365 0.614635 35.5995C1.05554 38.2533 2.43328 40.661 4.4978 42.3857C6.56231 44.1105 9.17677 45.0378 11.8666 44.9995H22.5006C23.0311 44.9995 23.5398 44.7888 23.9148 44.4137C24.2899 44.0387 24.5006 43.53 24.5006 42.9995C24.5006 42.4691 24.2899 41.9604 23.9148 41.5853C23.5398 41.2102 23.0311 40.9995 22.5006 40.9995H11.8666C10.1392 41.0415 8.45389 40.4631 7.11616 39.3694C5.77842 38.2757 4.87678 36.7389 4.57464 35.0375C4.38303 33.787 4.53832 32.5079 5.02358 31.3395C5.50884 30.1711 6.30546 29.1584 7.32664 28.4115C8.39928 27.6099 9.1752 26.4746 9.53251 25.184C9.88981 23.8934 9.80825 22.5207 9.30064 21.2815C8.29694 18.6309 8.24533 15.714 9.15464 13.0295C9.88103 10.9267 11.1818 9.06929 12.9096 7.66775C14.6374 6.26621 16.7232 5.37654 18.9306 5.09953C19.4427 5.03361 19.9584 5.00021 20.4746 4.99953C23.0607 4.991 25.58 5.82039 27.6553 7.36352C29.7306 8.90664 31.2502 11.0805 31.9866 13.5595C32.2741 14.5043 32.792 15.3627 33.4938 16.0574C34.1955 16.7522 35.0591 17.2615 36.0066 17.5395C38.3256 18.2254 40.3798 19.6033 41.894 21.4888C43.4083 23.3743 44.3105 25.6773 44.4797 28.0897C44.6489 30.5021 44.0772 32.9085 42.841 34.987C41.6048 37.0654 39.7632 38.7166 37.5626 39.7195C37.237 39.8863 36.9647 40.1412 36.7769 40.4552C36.5892 40.7692 36.4934 41.1297 36.5006 41.4955C36.4967 41.8265 36.576 42.1531 36.7312 42.4454C36.8865 42.7377 37.1126 42.9864 37.3889 43.1686C37.6653 43.3507 37.9829 43.4606 38.3127 43.488C38.6426 43.5154 38.974 43.4595 39.2766 43.3255C47.5446 39.3515 52.0366 28.8975 45.0366 18.7975C43.1092 16.2834 40.3792 14.5048 37.3006 13.7575Z"
        fill="#D5DEED"
      />
      <path
        d="M37.9144 32.4138C38.2894 32.0388 38.5 31.5302 38.5 30.9998C38.5 30.4695 38.2894 29.9609 37.9144 29.5858L34.7424 26.4138C33.6173 25.289 32.0914 24.6571 30.5004 24.6571C28.9094 24.6571 27.3836 25.289 26.2584 26.4138L23.0864 29.5858C22.7221 29.963 22.5205 30.4683 22.5251 30.9926C22.5296 31.517 22.74 32.0187 23.1108 32.3895C23.4816 32.7603 23.9832 32.9706 24.5076 32.9752C25.032 32.9798 25.5372 32.7782 25.9144 32.4138L28.5004 29.8278V44.9998C28.5004 45.5303 28.7111 46.039 29.0862 46.4141C29.4613 46.7891 29.97 46.9998 30.5004 46.9998C31.0309 46.9998 31.5396 46.7891 31.9146 46.4141C32.2897 46.039 32.5004 45.5303 32.5004 44.9998V29.8278L35.0864 32.4138C35.4615 32.7888 35.9701 32.9994 36.5004 32.9994C37.0308 32.9994 37.5394 32.7888 37.9144 32.4138Z"
        fill="#D5DEED"
      />
    </svg>
  );
}
