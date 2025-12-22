

export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    meta?: unknown;
};

// Standard API Response Helper
export function successResponse<T>(data: T, message?: string) {
    return Response.json({
        success: true,
        data,
        message
    });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
    return Response.json({
        success: false,
        message,
        details
    }, { status });
}
