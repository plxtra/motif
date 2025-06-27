import { AssertInternalError } from '@pbkware/js-utils';

export class SignOutService {
    signOutEvent: SignOutService.SignOutEvent | undefined;

    signOut() {
        if (this.signOutEvent === undefined) {
            throw new AssertInternalError('SOSSO3386200');
        } else {
            this.signOutEvent();
        }
    }
}

export namespace SignOutService {
    export type SignOutEvent = (this: void) => void;
}
