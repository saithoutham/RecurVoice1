export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export const TERMS_INTRO =
  "These Terms of Service govern your use of RecurVoice in the United States.";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "1. Service description and limitations",
    paragraphs: [
      "RecurVoice is a digital health wellness monitoring service that asks users to complete short voice check-ins and then stores numerical acoustic features, trends, and alerts.",
      "The service is designed to help users and caregivers notice changes in voice patterns over time. RecurVoice does not replace medical care, clinical evaluation, imaging, or emergency services."
    ]
  },
  {
    title: "2. Not a medical device disclaimer",
    paragraphs: [
      "RecurVoice is not cleared or approved as a medical device. RecurVoice does not diagnose, prevent, treat, cure, or monitor any disease for clinical decision making.",
      "Any information presented by RecurVoice is informational and educational only. You agree to contact your oncology care team for medical decisions."
    ]
  },
  {
    title: "3. User responsibilities",
    paragraphs: [
      "You agree to provide accurate account information, protect your password, use the service only for lawful purposes, and avoid sharing misleading or false medical information through the platform.",
      "You are responsible for how you interpret and act on messages from RecurVoice. If you experience concerning symptoms, you must contact your care team directly."
    ]
  },
  {
    title: "4. Data collection and use",
    paragraphs: [
      "RecurVoice collects account information, profile information, caregiver contact information, numerical voice features, trend scores, alerts, and service usage information.",
      "RecurVoice is designed not to store raw voice recordings after analysis. We use collected data to provide the service, improve the product, support reminders and caregiver notifications, and maintain security and reliability.",
      "RecurVoice also collects weekly self-reported symptom information including cough severity, shortness of breath, fatigue, pain, and activity level. This information is used solely to improve the accuracy of your monitoring and to generate caregiver alerts. It is never used for advertising or sold to third parties. The symptom questions used in RecurVoice are based on the PRO-CTCAE framework developed by the National Cancer Institute."
    ]
  },
  {
    title: "5. HIPAA considerations and limitations",
    paragraphs: [
      "RecurVoice is not offered as a covered entity or business associate healthcare record system unless a separate written agreement says otherwise.",
      "You should not assume that all information in RecurVoice is protected by HIPAA in every situation. The service is built using security practices intended to protect user information, but it is not an electronic health record and should not be treated as one."
    ]
  },
  {
    title: "6. Intellectual property",
    paragraphs: [
      "All software, content, branding, text, graphics, workflows, and visual designs in RecurVoice are owned by RecurVoice or its licensors and are protected by intellectual property laws.",
      "You receive a limited, revocable, non-exclusive, non-transferable license to use the service for personal, non-commercial purposes in accordance with these Terms."
    ]
  },
  {
    title: "7. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, RecurVoice and its affiliates, officers, employees, contractors, and licensors are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, business interruption, or personal injury arising from or related to your use of the service.",
      "RecurVoice is also not responsible for delays or failures caused by internet outages, device limitations, third-party platform failures, or inaccurate user input."
    ]
  },
  {
    title: "8. Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless RecurVoice and its affiliates, officers, employees, contractors, and licensors from claims, losses, damages, liabilities, and expenses, including reasonable attorneys' fees, arising from your misuse of the service, your violation of these Terms, or your infringement of another party's rights."
    ]
  },
  {
    title: "9. Governing law",
    paragraphs: [
      "These Terms are governed by the laws of the State of Delaware, without regard to conflict of law rules.",
      "Any dispute arising out of or relating to these Terms or the service will be resolved in the state or federal courts located in Delaware, and you consent to those courts' jurisdiction."
    ]
  },
  {
    title: "10. Changes to terms",
    paragraphs: [
      "We may update these Terms from time to time. If we make material changes, we will post the updated Terms within the service and update the effective date.",
      "Your continued use of RecurVoice after changes become effective means you accept the revised Terms."
    ]
  },
  {
    title: "11. Contact information",
    paragraphs: ["Questions about these Terms may be sent to: legal@recurvoice.example."]
  }
];

export const PRIVACY_INTRO =
  "This Privacy Policy explains what RecurVoice collects, how we use it, and the choices you have.";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "1. What data we collect",
    paragraphs: [
      "We collect account details such as your name, email address, and password hash. We collect profile information such as date of birth, treatment information, and caregiver details if you choose to provide them.",
      "We collect numerical voice features such as HNR, jitter, shimmer, MFCC values, and trend scores. RecurVoice is designed not to keep raw voice recordings after analysis. We also collect routine usage and device information such as timestamps, browser type, and consent history."
    ]
  },
  {
    title: "2. How we use your data",
    paragraphs: [
      "We use your information to operate the service, show your dashboard, send reminder and caregiver emails, generate weekly summaries, improve product quality, detect misuse, and maintain reliability.",
      "We do not sell your data and we do not use your data for advertising."
    ]
  },
  {
    title: "3. How we protect your data",
    paragraphs: [
      "We use modern hosting and data infrastructure, including Supabase-compatible storage, encrypted transport, access controls, and audit logging.",
      "We limit who can access operational systems and review security controls as the product evolves. No system is perfectly secure, but we use reasonable safeguards designed to reduce risk."
    ]
  },
  {
    title: "4. Your rights",
    paragraphs: [
      "You may request access to your stored data, correct profile information, download your stored records, or delete your account.",
      "The Settings area includes tools to download your data and remove your account. You may also contact privacy@recurvoice.example for help with data requests."
    ]
  },
  {
    title: "5. Data retention",
    paragraphs: [
      "We retain account and monitoring data while your account is active and for a limited period after closure as needed to comply with legal obligations, resolve disputes, and maintain backups.",
      "If you delete your account, we will remove active account data and then allow backup systems to age out according to ordinary retention windows."
    ]
  },
  {
    title: "6. Third parties",
    paragraphs: [
      "RecurVoice may rely on third-party infrastructure providers, including Supabase for authentication and database services, OpenRouter for AI-generated plain English explanations, Resend for transactional email delivery, and Vercel for hosting and deployment.",
      "These providers process information only as needed to support the service.",
      "RecurVoice uses the PRO-CTCAE instrument developed by the National Cancer Institute under NCI terms of use. The instrument itself is not sold as a standalone product. It is used as a data collection component within the broader RecurVoice monitoring platform."
    ]
  },
  {
    title: "7. Children",
    paragraphs: [
      "RecurVoice is not intended for children under 18 years old. We do not knowingly collect personal information from children under 18."
    ]
  },
  {
    title: "8. Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. If we make material changes, we will update the policy in the service and revise the effective date.",
      "Continued use of RecurVoice after the new policy becomes effective means you accept the revised policy."
    ]
  },
  {
    title: "9. Contact information",
    paragraphs: ["Questions about this Privacy Policy may be sent to: privacy@recurvoice.example."]
  }
];
