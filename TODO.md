# Mobile Responsiveness Fix TODO

## Plan Steps (Approved)
- [ ] 1. Add Bootstrap CSS to index.html
- [ ] 2. Update src/App.css with XR-specific tweaks (414px)
- [ ] 3. Refactor Sidebar.jsx inline styles to responsive classes
- [ ] 4. Refactor Navbar.jsx inline styles to responsive classes
- [ ] 5. Test with `npm run dev` (check iPhone XR viewport 414x896)
- [ ] 6. Audit Dashboard.jsx/Transfer.jsx if issues persist
- [ ] 7. Complete

## Completed:
- [x] 1. Add Bootstrap CSS to index.html
- [x] 2. Update src/App.css with XR-specific tweaks (414px)

## Completed:
- [x] 1. Add Bootstrap CSS to index.html
- [x] 2. Update src/App.css with XR-specific tweaks (414px)
- [x] 3. Refactor Sidebar.jsx inline styles to responsive classes
- [x] 4. Refactor Navbar.jsx inline styles to responsive classes

Mobile responsiveness fixed. Dev server running at http://localhost:5173. Test in browser devtools (iPhone XR viewport). Layouts scale from 320px+, sidebar collapses on mobile, avatars/paddings adaptive via clamp(). Task complete.
