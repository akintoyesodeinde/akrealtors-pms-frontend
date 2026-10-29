export interface ApiProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  errorCode?: string;
  correlationId?: string;
  timestamp?: string;
  errors?: Record<string, string>;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly errorCode: string;
  public readonly correlationId?: string;
  public readonly fieldErrors: Record<string, string>;

  constructor(problem: ApiProblemDetail) {
    super(problem.detail ?? problem.title ?? 'Request failed');
    this.name = 'ApiClientError';
    this.status = problem.status;
    this.errorCode = problem.errorCode ?? 'UNKNOWN_ERROR';
    this.correlationId = problem.correlationId;
    this.fieldErrors = problem.errors ?? {};
  }
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
