import { ApiError as ApiErrorApi, ApiErrorSvc } from '../../../api';
import { ApiErrorImplementation } from '../../types/internal-api';

export class ApiErrorSvcImplementation implements ApiErrorSvc {
    createError(code: ApiErrorApi.Code, message?: string) {
        return new ApiErrorImplementation(code, message);
    }
}
