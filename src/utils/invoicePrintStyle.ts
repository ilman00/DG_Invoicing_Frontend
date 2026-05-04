/**
 * InvoicePrintStyles.ts
 *
 * Call injectInvoicePrintStyles() once (e.g. in main.tsx or App.tsx).
 * It injects a <style id="invoice-print-styles"> tag into <head> that:
 *   - hides everything on the page when printing
 *   - shows only the element with id="invoice-printable"
 *
 * This means the rest of your app layout (sidebar, header, nav) all
 * disappear cleanly and the invoice fills the printed page.
 */

export function injectInvoicePrintStyles(): void {
  const id = 'invoice-print-styles';
  if (document.getElementById(id)) return; // already injected

  const style = document.createElement('style');
  style.id = id;
  style.innerHTML = `
    @media print {
      /* Hide everything */
      body > * {
        display: none !important;
      }

      /* Show only the invoice portal root */
      #invoice-print-portal {
        display: block !important;
        position: fixed !important;
        inset: 0 !important;
        z-index: 99999 !important;
        background: #fff !important;
        overflow: auto !important;
      }

      /* Reset page margins so the invoice fills the page */
      @page {
        margin: 10mm;
        size: A4 portrait;
      }

      /* Ensure the invoice card itself has no extra shadow/border */
      #invoice-printable {
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
      }
    }
  `;

  document.head.appendChild(style);
}