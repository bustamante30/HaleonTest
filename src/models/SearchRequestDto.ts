export type SearchRequestDto = {
    searchText: string;
    pageNumber: number;
    pageCount: number;
    orderBy: string;
    orderByAsc: boolean;
    isActive: boolean;
    printerId: number;
    userId: number;
    userTypeKey: string;
    isDashboardPage?: Boolean;
  };

  export type SearchRequestSendToPmDto = {
    searchText: string;
    pageNumber: number;
    pageCount: number;
    orderBy: string;
    orderByAsc: boolean;
    isActive: boolean;
    printerId: number;
    userId: number;
    userTypeKey: string;
    roleKey: string;
    locationId: number;
    locationName: string;
  };