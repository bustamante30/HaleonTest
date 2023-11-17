/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CartAddRequestDto } from "@/models/CartAddRequestDto";
import type { ReorderDto } from "../models/ReorderDto";
import ApiService from "../services/apiService";
import type { CartResponseDto } from "@/models/CartResponseDto";
import * as Constants from "./Constants";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? Constants.API_LOCAL_URL;

const httpService = new ApiService(baseUrl);

interface SearchPagedResultDto {
  data: ReorderDto[];
  totalRecords: number;
}

interface APIResponse<T> {
  result?: boolean;
  data?: T;
  isBusinessError?: boolean;
  ExceptionDetails?: APIException;
}

interface APIException {
  Message?: string;
  statusCode?: number;
}

type Reorderdoc = {
  fileName: string;
  url: string;
};
interface SubmitReorder {
  id: number;
  originalOrderId: string;
  brandName: string;
  description: string;
  weight: string;
  itemCode: string;
  printerName: string;
  printerId: number;
  packType: string;
  statusId: number;
  expectedDate: Date;
  notes: string;
  PO: string;
  createdBy?: number;
  plateRelief: string;
  variety: string;
  isActive: boolean;
  colors: Color[];
  customerContacts: CustomerContact[];
  reorderDocs: Reorderdoc[];
  packagingReference: string;
  isRushOrder: boolean;
}

interface PlateType {
  id: number;
  reorderColourPlateTypeId: number;
  plateTypeId: number;
  plateType: string;
  plateThicknessId: number;
  plateThickness: string;
  sets: number;
  isActive: boolean;
}
interface Color {
  id: number;
  jobTechSpecColourId: number;
  colourName: string;
  sequenceNumber: number;
  clientPlateColourRef: string;
  custCarrierIdNo: string;
  custImageIdNo: string;
  imageCarrierId: string;
  serialNumber: number;
  sets: number;
  originalSets: number;
  plateTypeId: number;
  plateTypeDescription: string;
  plateThicknessId: number;
  plateThicknessDescription: string;
  colourType: string;
  isNew: boolean;
  newColour?: string;
  commonColourRef: string;
  isActive: boolean;
  totalSets?: number;
  plates?: PlateType[];
}

