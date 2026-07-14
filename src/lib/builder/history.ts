import { BuilderBlock } from "./types";

const MAX_HISTORY = 50;

export class BuilderHistory {
  private past: BuilderBlock[][] = [];
  private future: BuilderBlock[][] = [];

  push(state: BuilderBlock[]) {
    this.past.push(JSON.parse(JSON.stringify(state)));
    if (this.past.length > MAX_HISTORY) this.past.shift();
    this.future = []; // clear redo stack on new action
  }

  undo(current: BuilderBlock[]): BuilderBlock[] | null {
    if (this.past.length === 0) return null;
    this.future.push(JSON.parse(JSON.stringify(current)));
    return this.past.pop()!;
  }

  redo(current: BuilderBlock[]): BuilderBlock[] | null {
    if (this.future.length === 0) return null;
    this.past.push(JSON.parse(JSON.stringify(current)));
    return this.future.pop()!;
  }

  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }
}
