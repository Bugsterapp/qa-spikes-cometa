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

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { name: 'Mi perfil' });
    this.edit_button = page.getByTestId('edit-button');
    this.first_name = page.getByTestId('first_name-input');
    this.last_name = page.getByTestId('last_name-input');
    this.email = page.getByTestId('email-input');
    this.gender_list = page.getByTestId('gender-list');
    this.gender_select = page.locator('select');
    this.gender_value = page.getByTestId('gender-value');
    this.confirm_button = page.getByTestId('confirm-button');
  }
}
