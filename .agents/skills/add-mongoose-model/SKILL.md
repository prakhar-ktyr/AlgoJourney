---
name: Add Mongoose Model
description: How to create a new Mongoose model with barrel export, enum sync, and validation tests
---

# Adding a New Mongoose Model

Follow every step — a task is not complete until all steps are done.

## Steps

1. **Create `server/models/<Name>.js`**:
   - One schema per file, ESM syntax
   - Export the model as default
   - Export any domain enums (e.g. `const STATUSES = [...]`) as named exports alongside the model
   - Reference pattern: `server/models/User.js`, `server/models/Tutorial.js`

2. **Re-export from the barrel** in `server/models/index.js`:

   ```js
   export { default as <Name>, <ENUM_NAME> } from "./<Name>.js";
   ```

3. **Sync client-side enums** if the model defines categories/topics that the client also uses:
   - Check `client/src/data/topics.js` — does it mirror the new enum?
   - If yes, update `topics.js` to include the new values
   - Client and server enums must stay in sync

4. **Create `server/__tests__/<name>.model.test.js`**:
   - Test required-field validation (expect `ValidationError` when required fields are missing)
   - Test enum validation (invalid values should be rejected)
   - Test default values
   - Test any virtual fields or instance methods
   - Reference pattern: `server/__tests__/user.model.test.js`

5. **Update `docs/architecture/database.md`** with the new schema: fields, types, constraints, relationships.

6. **Run verification**:
   ```bash
   npm run test:server
   ```

## Constraints

- ESM only — no `require()`, include `.js` on relative imports
- Always re-export from the barrel (`models/index.js`) — consumers import from the barrel, not individual files
- Domain enums live alongside the model, not in separate files
