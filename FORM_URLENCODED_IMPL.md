## Form-URLEncoded Support Implementation - Complete

### Changes Made

#### 1. New Utility: `src/utils/body-parser.ts`
- Created `parseBody(text, contentType)` function that automatically detects and parses:
  - `application/x-www-form-urlencoded` → Uses `URLSearchParams` for automatic URL decoding
  - `application/json` → Uses `JSON.parse()` (existing behavior)
  - Defaults to JSON if no Content-Type header is provided
- Handles empty bodies gracefully, returning empty objects
- Strips charset parameters from Content-Type header

#### 2. Updated Router: `src/core/router.ts`
- Added import: `import { parseBody } from '../utils/body-parser'`
- Modified body parsing logic (lines 169-171):
  - Passes `contentType` header to `parseBody()` utility
  - Maintains existing caching via `context._parsedBody`
  - Zod validation works identically for both formats

#### 3. Comprehensive Tests: `src/__tests__/router.test.ts`
- Added `FormUrlController` with two endpoints:
  - `POST /form` - Basic form parsing
  - `POST /form/validated` - Form parsing with Zod validation
- Added test suite covering:
  - ✓ Simple form-urlencoded parsing
  - ✓ URL-encoded special characters (@, spaces, etc.)
  - ✓ Form-urlencoded with charset parameter
  - ✓ Empty form body handling
  - ✓ Zod validation with form data
  - ✓ Validation failure error handling

### Key Design Decisions

1. **Content-Type Detection**: Extracts media type and ignores charset/parameters
2. **Default Behavior**: Assumes JSON when Content-Type header is missing (backward compatible)
3. **URLSearchParams**: Built-in, no external dependencies needed
4. **Duplicate Keys**: Last value wins (standard URLSearchParams behavior)
5. **Backward Compatible**: All existing JSON tests remain unchanged and passing

### Usage Example

```typescript
// Form submission automatically parsed
@Post('/signup')
register(@Body(UserSchema) data: any) {
  // `data` is parsed from form-urlencoded with type safety
  return { userId: data.id }
}
```

**Client-side usage remains unchanged** - the decorator handles content-type negotiation transparently.