interface CustomerContact {
  id: number;
  alias: string;
  customerContactId: string;
  sgsCustomerId: string;
  customerName: string;
  shippingAddress: string;
  siteName: string;
  isActive: boolean;
}
class ReorderService {
  public static submitReorder(
    reorderInfo: any,
    statusId: number,
    isUpdate?: boolean,
  ) {
    const newColors = JSON.parse(JSON.stringify(reorderInfo.editionColors));
    const newContacts = [] as any[];
    ///code added to resolve the iisue with the plate details:
    newColors.forEach((color: any) => {
      delete color.lenData;
      delete color.fullPlateList;
      delete color.printerPlateList;
      delete color.fullThicknessList;
      delete color.checkboxId;
      let hasPlates = false;
      for (const plateType of color.plateDetails) {
        if (plateType.sets > 0) {
          hasPlates = true;
          delete plateType.checkboxId;
          delete plateType.plateList;
          delete plateType.thicknessList;
          delete plateType.alternateOptions;
        }
      }
      ///api expects plates and sets fields:
      if (hasPlates)
        color.plates = color.plateDetails.filter((x) => x.sets > 0);
      else color.plates = [];
      delete color.plateType;
      delete color.plateDetails;
      color.sets = color.totalSets;
    });
    reorderInfo.customerContacts.forEach((contact: any) => {
      newContacts.push({
        id: isUpdate ? contact.id : 0,
        alias: contact.alias,
        customerContactId: contact.customerContactId,
        sgsCustomerId: contact.customerId,
        customerName: contact.customerName,
        siteName: contact.siteName,
        shippingAddress: contact.shippingAddress ? contact.shippingAddress : "",
        isActive: contact.isActive,
      });
    });
    const newReorder: SubmitReorder = {
      id: isUpdate ? reorderInfo.id : 0,
      originalOrderId: reorderInfo.originalOrderId
        ? reorderInfo.originalOrderId
        : reorderInfo.sgsId,
      brandName: reorderInfo.brandName,
      description: reorderInfo.description,
      weight: reorderInfo.weight,
      itemCode: reorderInfo.itemCode,
      printerId: 1,
      printerName: reorderInfo.printerName,
      packType: reorderInfo.packType,
      statusId: statusId,
      variety: reorderInfo.variety,
      PO: reorderInfo.PO,
      expectedDate: reorderInfo.expectedDate
        ? reorderInfo.expectedDate
        : new Date(),
      notes: reorderInfo.Notes,
      plateRelief: reorderInfo.plateRelief,
      reorderDocs: reorderInfo.reorderDocs,
      isActive: reorderInfo.isActive,
      colors: [...newColors],
      customerContacts: [...newContacts],
      packagingReference: reorderInfo.packagingReference,
      isRushOrder: reorderInfo.isUrgent,
    };

    return httpService
      .post<APIResponse<any>>("v1/Reorder/submitReorder", newReorder)
      .then((response: APIResponse<any>) => {
        if (response.result) {
          this.decorateColours(response.data?.colors);
        }
        return response;
      })
      .catch((error: any) => {
        console.log("Error submitting reorder:", error);
        return { result: false, ExceptionDetails: { Message: error } };
      });
  }
  public static getRecentReorders(
    status: number,
    query?: string,
    sortBy?: string,
    sortOrder?: string,
    page?: number,
    pageSize?: number,
    filters?: any,
    columnFilters?: any,
    printerNames?: string[],
    printerUserIds?: number[],
  ) {
    let params = {};
    const advancedSearchParameters = JSON.parse(JSON.stringify(filters));
    if (query == "") {
      params = {
        status: status,
        pageNumber: page,
        pageCount: pageSize,
        printerId: 1,
        brandName:
          columnFilters != null
            ? columnFilters.state.brandNameFilter != null
              ? columnFilters.state.brandNameFilter
              : null
            : null,
        packType:
          columnFilters != null
            ? columnFilters.state.packTypeFilter != null
              ? columnFilters.state.packTypeFilter
              : null
            : null,
        Description:
          columnFilters != null
            ? columnFilters.state.descriptionFilter != null
              ? columnFilters.state.descriptionFilter
              : null
            : null,
        orderStatusId: status,
        OrderBy: sortBy != null ? sortBy : null,
        OrderByAsc: sortOrder != null ? sortOrder : true,
        printerName: printerNames ? printerNames : [],
        roleKey: advancedSearchParameters.roleKey,
        printerUserIds: printerUserIds,
      };
    } else {
      params = {
        status: status,
        pageNumber: page,
        pageCount: pageSize,
        printerId: 1,
        searchText: query,
        brandName:
          columnFilters != null
            ? columnFilters.state.brandNameFilter != null
              ? columnFilters.state.brandNameFilter
              : null
            : null,
        packType:
          columnFilters != null
            ? columnFilters.state.packTypeFilter != null
              ? columnFilters.state.packTypeFilter
              : null
            : null,
        Description:
          columnFilters != null
            ? columnFilters.state.descriptionFilter != null
              ? columnFilters.state.descriptionFilter
              : null
            : null,
        orderStatusId: status,
        OrderBy: sortBy != null ? sortBy : null,
        OrderByAsc: sortOrder != null ? sortOrder : true,
        printerName: printerNames ? printerNames : [],
        roleKey: advancedSearchParameters.roleKey,
        printerUserIds: printerUserIds,
      };
    }

    if (advancedSearchParameters) {
      if (advancedSearchParameters.startDate != null) {
        const dateRange = Object.assign<Array<Date>, Array<Date>>(
          [],
          advancedSearchParameters.startDate,
        );
        advancedSearchParameters.startDate = dateRange[0];
        advancedSearchParameters.endDate = dateRange[1];
        (params as any)["advancedSearchParameters"] = advancedSearchParameters;
      }
      if (advancedSearchParameters.printerName) {
        (params as any)["advancedSearchParameters"] = advancedSearchParameters;
      }
    }
    return httpService
      .post<SearchPagedResultDto>("v1/Reorder/search", params, undefined, true)
      .then((response: SearchPagedResultDto) => {
        const reorderedData: ReorderDto[] = response.data
          ? response.data.map((item: ReorderDto) => ({
              id: item.id,
              sgsId:
                item.sgsId != null
                  ? item.sgsId
                  : item.id
                  ? item.id.toString()
                  : "",
              brandName: item.brandName,
              description: item.description,
              weight: item.weight,
              printerId: item.printerId,
              printerName: item.printerName,
              packType: item.packType, // Renamed to packStatus to match DTO
              createdAt: item.createdAt ? item.createdAt : null,
              submittedDate: item.submittedDate ? item.submittedDate : null,
              cancelledDate: item.cancelledDate ? item.cancelledDate : null,
              orderStatus: item.orderStatus ? item.orderStatus : null,
              createdBy: item.createdBy,
              statusId: item.statusId,
              thumbNailPath: new URL(
                "@/assets/images/no_thumbnail.png",
                import.meta.url,
              ).pathname,
              itemCode: item.itemCode,
              originalOrderId: item.originalOrderId,
            }))
          : [];

        const totalRecords: number = response.totalRecords ?? 1000;
        return {
          reorderedData,
          totalRecords,
        };
      })
      .catch((error: any) => {
        console.error("[Error getting reorders]:", error);
        return [];
      });
  }

