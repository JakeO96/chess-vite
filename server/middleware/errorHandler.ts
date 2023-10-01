import { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from '../constants'

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode ? res.statusCode : HttpStatusCode.SERVER_ERROR;
  switch (statusCode) {
    case HttpStatusCode.VALIDATION_ERROR:
      res.status(statusCode).json( { title: "Validation Failed", message: err.message, stackTrace: err.stack, });
      break;
    case HttpStatusCode.UNAUTHORIZED:
      res.status(statusCode).json( { title: "Unauthorized", message: err.message, stackTrace: err.stack, });
      break;
    case HttpStatusCode.FORBIDDEN:
      res.status(statusCode).json( { title: "Forbidden", message: err.message, stackTrace: err.stack, });
      break;
    case HttpStatusCode.NOT_FOUND:
      res.status(statusCode).json( { title: "Not Found", message: err.message, stackTrace: err.stack, });
      break;
    case HttpStatusCode.SERVER_ERROR:
      res.status(statusCode).json( { title: "Server Error", message: err.message, stackTrace: err.stack, });
      break;
    case HttpStatusCode.SUCCESS:
      res.status(statusCode).json( { message: "no error"});
      break;
    case HttpStatusCode.RECORD_CREATED:
      res.status(statusCode).json( { message: "no error"});
      break;
    default:
      res.status(HttpStatusCode.SERVER_ERROR).json( { title: "No case for this Error", message: err.message, stackTrace: err.stack, });
      break;
  }
}

export { errorHandler }