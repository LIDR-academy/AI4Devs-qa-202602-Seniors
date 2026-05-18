import { updateCandidateStageController, setApplicationProgressionService } from './candidateController';
import { Request, Response } from 'express';
import { NotFoundError } from '../../application/errors/AppError';

// Mock service factory to ensure clean state per test
const createMockService = () => ({
  updateCandidateStage: jest.fn(),
});

describe('updateCandidateStageController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let mockService: ReturnType<typeof createMockService>;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    // Create fresh mock service for each test
    mockService = createMockService();

    // Inject mock service using setApplicationProgressionService
    setApplicationProgressionService(mockService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 on successful stage update', async () => {
    mockService.updateCandidateStage.mockResolvedValue({
      id: 1,
      positionId: 1,
      candidateId: 1,
      currentInterviewStep: 2,
    });

    mockReq = {
      params: { id: '1' },
      body: { applicationId: 1, currentInterviewStep: 2 },
    };

    await updateCandidateStageController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Candidate stage updated successfully',
      data: expect.any(Object),
    });
  });

  it('should return 404 when application not found', async () => {
    mockService.updateCandidateStage.mockRejectedValue(new NotFoundError('Application not found'));

    mockReq = {
      params: { id: '1' },
      body: { applicationId: 1, currentInterviewStep: 2 },
    };

    await updateCandidateStageController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Application not found',
      error: 'Application not found',
    });
  });

  it('should return 400 for invalid ID format', async () => {
    mockReq = {
      params: { id: 'invalid' },
      body: { applicationId: 1, currentInterviewStep: 2 },
    };

    await updateCandidateStageController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid ID format',
    });
  });

  it('should return 400 for invalid applicationId format', async () => {
    mockReq = {
      params: { id: '1' },
      body: { applicationId: 'invalid', currentInterviewStep: 2 },
    };

    await updateCandidateStageController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid position ID format',
    });
  });

  it('should return 400 for invalid currentInterviewStep format', async () => {
    mockReq = {
      params: { id: '1' },
      body: { applicationId: 1, currentInterviewStep: 'invalid' },
    };

    await updateCandidateStageController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Invalid currentInterviewStep format',
    });
  });

  it('should return 400 for generic error', async () => {
    mockService.updateCandidateStage.mockRejectedValue(new Error('Generic error'));

    mockReq = {
      params: { id: '1' },
      body: { applicationId: 1, currentInterviewStep: 2 },
    };

    await updateCandidateStageController(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Error updating candidate stage',
      error: 'Generic error',
    });
  });
});