  public static getOrderDetails(sgsId: string) {
    return httpService
      .get<any>("v1/Reorder/info?jobnumber=" + sgsId)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting reorders]: ", error);
        return null;
      });
  }
  public static getOrderAvailablePlates(sgsId: string, printerName: string) {
    return httpService
      .get<any>(
        "v1/Reorder/info/availablePlates?jobnumber=" +
          sgsId +
          "&printerName=" +
          printerName,
      )
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting OrderAvailablePlates]: ", error);
        return null;
      });
  }

  public static getCartCount() {
    return httpService
      .get<any>("v1/Reorder/cart-count")
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting cart count]: ", error);
        return 0;
      });
  }
  public static getPhotonReorderDetails(id: string) {
    return httpService
      .get<any>("v1/Reorder/photon-reorder-details?orderId=" + id)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting photon reorder]: ", error);
        return null;
      });
  }

  public static getCart() {
    return httpService
      .get<any>("v1/Reorder/user-cart")
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting cart]: ", error);
        return 0;
      });
  }
  public static discardOrder(id: string) {
    return httpService
      .post<any>("v1/Reorder/discardOrder/" + id)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error discarding order]: ", error);
        return { result: false, ExceptionDetails: { Message: error } };
      });
  }

  public static cancelOrder(orderId: number, isActive: boolean) {
    return httpService
      .delete<boolean>(
        "v1/Reorder/cancel?orderId=" + orderId + "&isActive=" + isActive + "",
      )
      .then((response: boolean) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error deleting order]:", error);
        return { result: false, ExceptionDetails: { Message: error } };
      });
  }

  public static getThumbnail(sgsId: string) {
    return httpService
      .get<string>(`v1/Reorder/${sgsId.split("-")[0]}/thumbnail`)
      .then((response: string) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting thumbnail]:", error);
        return false;
      });
  }

  public static getPdfs(sgsId: string) {
    return httpService
      .get<string>(`v1/Reorder/${sgsId.split("-")[0]}/pdfs`)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting pdfs]:", error);
        return false;
      });
  }

  public static decorateColours(colors: Color[] | undefined) {
    if (colors)
      colors.forEach((color) => {
        color.plates = color.plates?.sort(
          (a, b) => a.plateTypeId - b.plateTypeId,
        );
        color.newColour = color.isNew ? "New" : "Common";
        color.imageCarrierId = color.custImageIdNo
          ? color.custImageIdNo
          : color.custCarrierIdNo
          ? color.custCarrierIdNo
          : color.imageCarrierId;
        color.totalSets = color.sets;
      });
  }

  public static getBarcode(id: string) {
    return httpService
      .get<any>("v1/Reorder/barcode?orderId=" + id)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting barcode]: ", error);
        return 0;
      });
  }

  public static getShirttail(id: string) {
    return httpService
      .get<any>("v1/Reorder/shirttail?orderId=" + id)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting shirttail]: ", error);
        return 0;
      });
  }

  public static getReorderAudit(id: number) {
    return httpService
      .get<any>("v1/audit/reorder/" + id)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting shirttail]: ", error);
        return { result: false, ExceptionDetails: { Message: error } };
      });
  }

  public static async validateOrder(jobNo: string) {
    return httpService
      .post<any>("v1/Reorder/info/ValidateOrder?jobnumber=" + jobNo)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error while validate order service]:", error);
        return false;
      });
  }

  public static async getLen(jobNo: string, sequenceNumber: number) {
    return httpService
      .get<any>(
        "v1/Reorder/lenThumbnails?sgsOrderID=" +
          jobNo +
          "&sequenceNumber=" +
          sequenceNumber,
      )
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error getting reorders]: ", error);
        return null;
      });
  }
  public static async decoratePhotonOrder(order: any) {
    this.decorateColours(order.colors);
    order.thumbNailPath = new URL(
      "@/assets/images/no_thumbnail.png",
      import.meta.url,
    );
    ReorderService.getThumbnail(order.originalOrderId).then(
      (response: string | boolean) => {
        if (response) order.thumbNailPath = response;
      },
    );
    //transform cart colors to the structure used in the ui
    order.editionColors = JSON.parse(JSON.stringify(order.colors));
    //remove duplicate colors for first page
    const distinctColors = order.colors.filter((thing, i, arr) => {
      return (
        arr.indexOf(
          arr.find((t) => t.sequenceNumber === thing.sequenceNumber),
        ) === i
      );
    });
    order.colors = distinctColors;
  }

  public static async addOrdersToCart(
    cartAddRequest: Array<CartAddRequestDto>,
  ): Promise<APIResponse<CartResponseDto[]>> {
    return httpService
      .post<any>("v1/Reorder/addToCartBulk", cartAddRequest)
      .then((response: APIResponse<CartResponseDto[]>) => {
        return response;
      })
      .catch((error: any) => {
        console.error("[Error while adding order to Cart]:", error);
        return { result: false, ExceptionDetails: { Message: error } };
      });
  }

  public static async exportToExcel(
    status: number,
    query?: string,
    sortBy?: string,
    sortOrder?: string,
    page?: number,
    pageSize?: number,
    filters?: any,
    printerNames?: string[],
    printerUserIds?: number[],
  ) {
    let params = {};
    const advancedSearchParameters = JSON.parse(JSON.stringify(filters));
    if (query == "") {
      params = {
        status: status,
        pageNumber: page,
        pageCount: pageSize,
        printerId: 0,
        orderStatusId: status,
        OrderBy: sortBy != null ? sortBy : null,
        OrderByAsc: sortOrder != null ? sortOrder : true,
        printerName: printerNames ? printerNames : [],
        roleKey: advancedSearchParameters.roleKey,
        printerUserIds: printerUserIds,
      };
    }

    if (advancedSearchParameters) {
      if (advancedSearchParameters.startDate != null) {
        const dateRange = Object.assign<Array<Date>, Array<Date>>(
          [],
          advancedSearchParameters.startDate,
        );
        advancedSearchParameters.startDate = dateRange[0];
        advancedSearchParameters.endDate = dateRange[1];
        (params as any)["advancedSearchParameters"] = advancedSearchParameters;
      }
      if (advancedSearchParameters.printerName) {
        (params as any)["advancedSearchParameters"] = advancedSearchParameters;
      }
    }
    return httpService
      .post<any>("v1/Reorder/export-excel", params)
      .then((response: any) => {
        return response;
      })
      .catch((error: any) => {
        console.log("Error Exporting reorders:", error);
        return [];
      });
  }
}

export default ReorderService;
