import { ApiError } from '../../types';

/** @public */
export interface ApiErrorSvc {
    createError(code: ApiError.Code, message?: string): ApiError;
}
