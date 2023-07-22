import { type UserDto } from "./UserDto";
import { type UserIdentityProviderDto } from "./UserIdentityProviderDto";
 
export type PrinterDto = {
    id?: number;
    printerName?: string | null;
    userData?: UserDto | null;
    userIdentityProv?: Array<UserIdentityProviderDto> | null;
};