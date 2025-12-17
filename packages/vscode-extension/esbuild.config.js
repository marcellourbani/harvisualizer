const esbuild = require("esbuild");
const path = require("path");

const isWatch = process.argv.includes("--watch");

// Custom plugin to resolve 'har-viewer' to its bundled output


const harViewerResolvePlugin = {
  name: "har-viewer-resolve",
  setup(build) {
    build.onResolve({ filter: /^har-viewer$/ }, args => {
      // Resolve to source directly to share dependencies and avoid bundling issues
      return { path: path.resolve(__dirname, '../har-viewer/src/HarViewer.tsx') };
    });
    // Also redirect the CSS import to source
    build.onResolve({ filter: /^har-viewer\/dist\/har-viewer\.css$/ }, args => {
      return { path: path.resolve(__dirname, '../har-viewer/src/HarViewer.css') };
    });
  },
};

async function build() {
  try {
    // ESBuild context for the main extension
    const extensionContext = await esbuild.context({
      entryPoints: [path.join(__dirname, "src/extension.ts")],
      bundle: true,
      minify: false, // Minify for production builds
      platform: "node",
      outfile: path.join(__dirname, "out/extension.js"),
      sourcemap: true,
      external: ["vscode"], // The 'vscode' module is provided by VS Code, so it must be excluded
      logLevel: "info",
    });

    // ESBuild context for the webview
    const webviewContext = await esbuild.context({
      entryPoints: [path.join(__dirname, "src/webview/main.tsx")],
      bundle: true,
      minify: false, // Minify for production builds
      platform: "browser",
      outfile: path.join(__dirname, "out/webview.js"),
      sourcemap: true,
      external: ["vscode"],
      logLevel: "info",
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      jsx: "automatic", // Ensure JSX is transformed automatically for React 17+
      plugins: [
        harViewerResolvePlugin,
        {
          name: 'react-alias',
          setup(build) {
            // Exact match for 'react'
            build.onResolve({ filter: /^react$/ }, args => {
              return { path: require.resolve('react') };
            });
            // Subpaths for 'react/' (e.g. react/jsx-runtime)
            build.onResolve({ filter: /^react\/.+/ }, args => {
              return { path: require.resolve(args.path) };
            });
            // Exact match for 'react-dom'
            build.onResolve({ filter: /^react-dom$/ }, args => {
              return { path: require.resolve('react-dom') };
            });
            // Subpaths for 'react-dom/' (e.g. react-dom/client)
            build.onResolve({ filter: /^react-dom\/.+/ }, args => {
              return { path: require.resolve(args.path) };
            });
          }
        }
      ],
    });

    if (isWatch) {
      await extensionContext.watch();
      await webviewContext.watch();
      console.log("[esbuild] Watching for changes...");
    } else {
      await extensionContext.rebuild();
      await webviewContext.rebuild();
      await extensionContext.dispose();
      await webviewContext.dispose();
      console.log("[esbuild] Build complete.");
    }
  } catch (error) {
    console.error("[esbuild] Build failed:", error);
    process.exit(1);
  }
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
