"use client";

type MeydaLike = {
  extract: (
    features: string[] | string,
    signal: Float32Array,
    options?: Record<string, unknown>
  ) => Record<string, unknown> | null;
};

export type FeaturePayload = {
  f0_mean: number;
  f0_std: number;
  hnr_mean: number;
  jitter_local: number;
  jitter_rap: number;
  shimmer_local: number;
  shimmer_apq3: number;
  spectral_centroid_mean: number;
  zero_crossing_rate_mean: number;
  voiced_frame_ratio: number;
  snr_db: number;
} & Record<string, number>;

export type VoiceSlice = {
  voicedSignal: Float32Array;
  voicedFrames: number;
  totalFrames: number;
  durationSeconds: number;
};

const DEFAULT_SAMPLE_RATE = 16000;

export function createAudioContext() {
  const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Context) {
    throw new Error("AudioContext is not available in this browser.");
  }
  return new Context();
}

export async function decodeBlobToAudioBuffer(blob: Blob, audioContext?: AudioContext) {
  const context = audioContext ?? createAudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  return await context.decodeAudioData(arrayBuffer.slice(0));
}

export async function normalizeRecordedBlob(blob: Blob) {
  if (blob.type.includes("wav")) {
    return blob;
  }
  const context = createAudioContext();
  try {
    const buffer = await decodeBlobToAudioBuffer(blob, context);
    return audioBufferToWavBlob(buffer);
  } finally {
    await context.close();
  }
}

export function audioBufferToWavBlob(buffer: AudioBuffer) {
  const channelData = new Float32Array(buffer.length);
  if (buffer.numberOfChannels === 1) {
    channelData.set(buffer.getChannelData(0));
  } else {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let index = 0; index < buffer.length; index += 1) {
      channelData[index] = (left[index] + right[index]) / 2;
    }
  }

  const wavBuffer = encodeWav(channelData, buffer.sampleRate);
  return new Blob([wavBuffer], { type: "audio/wav" });
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

export async function resampleAudioBuffer(buffer: AudioBuffer, targetSampleRate = DEFAULT_SAMPLE_RATE) {
  if (buffer.sampleRate === targetSampleRate) {
    return buffer;
  }
  const offline = new OfflineAudioContext(1, Math.ceil((buffer.duration || 0) * targetSampleRate), targetSampleRate);
  const source = offline.createBufferSource();
  source.buffer = buffer.numberOfChannels === 1 ? buffer : toMonoAudioBuffer(buffer, offline);
  source.connect(offline.destination);
  source.start(0);
  return await offline.startRendering();
}

function toMonoAudioBuffer(buffer: AudioBuffer, context: BaseAudioContext) {
  const mono = context.createBuffer(1, buffer.length, buffer.sampleRate);
  const monoData = mono.getChannelData(0);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const source = buffer.getChannelData(channel);
    for (let index = 0; index < buffer.length; index += 1) {
      monoData[index] += source[index] / buffer.numberOfChannels;
    }
  }
  return mono;
}

export function concatenateBuffers(first: AudioBuffer, second: AudioBuffer, context: BaseAudioContext) {
  const combined = context.createBuffer(1, first.length + second.length, first.sampleRate);
  const channel = combined.getChannelData(0);
  channel.set(first.getChannelData(0), 0);
  channel.set(second.getChannelData(0), first.length);
  return combined;
}

export function voiceActivityDetect(signal: Float32Array, sampleRate: number, threshold = 0.01): VoiceSlice {
  const frameSize = Math.max(1, Math.floor(0.02 * sampleRate));
  const hopSize = frameSize;
  const voicedChunks: number[] = [];
  let voicedFrames = 0;
  let totalFrames = 0;

  for (let index = 0; index + frameSize <= signal.length; index += hopSize) {
    totalFrames += 1;
    const frame = signal.subarray(index, index + frameSize);
    const rms = calculateRms(frame);
    if (rms >= threshold) {
      voicedFrames += 1;
      for (let sampleIndex = 0; sampleIndex < frame.length; sampleIndex += 1) {
        voicedChunks.push(frame[sampleIndex]);
      }
    }
  }

  const voicedSignal = new Float32Array(voicedChunks);
  return {
    voicedSignal,
    voicedFrames,
    totalFrames,
    durationSeconds: voicedSignal.length / sampleRate
  };
}

export function calculateRms(frame: Float32Array) {
  if (!frame.length) return 0;
  let sum = 0;
  for (let index = 0; index < frame.length; index += 1) {
    sum += frame[index] * frame[index];
  }
  return Math.sqrt(sum / frame.length);
}

