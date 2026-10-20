export type GallerySectionKey =
  | "villa_exterior"
  | "bedrooms"
  | "amenities"
  | "main_level"
  | "entertainment_deck"
  | "gallery"
  | "attractions"
  | "other";

export interface GallerySectionConfig {
  key: GallerySectionKey;
  label: string;
  description: string;
  folderPath?: string;
}

export const GALLERY_SECTIONS: GallerySectionConfig[] = [
  {
    key: "villa_exterior",
    label: "Villa / Exterior",
    description: "Architecture, beachfront elevation, pool views & landscape",
    folderPath: "aboutvillab/1",
  },
  {
    key: "bedrooms",
    label: "Bedrooms",
    description: "Master suites, guest bedrooms, and ensuite bathrooms",
    folderPath: "aboutvillab/bedrooms",
  },
  {
    key: "amenities",
    label: "Amenities",
    description: "Infinity pool, fitness, tennis, chef kitchen & estate facilities",
    folderPath: "aboutvillab/amenities",
  },
  {
    key: "main_level",
    label: "Main Level",
    description: "Great room, indoor dining, living salon & foyer",
    folderPath: "aboutvillab/mainlevel",
  },
  {
    key: "entertainment_deck",
    label: "Entertainment Deck",
    description: "Sun loungers, outdoor dining, BBQ, cabana & sunset terrace",
    folderPath: "aboutvillab/entertainmentdeck",
  },
  {
    key: "gallery",
    label: "Gallery",
    description: "Curated highlight imagery and artistic villa photography",
    folderPath: "aboutvillab/gallery",
  },
  {
    key: "attractions",
    label: "Attractions",
    description: "Beaches, island excursions, dining, and surrounding coves",
    folderPath: "attractions",
  },
  {
    key: "other",
    label: "Other",
    description: "Floorplans, special events, brochures, and seasonal promotions",
    folderPath: "galleryphotos",
  },
];

export interface GalleryItem {
  _id: string;
  url: string;
  fileName: string;
  section: GallerySectionKey;
  title: string;
  altText: string;
  order: number;
  status: "active" | "hidden" | "archived";
  isHero?: boolean;
  fileSize?: number; // In bytes
  mimeType?: string;
  dimensions?: { width: number; height: number };
  isLocalAsset?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryItemDto {
  url: string;
  fileName: string;
  section: GallerySectionKey;
  title: string;
  altText: string;
  order?: number;
  status?: "active" | "hidden" | "archived";
  isHero?: boolean;
  fileSize?: number;
  mimeType?: string;
  isLocalAsset?: boolean;
}

export interface UpdateGalleryItemDto {
  title?: string;
  altText?: string;
  section?: GallerySectionKey;
  status?: "active" | "hidden" | "archived";
  order?: number;
  isHero?: boolean;
}

export interface GalleryStats {
  totalImages: number;
  activeImages: number;
  hiddenImages: number;
  missingAltCount: number;
  heroImages: number;
  sectionCounts: Record<GallerySectionKey | "all", number>;
}
