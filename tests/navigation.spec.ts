import { test, expect } from '@playwright/test';

/**
 * The main nav has three layouts (see Navigation.tsx): links stacked under the logo
 * below 880px, links beside a two-line FINE / WOODWORKING logo from 880px, and a
 * one-line logo from 1024px. Switching to a row too early once wrapped the logo
 * unpredictably and pushed the phone link and Contact button off the right edge.
 */
test.describe('Main navigation fits at every width', () => {
  const WIDTHS = [360, 390, 639, 640, 672, 768, 879, 880, 900, 960, 1023, 1024, 1100, 1280, 1440];
  const TWO_LINE_LOGO = (width: number) => width >= 880 && width < 1024;

  for (const path of ['/gallery', '/projects/walnut-drawers']) {
    test(`logo wraps only where intended and every link is on screen (${path})`, async ({ page }) => {
      await page.goto(path);
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const logo = nav.getByRole('link', { name: /WIENS/ });
      const links = [
        nav.getByRole('link', { name: 'Gallery' }),
        nav.getByRole('link', { name: 'About' }),
        nav.getByRole('link', { name: 'Tools' }),
        nav.getByTestId('nav-phone'),
        nav.getByRole('link', { name: 'Contact' }),
      ];

      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });

        // One line of the logo is at most 40px tall (the divider); two lines are ~72px.
        const twoLines = TWO_LINE_LOGO(width);
        await expect
          .poll(async () => (await logo.boundingBox())!.height, {
            message: `logo should be ${twoLines ? 'two lines' : 'one line'} at ${width}px`,
          })
          [twoLines ? 'toBeGreaterThan' : 'toBeLessThanOrEqual'](44);
        expect((await logo.boundingBox())!.height).toBeLessThanOrEqual(80);

        // Beside the logo from 880px, with clear space between them.
        if (width >= 880) {
          const logoBox = (await logo.boundingBox())!;
          const galleryBox = (await links[0].boundingBox())!;
          expect(galleryBox.y, `links drop below the logo at ${width}px`).toBeLessThan(
            logoBox.y + logoBox.height
          );
          expect(galleryBox.x - (logoBox.x + logoBox.width), `logo crowds links at ${width}px`)
            .toBeGreaterThanOrEqual(24);
        }

        for (const link of links) {
          const box = (await link.boundingBox())!;
          expect(box.x, `${await link.textContent()} off the left at ${width}px`).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width, `link off the right at ${width}px`).toBeLessThanOrEqual(width);
        }

        // Nothing in the nav overflows sideways.
        const overflow = await nav.evaluate(el => el.scrollWidth - el.clientWidth);
        expect(overflow, `nav overflows at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test('page content starts below the nav on a project page', async ({ page }) => {
    for (const width of [390, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/projects/walnut-drawers');
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
      const [navBox, crumbBox] = await Promise.all([nav.boundingBox(), breadcrumb.boundingBox()]);
      expect(crumbBox!.y, `breadcrumb under the nav at ${width}px`).toBeGreaterThanOrEqual(
        navBox!.y + navBox!.height
      );
    }
  });
});
