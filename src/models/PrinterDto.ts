import { type UserDto } from "./UserDto";
import { type PrinterIdentityProviderDto } from "./PrinterIdentityProviderDto";

export type PrinterDto = {
  id?: number;
  printerName?: string | null;
  userData?: Array<UserDto> | null;
  printerIdentityProv?: Array<PrinterIdentityProviderDto> | null;
};
