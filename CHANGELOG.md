# Changelog

All notable changes to this project will be documented in this file.

## [v1.0.0] - 2026-02-14

### Added
- **Fail-Safe Auth Flow**: Implemented robust user signup logic that handles edge cases and prevents lockouts.
- **Partner Invite System**: Secure, invitation-based registration with temporary passwords and SMTP email delivery.
- **Fail-Safe Trigger**: `on_auth_user_created` trigger ensures database consistency even if initial steps fail.
- **Consolidated Schema**: A single, authoritative `supabase/schema.sql` file for easier deployment.
- **Mobile Optimizations**: Improved responsive design, including a fixed demo banner on mobile devices.
- **Password Visibility**: Added "Show Password" toggles to Login, Sign Up, and Partner Register forms.
- **Social Sharing**: Implementation of Open Graph tags and a custom social preview image.
- **Data Persistence**: Fixed "Start Journey" state persistence to ensure seamless partner onboarding.
- **Shared Links**: Secure, time-limited public sharing capability.
- **Cleanup Scripts**: `lockdown_and_cleanup.sql` for easy database resetting.

### Changed
- **Database Architecture**: Unified multiple migration files into `schema.sql`.
- **UI Improvements**: Refined dashboard layout, buttons, and typography for a premium feel.
- **Environment**: Updated `.env.local` to point to production URLs for invites.

### Fixed
- **Invite Logic**: Resolved 401 Unauthorized errors in invite emails by managing `Authorization` headers explicitly.
- **Demo Mode**: Fixed mobile layout issues with the demo banner.
- **Asset Management**: Removed unused generated assets and standardized on high-quality JPEG for social previews.
