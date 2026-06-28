// Default Expo Metro config, plus a resolver shim.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @supabase/supabase-js lazily imports the optional `@opentelemetry/api`
// telemetry package. We don't ship it, so resolve it to an empty module
// instead of letting Metro fail on the missing dependency.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@opentelemetry/api') {
    return { type: 'empty' };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
