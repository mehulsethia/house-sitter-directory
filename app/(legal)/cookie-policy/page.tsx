import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy — The House Sitter Directory',
  description: 'Cookie Policy for The House Sitter Directory.',
}

export default function CookiePolicyPage() {
  return (
    <div className="bg-white px-6 py-14">
      <article className="prose prose-gray mx-auto max-w-4xl prose-headings:text-gray-900 prose-p:text-gray-700">
        <h1>Cookie Policy</h1>
        <p>Last updated: January 30, 2026</p>

        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a
          website. They are widely used to make websites work more efficiently and provide information to website owners.
        </p>
        <p>
          This Cookie Policy explains how The House Sitter Directory uses cookies and similar tracking technologies on our
          platform.
        </p>

        <h2>Why We Use Cookies</h2>
        <p>We use cookies to:</p>
        <ul>
          <li>Keep you signed in to your account</li>
          <li>Remember your preferences and settings</li>
          <li>Understand how you use our platform</li>
          <li>Improve our services and user experience</li>
          <li>Provide personalized content and recommendations</li>
          <li>Measure the effectiveness of our marketing campaigns</li>
          <li>Detect and prevent fraud and security threats</li>
          <li>Comply with legal and regulatory requirements</li>
        </ul>

        <h2>Types of Cookies We Use</h2>

        <h3>Strictly Necessary Cookies</h3>
        <p>
          These cookies are essential for the platform to function properly. They enable core functionality such as security,
          network management, and accessibility.
        </p>
        <p><strong>Examples:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          <ul className="list-disc space-y-1 pl-5">
            <li>Authentication cookies (keeping you logged in)</li>
            <li>Security cookies (protecting against fraud)</li>
            <li>Load balancing cookies (distributing traffic)</li>
            <li>Session cookies (maintaining your session state)</li>
          </ul>
        </div>

        <h3>Performance and Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our platform by collecting and reporting information
          anonymously.
        </p>
        <p><strong>Examples:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          <ul className="list-disc space-y-1 pl-5">
            <li>Google Analytics (tracking page views and user behavior)</li>
            <li>Performance monitoring (identifying slow pages)</li>
            <li>Error tracking (detecting technical issues)</li>
            <li>A/B testing (comparing different designs)</li>
          </ul>
        </div>

        <h3>Functionality Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our platform by collecting and reporting information
          anonymously.
        </p>
        <p><strong>Examples:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          <ul className="list-disc space-y-1 pl-5">
            <li>Google Analytics (tracking page views and user behavior)</li>
            <li>Performance monitoring (identifying slow pages)</li>
            <li>Error tracking (detecting technical issues)</li>
            <li>A/B testing (comparing different designs)</li>
          </ul>
        </div>

        <h3>Functionality Cookies</h3>
        <p>These cookies enable the platform to remember choices you make and provide enhanced, personalized features.</p>
        <p><strong>Examples:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          <ul className="list-disc space-y-1 pl-5">
            <li>Language preferences</li>
            <li>Search filters and sorting preferences</li>
            <li>Map location and zoom level</li>
            <li>Recently viewed listings</li>
            <li>Dark mode or theme preferences</li>
          </ul>
        </div>
        <p><strong>Customer Support:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">Intercom - for live chat and customer support</div>

        <h3>Targeting and Advertising Cookies</h3>
        <p>
          These cookies are used to deliver advertisements that are relevant to you and your interests. They also help measure
          the effectiveness of advertising campaigns.
        </p>
        <p><strong>Examples:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          <ul className="list-disc space-y-1 pl-5">
            <li>Facebook Pixel (tracking ad conversions)</li>
            <li>Google Ads (displaying relevant advertisements)</li>
            <li>Retargeting cookies (showing ads to previous visitors)</li>
            <li>Social media sharing (enabling content sharing)</li>
          </ul>
        </div>

        <h3>Third-Party Cookies</h3>
        <p>
          In addition to our own cookies, we use third-party services that may set cookies on your device. These third parties
          include:
        </p>

        <p><strong>Analytics Providers:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          <p>Google Analytics - for website usage statistics</p>
          <p className="mt-1">Hotjar - for user behavior analysis and heatmaps</p>
        </div>

        <p><strong>Advertising Partners:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          <p>Google Ads - for targeted advertising</p>
          <p className="mt-1">Facebook - for social media integration and ads</p>
        </div>

        <p><strong>Payment Processors:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">Stripe - for secure payment processing</div>

        <p><strong>Customer Support:</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">Intercom - for live chat and customer support</div>

        <h2>How Long Do Cookies Last?</h2>
        <p>Cookies can be either &quot;session&quot; cookies or &quot;persistent&quot; cookies:</p>

        <p><strong>Session Cookies</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          These are temporary cookies that are deleted when you close your browser. They help us track your actions during a
          single browsing session.
        </div>

        <p><strong>Persistent Cookies</strong></p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          These cookies remain on your device for a set period or until you delete them. They help us recognize you when you
          return to our platform and remember your preferences.
        </div>

        <h2>Managing Your Cookie Preferences</h2>

        <h3>Browser Settings</h3>
        <p>
          Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or
          delete certain cookies. However, please note that if you block or delete cookies, some features of our platform may
          not function properly.
        </p>
        <p>Here&apos;s how to manage cookies in popular browsers:</p>
        <ul>
          <li>Google Chrome: Settings -&gt; Privacy and security -&gt; Cookies and other site data</li>
          <li>Safari: Preferences -&gt; Privacy -&gt; Manage Website Data</li>
          <li>Firefox: Options -&gt; Privacy &amp; Security -&gt; Cookies and Site Data</li>
          <li>Microsoft Edge: Settings -&gt; Cookies and site permissions -&gt; Manage and delete cookies</li>
        </ul>

        <h3>Opt-Out Tools</h3>
        <p>You can also opt out of certain cookies using these tools:</p>
        <ul>
          <li>Google Analytics: Google Analytics Opt-out Browser Add-on</li>
          <li>Advertising cookies: Digital Advertising Alliance Opt-Out</li>
          <li>European users: Your Online Choices</li>
        </ul>

        <h3>Mobile Device Settings</h3>
        <p>On mobile devices, you can manage cookies and tracking in your device settings:</p>
        <ul>
          <li>iOS: Settings -&gt; Safari -&gt; Block All Cookies</li>
          <li>Android: Settings -&gt; Site settings -&gt; Cookies</li>
        </ul>

        <h2>Do Not Track Signals</h2>
        <p>
          Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals to websites that you do not want your online activity
          tracked. Currently, there is no industry standard for how to respond to DNT signals, so our platform does not
          currently respond to DNT browser settings.
        </p>

        <h2>Changes to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or
          regulatory reasons. We will notify you of any material changes by posting the updated policy on this page with a new
          &quot;Last updated&quot; date.
        </p>

        <h2>More Information</h2>
        <p>
          For more information about how we collect, use, and protect your personal information, please see our{' '}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>

        <h2>Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <div className="not-prose rounded-md bg-[#f6f4f2] p-4 text-sm text-[#555]">
          <p><strong>Email:</strong> Contact@thehousesitterdirectory.com</p>
          <p className="mt-1"><strong>Address:</strong> The House Sitter Directory, 123 Trust Lane, Safety City, SC 12345</p>
          <p className="mt-1"><strong>Phone:</strong> +1 (555) 123-4567</p>
        </div>

        <p>
          By continuing to use The House Sitter Directory, you consent to our use of cookies as described in this Cookie
          Policy.
        </p>
      </article>
    </div>
  )
}
