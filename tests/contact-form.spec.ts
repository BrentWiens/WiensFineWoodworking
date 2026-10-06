import { test, expect } from '@playwright/test';

test.describe('Contact API validation', () => {
  const REQUIRED_ERROR = 'Name, email and message are required';

  // The route rate-limits by client IP, and every test request comes from the same
  // machine. A distinct forwarded IP per request keeps retries from tripping the limit.
  let ipCounter = 0;
  const post = (request: import('@playwright/test').APIRequestContext, data: object) =>
    request.post('/api/contact', {
      data,
      headers: { 'x-forwarded-for': `203.0.113.${(Date.now() + ipCounter++) % 250}` },
    });

  test('accepts a message without phone or city', async ({ request }) => {
    const response = await post(request, {
      name: 'Test Person',
      email: 'test@example.com',
      message: 'Interested in a desk.',
      turnstileToken: 'not-a-real-token',
    });

    // The dummy token fails verification further on, so this never sends an email.
    // What matters is that it got past the required-field check.
    const body = await response.json();
    expect(body.error).not.toBe(REQUIRED_ERROR);
  });

  test('still rejects a message with no message text', async ({ request }) => {
    const response = await post(request, {
      name: 'Test Person',
      email: 'test@example.com',
      turnstileToken: 'not-a-real-token',
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe(REQUIRED_ERROR);
  });
});

test.describe('Phone number', () => {
  test('nav and contact section both link to the same number', async ({ page }) => {
    await page.goto('/');

    for (const id of ['nav-phone', 'contact-phone']) {
      await expect(page.getByTestId(id)).toHaveAttribute('href', 'tel:+12263384441');
    }
    await expect(page.getByTestId('contact-phone')).toHaveText('226-338-4441');
    await expect(page.locator('#contact')).toContainText('Call or text');
  });

  test('is in the nav on other pages too, including on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/projects/walnut-end-table');

    const navPhone = page.getByTestId('nav-phone');
    await expect(navPhone).toBeVisible();
    await expect(navPhone).toHaveAccessibleName('Call 226-338-4441');
  });

  test('matches the number in the LocalBusiness structured data', async ({ page }) => {
    await page.goto('/');

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const business = blocks.map(b => JSON.parse(b)).find(b => b['@type'] === 'LocalBusiness');
    expect(business.telephone).toBe('+1-226-338-4441');
  });
});

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

  test.describe('contact buttons open the form directly', () => {
    const form = (page: import('@playwright/test').Page) => page.getByTestId('contact-form');

    test('hero "Get in Touch"', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.getByRole('link', { name: 'Get in Touch' }).click();
      await expect(form(page)).toBeVisible();
    });

    test('nav "Contact" on the homepage', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Contact' })
        .click();
      await expect(form(page)).toBeVisible();
    });

    test('nav "Contact" again after going back to the contact options', async ({ page }) => {
      // The URL is already /#contact here, so the second click changes nothing about
      // it — the form has to reopen from the click itself.
      // No networkidle: the form opens straight away here and loads the Turnstile
      // widget, which keeps the network busy. The form appearing at all means React
      // has hydrated, which is what the clicks below need.
      await page.goto('/#contact');
      await expect(form(page)).toBeVisible();

      await page.getByRole('button', { name: /Back to contact options/ }).click();
      await expect(page.getByTestId('contact-show-form')).toBeVisible();

      await page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Contact' })
        .click();
      await expect(form(page)).toBeVisible();
    });

    test('"Start a Commission" from a project page', async ({ page }) => {
      await page.goto('/projects/walnut-end-table', { waitUntil: 'networkidle' });
      await page.getByRole('link', { name: 'Start a Commission' }).click();
      await expect(page).toHaveURL(/\/#contact$/);
      await expect(form(page)).toBeVisible();
    });

    test('a shared /#contact link', async ({ page }) => {
      await page.goto('/#contact');
      await expect(form(page)).toBeVisible();
    });
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

  test('name, email and message are required; phone and city are optional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();
    await page.getByTestId('contact-show-form').click();

    await expect(page.locator('#name')).toHaveAttribute('required', '');
    await expect(page.locator('#email')).toHaveAttribute('required', '');
    await expect(page.locator('#message')).toHaveAttribute('required', '');

    await expect(page.locator('#phone')).not.toHaveAttribute('required');
    await expect(page.locator('#city')).not.toHaveAttribute('required');
    await expect(page.locator('label[for="phone"]')).toContainText('optional');
    await expect(page.locator('label[for="city"]')).toContainText('optional');
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
    await expect(page.locator('label[for="phone"]')).toHaveText('Phone (optional)');
    await expect(page.locator('label[for="city"]')).toHaveText('City (optional)');
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
  // One test here deliberately waits out the widget-load timeout in ContactForm,
  // on top of the lazy-chunk wait below.
  test.describe.configure({ timeout: 60_000 });

  async function openForm(page: import('@playwright/test').Page) {
    const contactSection = page.locator('#contact');
    await contactSection.scrollIntoViewIfNeeded();

    // The reveal button is server-rendered, so Playwright can click it before React
    // has hydrated and attached the handler — the click is then silently lost and
    // the form never opens. Retry until it actually does. Only shows up under
    // parallel load, where hydration lags far enough behind first paint to lose the
    // race, which is why this passed in isolation and failed in a full run.
    await expect(async () => {
      if (!(await page.getByTestId('contact-form').isVisible())) {
        await page.getByTestId('contact-show-form').click();
      }
      await expect(page.getByTestId('contact-form')).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });
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
