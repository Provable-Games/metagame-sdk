# Metagame SDK Logging Configuration

The Metagame SDK now includes a configurable logging system that allows you to control console output from the SDK.

## Configuration

By default, logging is **disabled**. You can enable it and configure the logging level when initializing the SDK:

```typescript
import { initMetagame } from 'metagame-sdk';

// Initialize with logging disabled (default)
const client = await initMetagame({
  toriiUrl: 'https://api.denshokan.online/mainnet/torii/graphql',
  // ... other config
});

// Initialize with logging enabled at error level only
const client = await initMetagame({
  toriiUrl: 'https://api.denshokan.online/mainnet/torii/graphql',
  logging: {
    enabled: true,
    level: 'error'  // Only show errors
  }
});

// Initialize with verbose logging for development
const client = await initMetagame({
  toriiUrl: 'https://api.denshokan.online/mainnet/torii/graphql',
  logging: {
    enabled: true,
    level: 'debug'  // Show all logs including debug
  }
});
```

## Logging Levels

The SDK supports the following logging levels (from most to least verbose):

- `'debug'` - All logs including detailed debug information
- `'info'` - Informational messages and above
- `'warn'` - Warnings and errors only
- `'error'` - Errors only
- `'none'` - No logging (equivalent to `enabled: false`)

## Examples

### Production Configuration (Recommended)
```typescript
const client = await initMetagame({
  toriiUrl: 'https://api.denshokan.online/mainnet/torii/graphql',
  // Logging disabled by default - no console output
});
```

### Development Configuration
```typescript
const client = await initMetagame({
  toriiUrl: 'https://api.denshokan.online/mainnet/torii/graphql',
  logging: {
    enabled: true,
    level: 'debug'  // See all SDK activity
  }
});
```

### Error Monitoring Only
```typescript
const client = await initMetagame({
  toriiUrl: 'https://api.denshokan.online/mainnet/torii/graphql',
  logging: {
    enabled: true,
    level: 'error'  // Only see errors
  }
});
```

## Log Output Format

When enabled, logs are prefixed with `[Metagame SDK]` for easy identification:

```
[Metagame SDK] Config changed, reinitializing SDK
[Metagame SDK] gameTokensStore: initializeStore called with 150 entities
[Metagame SDK] Error: Failed to fetch data
```

## Notes

- The logging configuration applies globally to the SDK instance
- Generated contract files (in `src/shared/generated/`) retain their console.error statements as they represent critical contract errors
- Example applications are not affected by SDK logging configuration - they can have their own console logs