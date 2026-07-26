export type PipelineMeta = {
  note?: string;
};

export const PIPELINE_QUALITY = {
  id: 'data-quality-pipeline',
  name: 'Data quality checkpoints',
  steps: [
    { label: 'Ingested', value: 12_400_000 },
    { label: 'Validated', value: 11_760_000, meta: { note: 'Dropped malformed partner feeds and null timestamps' } as PipelineMeta },
    { label: 'Deduplicated', value: 11_180_000, meta: { note: 'UserId + sessionId key resolves campaign duplicates' } as PipelineMeta },
    { label: 'QA passed', value: 10_260_000, meta: { note: 'Primary blockers: stale reference data & threshold breaches' } as PipelineMeta },
    { label: 'Certified', value: 9_940_000, meta: { note: 'Ready for downstream activation' } as PipelineMeta },
  ],
};
