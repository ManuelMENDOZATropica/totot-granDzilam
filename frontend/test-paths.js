const Module = require('module');
const path = require('path');

const baseDir = path.join(__dirname, 'dist-tests');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const resolved = path.join(baseDir, request.slice(2));
    return originalResolveFilename.call(this, resolved, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
