import type { Action } from './actions'

export interface LoggedAction {
  index: number
  action: Action
}

export class ActionLog {
  private entries: LoggedAction[] = []

  append(action: Action): LoggedAction {
    const entry = { index: this.entries.length, action }
    this.entries.push(entry)
    return entry
  }

  all(): readonly LoggedAction[] {
    return this.entries
  }

  clear() {
    this.entries = []
  }

  toJSON() {
    return this.entries
  }
}
