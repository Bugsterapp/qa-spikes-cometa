/**
 * @see https://www.embla-carousel.com/get-started/
 */

import React from 'react';
import { cn } from '@cometa/utils';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, EmblaCarouselType } from 'embla-carousel';

export function SliderChild({ children, className }: { children: React.ReactElement; className?: string }) {
  return <div className={cn('embla__slide', className)}>{children}</div>;
}

type SliderProps = {
  children: React.ReactElement[] | ((sliderApi: EmblaCarouselType | undefined) => React.ReactElement[]);
  options?: EmblaOptionsType;
  className?: string;
};

export const Root = ({ children, options, className }: SliderProps) => {
  const [sliderRef, sliderApi] = useEmblaCarousel(options);

  const isRenderProp = typeof children === 'function';

  return (
    <div ref={sliderRef} className={cn('embla', className)}>
      <div className="embla__container">{isRenderProp ? children(sliderApi) : children}</div>
    </div>
  );
};
