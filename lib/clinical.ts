import type {
  CciCategory,
  ConvergenceLevel,
  ProFrequency,
  RecurrenceRiskTier,
  WeeklyProAssessmentRecord
} from "@/lib/types";

export const COMORBIDITY_QUESTIONS = [
  { key: "heart_attack", label: "Have you ever had a heart attack.", points: 1 },
  { key: "heart_failure", label: "Do you have heart failure.", points: 1 },
  { key: "poor_circulation", label: "Do you have poor circulation in your legs.", points: 1 },
  { key: "stroke", label: "Have you ever had a stroke or mini stroke.", points: 1 },
  { key: "memory_problems", label: "Do you have significant memory problems or dementia.", points: 1 },
  { key: "chronic_lung_disease", label: "Do you have a chronic lung disease like COPD or emphysema.", points: 1 },
  { key: "rheumatic_disease", label: "Do you have lupus or rheumatoid arthritis.", points: 1 },
  { key: "ulcer", label: "Do you have stomach ulcers requiring long-term medication.", points: 1 },
  { key: "mild_liver_disease", label: "Do you have mild liver disease like hepatitis.", points: 1 },
  { key: "diabetes_pills", label: "Do you have diabetes managed with diet or pills only.", points: 1 },
  { key: "diabetes_insulin", label: "Do you have diabetes requiring insulin.", points: 1 },
  { key: "paralysis", label: "Do you have paralysis on one side of your body.", points: 2 },
  { key: "kidney_disease", label: "Do you have moderate or severe kidney disease.", points: 2 },
  { key: "other_recent_cancer", label: "Have you had any cancer other than your current lung cancer in the last 5 years.", points: 2 },
  { key: "severe_liver_disease", label: "Do you have moderate or severe liver disease.", points: 3 },
  { key: "hiv", label: "Do you have AIDS or HIV.", points: 6 },
  { key: "diabetes_organ_damage", label: "Do you have diabetes with damage to your organs like your eyes or kidneys.", points: 2 },
  { key: "metastatic_tumor", label: "Do you have any tumor that has spread to other parts of your body.", points: 6 },
  { key: "dialysis", label: "Are you currently on dialysis for kidney failure.", points: 2 }
] as const;

export const WEEKLY_PRO_QUESTIONS = [
  {
    key: "ecog_score",
    title: "Which best describes your activity level this week?",
    options: [
      "Fully active, doing everything normally.",
      "Able to do light activities but not hard work.",
      "Up and about but unable to do any work.",
      "Spending more than half the day in bed.",
      "Unable to get out of bed."
    ]
  },
  {
    key: "cough_score",
    title: "How bad was your coughing this past week?",
    options: [
      "No coughing.",
      "Mild coughing, did not bother me.",
      "Moderate coughing, got in the way sometimes.",
      "Severe coughing, very hard to manage."
    ]
  },
  {
    key: "dyspnea_score",
    title: "Did you feel short of breath this past week?",
    options: [
      "Not at all.",
      "A little short of breath.",
      "Moderately short of breath.",
      "Very short of breath."
    ]
  },
  {
    key: "fatigue_score",
    title: "How tired did you feel this past week?",
    options: [
      "Not tired at all.",
      "A little tired.",
      "Moderately tired.",
      "Very tired, hard to do anything."
    ]
  },
  {
    key: "pain_score",
    title: "How much pain did you have this past week?",
    options: ["No pain.", "Mild pain.", "Moderate pain.", "Severe pain."]
  }
] as const;

export const RECURRENCE_RISK_QUESTIONS = [
  {
    key: "stage_three_or_four",
    label: "Was your lung cancer stage III or stage IV when you were diagnosed?",
    points: 2
  },
  {
    key: "lymph_node_involvement",
    label: "Did your doctor tell you that lymph nodes in the chest were involved?",
    points: 2
  },
  {
    key: "tumor_four_cm_or_larger",
    label: "Was the main lung tumor 4 centimeters or larger?",
    points: 1
  },
  {
    key: "positive_or_close_margins",
    label: "After treatment, were cancer cells found at or very close to the edge of the treated area?",
    points: 2
  },
  {
    key: "pleural_or_chest_wall_involvement",
    label: "Did the cancer reach the lining around the lung or the chest wall?",
    points: 1
  },
  {
    key: "lymphovascular_invasion",
    label: "Did your pathology report mention cancer in blood vessels or lymph channels?",
    points: 1
  },
  {
    key: "multiple_tumors_or_second_primary",
    label: "Have you had more than one lung tumor or a second separate lung cancer?",
    points: 1
  },
  {
    key: "prior_recurrence_or_residual_disease",
    label: "Has your cancer come back before, or did your care team say some cancer may still be present after treatment?",
    points: 2
  }
] as const;

