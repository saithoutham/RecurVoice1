import { RecurVoiceChat } from "@/components/RecurVoiceChat";
import { PageIntro } from "@/components/PageIntro";

export default function RecurVoiceAiPage() {
  return (
    <main className="bg-[#F9FAFB] px-4 py-10">
      <div className="mx-auto max-w-[1000px] space-y-8">
        <PageIntro
          eyebrow="RecurVoice AI"
          title="Ask RecurVoice AI"
          body="Use this page for simple explanations about lung cancer voice monitoring, what your scores mean, how to do the most accurate recording, and how RecurVoice compares your trend over time."
        />
        <RecurVoiceChat />
      </div>
    </main>
  );
}
