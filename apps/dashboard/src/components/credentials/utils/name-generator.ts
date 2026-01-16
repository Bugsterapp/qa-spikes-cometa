import type { CredentialTemplateEntity } from '@cometa/trpc/src/students/types';

/**
 * Generates a unique name for a duplicated template by adding a numeric suffix
 *
 * Examples:
 * - "Students" → "Students 2"
 * - "Students 2" → "Students 3"
 * - "Teachers" → "Teachers 2" (if "Teachers" already exists)
 *
 * @param originalName - Name of the template to duplicate
 * @param existingTemplates - List of existing templates
 * @returns New name with unique numeric suffix
 */
export function generateDuplicateName(originalName: string, existingTemplates: CredentialTemplateEntity[]): string {
  const match = originalName.match(/^(.+?)\s*(\d+)?$/);
  const baseName = match?.[1]?.trim() || originalName;

  const existingNames = existingTemplates.map((t) => t.name);
  const similarNames = existingNames.filter(
    (name) =>
      name === baseName || name.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+\\d+$`))
  );

  let maxNumber = 0;
  similarNames.forEach((name) => {
    if (name === baseName) {
      maxNumber = Math.max(maxNumber, 1);
    } else {
      const numberMatch = name.match(/\s+(\d+)$/);
      if (numberMatch) {
        maxNumber = Math.max(maxNumber, parseInt(numberMatch[1], 10));
      }
    }
  });

  const newNumber = maxNumber + 1;
  return `${baseName} ${newNumber}`;
}
