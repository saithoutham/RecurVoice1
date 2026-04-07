export type ReferenceBenchmark = {
  id: string;
  metric: "hnr_mean" | "jitter_local" | "shimmer_local";
  population: "healthy_adults" | "post_treatment_lung_cancer" | "confirmed_uvfp";
  mean_value: number;
  std_value: number;
  percentile_10: number;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
  source: string;
  notes: string;
};

export const REFERENCE_BENCHMARKS: ReferenceBenchmark[] = [
  {
    id: "healthy-hnr",
    metric: "hnr_mean",
    population: "healthy_adults",
    mean_value: 11.8505,
    std_value: 5.9444,
    percentile_10: 6.03,
    percentile_25: 8.2325,
    percentile_50: 10.2,
    percentile_75: 12.9,
    percentile_90: 21.9181,
    source: "RecurVoice processed SVD, VOICED, and UVFP Harvard healthy controls",
    notes: "Derived from healthy recordings in data/processed/feature_matrix.csv."
  },
  {
    id: "healthy-jitter",
    metric: "jitter_local",
    population: "healthy_adults",
    mean_value: 0.0064,
    std_value: 0.0089,
    percentile_10: 0.0025,
    percentile_25: 0.0032,
    percentile_50: 0.0045,
    percentile_75: 0.0061,
    percentile_90: 0.0097,
    source: "RecurVoice processed SVD, VOICED, and UVFP Harvard healthy controls",
    notes: "Local jitter expressed as proportion, matching engine output."
  },
  {
    id: "healthy-shimmer",
    metric: "shimmer_local",
    population: "healthy_adults",
    mean_value: 3.9539,
    std_value: 3.4413,
    percentile_10: 0.0304,
    percentile_25: 1.8386,
    percentile_50: 3.7528,
    percentile_75: 5.2204,
    percentile_90: 6.7923,
    source: "RecurVoice processed SVD, VOICED, and UVFP Harvard healthy controls",
    notes: "Local shimmer stored in percent-like Praat-compatible units."
  },
  {
    id: "post-treatment-hnr",
    metric: "hnr_mean",
    population: "post_treatment_lung_cancer",
    mean_value: 10.0948,
    std_value: 5.829,
    percentile_10: 3.7876,
    percentile_25: 6.5026,
    percentile_50: 9.206,
    percentile_75: 12.095,
    percentile_90: 18.8318,
    source: "RecurVoice inferred monitoring cohort from healthy and UVFP benchmark envelopes",
    notes: "Reference bridge cohort inferred from available SVD and UVFP Harvard populations because a direct post-treatment longitudinal benchmark cohort is not present locally."
  },
  {
    id: "post-treatment-jitter",
    metric: "jitter_local",
    population: "post_treatment_lung_cancer",
    mean_value: 0.0123,
    std_value: 0.0139,
    percentile_10: 0.0028,
    percentile_25: 0.0044,
    percentile_50: 0.0074,
    percentile_75: 0.0139,
    percentile_90: 0.027,
    source: "RecurVoice inferred monitoring cohort from healthy and UVFP benchmark envelopes",
    notes: "Interpolated clinical monitoring reference for educational comparison only."
  },
  {
    id: "post-treatment-shimmer",
    metric: "shimmer_local",
    population: "post_treatment_lung_cancer",
    mean_value: 5.9578,
    std_value: 4.6424,
    percentile_10: 1.0377,
    percentile_25: 2.977,
    percentile_50: 5.2686,
    percentile_75: 7.6263,
    percentile_90: 10.3769,
    source: "RecurVoice inferred monitoring cohort from healthy and UVFP benchmark envelopes",
    notes: "Interpolated clinical monitoring reference for educational comparison only."
  },
  {
    id: "uvfp-hnr",
    metric: "hnr_mean",
    population: "confirmed_uvfp",
    mean_value: 6.8343,
    std_value: 5.5598,
    percentile_10: -0.377,
    percentile_25: 3.29,
    percentile_50: 7.36,
    percentile_75: 10.6,
    percentile_90: 13.1,
    source: "RecurVoice processed SVD and UVFP Harvard confirmed UVFP cases",
    notes: "Confirmed unilateral vocal fold paresis / RLN impairment cohort."
  },
  {
    id: "uvfp-jitter",
    metric: "jitter_local",
    population: "confirmed_uvfp",
    mean_value: 0.0259,
    std_value: 0.0286,
    percentile_10: 0.0037,
    percentile_25: 0.0072,
    percentile_50: 0.0143,
    percentile_75: 0.0322,
    percentile_90: 0.0675,
    source: "RecurVoice processed SVD and UVFP Harvard confirmed UVFP cases",
    notes: "Confirmed unilateral vocal fold paresis / RLN impairment cohort."
  },
  {
    id: "uvfp-shimmer",
    metric: "shimmer_local",
    population: "confirmed_uvfp",
    mean_value: 10.6337,
    std_value: 8.2459,
    percentile_10: 3.388,
    percentile_25: 5.6331,
    percentile_50: 8.8053,
    percentile_75: 13.24,
    percentile_90: 18.741,
    source: "RecurVoice processed SVD and UVFP Harvard confirmed UVFP cases",
    notes: "Confirmed unilateral vocal fold paresis / RLN impairment cohort."
  }
];
