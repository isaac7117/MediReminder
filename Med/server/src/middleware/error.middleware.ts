import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
}

export const errorMiddleware = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error:`, err);

  res.status(status).json({
    message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFoundMiddleware = (req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    status: 404
  });
};
