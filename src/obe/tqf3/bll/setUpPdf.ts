export const setupFonts = (doc: PDFKit.PDFDocument) => {
  const fontNormal = 'TH Niramit AS-normal';
  const fontBold = 'TH Niramit AS-bold';
  const emoji = 'Segoe UI Symbol';

  doc.registerFont(fontNormal, 'src/assets/fonts/TH Niramit AS Regular.ttf');
  doc.registerFont(fontBold, 'src/assets/fonts/TH Niramit AS Bold.ttf');
  doc.registerFont(emoji, 'src/assets/fonts/Segoe-UI-Symbol.ttf');

  return { fontNormal, fontBold, emoji };
};

export const setSymbol = (
  condition: boolean,
  type: 'checkbox' | 'radio' = 'checkbox',
) => {
  if (type === 'radio') {
    return condition ? '◉' : '○';
  } else {
    return condition ? '☑' : '☐';
  }
};
