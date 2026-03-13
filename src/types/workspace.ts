export interface CreatorStreak {
  count:         number
  lastWeekStart: string | null  // 'YYYY-MM-DD' of Monday of the last week they published
}

export interface Workspace {
  streaks: {
    Pab:   CreatorStreak
    Opher: CreatorStreak
  }
}

export const WORKSPACE_DEFAULTS: Workspace = {
  streaks: {
    Pab:   { count: 0, lastWeekStart: null },
    Opher: { count: 0, lastWeekStart: null },
  },
}
