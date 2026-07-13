export const DEFAULT_GROUP_ID = "__all__";

export interface DomainGroup {
  id: string;
  name: string;
  createdAt: number;
  order: number;
}

export interface FavoriteItem {
  domain: string;
  groupIds: string[];
  note: string;
  addedAt: number;
}

/** Legacy format with single groupId — used for migration */
export interface LegacyFavoriteItem {
  domain: string;
  groupId: string;
  note: string;
  addedAt: number;
}

export interface FavoritesExportData {
  version: 1;
  exportedAt: string;
  groups: DomainGroup[];
  favorites: FavoriteItem[];
}
