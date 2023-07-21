export interface UserSearchResponseDto {
    id: number;
    uniqueIdentifier: string;
    firstName: string;
    lastName: string;
    displayName: string;
    email: string;
    isAdmin: boolean | null;
    role: string;
    isActive: boolean | null;
    userTypeId: number;
    userType: string;
    createdBy: number | null;
    modifiedBy: number | null;
    createdOn: Date | null;
    modifiedOn: Date | null;
    printerId: number;
    printerName: string;
  }