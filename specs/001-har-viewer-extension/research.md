# Research: HAR Viewer Extension

## Webview Communication

**Decision**: Use a dependency injection pattern to decouple the `har-viewer` component from the VSCode environment. The `vscode-extension` will provide a concrete implementation that uses VSCode's built-in `postMessage` API.

**Rationale**: This approach ensures that the `har-viewer` package has zero dependencies on the VSCode API, making it a truly reusable component. This aligns with the "Package Independence" principle. It also improves testability, as the UI can be tested in isolation with a mock communication provider.

**Alternatives considered**:
- **Direct `postMessage` calls from the UI component**: This would create a hard dependency on the VSCode webview environment, violating the package independence principle.
- **Local Server/Websockets**: This would add unnecessary complexity and potential security risks.

## HAR Parsing Library

**Decision**: Write a custom HAR parser, utilizing `stream-json` for efficient large file processing.

**Rationale**: While there are existing HAR parsing libraries, writing a custom one will provide more control over the data structures and error handling. It will also avoid introducing external dependencies that may not be optimized for this specific use case. Given the well-defined HAR specification, a custom parser can be implemented relatively easily. The integration of `stream-json` allows for efficient lazy loading of HAR entries, crucial for handling large files without excessive memory consumption.

**Alternatives considered**:
- **Using an existing npm library**: This could speed up initial development, but might lead to less flexibility and more bloat. It could also introduce licensing or maintenance issues.

## Large File Handling / Lazy Loading

**Decision**: Implement conditional lazy loading for HAR entries in large files using `stream-json`.

**Rationale**: HAR files, particularly those capturing extended browsing sessions, can become extremely large. Loading the entire file into memory before processing would lead to high memory consumption and potential performance issues, especially within a VSCode extension. By using `stream-json` to parse `log.entries` incrementally for files exceeding a configurable size threshold (defaulting to 50MB), we can significantly reduce memory footprint and improve the responsiveness of the extension when dealing with large HAR files. Smaller files will still be parsed in their entirety for simplicity and faster initial access.

**Alternatives considered**:
- **Always load entire file**: Leads to poor performance and high memory usage for large files.
- **Implement a custom streaming parser without a library**: Increased development effort for potentially little gain over a robust library like `stream-json`.

## UI Component Library

**Decision**: Use Vite to bootstrap, build, and test the `har-viewer` package.

**Rationale**: Vite provides a fast and lightweight development experience for React projects. It supports TypeScript out-of-the-box and is well-suited for component library development, especially in a monorepo setup. Using Vite for building ensures optimized output, and integrating Vitest (which is built on Vite) provides a seamless and performant testing environment. This approach avoids the complexities and deprecation issues associated with Create React App.

**Alternatives considered**:
- **Create React App**: Deprecated for new projects.
- **Custom webpack config**: This would add unnecessary complexity to the project.

## Extension Build Tool

**Decision**: Use `esbuild` to bundle and minify the `vscode-extension` package.

**Rationale**: `esbuild` is an extremely fast bundler that is well-suited for TypeScript projects. It provides significant performance improvements over the standard TypeScript compiler (`tsc`) for bundling. It can also handle minification without obfuscating the code, which is ideal for producing a smaller extension package size while maintaining debuggability.

**Alternatives considered**:
- **`tsc` (TypeScript Compiler)**: While `tsc` is the default, it is not a bundler and can be slow for larger projects.
- **`webpack`**: Webpack is a powerful and flexible bundler, but it can be complex to configure. `esbuild` provides a simpler and faster alternative for this use case.
- **`swc`**: SWC is another fast bundler written in Rust. It's a viable alternative to `esbuild`, but `esbuild` has slightly more mature tooling and community support in the VSCode extension ecosystem.