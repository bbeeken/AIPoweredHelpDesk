# Front-End Changelog

## [2025-07-12] React dashboard and analytics page
- Replaced static HTML dashboard with a React application served by Express.
- Added routing with React Router and a new analytics page powered by Chart.js.
- Ticket tables now update in real time via Server-Sent Events.

## [2025-07-16] Improved accessibility of public pages
- Added responsive viewport meta tag and semantic markup in `index.html` and `chat.html`.
- Introduced ARIA live regions for dynamic content and provided a visually hidden label for the chat input field.
- These updates make the demo UI easier to navigate with assistive technologies.

## [2025-07-17] Consolidated styling and improved responsiveness
- Extracted shared CSS into `public/styles.css` for use across pages.
- Added mobile-friendly input sizing and navigation link from chat page back to the dashboard.
- Clean markup and unified appearance make the demo easier to maintain and use on small screens.



## [2025-07-18] Added skip link for accessibility
- Introduced a hidden "Skip to content" link that appears when focused.
- Added `id="main"` to main sections and styles in `styles.css`.
- Keyboard users can now jump directly to page content.


## [2025-07-19] Improved focus visibility
- Added high-contrast outlines for links, buttons and inputs when focused.
- Helps keyboard users track their position while navigating the demo pages.

## [2025-07-20] Added Prettier formatting command
- Introduced `npm run format` script using Prettier for JS, JSON and Markdown files.

## [2025-07-21] Fixed CSS focus styles
- Closed unbalanced rule in `styles.css` and removed duplicate skip link declarations.
- Ensures focus outlines and skip link display correctly across pages.


## [2025-07-22] Added voice input and offline caching
- Implemented microphone button on `chat.html` using the Web Speech API.
- Introduced search suggestions and service worker registration in `index.html`.
- Added `public/sw.js` to cache static files for offline use.

## [2025-07-23] Service worker tweaks
- Removed duplicate service worker registration scripts from HTML pages.
- Cached `manifest.json` for offline support.

## [2025-07-24] Added user profile page
- Introduced `UserProfile.tsx` reachable at `/users/:id` displaying tickets and assets for the selected user.
- Navigation menu now links to the profile page.
