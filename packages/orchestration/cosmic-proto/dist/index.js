// Do not export codegen/index.js because it entrains multiple megabytes of module imports.
// Instead we have the top level be relatively conservative, just things that are safe to import into a vat.
// This can include all the types because those are free (never included in a JS bundle).
export * from './codegen/json-safe.js';
export * from './helpers.js';
//# sourceMappingURL=index.js.map