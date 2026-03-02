export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-medium mb-8">Privacy Policy</h1>
      <p className="text-foreground/60 text-sm mb-8">Last updated: March 1, 2026</p>

      <div className="space-y-6 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-xl font-medium text-foreground mb-2">1. Information We Collect</h2>
          <p>
            When you sign up for Bloxsmith, we collect your email address and, if you use OAuth
            sign-in (Discord, GitHub, or Roblox), your username, display name, and avatar URL from
            that provider. We also collect usage data related to your generations and account balance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground mb-2">2. How We Use Your Information</h2>
          <p>
            We use your information to provide and maintain the Bloxsmith service, process
            transactions, and communicate with you about your account. We do not sell your personal
            information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground mb-2">3. Data Storage</h2>
          <p>
            Your data is stored securely using Supabase infrastructure. Authentication tokens are
            stored locally in your browser. We retain your data for as long as your account is active.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground mb-2">4. Roblox Account Access</h2>
          <p>
            If you connect your Roblox account via OAuth, we request permission to read and upload
            assets on your behalf. We use this access solely to upload AI-generated images (such as
            icons and textures) to your Roblox inventory so they can be referenced in generated UIs.
            We do not read, modify, or delete your existing Roblox assets. We do not access your
            Roblox experiences, groups, or any data beyond what is required to upload generated assets.
            You can revoke this access at any time from your Roblox account settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground mb-2">5. Third-Party Services</h2>
          <p>
            We use Supabase for authentication and data storage, Vercel for hosting, and Stripe for
            payment processing. Each of these services has their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground mb-2">6. Your Rights</h2>
          <p>
            You may request deletion of your account and associated data at any time by contacting us.
            You can also update your email and profile information from your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium text-foreground mb-2">7. Contact</h2>
          <p>
            If you have questions about this privacy policy, please reach out via our GitHub
            repository or contact us at the email associated with our domain.
          </p>
        </section>
      </div>
    </main>
  )
}
