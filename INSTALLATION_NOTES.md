# Installation Notes

## Required Dependencies

Before running the application, you need to install the following dependencies:

### Frontend Dependencies

```bash
cd /Users/jino/Downloads/pest-i
npm install zod @hookform/resolvers
```

**Why these packages?**

- `zod`: Schema validation library for TypeScript
- `@hookform/resolvers`: Resolvers for react-hook-form to integrate with zod

### Backend Dependencies (Optional - for rate limiting)

```bash
cd /Users/jino/Downloads/pest-i/server
npm install express-rate-limit
```

**Why this package?**

- `express-rate-limit`: Prevents brute force attacks on authentication endpoints

---

## After Installation

Once dependencies are installed, the following features will be enabled:

1. **Form Validation** - Login and registration forms now use zod validation
2. **Rate Limiting** - Auth endpoints protected from brute force (if installed)

---

## Verification

After installing dependencies, verify the installation:

```bash
# Check frontend dependencies
npm list zod @hookform/resolvers

# Check backend dependencies (if installed)
cd server && npm list express-rate-limit
```
