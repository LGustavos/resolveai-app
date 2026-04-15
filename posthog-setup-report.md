<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the eufaço! Next.js App Router application. PostHog is initialized client-side via `instrumentation-client.ts` (Next.js 15.3+ pattern), with a reverse proxy configured in `next.config.ts` to route events through `/ingest`. A shared server-side client (`src/lib/posthog-server.ts`) powers event capture in Server Actions. Exception tracking is enabled globally via `capture_exceptions: true`.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | Fired when a user successfully completes registration | `src/app/(auth)/register/page.tsx` |
| `user_logged_in` | Fired when a user signs in via email/password | `src/lib/supabase/actions.ts` |
| `whatsapp_contact_clicked` | Fired when a logged-in user clicks the WhatsApp CTA | `src/components/providers/provider-detail.tsx` |
| `review_submitted` | Fired when a client successfully submits a review | `src/components/reviews/review-form.tsx` |
| `provider_favorited` | Fired when a user adds a provider to favorites | `src/components/providers/favorite-button.tsx` |
| `provider_unfavorited` | Fired when a user removes a provider from favorites | `src/components/providers/favorite-button.tsx` |
| `become_provider_submitted` | Fired when a client successfully upgrades to provider | `src/components/providers/become-provider-form.tsx` |
| `account_deleted` | Fired when a user successfully deletes their account | `src/app/(main)/profile/delete/actions.ts` |
| `provider_profile_shared` | Fired when a user shares a provider profile | `src/components/providers/provider-detail.tsx` |
| `provider_profile_viewed` | Fired on the server when a provider profile page is viewed | `src/app/(main)/provider/[id]/actions.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/383647/dashboard/1472313
- **Signups & Logins Over Time**: https://us.posthog.com/project/383647/insights/EloXo8dZ
- **Provider Contact Funnel** (profile view → WhatsApp click): https://us.posthog.com/project/383647/insights/4YsPnxRc
- **Provider Acquisition Funnel** (signup → become provider): https://us.posthog.com/project/383647/insights/qeayJ9YM
- **Engagement Events Over Time** (reviews, favorites, shares): https://us.posthog.com/project/383647/insights/6OXpk2BQ
- **Account Deletions Over Time**: https://us.posthog.com/project/383647/insights/4VuDc9Zz

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
