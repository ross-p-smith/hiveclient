export interface ErrorResponse {
    errorMessage: string;
    errorType: string;
    details?: unknown;
  }
  
  /**
   * A generic result pattern implementation.
   * Instead of returning the result directly, which can be an error or data itself,
   * we wrap them with a meaningful state: Success or Failure
   */
  export class Result<T> {
    public readonly success: boolean;
    public readonly failure: boolean;
    public readonly statusCode: number;
    public readonly status: string;
    public readonly content: T | null;
    public readonly error: ErrorResponse | null;
  
    private constructor(
      content: T | null,
      error: ErrorResponse | null,
      success: boolean,
      statusCode: number
    ) {
      this.content = content;
      this.error = error;
      this.success = success;
      this.failure = !success;
      this.statusCode = statusCode;
      this.status = success ? "Success" : "Error";
    }
  
    public static Succeeded<T>(content: T): Result<T> {
      return new Result<T>(content, null, true, 200);
    }
  
    public static Failed<T>(
      error: ErrorResponse,
      statusCode: number = 400
    ): Result<T> {
      return new Result<T>(null, error, false, statusCode);
    }
  }