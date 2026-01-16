import { Locator, Page } from '@playwright/test';

export class FiscalEntitiesPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly addEntityButton: Locator;
  readonly entityCards: Locator;
  readonly emptyStateImage: Locator;
  readonly emptyStateTitle: Locator;
  readonly emptyStateDescription: Locator;
  readonly emptyStateAddButton: Locator;

  readonly drawerTitle: Locator;
  readonly fiscalEntityFileInput: Locator;
  readonly csdKeyFileInput: Locator;
  readonly csdCertificateFileInput: Locator;
  readonly csdPasswordInput: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly saveButton: Locator;
  readonly discardButton: Locator;
  readonly identificationSectionHeading: Locator;

  readonly nameInput: Locator;
  readonly taxIdInput: Locator;
  readonly taxingSystemSelect: Locator;
  readonly issuedAtInput: Locator;
  readonly stateSelect: Locator;
  readonly postalCodeInput: Locator;
  readonly cityInput: Locator;
  readonly districtInput: Locator;
  readonly addressNameInput: Locator;
  readonly addressNumberInput: Locator;

  readonly deleteButton: Locator;
  readonly confirmDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByText('Entidades fiscales', { exact: true }).first();
    this.pageDescription = page.getByText('Registra aquí las entidades fiscales que utilizarás para tu facturación');
    this.addEntityButton = page.getByRole('button', { name: 'Agregar entidad fiscal' });

    this.entityCards = page.locator('div.flex.flex-col.gap-4.w-full button[type="button"]');
    this.emptyStateImage = page.locator('img[alt="Entidades fiscales"]');
    this.emptyStateTitle = page.getByText('Registra tus entidades fiscales');
    this.emptyStateDescription = page.getByText(
      'Al crear tus conceptos de cobro podrás determinar la entidad fiscal a utilizar para su facturación.'
    );
    this.emptyStateAddButton = page.getByRole('button', { name: 'Agregar entidad fiscal' });

    this.drawerTitle = page.getByRole('heading', { name: 'Agregar entidad fiscal' });

    this.fiscalEntityFileInput = page.locator('#fiscal-entity-file input[type="file"].filepond--browser');
    this.csdKeyFileInput = page.locator('#csd-key-file input[type="file"].filepond--browser');
    this.csdCertificateFileInput = page.locator('#csd-certificate-file input[type="file"].filepond--browser');
    this.csdPasswordInput = page.locator('#csd_password');
    this.nextButton = page.getByRole('button', { name: 'Siguiente' });
    this.backButton = page.getByRole('button', { name: 'Atrás' });
    this.saveButton = page.getByRole('button', { name: 'Guardar' });
    this.discardButton = page.getByRole('button', { name: 'Descartar' });
    this.identificationSectionHeading = page.getByRole('heading', { name: 'Datos de identificación' });

    this.nameInput = page.locator('#name');
    this.taxIdInput = page.locator('#tax_id');
    this.taxingSystemSelect = page.locator('[role="combobox"]').first();
    this.issuedAtInput = page.locator('#issued_at');
    this.stateSelect = page.locator('[role="combobox"]').nth(1);
    this.postalCodeInput = page.locator('#postal_code');
    this.cityInput = page.locator('#city');
    this.districtInput = page.locator('#district');
    this.addressNameInput = page.locator('#address_name');
    this.addressNumberInput = page.locator('#address_number');

    this.deleteButton = page.getByRole('button', { name: 'Eliminar entidad fiscal' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'Si, eliminar' });
  }

  async navigateToFiscalEntities() {
    await this.page.waitForLoadState('networkidle');
    const currentUrl = this.page.url();
    const baseUrl = new URL(currentUrl).origin;
    await this.page.goto(`${baseUrl}/school_config/fiscal_entities`, { waitUntil: 'networkidle' });
  }

  async clickAddEntity() {
    const hasEntities = await this.entityCards.count();
    if (hasEntities > 0) {
      await this.addEntityButton.click();
    } else {
      await this.emptyStateAddButton.click();
    }
  }

  async uploadFile(inputLocator: Locator, filePath: string) {
    await inputLocator.waitFor({ state: 'attached', timeout: 5000 });

    await inputLocator.setInputFiles(filePath);

    // Wait for FilePond to process the file
    await this.page.waitForTimeout(2000);
  }

  async fillCsdPassword(password: string) {
    await this.csdPasswordInput.fill(password);
  }

  async clickNext() {
    await this.nextButton.click();
    await this.identificationSectionHeading.waitFor({ state: 'visible', timeout: 10000 });
    // Small delay to ensure form is fully rendered
    await this.page.waitForTimeout(500);
  }

  async fillIdentificationFields(data: { name: string; taxId: string; taxingSystem: string; issuedAt: string }) {
    await this.nameInput.fill(data.name);
    await this.nameInput.blur();

    await this.taxIdInput.fill(data.taxId);
    await this.taxIdInput.blur();

    await this.taxingSystemSelect.scrollIntoViewIfNeeded();
    await this.taxingSystemSelect.click();
    const option = this.page.getByRole('option', { name: data.taxingSystem });
    await option.waitFor({ state: 'visible' });
    await option.click();

    await this.issuedAtInput.fill(data.issuedAt);
    await this.issuedAtInput.blur();
  }

  async fillAddressFields(data: {
    state: string;
    postalCode: string;
    city: string;
    district: string;
    addressName: string;
    addressNumber: string;
  }) {
    await this.stateSelect.scrollIntoViewIfNeeded();
    await this.stateSelect.click();
    const stateOption = this.page.getByRole('option', { name: data.state, exact: true });
    await stateOption.waitFor({ state: 'visible' });
    await stateOption.click();

    await this.postalCodeInput.fill(data.postalCode);
    await this.postalCodeInput.blur();

    await this.cityInput.fill(data.city);
    await this.cityInput.blur();

    await this.districtInput.fill(data.district);
    await this.districtInput.blur();

    await this.addressNameInput.fill(data.addressName);
    await this.addressNameInput.blur();

    await this.addressNumberInput.fill(data.addressNumber);
    await this.addressNumberInput.blur();
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async getEntityCardByTaxId(taxId: string) {
    return this.entityCards.filter({ hasText: taxId });
  }

  async getEntityCardByTaxIdAndName(taxId: string, name: string) {
    // More specific selector that matches both RFC and name
    return this.entityCards.filter({ hasText: taxId }).filter({ hasText: name });
  }

  async clickEntityByTaxId(taxId: string) {
    const entityCard = await this.getEntityCardByTaxId(taxId);
    await entityCard.click();
  }

  async clickEntityByTaxIdAndName(taxId: string, name: string) {
    const entityCard = await this.getEntityCardByTaxIdAndName(taxId, name);
    await entityCard.click();
  }

  async deleteEntityByTaxId(taxId: string) {
    await this.clickEntityByTaxId(taxId);
    await this.drawerTitle.waitFor({ state: 'visible' });
    await this.deleteButton.click();
    await this.confirmDeleteButton.waitFor({ state: 'visible' });
    await this.confirmDeleteButton.click();
  }

  async deleteEntityByTaxIdAndName(taxId: string, name: string) {
    await this.clickEntityByTaxIdAndName(taxId, name);

    await this.page
      .getByRole('heading', { name: 'Entidad fiscal', exact: true })
      .waitFor({ state: 'visible', timeout: 10000 });

    // Wait for the drawer content to fully load
    await this.page.waitForTimeout(1000);

    await this.deleteButton.waitFor({ state: 'visible', timeout: 10000 });

    await this.deleteButton.click();

    await this.confirmDeleteButton.waitFor({ state: 'visible', timeout: 10000 });

    await this.confirmDeleteButton.click();
  }
}
