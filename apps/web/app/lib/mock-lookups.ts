// TODO: Ayrı bir faz'da API endpoint eklenecek ve buradaki mock data kaldırılacak.
// Şimdilik kategoriler, tipler, stages ve teknolojiler icin statik ornek liste.

export interface MockCategory {
  id: string;
  nameTr: string;
  nameEn: string;
}

export interface MockProjectType {
  id: string;
  nameTr: string;
  nameEn: string;
}

export interface MockProjectStage {
  id: string;
  nameTr: string;
  nameEn: string;
}

export interface MockTechnology {
  id: string;
  name: string;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: "cat-web", nameTr: "Web", nameEn: "Web" },
  { id: "cat-mobile", nameTr: "Mobil", nameEn: "Mobile" },
  { id: "cat-ai-ml", nameTr: "Yapay Zeka", nameEn: "AI/ML" },
  { id: "cat-devtools", nameTr: "Geliştirici Araçları", nameEn: "Developer Tools" },
];

export const MOCK_PROJECT_TYPES: MockProjectType[] = [
  { id: "type-saas", nameTr: "SaaS", nameEn: "SaaS" },
  { id: "type-library", nameTr: "Kütüphane", nameEn: "Library" },
  { id: "type-mobile-app", nameTr: "Mobil Uygulama", nameEn: "Mobile App" },
  { id: "type-side-project", nameTr: "Yan Proje", nameEn: "Side Project" },
];

export const MOCK_PROJECT_STAGES: MockProjectStage[] = [
  { id: "stage-idea", nameTr: "Fikir", nameEn: "Idea" },
  { id: "stage-mvp", nameTr: "MVP", nameEn: "MVP" },
  { id: "stage-beta", nameTr: "Beta", nameEn: "Beta" },
  { id: "stage-live", nameTr: "Canlı", nameEn: "Live" },
];

export const MOCK_TECHNOLOGIES: MockTechnology[] = [
  { id: "tech-react", name: "React" },
  { id: "tech-typescript", name: "TypeScript" },
  { id: "tech-node", name: "Node.js" },
  { id: "tech-cloudflare", name: "Cloudflare" },
];
