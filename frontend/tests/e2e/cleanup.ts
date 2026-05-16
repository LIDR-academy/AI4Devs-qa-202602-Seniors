import { Page } from '@playwright/test';

const API_BASE_URL = 'http://localhost:3000/api';

export class TestCleanup {
  private createdCandidates: Set<string> = new Set();
  private createdPositions: Set<string> = new Set();

  constructor(private page: Page) {}

  trackCandidate(candidateId: string): void {
    this.createdCandidates.add(candidateId);
  }

  trackPosition(positionId: string): void {
    this.createdPositions.add(positionId);
  }

  async cleanup(): Promise<void> {
    await this.cleanupCandidates();
    await this.cleanupPositions();
  }

  private async cleanupCandidates(): Promise<void> {
    for (const candidateId of this.createdCandidates) {
      try {
        const response = await this.page.request.delete(
          `${API_BASE_URL}/candidate/${candidateId}`
        );
        if (!response.ok()) {
          console.warn(
            `Failed to delete candidate ${candidateId}: ${response.status()}`
          );
        }
      } catch (error) {
        console.warn(`Error cleaning up candidate ${candidateId}:`, error);
      }
    }
    this.createdCandidates.clear();
  }

  private async cleanupPositions(): Promise<void> {
    for (const positionId of this.createdPositions) {
      try {
        const response = await this.page.request.delete(
          `${API_BASE_URL}/position/${positionId}`
        );
        if (!response.ok()) {
          console.warn(
            `Failed to delete position ${positionId}: ${response.status()}`
          );
        }
      } catch (error) {
        console.warn(`Error cleaning up position ${positionId}:`, error);
      }
    }
    this.createdPositions.clear();
  }
}
