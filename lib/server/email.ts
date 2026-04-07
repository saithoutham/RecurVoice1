import "server-only";

import { Resend } from "resend";

import { caregiverMessageForLevel } from "@/lib/clinical";
import { appUrl, isResendConfigured } from "@/lib/config";
import type {
  AlertRecord,
  ConvergenceLevel,
  DashboardSummary,
  NotificationPreferencesRecord,
  ProfileRecord
} from "@/lib/types";

type SendEmailResult = {
  delivered: boolean;
  mode: "resend" | "preview";
  preview?: string;
};

function sender() {
  return "RecurVoice <noreply@recurvoice.local>";
}

function resendClient() {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
}

async function deliverEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    return {
      delivered: true,
      mode: "preview",
      preview: `${input.subject}\n\n${input.text}`
    };
  }

  const client = resendClient();
  if (!client) {
    return {
      delivered: false,
      mode: "preview",
      preview: input.text
    };
  }

  await client.emails.send({
    from: sender(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text
  });

  return { delivered: true, mode: "resend" };
}

export async function sendWelcomeEmail(profile: ProfileRecord, email: string, verificationUrl: string) {
  return await deliverEmail({
    to: email,
    subject: "Welcome to RecurVoice.",
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0A0A0A">
      <h1 style="color:#1B4332">Welcome to RecurVoice.</h1>
      <p>Thank you for signing up. Please verify your email to start your 14-day voice baseline.</p>
      <p><a href="${verificationUrl}" style="display:inline-block;background:#1B4332;color:#ffffff;padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:600">Verify email</a></p>
      <p>You can also paste this link into your browser:<br/>${verificationUrl}</p>
    </div>`,
    text: `Welcome to RecurVoice.\n\nPlease verify your email to start onboarding:\n${verificationUrl}`
  });
}

export async function sendCaregiverAlertEmail(input: {
  patientName: string;
  caregiverEmail: string;
  message: string;
  alertLevel: string;
}) {
  return await deliverEmail({
    to: input.caregiverEmail,
    subject: `RecurVoice noticed a change - ${input.patientName}'s check-in.`,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0A0A0A">
      <h1 style="color:#1B4332">RecurVoice noticed a change.</h1>
      <p>${input.message}</p>
      <p>This message is informational only. Please contact the care team today if you have questions.</p>
      <p style="color:#6B7280">Alert level: ${input.alertLevel}</p>
    </div>`,
    text: `${input.message}\n\nThis message is informational only. Please contact the care team today if you have questions.`
  });
}

export async function sendConvergenceCaregiverEmail(input: {
  caregiverEmail: string;
  caregiverName: string;
  patientName: string;
  level: ConvergenceLevel;
}) {
  const copy = caregiverMessageForLevel(
    input.level,
    input.patientName,
    input.caregiverName
  );

  return await deliverEmail({
    to: input.caregiverEmail,
    subject: copy.subject,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0A0A0A">
      <h1 style="color:#1B4332">${copy.subject}</h1>
      <p>${copy.body}</p>
      <p style="margin-top:16px">Open RecurVoice: ${appUrl()}/dashboard</p>
    </div>`,
    text: `${copy.body}\n\nOpen RecurVoice: ${appUrl()}/dashboard`
  });
}

export async function sendWeeklySummaryEmail(input: {
  email: string;
  profile: ProfileRecord;
  summary: DashboardSummary;
}) {
  const recent = input.summary.recentSessions.slice(-7).reverse();
  const rows = recent
    .map(
      (session) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #E5E7EB">${new Date(session.recorded_at).toLocaleDateString()}</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">${session.hnr_mean?.toFixed(1) ?? "-"}</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">${session.jitter_local?.toFixed(3) ?? "-"}</td><td style="padding:8px;border-bottom:1px solid #E5E7EB">${session.shimmer_local?.toFixed(2) ?? "-"}</td></tr>`
    )
    .join("");

  return await deliverEmail({
    to: input.email,
    subject: "Your RecurVoice week in review.",
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0A0A0A">
      <h1 style="color:#1B4332">Your RecurVoice week in review.</h1>
      <p>You completed ${recent.length} of 14 possible check-ins in the current baseline window.</p>
      <table style="border-collapse:collapse;width:100%;margin-top:16px">
        <thead><tr><th align="left" style="padding:8px;border-bottom:1px solid #E5E7EB">Date</th><th align="left" style="padding:8px;border-bottom:1px solid #E5E7EB">HNR</th><th align="left" style="padding:8px;border-bottom:1px solid #E5E7EB">Jitter</th><th align="left" style="padding:8px;border-bottom:1px solid #E5E7EB">Shimmer</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:16px">Open your dashboard: ${appUrl()}/dashboard</p>
    </div>`,
    text: `Your RecurVoice week in review.\n\nYou completed ${recent.length} of 14 possible check-ins in the current baseline window.\nOpen your dashboard: ${appUrl()}/dashboard`
  });
}

export async function sendBaselineCompleteEmail(email: string, name: string) {
  return await deliverEmail({
    to: email,
    subject: "Your baseline is complete.",
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0A0A0A">
      <h1 style="color:#1B4332">Your baseline is complete.</h1>
      <p>${name}, your 14-day voice baseline is now set. RecurVoice will now compare each new check-in against your own normal voice pattern.</p>
      <p><a href="${appUrl()}/trends" style="display:inline-block;background:#1B4332;color:#ffffff;padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:600">View trends</a></p>
    </div>`,
    text: `${name}, your 14-day voice baseline is now set. Open your trends page: ${appUrl()}/trends`
  });
}

export async function sendTestCaregiverEmail(caregiverEmail: string, patientName: string) {
  return await deliverEmail({
    to: caregiverEmail,
    subject: `RecurVoice caregiver setup for ${patientName}`,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0A0A0A">
      <h1 style="color:#1B4332">Caregiver notifications are active.</h1>
      <p>You are listed as the caregiver contact for ${patientName} in RecurVoice.</p>
      <p>If the voice monitoring system notices a sustained change, you may receive a plain English email asking you to contact the care team.</p>
    </div>`,
    text: `You are listed as the caregiver contact for ${patientName} in RecurVoice.`
  });
}

export async function shouldSendDailyReminder(
  summary: DashboardSummary,
  preferences: NotificationPreferencesRecord
) {
  return preferences.daily_reminder_enabled && !summary.checkedInToday;
}

export async function buildCaregiverMessage(summary: DashboardSummary, alert: AlertRecord) {
  return alert.message || "We noticed a change in today's voice check-in. Please contact the care team today.";
}
