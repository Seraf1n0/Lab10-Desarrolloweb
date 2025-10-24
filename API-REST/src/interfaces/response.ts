// Interface para las respuestas esperadas (debe haber una para error y otra para exito)
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details: Record<string, any>;
    timestamp: string;
    path: string;
  };
}

// Interface para respuestas de exito (genérica para diferentes tipos de data)
interface SuccessResponse<T = any> {
    code: string;
    message: string;
    data: T;
    timestamp: string;
    path: string;
}

export { ErrorResponse, SuccessResponse };