import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        res
          .status(400)
          .json({ error: "validation_error", message: e.errors.map((x) => x.message).join("; ") });
        return;
      }
      next(e);
    }
  };
}
