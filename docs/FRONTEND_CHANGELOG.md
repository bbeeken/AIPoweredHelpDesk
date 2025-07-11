# Front-End Changelog

## [2025-07-16] Improved accessibility of public pages
- Added responsive viewport meta tag and semantic markup in `index.html` and `chat.html`.
- Introduced ARIA live regions for dynamic content and provided a visually hidden label for the chat input field.
- These updates make the demo UI easier to navigate with assistive technologies.

## [2025-07-17] Consolidated styling and improved responsiveness
- Extracted shared CSS into `public/styles.css` for use across pages.
- Added mobile-friendly input sizing and navigation link from chat page back to the dashboard.
- Clean markup and unified appearance make the demo easier to maintain and use on small screens.

## [2025-07-18] Added skip navigation link
- Inserted a keyboard-accessible "Skip to main content" link on all pages.
- Provided CSS to reveal the link when focused.
- Improves navigation efficiency for screen reader and keyboard users.
