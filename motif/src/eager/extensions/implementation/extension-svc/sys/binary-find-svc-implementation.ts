import { BinaryFind } from '@pbkware/js-utils';
import { BinaryFind as BinaryFindApi, BinaryFindSvc, Integer } from '../../../api';
import { ComparisonResultImplementation } from '../../types/internal-api';

export class BinaryFindSvcImplementation implements BinaryFindSvc {
    any<T>(values: T[], compareItemFn: BinaryFindApi.CompareItemFn<T>): BinaryFind.Result {
        return  BinaryFind.any(values, (item) => {
            const comparisonResultApi = compareItemFn(item);
            return ComparisonResultImplementation.fromApi(comparisonResultApi);
        });
    }

    rangedAny<T>(values: T[], compareItemFn: BinaryFindApi.CompareItemFn<T>, index: Integer, count: Integer): BinaryFind.Result {
        return  BinaryFind.rangedAny(
            values,
            (item) => {
                const comparisonResultApi = compareItemFn(item);
                return ComparisonResultImplementation.fromApi(comparisonResultApi);
            },
            index,
            count,
        );
    }

    earliest<T>(values: T[], compareItemFn: BinaryFindApi.CompareItemFn<T>): BinaryFind.Result {
        return  BinaryFind.earliest(
            values,
            (item) => {
                const comparisonResultApi = compareItemFn(item);
                return ComparisonResultImplementation.fromApi(comparisonResultApi);
            }
        );
    }

    rangedEarliest<T>(values: T[], compareItemFn: BinaryFindApi.CompareItemFn<T>, index: Integer, count: Integer): BinaryFind.Result {
        return  BinaryFind.rangedEarliest(
            values,
            (item) => {
                const comparisonResultApi = compareItemFn(item);
                return ComparisonResultImplementation.fromApi(comparisonResultApi);
            },
            index,
            count,
        );
    }

    latest<T>(values: T[], compareItemFn: BinaryFindApi.CompareItemFn<T>): BinaryFind.Result {
        return  BinaryFind.latest(
            values,
            (item) => {
                const comparisonResultApi = compareItemFn(item);
                return ComparisonResultImplementation.fromApi(comparisonResultApi);
            }
        );
    }

    rangedLatest<T>(values: T[], compareItemFn: BinaryFindApi.CompareItemFn<T>, index: Integer, count: Integer): BinaryFind.Result {
        return  BinaryFind.rangedEarliest(
            values,
            (item) => {
                const comparisonResultApi = compareItemFn(item);
                return ComparisonResultImplementation.fromApi(comparisonResultApi);
            },
            index,
            count,
        );
    }
}
