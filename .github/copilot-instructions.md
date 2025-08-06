# HiveClient Copilot Instructions

## Project Overview
TypeScript Node.js library for communicating with the British Gas Hive API. Uses Amazon Cognito SRP authentication and provides a clean interface for accessing Hive home automation devices.

## Architecture Pattern
- **Service Layer**: `src/services/beekeeper.ts` - Main API facade implementing `IBeekeeper` interface
- **Repository Pattern**: `src/repositories/productRepository.ts` - Handles API calls and authentication
- **Domain Models**: `src/models/` - `Product`, `ThermostaticRadiatorValve` with factory methods
- **Result Pattern**: All async operations return `Result<T>` wrapper with success/failure states

## Key Conventions

### ES Modules with `.js` Extensions
All imports use `.js` extensions even for TypeScript files:
```typescript
import { Result } from '../utils/result.js';
import productRepository from '../repositories/productRepository.js';
```

### Result Pattern Usage
Never throw exceptions - always return `Result<T>`:
```typescript
public async getTRVs(): Promise<Result<ThermostaticRadiatorValve[]>> {
    const products = await productRepository.getByType("trvcontrol");
    if (products.success) {
        return Result.Succeeded(trvs);
    }
    return Result.Failed({
        errorMessage: "Error: Unable to get TRVs",
        errorType: "InvalidTRVConversion"
    });
}
```

### Factory Pattern for Models
Models use static `create()` methods with validation:
```typescript
public static create(props: ProductDefinition): Result<ProductDefinition> {
    if (!props.id) {
        return Result.Failed({
            errorMessage: "Error: id cannot be null or empty.",
            errorType: "ValidationError"
        });
    }
    return Result.Succeeded(new Product(props));
}
```

## Authentication Flow
Uses Amazon Cognito SRP with MFA support:
1. `hiveSRPclient.loginWithMFA()` handles SRP challenge/response 
2. Interactive MFA prompt via `getMFACode()` in terminal
3. Returns `AuthenticationResult` with tokens for API calls
4. Repository layer automatically handles auth for all requests

## Development Workflow

### Build & Test
```bash
npm run build          # TypeScript compilation
npm run e2e-test       # Run integration test
```

### Environment Setup
Requires `.env` file with:
```
HIVE_USERNAME=your_email
HIVE_PASSWORD=your_password
```

### Key Entry Points
- **Main Export**: `dist/src/services/beekeeper.js` (built from `src/services/beekeeper.ts`)
- **Test Runner**: `test/index.ts` - Demonstrates all API operations
- **Type Definitions**: Custom `amazon-user-pool-srp-client.d.ts` for missing npm package types

## API Patterns
- Device types: `"trvcontrol"`, `"heating"`, `"hotwater"`
- All API calls go through single `productRepository` instance
- Base URL: `https://beekeeper-uk.hivehome.com/1.0/`
- Authorization header format: `${idToken}` (no "Bearer" prefix)

## Common Tasks
- Adding new device types: Extend `getByType()` options and create model in `src/models/`
- API endpoints: Add methods to `ProductRepository` and expose via `Beekeeper` service
- Error handling: Always use `Result.Failed()` with `errorMessage` and `errorType`
