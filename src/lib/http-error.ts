/**
 * Error que el código de servidor lanza para responder con un código HTTP concreto.
 * `apiErrorResponse` lo traduce al formato `ApiError`.
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string | string[],
    public readonly error: string = defaultErrorName(statusCode),
  ) {
    super(Array.isArray(message) ? message.join(" ") : message);
    this.messages = message;
  }

  readonly messages: string | string[];
}

function defaultErrorName(statusCode: number): string {
  const names: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
  };
  return names[statusCode] ?? (statusCode >= 500 ? "Internal Server Error" : "Error");
}
