import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — The House Sitter Directory',
  description: 'Terms of Service for The House Sitter Directory.',
}

export default function TermsOfServicePage() {
  return (
    <>
      <div className="bg-gray-950 px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: 1 May 2026</p>
        </div>
      </div>

      <div className="bg-white px-6 py-16">
        <article className="prose prose-gray mx-auto max-w-4xl prose-headings:text-gray-900 prose-p:text-gray-700">
          <h2>1. Agreement to Terms</h2>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and The House Sitter
            Directory (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) governing your access to and use of our platform.
          </p>
          <p>
            By accessing or using our platform, you confirm that you have read, understood, and agree to be bound by these
            Terms. If you do not agree, you must not use our services.
          </p>

          <h2>2. Eligibility</h2>
          <p>To use our platform, you must:</p>
          <ul>
            <li>Be at least 18 years old</li>
            <li>Have the legal capacity to enter into a binding agreement</li>
            <li>Not be prohibited from using our services under applicable law</li>
            <li>Provide accurate and complete information at all times</li>
            <li>Maintain the security of your account credentials</li>
          </ul>

          <h2>3. User Accounts</h2>
          <h3>Account Registration</h3>
          <p>
            You must provide accurate, current, and complete information when creating an account. You are responsible for all
            activity under your account and for keeping your login details secure.
          </p>

          <h3>Account Types</h3>
          <ul>
            <li>House Sitters: Individuals seeking house sitting opportunities</li>
            <li>Homeowners: individuals listing properties for house sitting</li>
          </ul>

          <h3>Account Suspension and Termination</h3>
          <p>We may suspend or terminate your account at any time if:</p>
          <ul>
            <li>You breach these Terms</li>
            <li>You provide false or misleading information</li>
            <li>Your conduct poses a risk to other users or the platform</li>
          </ul>

          <h2>4. Platform Role</h2>
          <p>The House Sitter Directory is a platform that connects homeowners and house sitters.</p>
          <p>We do not:</p>
          <ul>
            <li>Act as an agent for any user</li>
            <li>Participate in or manage agreements between users</li>
            <li>Guarantee the conduct, performance, or suitability of any user</li>
          </ul>
          <p>
            All arrangements are made directly between homeowners and house sitters. Users are solely responsible for their
            decisions, interactions, and agreements.
          </p>

          <h2>5. Platform Services</h2>
          <h3>For Homeowners</h3>
          <ul>
            <li>Create and publish house sitting listings</li>
            <li>Review sitter profiles and applications</li>
            <li>Communicate with sitters</li>
            <li>Leave reviews and ratings</li>
          </ul>

          <h3>For House Sitters</h3>
          <ul>
            <li>Create and manage a sitter profile</li>
            <li>Browse and apply for house sits</li>
            <li>Communicate with homeowners</li>
            <li>Leave reviews and ratings</li>
          </ul>

          <h2>6. Verification and Background Checks</h2>
          <p>We may offer verification services, including identity checks and background checks.</p>
          <p>These are provided for guidance only.</p>
          <p>We do not:</p>
          <ul>
            <li>Guarantee the accuracy or completeness of verification results</li>
            <li>Endorse or certify any user</li>
          </ul>
          <p>
            Verification badges are indicators only and should not be relied upon as a substitute for your own due diligence.
            Users are responsible for carrying out their own checks before entering into any arrangement.
          </p>

          <h2>7. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Provide false or misleading information</li>
            <li>Impersonate any person or entity</li>
            <li>Use the platform for unlawful purposes</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Circumvent platform fees or processes</li>
            <li>Use automated tools (e.g. bots, scraping)</li>
            <li>Interfere with the platform&rsquo;s operation</li>
          </ul>
          <p>
            We reserve the right to take appropriate action, including account suspension or removal, where necessary.
          </p>

          <h2>8. Payments and Subscriptions</h2>
          <p>Access to the platform requires a paid subscription.</p>

          <h3>Payment Terms</h3>
          <ul>
            <li>Payment must be completed before access to the platform is granted</li>
            <li>Subscriptions renew automatically unless cancelled</li>
            <li>You may cancel at any time via your account settings</li>
            <li>Cancellation takes effect at the end of the current billing period</li>
            <li>No refunds are provided for partial periods</li>
          </ul>
          <p>We may update pricing with reasonable notice.</p>

          <h3>Payment Processing</h3>
          <p>
            All payments are processed securely via third-party providers. We do not store full payment card details.
          </p>

          <h2>9. Reviews and Content</h2>
          <p>Users may leave reviews and upload content to the platform.</p>
          <p>You agree that:</p>
          <ul>
            <li>Content must be accurate and not misleading</li>
            <li>You will not post offensive, defamatory, or unlawful material</li>
            <li>We may remove content at our discretion</li>
          </ul>

          <h2>10. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law:</p>
          <ul>
            <li>We are not responsible for any loss, damage, or disputes arising between users</li>
            <li>
              We do not accept liability for property damage, personal injury, or financial loss resulting from house sitting
              arrangements
            </li>
            <li>We do not guarantee the availability, reliability, or performance of the platform</li>
          </ul>
          <p>Nothing in these Terms limits liability where it cannot legally be excluded.</p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless The House Sitter Directory from any claims, damages, or expenses arising
            from:
          </p>
          <ul>
            <li>Your use of the platform</li>
            <li>Your breach of these Terms</li>
            <li>Any agreements or interactions with other users</li>
          </ul>

          <h2>12. Governing Law</h2>
          <p>These Terms are governed by the laws of England and Wales.</p>
          <p>
            Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of
            England and Wales.
          </p>

          <h2>13. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Where changes are material, we will notify users via email or platform
            notice.
          </p>
          <p>Continued use of the platform constitutes acceptance of the updated Terms.</p>

          <h2>14. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us:</p>
          <p>Email: support@housesitterdirectory.com</p>

          <p>
            By using The House Sitter Directory, you acknowledge that you have read, understood, and agree to be bound by these
            Terms of Service.
          </p>
        </article>
      </div>
    </>
  )
}
