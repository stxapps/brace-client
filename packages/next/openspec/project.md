# Project Context

## Purpose
Brace.to is a web application that allows users to save, organize, and access web content. It appears to function as a "read it later" or bookmarking service with features for end-to-end encryption, listing, and tagging. The client is built as a Next.js application and seems to interact with a backend service and potentially the Stacks blockchain for identity or data storage.

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
- Code is formatted with ESLint, which can be run with `npm run lint`.

### Architecture Patterns
- The project follows a standard Next.js architecture with the application logic contained within the `src` directory.
- The project is configured for static export, meaning it generates a set of static HTML, CSS, and JavaScript files that can be hosted on any static hosting service. It also includes a service worker for offline capabilities.
- It uses a component-based architecture for the UI.
- State management is centralized using Redux. The presence of `reducers`, `actions`, and `selectors` folders indicates a standard Redux pattern. `redux-offline` is used to provide offline functionality.
- It uses dynamic imports to code-split the application for better performance.

### Testing Strategy
- There are currently no test files found within the project.

### Git Workflow
- The `package.json` includes scripts for building and deploying to test and production environments.
- To run the development server, use the following command: `npm run dev`. This will start the development server on `https://localhost:3000`.
- To build the application for production, use the following command: `npm run build`. This will create a production-ready build in the `out` directory.
- The project includes scripts for deploying to AWS S3 and CloudFront.

## Domain Context
- **Brace.to**: The name of the application.
- **Content Saving**: Users can save content (likely URLs).
- **Organization**: Content can be organized with "lists" and "tags".
- **Offline Access**: The application is designed to work offline.
- **Stacks**: The Stacks blockchain is used, likely for decentralized identity and/or data storage.

## Important Constraints
- The application needs to function correctly both online and offline.
- The application interacts with the Stacks blockchain, which may have its own set of constraints.

## External Dependencies
- **Stacks Blockchain**: For authentication and possibly data storage.
- **Service Worker:** The project uses a service worker for offline capabilities, configured with `@serwist/next`.
- **Backend Hub**: The application likely communicates with a custom backend API (referred to as "internalHub" in the code).
