
export type UserDto = {
    id?: number;
    uniqueIdentifier?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    email?: string | null;
    userType: UserTypeDto;
};

export type UserTypeDto = {
    id: number;
    directoryId: null;
    type: string;
    userKey: null;
    isActive: null;
  };
