import type { RubricItem } from '../types/courseWorkspace.types';

export const parseRubrics = (
  rubricStr?: string | null,
  total: number = 20
): RubricItem[] => {
  if (!rubricStr || !rubricStr.trim()) {
    return [
      {
        criteria: 'Knowledge of road signs & ground markings',
        points: `${Math.round(total * 0.4)} pts`,
      },
      {
        criteria: 'Intersections and right-of-way rules (Article 34)',
        points: `${Math.round(total * 0.3)} pts`,
      },
      {
        criteria: 'Defensive driving and general road safety',
        points: `${Math.round(total * 0.3)} pts`,
      },
    ];
  }
  const lines = rubricStr
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length > 1) {
    return lines.map((line) => {
      const match = line.match(/^(.*?)(?::|\s-\s|\s–\s)?\s*(\d+\s*(?:pts|points|marks)?)$/i);
      if (match) {
        const criteria = match[1].trim() || line;
        const pts = match[2].trim().toLowerCase().includes('pt') ? match[2].trim() : `${match[2].trim()} pts`;
        return { criteria, points: pts };
      }
      return { criteria: line, points: 'Evaluated' };
    });
  }
  return [{ criteria: rubricStr, points: `${total} pts` }];
};
