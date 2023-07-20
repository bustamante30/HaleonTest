import { type UserRoleDto } from "./UserRoleDto";
import { type UserPrinterLocationDto } from "./UserPrinterLocationDto";
 
export type UserDto = {
    id?: number;
    uniqueIdentifier?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    email?: string | null;
    userType: string | null;
    userRoles?: Array<UserRoleDto> | null;
    userPrinterLocation?: Array<UserPrinterLocationDto> | null;
};
