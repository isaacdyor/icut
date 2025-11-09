# iCut - Claude Development Guidelines

## File Naming Convention

**Always use kebab-case for all file names.**

### Examples:
- ✅ `use-drag-drop.ts`
- ✅ `file-manager.tsx`
- ✅ `api-client.ts`
- ❌ `useDragDrop.ts`
- ❌ `fileManager.tsx`
- ❌ `api_client.ts`

### Why kebab-case?
- Consistent across the codebase
- Works well with all operating systems
- Easy to read and type
- Standard practice in modern web development

## Code Style

- Use TypeScript for all new files
- Use TanStack Query for data fetching and mutations
- Use Tauri v2 APIs (e.g., `getCurrentWebview()`, not legacy event listeners)
- Create reusable hooks in `/src/hooks/` directory
