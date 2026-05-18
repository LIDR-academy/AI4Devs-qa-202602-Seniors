/**
 * Candidate API - handles CV upload and candidate creation
 * Follows a clean fetch-based pattern with proper error handling
 */

const API_BASE_URL = 'http://localhost:3010';

// ============================================================================
// Types
// ============================================================================

export interface CvUploadResponse {
  filePath: string;
  fileType: string;
}

export interface CandidatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  educations: EducationPayload[];
  workExperiences: WorkExperiencePayload[];
  cv: CvFilePayload | null;
}

export interface EducationPayload {
  institution: string;
  title: string;
  startDate: string;
  endDate: string;
}

export interface WorkExperiencePayload {
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CvFilePayload {
  filePath: string;
  fileType: string;
}

// ============================================================================
// Private helpers
// ============================================================================

/**
 * Check if error is a network/TypeError (e.g., no internet, DNS failure)
 * These typically indicate getApiBaseUrl() cannot reach the server
 */
function isNetworkError(error: unknown): error is TypeError {
  return error instanceof TypeError;
}

/**
 * Handle fetch errors and return user-friendly Spanish message
 */
function handleFetchError(error: unknown): string {
  if (isNetworkError(error)) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido. Por favor, intenta de nuevo.';
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Upload a CV file to the server
 * POST multipart/form-data to /upload
 */
export async function uploadCvFile(file: File): Promise<CvUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new Error(handleFetchError(err));
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al subir archivo: ${response.status}. ${errorText}`);
  }

  const data = await response.json();
  return data as CvUploadResponse;
}

/**
 * Create a new candidate
 * POST JSON to /candidates
 */
export async function createCandidate(
  payload: CandidatePayload
): Promise<{ message?: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new Error(handleFetchError(err));
  }

  // Handle different status codes with Spanish messages
  if (response.status === 201) {
    return (await response.json()) as { message?: string };
  }

  if (response.status === 400) {
    let errorMessage = 'Datos inválidos';
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = `Datos inválidos: ${errorData.message}`;
      }
    } catch {
      // Response was not JSON, use default message
    }
    throw new Error(errorMessage);
  }

  if (response.status === 500) {
    throw new Error('Error interno del servidor');
  }

  throw new Error(`Error al enviar datos del candidato: código ${response.status}`);
}