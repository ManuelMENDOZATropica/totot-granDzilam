export class HttpError extends Error {
  constructor(public statusCode: number, message: string, public details?: unknown) {
    super(message);
    this.name = 'HttpError';
  }
}

export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof Error && (error as HttpError).statusCode !== undefined;
};
