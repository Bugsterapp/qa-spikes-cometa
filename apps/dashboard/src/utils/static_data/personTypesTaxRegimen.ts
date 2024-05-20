import { TaxingTypeEnum } from '@cometa/trpc/src/types';

const personTypeDefault = TaxingTypeEnum.N;
const personTypeMoral = TaxingTypeEnum.M;
const personTypesNatural = [personTypeDefault];
const personTypesMoral = [TaxingTypeEnum.M];
const personTypesBoth = [personTypeDefault, TaxingTypeEnum.M];

export { personTypesBoth, personTypesNatural, personTypesMoral, personTypeDefault, personTypeMoral };
