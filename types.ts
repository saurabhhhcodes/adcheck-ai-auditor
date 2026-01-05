export interface AuditResult {
  pass: boolean;
  violations: string[];
  corrective_instruction: string;
}

export interface AdCreative {
  file: File;
  previewUrl: string;
  base64: string;
}

export const DEFAULT_GUIDELINES = `Retailer: FreshMarket Inc.
Guidelines:
1. Logo Integrity: The "FreshMarket" logo must be in the top-left or top-right corner and fully opaque. No overlaps allowed.
2. Color Palette: Primary text must use Hex #2E7D32 (Green) or #FFFFFF (White).
3. Contrast: All text must have a contrast ratio of at least 4.5:1 against the background.
4. Product Presentation: Fresh produce must look realistic, not cartoony. No warping of packaging.
5. Family Friendly: No aggressive imagery or competitive brands visible.`;
