
export type ReorderDto = {
    id?: number;
    sgsId?: number;
    brandName?: string | null;
    description?: string | null;
    weight?: string | null;
    printerId?: number;
    printerName?: string | null;
    printerLocationId?: number;
    printerLocationName?: string | null;
    packStatus?: string | null;
    createdAt?: Date | null;
    submittedDate?: Date | null;
    cancelledDate?: Date | null;
    createdBy?: number;
    statusId?: number;
    thumbNail?: string | null;
};

