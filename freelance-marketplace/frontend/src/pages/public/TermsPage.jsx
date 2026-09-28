/**
 * TermsPage — placeholder terms of service.
 *
 * TODO: replace with real, lawyer-reviewed terms before production.
 */

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14 prose prose-slate dark:prose-invert">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="mt-8 space-y-6 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of terms</h2>
          <p>
            By accessing or using this marketplace you agree to be bound by
            these terms. If you do not agree, do not use the platform.
            This is placeholder text and must be replaced with properly
            drafted terms before any public launch.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Accounts</h2>
          <p>
            You are responsible for the accuracy of the information in your
            account, the security of your credentials, and any activity
            that occurs under your account. You must be old enough to enter
            into a binding contract in your jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Acceptable use</h2>
          <p>
            Do not use the platform to harass, defraud, spam, or violate
            the law. We may suspend or terminate accounts that violate
            these rules.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Content</h2>
          <p>
            You retain ownership of the content you post. By posting, you
            grant us a license to display that content as part of the
            service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Payments</h2>
          <p>
            Payments between users are handled outside the platform.
            We do not process, hold, or guarantee any payments between
            users. Any disputes are between the parties involved.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Disclaimers</h2>
          <p>
            The platform is provided "as is" and "as available", without
            warranties of any kind, express or implied.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">7. Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of
            the platform after changes constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  );
}