export function deriveComorbidityProfile(answers: Record<string, boolean>) {
  const diabetesScore = answers.diabetes_organ_damage
    ? 2
    : answers.diabetes_pills || answers.diabetes_insulin
      ? 1
      : 0;
  const liverScore = answers.severe_liver_disease ? 3 : answers.mild_liver_disease ? 1 : 0;
  const kidneyScore = answers.kidney_disease || answers.dialysis ? 2 : 0;

  const groupedKeys = new Set([
    "diabetes_pills",
    "diabetes_insulin",
    "diabetes_organ_damage",
    "mild_liver_disease",
    "severe_liver_disease",
    "kidney_disease",
    "dialysis"
  ]);

  const baseScore = COMORBIDITY_QUESTIONS.reduce((total, question) => {
    if (groupedKeys.has(question.key)) return total;
    return total + (answers[question.key] ? question.points : 0);
  }, 0);

  const cciScore = baseScore + diabetesScore + liverScore + kidneyScore;

  let cciCategory: CciCategory = "low";
  let cusumSensitivityMultiplier = 1.0;
  let proThresholdMultiplier = 1.0;

  if (cciScore >= 4) {
    cciCategory = "high";
    cusumSensitivityMultiplier = 1.3;
    proThresholdMultiplier = 0.7;
  } else if (cciScore >= 2) {
    cciCategory = "moderate";
    cusumSensitivityMultiplier = 1.15;
    proThresholdMultiplier = 0.85;
  }

  return {
    cciScore,
    cciCategory,
    cusumSensitivityMultiplier,
    proThresholdMultiplier
  };
}

export function deriveRecurrenceRiskProfile(answers: Record<string, boolean>) {
  const rawScore = RECURRENCE_RISK_QUESTIONS.reduce((total, question) => {
    return total + (answers[question.key] ? question.points : 0);
  }, 0);

  let riskTier: RecurrenceRiskTier = "low";
  let cusumSensitivityMultiplier = 1.0;

  if (rawScore >= 6) {
    riskTier = "high";
    cusumSensitivityMultiplier = 1.2;
  } else if (rawScore >= 3) {
    riskTier = "intermediate";
    cusumSensitivityMultiplier = 1.1;
  }

  return {
    rawScore,
    riskTier,
    cusumSensitivityMultiplier
  };
}

export function combineCusumSensitivityMultipliers(
  cciMultiplier: number,
  recurrenceMultiplier: number
) {
  return Number(Math.min(1.75, cciMultiplier * recurrenceMultiplier).toFixed(4));
}

export function computeCompositeProScore(input: {
  ecogScore: number;
  coughScore: number;
  dyspneaScore: number;
  fatigueScore: number;
  painScore: number;
}) {
  return Number(
    (
      (input.ecogScore / 4) * 40 +
      (input.coughScore / 3) * 15 +
      (input.dyspneaScore / 3) * 15 +
      (input.fatigueScore / 3) * 15 +
      (input.painScore / 3) * 15
    ).toFixed(2)
  );
}

