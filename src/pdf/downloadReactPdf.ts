import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

export async function downloadReactPdf(
  document: ReactElement<DocumentProps>,
  filename: string,
) {
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
