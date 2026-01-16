import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@cometa/utils';

const cardVariants = cva('bg-white border border-solid relative min-h-[121px] max-h-[121px]', {
  variants: {
    variant: {
      default: 'border-[#edf2fc]',
      elevated: 'border-[#edf2fc] shadow-sm',
    },
    padding: {
      none: '',
      default: 'p-4',
      sm: 'p-2',
      lg: 'p-6',
    },
    roundness: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-[10px]',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'default',
    roundness: 'lg',
  },
});

const cardHeaderVariants = cva('flex-1 gap-1', {
  variants: {
    padding: {
      none: 'p-0',
      default: 'p-4',
      sm: 'p-2',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    padding: 'none',
  },
});

const cardTitleVariants = cva(
  ' text-[16px] overflow-ellipsis overflow-hidden font-semibold text-[#22283a] !leading-[22px]',
  {
    variants: {
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
      },
      truncate: {
        true: 'truncate',
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      truncate: false,
    },
  }
);

const cardContentVariants = cva('grid grid-cols-[1fr_auto]  gap-[7px] items-start', {
  variants: {
    padding: {
      none: '',
      default: 'p-4',
      sm: 'p-2',
      lg: 'p-6',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-2',
      default: 'gap-[7px]',
      lg: 'gap-6',
    },
  },
  defaultVariants: {
    padding: 'default',
    gap: 'default',
  },
});

const cardMainInformationVariants = cva('flex flex-col items-start gap-[6px] min-h-[93px] content-start', {
  variants: {
    gap: {
      none: 'gap-0',
      sm: 'gap-1',
      default: 'gap-[6px]',
      lg: 'gap-2',
    },
  },
  defaultVariants: {
    gap: 'default',
  },
});

const cardImageVariants = cva('justify-self-end overflow-clip rounded w-[93px] h-[93px]', {
  variants: {
    size: {
      sm: 'w-16 h-16',
      default: 'w-[93px] h-[93px]',
      lg: 'w-24 h-24',
    },
    roundness: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-[7.13px]',
      xl: 'rounded-xl',
    },
  },
  defaultVariants: {
    size: 'default',
    roundness: 'lg',
  },
});

const cardFooterVariants = cva('flex items-center gap-0 justify-between', {
  variants: {
    gap: {
      none: 'gap-0',
      sm: 'gap-1',
      default: 'gap-1.5',
      lg: 'gap-2',
    },
  },
  defaultVariants: {
    gap: 'default',
  },
});

const cardStudentNameVariants = cva('text-xs text-[#444c60]', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      default: 'text-xs',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const cardSeparatorVariants = cva('w-1 h-1 rounded-full bg-[#444c60]', {
  variants: {
    size: {
      sm: 'w-0.5 h-0.5',
      default: 'w-1 h-1',
      lg: 'w-1.5 h-1.5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const cardDateVariants = cva('text-xs text-[#444c60]', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      default: 'text-xs',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const cardStudentPhotoClass = 'w-5 h-5 rounded-full';

type CardProps = React.ComponentProps<'div'> & VariantProps<typeof cardVariants>;

type CardHeaderProps = React.ComponentProps<'div'> & VariantProps<typeof cardHeaderVariants>;

type CardTitleProps = React.ComponentProps<'h3'> & VariantProps<typeof cardTitleVariants>;

type CardContentProps = React.ComponentProps<'div'> & VariantProps<typeof cardContentVariants>;

type CardMainInformationProps = React.ComponentProps<'div'> & VariantProps<typeof cardMainInformationVariants>;

type CardImageProps = React.ComponentProps<'img'> & VariantProps<typeof cardImageVariants>;

type CardFooterProps = React.ComponentProps<'div'> & VariantProps<typeof cardFooterVariants>;

type CardStudentNameProps = React.ComponentProps<'div'> &
  VariantProps<typeof cardStudentNameVariants> & {
    imageUrl?: string;
    children: React.ReactNode;
  };

type CardSeparatorProps = React.ComponentProps<'div'> & VariantProps<typeof cardSeparatorVariants>;

type CardDateProps = React.ComponentProps<'p'> & VariantProps<typeof cardDateVariants>;

type CardStudentPhotoProps = React.ComponentProps<'img'>;

function Card({ className, variant, padding, roundness, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, padding, roundness, className }))} {...props} />;
}

function CardHeader({ className, padding, ...props }: CardHeaderProps) {
  return <div className={cn(cardHeaderVariants({ padding, className }))} {...props} />;
}

function CardTitle({ className, size, truncate, ...props }: CardTitleProps) {
  return <h3 className={cn(cardTitleVariants({ size, truncate, className }))} {...props} />;
}

function CardContent({ className, padding, gap, ...props }: CardContentProps) {
  return <div className={cn(cardContentVariants({ padding, gap, className }))} {...props} />;
}

function CardMainInformation({ className, gap, ...props }: CardMainInformationProps) {
  return <div className={cn(cardMainInformationVariants({ gap, className }))} {...props} />;
}

function CardImage({ className, size, roundness, src, ...props }: CardImageProps) {
  const imageSrc = src || '/images/placeholder.png';

  return (
    <img
      className={cn(cardImageVariants({ size, roundness, className }), 'object-cover')}
      src={imageSrc}
      onError={(e) => {
        e.currentTarget.src = '/images/placeholder.png';
      }}
      alt="Cover"
      {...props}
    />
  );
}

function CardFooter({ className, gap, ...props }: CardFooterProps) {
  return <div className={cn(cardFooterVariants({ gap, className }))} {...props} />;
}

function CardStudentName({ className, size, imageUrl, children, ...props }: CardStudentNameProps) {
  return (
    <div className={cn('flex items-center gap-1.5 flex-1 min-w-0', className)} {...props}>
      {imageUrl && <img src={imageUrl} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />}
      <p className={cn(cardStudentNameVariants({ size }), 'truncate')}>{children}</p>
    </div>
  );
}

function CardSeparator({ className, size, ...props }: CardSeparatorProps) {
  return <div className={cn(cardSeparatorVariants({ size, className }))} {...props} />;
}

function CardDate({ className, size, ...props }: CardDateProps) {
  return <p className={cn(cardDateVariants({ size, className }))} {...props} />;
}

function CardStudentPhoto({ className, alt = '', ...props }: CardStudentPhotoProps) {
  return <img className={cn(cardStudentPhotoClass, className)} alt={alt} {...props} />;
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardMainInformation,
  CardImage,
  CardFooter,
  CardStudentName,
  CardSeparator,
  CardDate,
  CardStudentPhoto,
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardContentVariants,
  cardMainInformationVariants,
  cardImageVariants,
  cardFooterVariants,
  cardStudentNameVariants,
  cardSeparatorVariants,
  cardDateVariants,
  cardStudentPhotoClass,
};

export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
  CardMainInformationProps,
  CardImageProps,
  CardFooterProps,
  CardStudentNameProps,
  CardSeparatorProps,
  CardDateProps,
  CardStudentPhotoProps,
};
