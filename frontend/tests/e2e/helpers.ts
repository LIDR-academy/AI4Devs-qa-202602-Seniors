import { Page } from '@playwright/test';

const API_BASE_URL = 'http://localhost:3000/api';

export interface TestCandidate {
  id: string;
  name: string;
  email: string;
  phase: string;
}

export interface TestPosition {
  id: string;
  title: string;
}

export class TestDataManager {
  constructor(private page: Page) {}

  async createPosition(title: string): Promise<TestPosition> {
    const response = await this.page.request.post(`${API_BASE_URL}/position`, {
      data: { title },
    });
    if (!response.ok()) {
      throw new Error(`Failed to create position: ${response.status()}`);
    }
    const position = await response.json();
    return position;
  }

  async createCandidate(
    positionId: string,
    name: string,
    email: string,
    phase: string
  ): Promise<TestCandidate> {
    const response = await this.page.request.post(`${API_BASE_URL}/candidate`, {
      data: { positionId, name, email, phase },
    });
    if (!response.ok()) {
      throw new Error(`Failed to create candidate: ${response.status()}`);
    }
    const candidate = await response.json();
    return candidate;
  }

  async updateCandidatePhase(
    candidateId: string,
    newPhase: string
  ): Promise<TestCandidate> {
    const response = await this.page.request.put(
      `${API_BASE_URL}/candidate/${candidateId}`,
      {
        data: { phase: newPhase },
      }
    );
    if (!response.ok()) {
      throw new Error(`Failed to update candidate phase: ${response.status()}`);
    }
    return response.json();
  }

  async deleteCandidate(candidateId: string): Promise<void> {
    const response = await this.page.request.delete(
      `${API_BASE_URL}/candidate/${candidateId}`
    );
    if (!response.ok()) {
      throw new Error(`Failed to delete candidate: ${response.status()}`);
    }
  }

  async deletePosition(positionId: string): Promise<void> {
    const response = await this.page.request.delete(
      `${API_BASE_URL}/position/${positionId}`
    );
    if (!response.ok()) {
      throw new Error(`Failed to delete position: ${response.status()}`);
    }
  }

  async getPosition(positionId: string): Promise<TestPosition> {
    const response = await this.page.request.get(
      `${API_BASE_URL}/position/${positionId}`
    );
    if (!response.ok()) {
      throw new Error(`Failed to fetch position: ${response.status()}`);
    }
    return response.json();
  }

  async getCandidates(positionId: string): Promise<TestCandidate[]> {
    const response = await this.page.request.get(
      `${API_BASE_URL}/position/${positionId}/candidates`
    );
    if (!response.ok()) {
      throw new Error(`Failed to fetch candidates: ${response.status()}`);
    }
    return response.json();
  }
}
