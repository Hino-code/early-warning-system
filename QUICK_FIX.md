# Quick Fix for Missing Dependencies

## Problem

The site won't start because `zod` and `@hookform/resolvers` packages are not installed.

## Solution

### Install Packages (Required)

**The site needs these packages to run properly.** Run this command in your terminal:

```bash
cd /Users/jino/Downloads/pest-i
npm install zod @hookform/resolvers
```

**If you get permission errors**, try one of these:

```bash
# Option 1: Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm
npm install zod @hookform/resolvers

# Option 2: Use npm with different cache location
npm install zod @hookform/resolvers --cache /tmp/.npm

# Option 3: Clear npm cache and retry
npm cache clean --force
npm install zod @hookform/resolvers
```

## Current Status

⚠️ **Site will not start until packages are installed**  
✅ Code is ready - just needs dependencies  
✅ All other features will work once packages are installed

## After Installing Packages

Once you install the packages, the form validation will automatically work. The forms will:

- ✅ Validate email format
- ✅ Check password strength (min 8 chars, uppercase, lowercase, number)
- ✅ Show helpful error messages
- ✅ Prevent invalid submissions

## What I've Done

I've created wrapper files that will gracefully handle missing packages:

- `src/shared/lib/zod-resolver-wrapper.ts` - Handles zodResolver import
- `src/shared/lib/validation-schemas.ts` - Provides fallback schemas

However, **Vite still needs the packages to be installed** for the imports to resolve at build time.
