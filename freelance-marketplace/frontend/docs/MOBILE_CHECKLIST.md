# Mobile Checklist

Run through the app at each width. Verify items below.

## 320 px (iPhone SE)

- [ ] Navbar: logo compact, bell + theme + hamburger visible, no overflow
- [ ] Hamburger opens the mobile nav; all links present; tap targets ≥ 44 px
- [ ] Home hero: heading wraps, search bar fits, button shows icon only
- [ ] Categories grid: 2 columns
- [ ] Job cards: full width, no clipping
- [ ] `/jobs`: search + sort + filters stack vertically
- [ ] Filters toggle opens inline card; scrolls into view
- [ ] Job detail: sidebar first (Apply, Save, Message), then description
- [ ] `/freelancers`: cards stack; "Message" full width
- [ ] Freelancer detail: header compact, message button full width
- [ ] Login/Register: single column, inputs at least 44 px
- [ ] Dashboard: sidebar is a drawer; hamburger in topbar
- [ ] Messages: single pane; back arrow appears
- [ ] Notifications: bell dropdown fits within viewport
- [ ] Modal (e.g. delete): full-width panel, body scrolls
- [ ] No horizontal scroll anywhere

## 375 px (iPhone 12/13/14)

- [ ] Same as 320, with more breathing room
- [ ] Navbar "Log in" / "Sign up" appear (sm breakpoint)

## 414 px (iPhone Plus / Max)

- [ ] Same as 375

## 768 px (iPad portrait)

- [ ] Navbar full nav visible; hamburger gone
- [ ] Dashboard sidebar visible (not a drawer)
- [ ] Jobs two-column layout not yet active (lg breakpoint is 1024)
- [ ] Messaging two-pane visible

## 1024 px (small laptop)

- [ ] Jobs two-column (filters left, results right)
- [ ] Job detail two-column (main + sidebar)
- [ ] Dashboard sidebar persistent

## 1440 px (laptop)

- [ ] Layout stays within max-w-6xl
- [ ] Content is centered, not stretched