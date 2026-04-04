export interface Profession {
  id: string;
  slug: string;
  nameEn: string;
  nameTr: string;
  icon: string | null;
  group: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameTr: string;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProjectType {
  id: string;
  slug: string;
  nameEn: string;
  nameTr: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProjectStage {
  id: string;
  slug: string;
  nameEn: string;
  nameTr: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Technology {
  id: string;
  slug: string;
  name: string;
  iconUrl: string | null;
  group: string | null;
  websiteUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}
