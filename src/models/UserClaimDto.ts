export type UserClaimDto = {
    userId?: number;
    uniqueIdentifier?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    email?: string | null;
    userType: string | null;
    printerId: number  | null;
    roleKey: number  | null;
    printerName: string  | null;
};