/**
 * Sifo Drive — Road Sign Domain Model
 */

export type RoadSignCategory = 'WARNING' | 'PROHIBITORY' | 'MANDATORY' | 'INFORMATORY' | 'ROAD_MARKING';

export interface RoadSignDTO {
  id: string;
  name: string;
  sign_code?: string;
  category: RoadSignCategory;
  image?: string;
  description: string;
  description_kinyarwanda?: string;
  is_active?: boolean;
}

export class RoadSign {
  public readonly id: string;
  public readonly name: string;
  public readonly signCode: string;
  public readonly category: RoadSignCategory;
  public readonly imageUrl: string;
  public readonly description: string;
  public readonly descriptionKinyarwanda: string;

  constructor(dto: RoadSignDTO) {
    this.id = dto.id;
    this.name = dto.name;
    this.signCode = dto.sign_code || '';
    this.category = dto.category;
    this.imageUrl = dto.image || '';
    this.description = dto.description;
    this.descriptionKinyarwanda = dto.description_kinyarwanda || '';
  }

  public getCategoryLabel(): string {
    switch (this.category) {
      case 'WARNING': return 'Warning (Icyapa kimenyesha akaga)';
      case 'PROHIBITORY': return 'Prohibitory (Icyapa kibuzanya)';
      case 'MANDATORY': return 'Mandatory (Icyapa gitegeka)';
      case 'INFORMATORY': return 'Informatory (Icyapa kiyobora)';
      case 'ROAD_MARKING': return 'Road Marking (Ibimenyetso byo mu muhanda)';
      default: return this.category;
    }
  }

  public getCategoryColor(): string {
    switch (this.category) {
      case 'WARNING': return 'var(--warning)';
      case 'PROHIBITORY': return 'var(--danger)';
      case 'MANDATORY': return 'var(--secondary-500)';
      case 'INFORMATORY': return 'var(--info)';
      default: return 'var(--primary)';
    }
  }
}
