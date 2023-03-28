// This is here just to make typescript happy
declare module 'amazon-user-pool-srp-client'{
    export class SRPClient {
        constructor(userPoolId: string);
        calculateA(): string;
        getPasswordAuthenticationKey(userId: string, password: string, srpB: string, salt: string): string;
    }
    export function calculateSignature(hkdf: string, userPoolId: string, userId: string, secretBlock: string, dateNow: string): string;
    export function getNowString(): string;
};
