export interface PrinterSearchResponseDto {
    PrinterId: number;
    PrinterName: string;
    ExternalUserCount?: number | null;
    InternalUserCount?: number | null;
    TotalUserCount?: number | null;
    identityProviderId?: number  | null;
    identityTypeId?: number  | null;
    identityProviderName?: string  | null;
    identityTypeName?: string  | null;

  }