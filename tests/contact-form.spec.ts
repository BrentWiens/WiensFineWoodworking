import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('contact section is visible on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await expect(contactSection).toBeVisible();
  });

  test('shows send message button initially', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();

    const showFormButton = page.getByTestId('contact-show-form');
    await expect(showFormButton).toBeVisible();
    await expect(showFormButton).toHaveText('Send Me a Message');
  });

  test('clicking send message reveals the form', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();

    await page.getByTestId('contact-show-form').click();

    const form = page.getByTestId('contact-form');
    await expect(form).toBeVisible();
  });

  test('form has all required fields', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#city')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
  });

  test('all fields are required', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    // All inputs should have required attribute
    await expect(page.locator('#name')).toHaveAttribute('required', '');
    await expect(page.locator('#email')).toHaveAttribute('required', '');
    await expect(page.locator('#phone')).toHaveAttribute('required', '');
    await expect(page.locator('#city')).toHaveAttribute('required', '');
    await expect(page.locator('#message')).toHaveAttribute('required', '');
  });

  test('email field validates email format', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('phone field has tel type', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    const phoneInput = page.locator('#phone');
    await expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  test('submit button is disabled without turnstile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    const submitButton = page.getByTestId('contact-submit');
    await expect(submitButton).toBeDisabled();
  });

  test('can fill in form fields', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    await page.locator('#name').fill('John Doe');
    await page.locator('#email').fill('john@example.com');
    await page.locator('#phone').fill('555-123-4567');
    await page.locator('#city').fill('Kitchener');
    await page.locator('#message').fill('I would like a custom dining table.');

    await expect(page.locator('#name')).toHaveValue('John Doe');
    await expect(page.locator('#email')).toHaveValue('john@example.com');
    await expect(page.locator('#phone')).toHaveValue('555-123-4567');
    await expect(page.locator('#city')).toHaveValue('Kitchener');
    await expect(page.locator('#message')).toHaveValue('I would like a custom dining table.');
  });

  test('back button returns to contact options', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    // Form should be visible
    await expect(page.getByTestId('contact-form')).toBeVisible();

    // Click back button
    await page.getByText('Back to contact options').click();

    // Should show the send message button again
    await expect(page.getByTestId('contact-show-form')).toBeVisible();
    await expect(page.getByTestId('contact-form')).not.toBeVisible();
  });

  test('has correct field labels', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    await expect(page.getByText('Name *')).toBeVisible();
    await expect(page.getByText('Email *')).toBeVisible();
    await expect(page.getByText('Phone *')).toBeVisible();
    await expect(page.getByText('City *')).toBeVisible();
    await expect(page.getByText('Message *')).toBeVisible();
  });

  test('has correct placeholders', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    await expect(page.locator('#name')).toHaveAttribute('placeholder', 'Your name');
    await expect(page.locator('#email')).toHaveAttribute('placeholder', 'your.email@example.com');
    await expect(page.locator('#phone')).toHaveAttribute('placeholder', '(555) 123-4567');
    await expect(page.locator('#city')).toHaveAttribute('placeholder', 'Your city');
    await expect(page.locator('#message')).toHaveAttribute('placeholder', 'Tell me about your project...');
  });
});

test.describe('Contact form failure fallback', () => {
  // One test here deliberately waits out the widget-load timeout in ContactForm.
  test.describe.configure({ timeout: 45_000 });

  async function openForm(page: import('@playwright/test').Page) {
    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();
    await expect(page.getByTestId('contact-form')).toBeVisible();
  }

  test('points people to social media when Turnstile cannot load', async ({ page }) => {
    // Simulates the most common real-world dead end: an ad blocker or extension
    // blocking challenges.cloudflare.com, which leaves the submit button
    // permanently disabled with no way for the visitor to get a message through.
    await page.route('**challenges.cloudflare.com/**', route => route.abort());

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openForm(page);

    const fallback = page.getByTestId('contact-error-social');
    // Allow for the widget-load timeout in ContactForm plus a margin.
    await expect(fallback).toBeVisible({ timeout: 20000 });
    await expect(fallback).toContainText('Facebook or Instagram');

    await expect(fallback.getByRole('link', { name: 'Facebook' })).toHaveAttribute(
      'href',
      /facebook\.com/
    );
    await expect(fallback.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      /instagram\.com/
    );
  });

  test('does not offer the social fallback before anything has gone wrong', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await openForm(page);

    await expect(page.getByTestId('contact-error-social')).toHaveCount(0);
  });
});