export function isWeeklyProDue(
  lastAssessedAt: string | null,
  frequency: ProFrequency,
  now = new Date()
) {
  if (!lastAssessedAt) return true;
  const diffDays =
    (now.getTime() - new Date(lastAssessedAt).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= (frequency === "biweekly" ? 3 : 7);
}

export function proScoreTone(score: number) {
  if (score < 30) return { label: "Stable", tone: "text-green-700", chip: "bg-green-100 text-green-800" };
  if (score < 50) return { label: "Watch", tone: "text-amber-700", chip: "bg-amber-100 text-amber-800" };
  if (score < 70) return { label: "Needs attention", tone: "text-orange-700", chip: "bg-orange-100 text-orange-800" };
  return { label: "High symptom burden", tone: "text-red-700", chip: "bg-red-100 text-red-800" };
}

export function acousticSignalState(score: number | null, alertLevel: string | null) {
  if ((alertLevel === "EARLY_WARNING" || alertLevel === "URGENT") || (score ?? 0) >= 3) {
    return "crossed_threshold";
  }
  if ((score ?? 0) > 1.5) {
    return "subclinical_drift";
  }
  return "stable";
}

export function summarizeProStatus(assessment: WeeklyProAssessmentRecord | null) {
  if (!assessment) {
    return "No weekly symptom check-in yet.";
  }
  const tone = proScoreTone(assessment.composite_pro_score);
  return `Your last symptom check-in looks ${tone.label.toLowerCase()}.`;
}

export function convergenceStatusMessage(level: ConvergenceLevel) {
  switch (level) {
    case 3:
      return "We noticed strong changes in both your voice and symptom check-ins. Your care team has been notified.";
    case 2:
      return "We noticed changes in your voice and symptom check-ins. Your care team has been notified.";
    case 1:
      return "We noticed a small change in one of your monitoring layers. We are watching more closely.";
    default:
      return "Both your voice and symptom check-in look stable this week.";
  }
}

export function evaluateConvergence(input: {
  acousticScore: number | null;
  acousticAlertLevel: string | null;
  latestPro: WeeklyProAssessmentRecord | null;
  previousPro: WeeklyProAssessmentRecord | null;
  cciCategory: CciCategory | null;
  proThresholdMultiplier: number;
}) {
  const acousticState = acousticSignalState(input.acousticScore, input.acousticAlertLevel);
  const proDelta = input.latestPro?.pro_delta_from_last ?? 0;
  const threshold = 1 * input.proThresholdMultiplier;
  const largeThreshold = 2 * input.proThresholdMultiplier;
  const hasProDelta = proDelta >= threshold;
  const hasLargeProDelta = proDelta >= largeThreshold;
  const ecogDrop =
    input.latestPro && input.previousPro
      ? input.latestPro.ecog_score - input.previousPro.ecog_score >= 1
      : false;
  const severeSymptom =
    input.cciCategory === "high" &&
    Boolean(
      input.latestPro &&
        [input.latestPro.cough_score, input.latestPro.dyspnea_score, input.latestPro.fatigue_score, input.latestPro.pain_score].some(
          (score) => score === 3
        )
    );

  let level: ConvergenceLevel = 0;

  if (severeSymptom) {
    level = 2;
  } else if (acousticState === "crossed_threshold" && (hasLargeProDelta || ecogDrop)) {
    level = 3;
  } else if (
    (acousticState === "subclinical_drift" && hasProDelta) ||
    acousticState === "crossed_threshold"
  ) {
    level = 2;
  } else if (
    (acousticState === "stable" && hasProDelta) ||
    acousticState === "subclinical_drift"
  ) {
    level = 1;
  }

  return {
    level,
    acousticState,
    proDelta,
    threshold,
    message: convergenceStatusMessage(level)
  };
}

export function caregiverMessageForLevel(level: ConvergenceLevel, patientName: string, caregiverName: string) {
  switch (level) {
    case 3:
      return {
        subject: `URGENT - Please contact ${patientName}'s care team`,
        body: `Hi ${caregiverName}. RecurVoice has detected a significant shift in ${patientName}'s voice patterns and she reported severe symptoms this week. Please contact her oncologist today to report these changes. If this is a medical emergency call 911 immediately.`
      };
    case 2:
      return {
        subject: `RecurVoice noticed a change - ${patientName}`,
        body: `Hi ${caregiverName}. RecurVoice noticed a recent change in ${patientName}'s voice patterns alongside an increase in her reported symptoms this week. This is a good time to check in with her doctor. We recommend calling the oncology team within the next 24 to 48 hours to share these updates. This is not an emergency.`
      };
    default:
      return {
        subject: `Weekly update for ${patientName}`,
        body: `Hi ${caregiverName}. Here is this week's update for ${patientName}. Her voice patterns remain stable and her weekly symptom check-in looks good. No action needed right now. You can expect the next update next week.`
      };
  }
}
