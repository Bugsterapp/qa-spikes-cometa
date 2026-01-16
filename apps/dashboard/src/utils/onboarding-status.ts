import { OnboardingStatus } from '@cometa/trpc/src/bot/types';

export enum EntityType {
  BankAccount = 'bankAccount',
  FiscalEntity = 'fiscalEntity',
  ArticlesOfIncorporation = 'articles_of_incorporation',
  ProofOfAddress = 'proof_of_address',
  LegalRepresentative = 'legal_representative',
  Generic = 'generic',
}

export function getStatusDisplay(status?: OnboardingStatus | string): string {
  switch (status) {
    case OnboardingStatus.Pending:
      return 'En revisión';
    case OnboardingStatus.Approved:
      return 'Aprobada';
    case OnboardingStatus.Declined:
      return 'Rechazada';
    case 'archived':
      return 'Desactivada';
    default:
      return 'En revisión';
  }
}

export function getStatusTooltip(
  status?: OnboardingStatus | string,
  entityType: EntityType = EntityType.Generic
): string {
  const entityNames = {
    bankAccount: {
      singular: 'cuenta',
      article: 'Esta cuenta',
    },
    fiscalEntity: {
      singular: 'entidad fiscal',
      article: 'Esta entidad fiscal',
    },
    articles_of_incorporation: {
      singular: 'acta constitutiva',
      article: 'Esta acta constitutiva',
    },
    proof_of_address: {
      singular: 'comprobante de domicilio',
      article: 'Este comprobante de domicilio',
    },
    legal_representative: {
      singular: 'información del representante legal',
      article: 'Esta información',
    },
    generic: {
      singular: 'entidad',
      article: 'Esta entidad',
    },
  };

  const entity = entityNames[entityType];

  switch (status) {
    case OnboardingStatus.Pending:
      return `Nuestro equipo está revisando esta ${entity.singular} para asegurarse de que todo esté en orden.`;
    case OnboardingStatus.Approved:
      return `${entity.article} ha sido validada y está lista para usar.`;
    case OnboardingStatus.Declined:
      return `${entity.article} ha sido rechazada. Contacta a soporte para más información.`;
    case 'archived':
      return `${entity.article} ha sido desactivada temporalmente.`;
    default:
      return `Nuestro equipo está revisando esta ${entity.singular} para asegurarse de que todo esté en orden.`;
  }
}

export function getStatusVariant(status?: OnboardingStatus | string): 'default' | 'success' | 'error' | 'blue' {
  switch (status) {
    case OnboardingStatus.Pending:
      return 'blue';
    case OnboardingStatus.Approved:
      return 'success';
    case OnboardingStatus.Declined:
      return 'error';
    case 'archived':
      return 'default';
    default:
      return 'blue';
  }
}
