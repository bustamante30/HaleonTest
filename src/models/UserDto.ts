import { type UserRoleDto } from "./UserRoleDto";
import type { UserPrinterDto } from "./UserPrinterDto";
import type { PlatingLocationDto } from "./PlatingLocationDto";

export type UserDto = {
  id?: number;
  uniqueIdentifier?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  email?: string | null;
  userType?: string | null;
  printerId?: number | null;
  isAdmin?: boolean | null;
  isPrimaryPM?: boolean | null;
  roles?: Array<UserRoleDto> | null;
  userPrinter?: Array<UserPrinterDto> | null;
  platingLocation?: Array<PlatingLocationDto> | null;
};
