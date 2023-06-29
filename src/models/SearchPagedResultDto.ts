import type { ReorderDto } from './ReorderDto';


export type SearchPagedResultDto= {
    pageNumber?: number;
    pageSize?: number;
    totalNumberOfRecords?: number;
    results?: Array<ReorderDto> | null;
};
