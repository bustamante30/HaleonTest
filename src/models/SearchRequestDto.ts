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
  };