import { type UserRoleDto } from "./UserRoleDto";
import { type UserPrinterLocationDto } from "./UserPrinterLocationDto";
 
export type UserDto = {
    id?: number;
    uniqueIdentifier?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    email?: string | null;
    userType?: string | null;
    printerId?: number| null;
    isAdmin?: boolean | null;
    isPrimaryPM?: boolean | null;
    roles?: Array<UserRoleDto> | null;
    printerLoc?: Array<UserPrinterLocationDto> | null;
};
