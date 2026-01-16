import React from 'react';
import { cn } from '/src/utils/cn';

interface BackgroundProcessIndicatorProps {
  status: 'working' | 'success' | 'error' | 'cancelling' | 'cancelled' | 'partialSuccess';
}

export const BackgroundProcessIndicator: React.FC<BackgroundProcessIndicatorProps> = ({ status }) => (
  <div className="grid-area w-[40px] h-[40px]">
    <img
      src="/assets/loading.svg"
      alt="loading"
      data-state={status === 'working' || status === 'cancelling' ? 'show' : 'hide'}
      className="grid-area"
    />
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-state={status === 'success' || status === 'cancelled' ? 'show' : 'hide'}
      className="grid-area"
    >
      <path
        d="M9.13672 15L13.2289 20.0016C13.4356 20.2542 13.825 20.2443 14.0185 19.9814L20.999 10.5"
        stroke="#00AB55"
        strokeWidth="3"
        strokeLinecap="round"
        className={cn('fPvpbRVO_0', {
          'animate-draw': status === 'partialSuccess' || status === 'success' || status === 'cancelled',
        })}
      />
      <path
        d="M28.75 15C28.75 22.5939 22.5939 28.75 15 28.75C7.40608 28.75 1.25 22.5939 1.25 15C1.25 7.40608 7.40608 1.25 15 1.25C22.5939 1.25 28.75 7.40608 28.75 15Z"
        stroke="#00AB55"
        strokeWidth="2.5"
        className={cn('fPvpbRVO_1', {
          'animate-draw': status === 'partialSuccess' || status === 'success' || status === 'cancelled',
        })}
      />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="35"
      height="35"
      fill="none"
      className="grid-area"
      data-state={status === 'error' ? 'show' : 'hide'}
    >
      <path
        stroke="red"
        strokeWidth="3.5"
        d="M2.6000000000000014,17.6A15,15 0,1,1 32.6,17.6A15,15 0,1,1 2.6000000000000014,17.6"
        className={cn('FHGIIeCe_2', { 'animate-draw': status === 'error' })}
      />
      <path
        stroke="red"
        strokeLinecap="round"
        strokeWidth="2.8"
        d="M11.5 11.5 24 24"
        className={cn('FHGIIeCe_3', { 'animate-draw': status === 'error' })}
      />
      <path
        stroke="red"
        strokeLinecap="round"
        strokeWidth="2.8"
        d="M11.5 24 24 11.5"
        className={cn('FHGIIeCe_4', { 'animate-draw': status === 'error' })}
      />
    </svg>
  </div>
);
