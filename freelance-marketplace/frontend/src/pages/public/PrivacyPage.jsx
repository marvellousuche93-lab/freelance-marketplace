/**
 * PrivacyPage — placeholder privacy policy.
 *
 * TODO: replace with a real privacy policy before production. Review
 * with a lawyer to comply with GDPR/CCPA where applicable.
 */

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 prose prose-slate dark:prose-invert">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-xl font-semibold mb-2">What we collect</h2>
          <p>
            Account information you provide (username, email, name, bio,
            profile picture, portfolio content). Usage data such as
            requests, timestamps, and IP address. This is placeholder text
            and must be replaced with a real privacy policy before launch.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">How we use it</h2>
          <p>
            To operate the marketplace: authenticate you, show your
            profile to other users, deliver notifications and messages,
            and keep the platform safe.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Sharing</h2>
          <p>
            We do not sell your data. We share information only as needed
            to run the service (for example, hosting providers) or when
            required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Your rights</h2>
          <p>
            You can access, update, or delete your account information
            from your settings page. To request a copy of your data or
            full deletion, contact support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Security</h2>
          <p>
            We take reasonable measures to protect your data. No system
            is perfectly secure; use a strong password and keep it
            private.
          </p>
        </section>
      </div>
    </div>
  );
}