import type { KeyLabelPair } from './keylabelpair'

export const orderStatusLabels = new Map<number, KeyLabelPair>([
    [2, { key: 'submit', label: 'Submitted' }],
    [3, { key: 'cancel', label: 'Cancelled' }],
    [4, { key: 'complete', label: 'Completed' }]
  ])
  