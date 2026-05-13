import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — The House Sitter Directory',
  description: 'Privacy Policy for The House Sitter Directory.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="bg-gray-950 px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: 1 May 2026</p>
        </div>
      </div>

      <div className="bg-white px-6 py-16">
        <article className="prose prose-gray mx-auto max-w-4xl prose-headings:text-gray-900 prose-p:text-gray-700">
          <h2>1. Introduction</h2>
          <p>
            The House Sitter Directory (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your personal
            information and respecting your privacy.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, and safeguard your information when you use our platform,
            in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
          <p>By using The House Sitter Directory, you agree to the practices described in this policy.</p>

          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>We collect personal information that you provide when you:</p>
          <ul>
            <li>Create an account</li>
            <li>Build a sitter or homeowner profile</li>
            <li>Post or apply for a house sit</li>
            <li>Communicate with other users</li>
            <li>Contact our support team</li>
          </ul>
          <p>This may include:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Address</li>
            <li>Date of birth</li>
            <li>Profile photos</li>
            <li>Identification documents (e.g. passport or driving licence)</li>
            <li>Payment details (processed securely via third-party providers)</li>
            <li>Background check results (where applicable)</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you use our platform, we may automatically collect:</p>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and operating system</li>
            <li>Pages visited and usage behaviour</li>
            <li>Location data (where enabled)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2>3. Sensitive Information</h2>
          <p>To maintain a safe and trusted platform, we may collect and process sensitive personal data such as:</p>
          <ul>
            <li>Identity verification documents</li>
            <li>Background check information</li>
          </ul>
          <p>This information is:</p>
          <ul>
            <li>Only collected where necessary</li>
            <li>Processed securely and in line with legal requirements</li>
            <li>Never shared publicly or with other users</li>
            <li>Only accessible to authorised personnel and trusted verification partners</li>
          </ul>

          <h2>4. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Connect homeowners with house sitters</li>
            <li>Enable applications and communication between users</li>
            <li>Process payments securely</li>
            <li>Verify identities and maintain platform safety</li>
            <li>Provide customer support</li>
            <li>Improve and optimise the platform</li>
            <li>Detect and prevent fraud or misuse</li>
            <li>Comply with legal and regulatory obligations</li>
            <li>Send service updates and (where consent is given) marketing communications</li>
          </ul>

          <h2>5. Legal Basis for Processing</h2>
          <p>We process your personal data under the following legal bases:</p>
          <ul>
            <li>Contractual necessity - to provide our services</li>
            <li>Legitimate interests - to improve, secure, and operate the platform</li>
            <li>Legal obligations - to comply with applicable laws</li>
            <li>Consent - for marketing communications and certain data uses</li>
          </ul>

          <h2>6. Sharing Your Information</h2>
          <p>We do not sell your personal data.</p>
          <p>We may share your information only where necessary:</p>

          <h3>With Other Users</h3>
          <ul>
            <li>Your public profile (e.g. name, photo, bio, reviews) is visible to other users</li>
            <li>Contact details are only shared where appropriate (e.g. during confirmed arrangements)</li>
          </ul>

          <h3>With Service Providers</h3>
          <p>We work with trusted third parties, including:</p>
          <ul>
            <li>Payment processors (e.g. Stripe)</li>
            <li>Identity verification and background check providers</li>
            <li>Hosting and infrastructure providers</li>
            <li>Email and communication platforms</li>
          </ul>
          <p>These providers only process your data on our behalf and under strict controls.</p>

          <h3>For Legal Reasons</h3>
          <p>We may disclose information if required to:</p>
          <ul>
            <li>Comply with legal obligations</li>
            <li>Enforce our terms</li>
            <li>Protect users and the platform</li>
          </ul>

          <h2>7. Payments</h2>
          <p>All payments are processed securely via third-party providers. We do not store full payment card details on our systems.</p>

          <h2>8. Data Retention</h2>
          <p>We retain your personal information only for as long as necessary to:</p>
          <ul>
            <li>Provide our services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce agreements</li>
          </ul>
          <p>When no longer required, your data is securely deleted or anonymised.</p>

          <h2>9. Data Security</h2>
          <p>We implement appropriate technical and organisational measures to protect your data, including:</p>
          <ul>
            <li>Secure servers</li>
            <li>Encryption where appropriate</li>
            <li>Access controls</li>
            <li>Regular monitoring and security checks</li>
          </ul>
          <p>
            While we take security seriously, no system is completely secure, and we cannot guarantee absolute protection.
          </p>

          <h2>10. Your Rights</h2>
          <p>Under UK data protection law, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Restrict or object to processing</li>
            <li>Request data portability</li>
            <li>Withdraw consent at any time (where applicable)</li>
          </ul>
          <p>To exercise these rights, contact: privacy@housesitterdirectory.com</p>

          <h2>11. Cookies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Improve site functionality</li>
            <li>Understand user behaviour</li>
            <li>Enhance your experience</li>
          </ul>
          <p>
            You can manage your cookie preferences through your browser settings. For more details, please see our Cookie Policy.
          </p>

          <h2>12. International Data Transfers</h2>
          <p>
            Your information may be transferred outside the UK where necessary. Where this occurs, we ensure appropriate safeguards
            are in place in line with UK GDPR requirements.
          </p>

          <h2>13. Children&rsquo;s Privacy</h2>
          <p>Our platform is not intended for individuals under 18. We do not knowingly collect data from children.</p>

          <h2>14. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
            &ldquo;Last updated&rdquo; date.
          </p>

          <h2>15. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <p>Email: privacy@housesitterdirectory.com</p>
        </article>
      </div>
    </>
  )
}
