import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware = (err, req, res, next) => {
    let customError = err;
    if(!(err instanceof ApiError)){
        customError = new ApiError(err?.code || 500, err?.message || "Internal Server Error");
    }
    return res.status(customError.statusCode).json({
        success: false,
        message: customError.message || "Something went wrong",
        errors: customError.errors || [],
        data: customError.data || null,
        stack: process.env.NODE_ENV === "development" ? customError.stack : undefined
    });
}
