import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckinStartPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-4xl">Your daily check-in is ready</CardTitle>
        <CardDescription>
          We will check your room noise, record one sustained Ahhhh, ask you to read one sentence, and then explain your result in plain English.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 text-lg leading-8 text-[#4B5563]">
          For the most accurate result, use a quiet room, hold the device still at arm&apos;s length, take one deep breath, say AHHHH at your normal speaking volume, keep the sound steady until it ends, then read the sentence in your natural voice without whispering or rushing.
        </div>
        <Button asChild className="w-full">
          <Link href="/checkin/ambient">Start today&apos;s check-in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
