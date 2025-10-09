# Project Context

## Purpose
Brace is a web application that allows users to save, organize, and access web content. It appears to function as a "read it later" or bookmarking service with features for tagging, listing, and sharing content. The client is built as a Next.js application and seems to interact with a backend service and potentially the Stacks blockchain for identity or data storage.

## Tech Stack
- **Framework**: Next.js
- **Language**: TypeScript
- **UI Library**: React
- **State Management**: Redux with `react-redux`, `redux-thunk`, and `redux-offline` for offline capabilities.
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Identity/Storage**: Stacks (`@stacks/auth`, `@stacks/storage`)

## Project Conventions

### Code Style
- The codebase uses a mix of modern and slightly older React patterns. For instance, `src/components/App.tsx` is a class-based component using the `connect` HOC, while `src/store.ts` defines and exports typed Redux hooks (`useSelector`, `useDispatch`), which is a more modern approach.
- Naming conventions appear to follow standard TypeScript and React practices (e.g., PascalCase for components, camelCase for functions and variables).
- Code is formatted with Prettier/ESLint, which can be run with `npm run lint`.

### Architecture Patterns
- The project follows a standard Next.js architecture with the application logic contained within the `src` directory.
- It uses a component-based architecture for the UI.
- State management is centralized using Redux. The presence of `reducers`, `actions`, and `selectors` folders indicates a standard Redux pattern. `redux-offline` is used to provide offline functionality.

### Testing Strategy
- There are currently no test files found within the project. A testing strategy should be established, potentially using a framework like Jest with React Testing Library.

### Git Workflow
- The `package.json` includes scripts for deploying to test and production environments, suggesting a Git workflow that involves at least these two branches. A more detailed branching strategy (e.g., GitFlow, trunk-based development) should be documented here.

## Domain Context
- **Brace**: The name of the application.
- **Content Saving**: Users can save content (likely URLs).
- **Organization**: Content can be organized with "lists" and "tags".
- **Offline Access**: The application is designed to work offline.
- **Stacks**: The Stacks blockchain is used, likely for decentralized identity and/or data storage.

## Important Constraints
- The application needs to function correctly both online and offline.
- The application interacts with the Stacks blockchain, which may have its own set of constraints.

## External Dependencies
- **Stacks Blockchain**: For authentication and possibly data storage.
- **Backend Hub**: The application likely communicates with a custom backend API (referred to as "internalHub" in the code).