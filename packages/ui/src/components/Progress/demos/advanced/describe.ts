import { TOTAL_MB, stageFor } from './stages';

/** Secondary line under the bar: what the current stage is actually doing. */
export const describe = (value: number) => {
  switch (stageFor(value).label) {
    case 'Preparing upload':
      return 'Compressing 18 files';
    case 'Uploading': {
      const sent = ((value / 86) * TOTAL_MB).toFixed(1);
      return `${sent} MB of ${TOTAL_MB} MB · 2.1 MB/s`;
    }
    case 'Processing on server':
      return 'Generating previews';
    default:
      return 'Checking file integrity';
  }
};
