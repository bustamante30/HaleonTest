import { type ColourDto } from "./ColourDto";

export type SearchPagedResultDto= {
    pageNumber?: number;
    pageSize?: number;
    totalNumberOfRecords?: number;
    results?: Array<ReorderDto> | null;
};


export type ReorderDto = {
    originalOrderId?: string;
    id?: number;
    sgsId?: string | number;
    brandName?: string | null;
    description?: string | null;
    weight?: string | null;
    printerId?: number;
    printerName?: string | null;
    itemCode?: string | null;
    packType?: string | null;
    createdAt?: Date | null;
    submittedDate?: Date | null | string;
    cancelledDate?: Date | null;
    createdBy?: number;
    statusId?: number;
    orderStatus?: string | null;
    thumbNailPath: string | null;
    colors?: Array<ColourDto> | null;
    myOrdersToggled?: boolean;
};


export type { ColourDto };
