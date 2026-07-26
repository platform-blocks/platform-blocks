export const TOTAL_MB = 24.6;
export const TICK_MS = 120;

/** Each stage owns a slice of the bar and advances at its own pace. */
export const STAGES = [
  { until: 8, speed: 0.6, label: 'Preparing upload', color: 'primary', striped: true },
  { until: 86, speed: 1.4, label: 'Uploading', color: 'primary', striped: false },
  { until: 96, speed: 0.35, label: 'Processing on server', color: 'secondary', striped: true },
  { until: 100, speed: 0.5, label: 'Verifying', color: 'secondary', striped: true },
];

export const stageFor = (value: number) => STAGES.find((stage) => value < stage.until) ?? STAGES[0];
