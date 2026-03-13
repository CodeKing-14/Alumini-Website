# TODO: Fix bcrypt password length limit

- [x] Step 1: Review frontend password input (api.ts, Login.tsx)
- [x] Step 2: Update backend/routers/auth.py to truncate password to 72 bytes before hashing
- [x] Step 3: Add password validation in schemas.py (e.g., max_length=72)
- [x] Step 4: Test registration with long password (backend restarted, test via frontend Login.tsx register with >72 byte password)
- [x] Step 5: Mark complete

