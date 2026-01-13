import { Locator, Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly title: Locator;
  readonly edit_button: Locator;
  readonly first_name: Locator;
  readonly last_name: Locator;
  readonly email: Locator;
  readonly gender_list: Locator;
  readonly gender_select: Locator;
  readonly gender_value: Locator;
  readonly confirm_button: Locator;
  // Read-only mode locators (when form is not editable)
  readonly first_name_text: Locator;
  readonly last_name_text: Locator;
  readonly email_text: Locator;
  readonly gender_value_text: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'Mi perfil' });
    this.edit_button = page.getByTestId('edit-button');
    this.first_name = page.locator('input[name="first_name"]');
    this.last_name = page.locator('input[name="last_name"]');
    this.email = page.locator('input[name="email"]');
    this.gender_list = page.getByTestId('gender-list');
    this.gender_select = page.locator('select');
    this.gender_value = page.getByTestId('gender-value');
    this.confirm_button = page.getByTestId('confirm-button');
    // Read-only mode locators (when form is not editable)
    this.first_name_text = page.locator('p:has-text("Nombre(s)") + p');
    this.last_name_text = page.locator('p:has-text("Apellidos") + p');
    this.email_text = page.locator('p:has-text("Correo") + p');
    this.gender_value_text = page.locator('p:has-text("Género") + p');
  }
}
