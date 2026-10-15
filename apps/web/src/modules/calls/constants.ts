// Page size options for pagination
export const PAGE_SIZES = [10, 25, 50] as const;

// Default filter values
export const DEFAULT_FILTERS = {
  direction: 'all' as const,
  status: 'all' as const,
  outcome: 'all' as const,
  assignedTo: 'all' as const,
} as const;

// Legacy mock call IDs to exclude
export const LEGACY_MOCK_CALL_IDS = ['c-1', 'c-2', 'c-3', 'c-4', 'c-5'] as const;

// Default call durations
export const DEFAULT_CALL_DURATIONS = {
  ACTIVITY_CALL: '03:15',
  LEAD_CALL: '03:30',
} as const;

// Default call outcomes
export const DEFAULT_CALL_OUTCOMES = {
  INTERESTED: 'Interested',
  FOLLOW_UP_REQUIRED: 'Follow-up Required',
  BUSY: 'Busy',
} as const;

// Local storage key
export const CALLS_STORAGE_KEY = 'crm_calls_data' as const;