export async function extractMeydaFeatures(signal: Float32Array, sampleRate: number) {
  const imported = (await import("meyda")) as unknown as { default?: MeydaLike } & MeydaLike;
  const Meyda = (imported.default ?? imported) as MeydaLike;
  const bufferSize = 512;
  const hopSize = 256;
  const mfccFrames: number[][] = [];
  const centroidValues: number[] = [];
  const rolloffValues: number[] = [];
  const zcrValues: number[] = [];
  const rmsValues: number[] = [];
  const energyValues: number[] = [];

  for (let index = 0; index + bufferSize <= signal.length; index += hopSize) {
    const frame = signal.subarray(index, index + bufferSize);
    const features = Meyda.extract(
      ["mfcc", "spectralCentroid", "spectralRolloff", "zcr", "rms", "energy"],
      frame,
      {
        sampleRate,
        bufferSize,
        melBands: 26,
        numberOfMFCCCoefficients: 13
      }
    ) as Record<string, unknown> | null;
    if (!features) continue;
    const mfcc = features.mfcc as number[] | undefined;
    if (mfcc?.length) {
      mfccFrames.push(mfcc.slice(0, 13));
    }
    centroidValues.push(Number(features.spectralCentroid ?? 0));
    rolloffValues.push(Number(features.spectralRolloff ?? 0));
    zcrValues.push(Number(features.zcr ?? 0));
    rmsValues.push(Number(features.rms ?? 0));
    energyValues.push(Number(features.energy ?? 0));
  }

  const mfccMeans = meanVector(mfccFrames, 13);
  const deltaFrames = mfccFrames.slice(1).map((frame, index) =>
    frame.map((value, coeffIndex) => value - mfccFrames[index][coeffIndex])
  );
  const mfccDeltaMeans = meanVector(deltaFrames, 13);

  return {
    mfccMeans,
    mfccDeltaMeans,
    spectralCentroid: mean(centroidValues),
    spectralRolloff: mean(rolloffValues),
    zcr: mean(zcrValues),
    rms: mean(rmsValues),
    energy: mean(energyValues)
  };
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values: number[]) {
  if (!values.length) return 0;
  const average = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)));
}

function meanVector(frames: number[][], length: number) {
  if (!frames.length) return Array.from({ length }, () => 0);
  const sums = Array.from({ length }, () => 0);
  frames.forEach((frame) => {
    frame.forEach((value, index) => {
      sums[index] += value;
    });
  });
  return sums.map((value) => value / frames.length);
}

export function estimateF0Track(signal: Float32Array, sampleRate: number) {
  const frameSize = Math.floor(0.04 * sampleRate);
  const hopSize = Math.floor(0.02 * sampleRate);
  const minLag = Math.floor(sampleRate / 500);
  const maxLag = Math.floor(sampleRate / 75);
  const values: number[] = [];

  for (let index = 0; index + frameSize <= signal.length; index += hopSize) {
    const frame = signal.subarray(index, index + frameSize);
    if (calculateRms(frame) < 0.01) continue;
    let bestLag = 0;
    let best = -Infinity;
    for (let lag = minLag; lag <= maxLag; lag += 1) {
      let correlation = 0;
      for (let sampleIndex = 0; sampleIndex + lag < frame.length; sampleIndex += 1) {
        correlation += frame[sampleIndex] * frame[sampleIndex + lag];
      }
      if (correlation > best) {
        best = correlation;
        bestLag = lag;
      }
    }
    if (bestLag > 0) {
      values.push(sampleRate / bestLag);
    }
  }

  return {
    values,
    mean: mean(values),
    std: std(values)
  };
}

export function calculateHNR(signal: Float32Array, sampleRate: number) {
  const frameSize = Math.floor(0.025 * sampleRate);
  const hopSize = Math.floor(0.01 * sampleRate);
  const hnrValues: number[] = [];

  for (let index = 0; index + frameSize < signal.length; index += hopSize) {
    const frame = signal.slice(index, index + frameSize);
    const rms = calculateRms(frame);
    if (rms < 0.01) continue;

    const acf = new Float32Array(frameSize);
    for (let lag = 0; lag < frameSize; lag += 1) {
      let sum = 0;
      for (let sampleIndex = 0; sampleIndex + lag < frame.length; sampleIndex += 1) {
        sum += frame[sampleIndex] * frame[sampleIndex + lag];
      }
      acf[lag] = sum;
    }

    const minLag = Math.floor(sampleRate / 500);
    const maxLag = Math.floor(sampleRate / 75);
    let maxAcf = 0;
    for (let lag = minLag; lag < maxLag; lag += 1) {
      if (acf[lag] > maxAcf) maxAcf = acf[lag];
    }

    if (acf[0] > 0) {
      const hnr = 10 * Math.log10(maxAcf / Math.max(acf[0] - maxAcf, 0.0001));
      hnrValues.push(hnr);
    }
  }

  return mean(hnrValues);
}

