import { ContestData } from "@/types/contest";

export class ContestModel {
  twitterStatusId: string | null;
  description: string | null;
  startTimeContest: number | null;
  endTimeContest: number | null;
  owner: string | null;

  constructor(data: ContestData) {
    this.twitterStatusId = data.twitterStatusId;
    this.description = data.description;
    this.startTimeContest = data.startTimeContest;
    this.endTimeContest = data.endTimeContest;
    this.owner = data.owner;
  }

  isEnded(): boolean {
    if (!this.endTimeContest) return false;
    return Date.now() / 1000 >= this.endTimeContest;
  }

  isStarted(): boolean {
    if (!this.startTimeContest) return false;
    return Date.now() / 1000 >= this.startTimeContest;
  }

  getProgress(): number {
    if (!this.startTimeContest || !this.endTimeContest) return 0;
    const now = Date.now() / 1000;
    const elapsed = now - this.startTimeContest;
    const total = this.endTimeContest - this.startTimeContest;
    return Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
  }

  getRemainingDays(): number {
    if (!this.endTimeContest) return 0;
    const today = Date.now();
    const end = Number(this.endTimeContest) * 1000;
    const remainingMs = Math.max(0, end - today);
    return Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  }
}
