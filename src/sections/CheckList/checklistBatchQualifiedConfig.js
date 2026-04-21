// Toggle for batch-qualified API concurrency testing.
// Keep only ONE active line below.
export const CHECKLIST_BATCH_QUALIFIED_CONCURRENCY_OVERRIDE = null
// export const CHECKLIST_BATCH_QUALIFIED_CONCURRENCY_OVERRIDE = 6
// export const CHECKLIST_BATCH_QUALIFIED_CONCURRENCY_OVERRIDE = 9
// export const CHECKLIST_BATCH_QUALIFIED_CONCURRENCY_OVERRIDE = 12
// export const CHECKLIST_BATCH_QUALIFIED_CONCURRENCY_OVERRIDE = 15
// export const CHECKLIST_BATCH_QUALIFIED_CONCURRENCY_OVERRIDE = 20

export const getChecklistBatchQualifiedConcurrencyLimit = (count = 0) => {
  const override = Number(CHECKLIST_BATCH_QUALIFIED_CONCURRENCY_OVERRIDE)
  if (Number.isFinite(override) && override > 0) {
    return Math.floor(override)
  }

  if (count >= 60) return 12
  if (count >= 30) return 10
  if (count >= 15) return 8
  return 6
}
