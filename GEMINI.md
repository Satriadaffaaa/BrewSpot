# Project Standards: Lokali (formerly BrewSpot)

## Architecture: Feature-Based Structure
We follow a feature-based architecture to ensure scalability and maintainability.

### 1. `src/features/[feature-name]`
This folder contains the "brain" of each feature.
- `api.ts`: API calls (Firestore interactions). If it grows > 300 lines, split into `queries.ts` and `mutations.ts`.
- `hooks.ts`: Custom React hooks for business logic.
- `types.ts`: TypeScript definitions for the feature.
- `constants.ts`: Feature-specific constants.
- `utils.ts`: (Optional) Helper functions unique to the feature.
- `components/`: (Optional) UI components used **only** within this feature.

### 2. `src/components`
- `common/`: Reusable, atomic UI components (Buttons, Inputs, Modals).
- `[feature-name]/`: Larger, domain-specific components (Cards, Lists, Forms). These should be decomposed if they exceed 250 lines.

## Coding Standards

### 1. Naming Conventions
- **Components:** `PascalCase.tsx`
- **Hooks:** `useHookName.ts`
- **Files/Functions:** `camelCase.ts`
- **Constants:** `UPPER_SNAKE_CASE`

### 2. Data Layer (Firebase)
- **Mappers:** Always use a mapper function (e.g., `mapToBrewSpot`) to transform Firestore data into typed objects.
- **Type Safety:** Avoid `any`. Use `DocumentData` from Firebase or specific types.
- **Error Handling:** Wrap API calls in `try/catch` and provide meaningful error messages.

### 3. Component Design
- **Single Responsibility:** A component should do one thing. If a form handles geocoding, photo uploading, and validation, split it.
- **Hooks for Logic:** Extract complex state and effects into custom hooks (e.g., `useBrewSpotForm`).
- **Prop Typing:** Always use interfaces for props.

### 4. Styling
- Use **Tailwind CSS** with the `cn()` utility for conditional classes.
- Follow the established color palette (Primary, Accent, Surface, Neutral).

## Development Workflow
1. **Research:** Map the feature requirements and existing code.
2. **Standardization:** Ensure new code follows these standards.
3. **Refactoring:** Proactively decompose large components when modifying them.
4. **Validation:** Always verify changes with manual testing or unit tests.
