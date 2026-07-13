# Plan: Favorite Domains Feature

## Data Model (localStorage)

### Storage Keys
- `dqmainer-groups`: DomainGroup[]  
- `dqmainer-favorites`: FavoriteItem[]

### Types
```typescript
interface DomainGroup {
  id: string;
  name: string;
  createdAt: number;
  order: number;
}

interface FavoriteItem {
  domain: string;
  groupId: string;   // '__all__' or specific group id
  note: string;
  addedAt: number;
}
```

### Default Groups
```typescript
[{ id: '__all__', name: '全部域名', createdAt: now, order: 0 }]
```

## Implementation Steps

### Step 1: Type Definitions
- File: `src/types/favorites.ts`
- Export: DomainGroup, FavoriteItem interfaces, DEFAULT_GROUP_ID constant

### Step 2: useFavorites Hook
- File: `src/hooks/useFavorites.ts`
- CRUD: add/remove/toggle favorite, batch add
- Group ops: create/rename/delete group, move domain between groups
- State: favorites[], groups[]
- localStorage read on mount, write on every change

### Step 3: FavoriteButton Component
- File: `src/components/FavoriteButton.tsx`
- Props: domain (string), groupId (optional), size (sm|default)
- Renders star icon, filled if favorited, outline if not
- On click: toggleFavorite => optimize (if not favorited, add to current context group)

### Step 4: Modify page.tsx (Results)
- Add selection state: `selectedDomains: Set<string>`
- Add checkbox to each result card/list item
- Select all checkbox in sort bar
- When 1+ selected: show batch action bar with "Favorite Selected" + count
- Add FavoriteButton to each card footer / list item
- Handle URL param `?domains=...` for one-click check from favorites page
  - Parse `searchParams.get("domains")` + `searchParams.get("group")` 
  - If present, auto-fill textarea and trigger lookup

### Step 5: Header Link
- File: `src/layout/Header.tsx`
- Add `<Link href="/favorites">` nav item
- Label: t("common.favorites")

### Step 6: /favorites Page
- File: `src/app/favorites/page.tsx`
- Layout: Left group tree (~250px) + Right domain list
- Left Sidebar:
  - "全部域名" root item (always visible)
  - Group list below with rename/delete on hover
  - "新建分组" button at bottom
  - Create group via inline input or dialog
- Right Domain List:
  - Search bar (filter by domain name)
  - "一键检查" button (navigate to /?domains=...&group=...)
  - "导入/导出" dropdown button
  - Sort: by name, by added date
  - Each domain item: domain name, note (editable inline), group badge, actions (check, move group, remove)
  - Batch select + batch remove
- Drag & drop: implement simple move-to-group via dropdown (drag is complex)
- Import: parse JSON, merge with existing (skip duplicates)
- Export: download current favorites as JSON file
- "全部域名" shows all favorites; clicking a group filters by that groupId

### Step 7: i18n
- Add translations for: favorites page, favorite button, groups
- Both zh.json and en.json

### Step 8: Verification
- LSP diagnostics on all changed files
- pnpm build (or at least lint)

## Scope Boundaries
- IN: localStorage only, independent route, CRUD groups, import/export JSON, notes, search/filter, batch ops
- OUT: backend, auth, drag-drop reorder (use dropdown instead), auto-monitoring
