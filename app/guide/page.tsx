const sections = [
  {
    id: "getting-started",
    title: "Getting started",
    content:
      "Create your account, verify your email, and finish the 6-step onboarding flow. Then start your 14-day baseline program. Each daily check-in takes about 60 seconds."
  },
  {
    id: "record-correctly",
    title: "How to record correctly",
    content:
      "Use a quiet room. Hold your phone or laptop at arm's length and keep it still. Sit up straight. Take a full breath before you say Ahhhh. Say the Ahhhh at your normal speaking volume and keep the sound steady until it ends. Then read the sentence naturally. Do not whisper or rush."
  },
  {
    id: "lung-cancer-link",
    title: "How this links to lung cancer",
    content:
      "The recurrent laryngeal nerve helps move the vocal cord. That nerve passes through the chest near the place where lung cancer can come back. If something starts pressing on that nerve, the voice can change before a person feels very different. RecurVoice watches for that slow voice drift."
  },
  {
    id: "scores",
    title: "What your scores mean",
    content:
      "HNR is a voice clarity score. Jitter is tiny pitch wobble. Shimmer is tiny loudness wobble. Higher HNR is better. Lower jitter and shimmer are better. Visit the Scores page for your own numbers and plain English explanations."
  },
  {
    id: "trend",
    title: "Understanding your trend",
    content:
      "RecurVoice cares most about trends. A CUSUM score is a running drift score. It grows when your voice keeps changing in the same direction over several days."
  },
  {
    id: "changes",
    title: "What happens when something changes",
    content:
      "WATCH means a small change was noticed. EARLY WARNING means a gradual change has been seen for several days. URGENT means the change has stayed strong enough long enough that you should contact your care team today."
  },
  {
    id: "weekly-symptoms",
    title: "Your weekly symptom check-in",
    content:
      "Once a week, RecurVoice asks how active you felt and how much cough, shortness of breath, fatigue, and pain you had. This does not replace medical care. It helps the system understand whether your voice changes are happening alongside changes in how you feel."
  },
  {
    id: "contact",
    title: "When to contact your care team",
    content:
      "Contact your care team any time you feel worse, notice a new symptom, or receive an EARLY WARNING or URGENT message. RecurVoice does not diagnose medical conditions."
  },
  {
    id: "caregiver",
    title: "How to add or change your caregiver",
    content:
      "Open Settings, then Caregiver. Add the name, email, and phone number of the person who should receive alerts. You can also send a test message from that screen."
  },
  {
    id: "delete-data",
    title: "How to delete your data",
    content:
      "Open Settings, then Data. You can download your data as JSON or permanently delete your account and all stored monitoring history."
  }
];

const faqs = [
  "Do I need to check in at the exact same time every day?",
  "What if I miss a day?",
  "What if I have a cold or allergies?",
  "Can I use headphones?",
  "What if my room is noisy?",
  "Can my caregiver see my dashboard?",
  "Will RecurVoice store my recordings?",
  "What does HNR mean in plain English?",
  "Why does RecurVoice need 14 days first?",
  "What does WATCH mean?",
  "What does EARLY WARNING mean?",
  "What does URGENT mean?",
  "Can I compare myself to healthy adults?",
  "How do weekly summaries work?",
  "How do I change my email reminder time?"
];

export default function GuidePage() {
  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1B4332]">Guide</p>
            <nav className="mt-4 space-y-3">
              {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="block text-base font-medium text-[#4B5563] hover:text-[#1B4332]">
                  {section.title}
                </a>
              ))}
              <a href="#faq" className="block text-base font-medium text-[#4B5563] hover:text-[#1B4332]">Frequently asked questions</a>
            </nav>
          </div>
        </aside>
        <div className="space-y-10">
          <header className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1B4332]">User guide</p>
            <h1 className="text-4xl font-semibold">How to use RecurVoice</h1>
            <p className="max-w-3xl text-lg leading-8 text-[#4B5563]">
              This guide explains how to record correctly, what your scores mean, and what to do when the system notices a sustained change.
            </p>
          </header>

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="rounded-xl border border-[#E5E7EB] bg-white p-8">
              <h2 className="text-3xl font-semibold">{section.title}</h2>
              <p className="mt-4 text-lg leading-8 text-[#4B5563]">{section.content}</p>
            </section>
          ))}

          <section id="faq" className="rounded-xl border border-[#E5E7EB] bg-white p-8">
            <h2 className="text-3xl font-semibold">Frequently asked questions</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((question) => (
                <details key={question} className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <summary className="cursor-pointer text-lg font-semibold text-[#0A0A0A]">{question}</summary>
                  <p className="mt-3 text-lg leading-8 text-[#4B5563]">
                    RecurVoice answers this through the dashboard, scores page, or your care team. When in doubt, use a quiet room, do your check-in at a regular time, and contact your care team for medical decisions.
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
