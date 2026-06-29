/**
 * Dynamic Theme Engine for B2B White-Labeling.
 * Dynamically overrides Tailwind CSS variables to change the application's primary brand color.
 */
export const setThemeColor = (primaryHex: string) => {
  if (typeof document === 'undefined') return;

  // Helper to darken/lighten hex colors for hover states
  const adjustBrightness = (hex: string, percent: number) => {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.min(255, Math.max(0, R + (R * percent) / 100));
    G = Math.min(255, Math.max(0, G + (G * percent) / 100));
    B = Math.min(255, Math.max(0, B + (B * percent) / 100));

    const rHex = Math.round(R).toString(16).padStart(2, '0');
    const gHex = Math.round(G).toString(16).padStart(2, '0');
    const bHex = Math.round(B).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  const root = document.documentElement;

  // Tailwind v4 uses --color-cyan-xxx variables for cyan.
  // By overriding these, all elements using bg-cyan-xxx or text-cyan-xxx will adapt instantly!
  root.style.setProperty('--color-cyan-400', adjustBrightness(primaryHex, 15));
  root.style.setProperty('--color-cyan-500', primaryHex);
  root.style.setProperty('--color-cyan-600', adjustBrightness(primaryHex, -15));
  root.style.setProperty('--color-cyan-700', adjustBrightness(primaryHex, -30));
  root.style.setProperty('--color-cyan-950', adjustBrightness(primaryHex, -85));
};
