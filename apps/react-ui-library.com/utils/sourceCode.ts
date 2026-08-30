// Re-export the single authoritative source code map generated in docs/data
// This indirection allows us to change generation location without touching import sites.

export { sourceCodeMap, getSourceCode, getAvailableSourceCodeKeys } from './sourceCodeMap';