export function calculateJitter(signal: Float32Array, sampleRate: number) {
  const minPeriod = Math.floor(sampleRate / 500);
  const maxPeriod = Math.floor(sampleRate / 75);
  const periods: number[] = [];
  let lastCrossing = -1;

  for (let index = 1; index < signal.length; index += 1) {
    if (signal[index - 1] < 0 && signal[index] >= 0) {
      if (lastCrossing >= 0) {
        const period = index - lastCrossing;
        if (period >= minPeriod && period <= maxPeriod) {
          periods.push(period);
        }
      }
      lastCrossing = index;
    }
  }

  if (periods.length < 3) return 0;

  let diffSum = 0;
  for (let index = 1; index < periods.length; index += 1) {
    diffSum += Math.abs(periods[index] - periods[index - 1]);
  }
  const meanDiff = diffSum / (periods.length - 1);
  const meanPeriod = mean(periods);

  return meanPeriod ? (meanDiff / meanPeriod) * 100 : 0;
}

export function calculateShimmer(signal: Float32Array, sampleRate: number) {
  const frameSize = Math.floor(0.03 * sampleRate);
  const hopSize = Math.floor(0.015 * sampleRate);
  const amplitudes: number[] = [];

  for (let index = 0; index + frameSize <= signal.length; index += hopSize) {
    const frame = signal.subarray(index, index + frameSize);
    const rms = calculateRms(frame);
    if (rms >= 0.01) amplitudes.push(rms);
  }

  if (amplitudes.length < 3) return 0;

  let diffSum = 0;
  for (let index = 1; index < amplitudes.length; index += 1) {
    diffSum += Math.abs(amplitudes[index] - amplitudes[index - 1]);
  }
  const meanDiff = diffSum / (amplitudes.length - 1);
  const meanAmplitude = mean(amplitudes);
  return meanAmplitude ? (meanDiff / meanAmplitude) * 100 : 0;
}

export function estimateSnr(fullSignal: Float32Array, voicedSignal: Float32Array) {
  const voicedRms = calculateRms(voicedSignal);
  const overallRms = calculateRms(fullSignal);
  const noise = Math.max((overallRms - voicedRms * 0.8) ** 2, 1e-6);
  return 10 * Math.log10(Math.max(voicedRms ** 2, 1e-6) / noise);
}

export async function extractFeaturePayload(buffer: AudioBuffer): Promise<FeaturePayload> {
  const context = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
  const monoBuffer = toMonoAudioBuffer(buffer, context);
  const resampled = await resampleAudioBuffer(monoBuffer, DEFAULT_SAMPLE_RATE);
  const signal = resampled.getChannelData(0);
  const vad = voiceActivityDetect(signal, DEFAULT_SAMPLE_RATE, 0.01);
  if (vad.durationSeconds < 1.5) {
    throw new Error("We could not detect enough voice. Please go back and try again.");
  }

  const meyda = await extractMeydaFeatures(vad.voicedSignal, DEFAULT_SAMPLE_RATE);
  const f0Track = estimateF0Track(vad.voicedSignal, DEFAULT_SAMPLE_RATE);
  const hnr = calculateHNR(vad.voicedSignal, DEFAULT_SAMPLE_RATE);
  const jitter = calculateJitter(vad.voicedSignal, DEFAULT_SAMPLE_RATE);
  const shimmer = calculateShimmer(vad.voicedSignal, DEFAULT_SAMPLE_RATE);
  const snr = estimateSnr(signal, vad.voicedSignal);

  const features: FeaturePayload = {
    f0_mean: f0Track.mean,
    f0_std: f0Track.std,
    hnr_mean: hnr,
    jitter_local: jitter,
    jitter_rap: jitter * 0.6,
    shimmer_local: shimmer,
    shimmer_apq3: shimmer * 0.8,
    spectral_centroid_mean: meyda.spectralCentroid,
    zero_crossing_rate_mean: meyda.zcr,
    voiced_frame_ratio: vad.totalFrames ? vad.voicedFrames / vad.totalFrames : 0,
    snr_db: snr
  };

  meyda.mfccMeans.forEach((value, index) => {
    features[`mfcc_${index + 1}`] = value;
  });
  meyda.mfccDeltaMeans.forEach((value, index) => {
    features[`mfcc_delta_${index + 1}`] = value;
  });

  return features;
}
