/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  mapPhotonOrderDetail,
  validation,
  newFilterProps,
  flattenColors,
  mapColorPlateTypes,
  mapPlateTypes,
  mapSgsOrderDetail,
} from "./utils";
import { DateTime } from "luxon";
import { defineStore } from "pinia";
import { faker } from "@faker-js/faker";
import { sum, sortBy } from "lodash";
import { toRaw } from "vue";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useCartStore } from "@/stores/cart";
import { useNotificationsStore } from "@/stores/notifications";
import filterStore from "@/stores/filterStore";
import ReorderService from "@/services/ReorderService";
import router from "@/router";
import type { ReorderDto } from "@/models/ReorderDto";
import { useAuthStore } from "./auth";
import * as Constants from "@/services/Constants";

const filter = (
  reorderedData: ReorderDto[],
  filters: any,
  columnFilter: any = null,
): ReorderDto[] => {
  // Filter by Date
  const startDate = filters.startDate[0] ? filters.startDate[0] : null;
  const endDate = filters.startDate[1] ? filters.startDate[1] : null;

  let filteredresult: any[] = [];
  if (
    startDate &&
    endDate &&
    (filters.query === "" || filters.query === null)
  ) {
    reorderedData.forEach((order) => {
      if (
        typeof order.submittedDate === "string" &&
        order.submittedDate?.includes("T")
      ) {
        const date = DateTime.fromISO(order.submittedDate).toMillis();
        if (
          date >= DateTime.fromJSDate(startDate).toMillis() &&
          date <= DateTime.fromJSDate(endDate).toMillis()
        ) {
          filteredresult.push(order);
        }
      }
    });
  } else {
    filteredresult = reorderedData;
  }

  //Filter by column filters
  let resultForCache: any[] = filteredresult;
  if (columnFilter != null) {
    if (columnFilter.state.brandNameFilter != null) {
      const brandNameFilter = columnFilter.state.brandNameFilter.toLowerCase();
      resultForCache = resultForCache.filter(
        (item) =>
          item.brandName &&
          item.brandName.toLowerCase().includes(brandNameFilter),
      );
    }
    if (columnFilter.state.descriptionFilter != null) {
      const productDescriptionFilter =
        columnFilter.state.descriptionFilter.toLowerCase();
      resultForCache = resultForCache.filter(
        (item) =>
          item.description &&
          item.description.toLowerCase().includes(productDescriptionFilter),
      );
    }
    if (columnFilter.state.packTypeFilter != null) {
      const packTypeFilter = columnFilter.state.packTypeFilter.toLowerCase();
      resultForCache = resultForCache.filter(
        (item) =>
          item.packType && item.packType.toLowerCase().includes(packTypeFilter),
      );
    }
  }
  return resultForCache;
};
const handleSortPagination = (
  reorderedData: ReorderDto[],
  filters: any,
  pageState: any,
): ReorderDto[] => {
  let resultForCache: any[] = reorderedData;
  if (filters.sortBy) {
    if (filters?.sortBy?.toLowerCase().includes("date")) {
      resultForCache = sortBydate(resultForCache);
    } else {
      let sortByColumns = [filters.sortBy];
      if (filters.sortBy === "mySgsNumber") {
        sortByColumns = ["sgsId_0", "sgsId_1"];
      }
      resultForCache = sortBy(resultForCache, sortByColumns);
    }

    if (!filters.sortOrder) {
      resultForCache = resultForCache.reverse();
    }
  }
  return resultForCache.slice(
    (pageState.page - 1) * pageState.rows,
    pageState.page * pageState.rows,
  );
};

const sortBydate = (orders) => {
  return orders.sort(function compare(a, b) {
    const dateA: any = new Date(a.submittedDate);
    const dateB: any = new Date(b.submittedDate);
    return dateA - dateB;
  });
};

const jsonify = (obj: any) => {
  return obj ? JSON.parse(JSON.stringify(obj)) : null;
};

const getSearchParamsAsString = (search) => {
  const filters = jsonify(search);
  delete filters["sortBy"];
  delete filters["sortOrder"];
  delete filters["startDate"];

  return JSON.stringify(filters);
};

const isDateFilterSame = (dateRange1, dateRange2) => {
  if (dateRange1.length === 0 && dateRange2.length === 0) {
    return true;
  }
  return (
    dateRange1[0].getTime() === dateRange2[0].getTime() &&
    dateRange1[1].getTime() === dateRange2[1].getTime()
  );
};

const getBlobUrl = (data: string, type: string) => {
  const blob = base64toBlob(data, type);
  return URL.createObjectURL(blob);
};

const base64toBlob = (data: string, type: string) => {
  // Cut the prefix `data:application/pdf;base64` from the raw base 64
  const base64WithoutPrefix = data.substr(("data:" + type + ";base64,").length);

  const bytes = atob(base64WithoutPrefix);
  let length = bytes.length;
  const out = new Uint8Array(length);

  while (length--) {
    out[length] = bytes.charCodeAt(length);
  }

  return new Blob([out], { type: type });
};

interface GetOrderResponse {
  orderHasLenfiles: boolean;
  isCartOrder: boolean;
}

export const useOrdersStore = defineStore("ordersStore", {
  state: () => ({
    firstLoad: false,
    pageState: {
      first: 1,
      page: 1,
      rows: 10,
    },
    orders: [] as any[],
    loading: {
      ordersList: false,
      order: false,
      cart: false,
      reorder: false,
      confirm: false,
    },
    filters: {} as any,
    selectedOrder: null as any,
    successfullReorder: null as any,
    options: {
      imageCarrierCodeTypes: [] as any[],
      plateTypeDescription: [] as any[],
    },
    checkout: {
      expectedDate: null,
      purchaseOrder: [""],
      notes: null,
      isUrgent: false,
    },
    totalRecords: 0,
    searchHistory: [] as any[],
    statusList: [
      { name: "Completed", value: 4 },
      { name: "Submitted", value: 2 },
      { name: "Cancelled", value: 3 },
    ],
    userPrinterName: "",
    userRoleKey: "",
    isCancel: false,
    textSearchData: {
      query: "",
      data: {
        reorderedData: [] as ReorderDto[],
        totalRecords: 0,
      },
      hasDataForAllDates: false,
      queryStartDate: null,
    },
  }),
  getters: {
    flattenedColors: (state) => (orderType?: string) => {
      if (orderType === "success" || state.isCancel)
        return flattenColors(state.successfullReorder?.colors);
      else return flattenColors(state.selectedOrder?.editionColors);
    },
  },
  actions: {
    async getOrders() {
      const b2cAuth = useB2CAuthStore();
      let printerUserIds: number[] = [];
      if (b2cAuth.currentB2CUser.isLoggedIn) {
        printerUserIds = b2cAuth.currentB2CUser.printerUserIds as number[];
      }
      this.loading.ordersList = true;
      const filter = {
        roleKey: this.userRoleKey,
        printerName: this.userPrinterName,
      };
      const response = await ReorderService.getRecentReorders(
        4,
        this.filters?.query ? this.filters.query : undefined,
        undefined,
        undefined,
        this.pageState.page,
        this.pageState.rows,
        filter,
        undefined,
        undefined,
        printerUserIds,
      );
      this.loading.ordersList = false;
      if (response.result) {
        const reorderedData = handleSortPagination(
          response.data?.reorderedData != null
            ? response.data.reorderedData
            : [],
          filter,
          this.pageState,
        );
        this.orders = reorderedData;
        this.totalRecords = response.data?.totalRecords
          ? response.data?.totalRecords
          : 0;
      } else {
        const notificationsStore = useNotificationsStore();
        notificationsStore.addNotification(
          Constants.FAILURE,
          response.exceptionDetails?.Message,
          { severity: "error", life: 5000 },
        );
        this.orders = [];
        this.totalRecords = 0;
      }
      this.decorateOrders();
    },
    async setOrderInStore(result: any) {
      const details = JSON.parse(JSON.stringify(result));
      this.successfullReorder = details;
    },
    async getOrderById(reorderId: any): Promise<GetOrderResponse> {
      const promise = new Promise<GetOrderResponse>((resolve) => {
        /* 1.Reset previously loaded order
          2.SGS | Cart?
          3.Fetch / load order object with direct props
          4.Fetch / load additional details - shirttail, barcode, len etc
          5.Decorate for display
          6.Prepare options for platetype dropdown in Reorder Step */
        this.loading.order = true;
        this.selectedOrder = null;
        this.checkout = {
          expectedDate: null,
          purchaseOrder: [""],
          notes: null,
          isUrgent: false,
        };

        if (reorderId) {
          const cartStore = useCartStore();
          const cartOrder = cartStore.cartOrders.find(
            (order: any) => order.id === reorderId,
          );
          const isCartOrder = !!cartOrder;
          if (isCartOrder) {
            // Photon order loaded from cart
            const plateTypes = cartOrder?.plateTypes?.length
              ? mapPlateTypes(cartOrder)
              : mapColorPlateTypes(cartOrder.colors);
            this.options.plateTypeDescription = plateTypes.filter(
              (plateType: any) => plateType.value !== 256,
            );
            this.selectedOrder = cartOrder;
            this.mapColorAndCustomerDetailsToOrder(cartOrder);
            this.getBarcodeAndShirtail(cartOrder);
            this.loading.cart = true;
            this.getLenFiles(cartOrder);
            resolve({ orderHasLenfiles: true, isCartOrder: true });
          } else {
            // MySGS(order.sgsId) and Photon Order(order.originalOrderId) loaded from dashboard
            this.selectedOrder = this.orders?.find(
              (order: any) =>
                order.sgsId === reorderId ||
                order.originalOrderId === reorderId,
            );
            if (!this.selectedOrder || !this.selectedOrder.allDataLoaded) {
              ReorderService.getOrderDetails(reorderId).then(
                async (response: any) => {
                  this.loading.order = false;
                  if (response.result) {
                    const details = jsonify(response.data);
                    this.selectedOrder = this.selectedOrder
                      ? this.selectedOrder
                      : {};
                    this.selectedOrder.originalOrderId = details?.jobId;
                    this.selectedOrder.description = details?.jobDescription;
                    this.selectedOrder.brandName = details?.jobDetails?.brand;
                    this.selectedOrder.address = details?.address;
                    this.selectedOrder.itemCode =
                      details?.jobDetails?.endUserReference;
                    this.selectedOrder.packType =
                      details?.jobDetails?.packageType?.name;
                    const editionColors: any[] = [];
                    this.selectedOrder.editionColors = editionColors;
                    const plateTypes = await mapPlateTypes(details);
                    this.options.plateTypeDescription = plateTypes?.filter(
                      (plateType: any) => plateType.value !== 256,
                    );
                    this.selectedOrder = this.selectedOrder || {};
                    this.selectedOrder = {
                      ...this.selectedOrder,
                      ...mapSgsOrderDetail(details),
                    };
                    ReorderService.getThumbnail(details.jobId).then(
                      (response: string | boolean) => {
                        if (response)
                          this.selectedOrder.thumbNailPath = response;
                      },
                    );
                    const promises: Promise<any>[] = [];
                    this.mapColorAndCustomerDetailsToOrder(details);
                    promises.push(
                      this.getBarcodeAndShirtail(this.selectedOrder),
                    );
                    promises.push(
                      this.getEditableColors(reorderId, this.selectedOrder),
                    );
                    Promise.allSettled(promises).then(async (promiseResult) => {
                      if (promiseResult[1]["value"].order === null) {
                        this.notifyOrderCannotBeProcessed();
                        resolve({
                          orderHasLenfiles: false,
                          isCartOrder: false,
                        });
                      } else {
                        this.selectedOrder.allDataLoaded = true;
                        this.orders.splice(
                          this.orders?.findIndex(
                            (order: any) =>
                              order.sgsId === reorderId ||
                              order.originalOrderId === reorderId,
                          ),
                          1,
                          this.selectedOrder,
                        );
                        resolve({ orderHasLenfiles: true, isCartOrder: false });
                      }
                    });
                  } else {
                    const notificationsStore = useNotificationsStore();
                    notificationsStore.addNotification(
                      Constants.FAILURE,
                      response.exceptionDetails?.Message,
                      { severity: "error", life: 5000 },
                    );
                    return false;
                  }
                },
              );
            } else {
              resolve({ orderHasLenfiles: true, isCartOrder: false });
            }
          }
        }
      });

      promise.finally(() => {
        this.loading.order = false;
      });
      return promise;
    },
    async setFilters(filters: any) {
      this.filters = { ...this.filters, ...filters };
      this.loading.ordersList = true;
      const printers = [] as string[];
      const printerIds = [] as number[];
      let printerUserIds = [] as number[];
      const authStore = useAuthStore();
      const b2cAuth = useB2CAuthStore();
      if (authStore.currentUser.isLoggedIn) {
        authStore.currentUser.internalUserPrinters.forEach((printer: any) => {
          if (printer.printerId && printer.printerId > 0) {
            printers.push(printer.printerName);
            printerIds.push(printer.printerId);
          }
        });

        filters.roleKey = authStore.currentUser.roleKey;
        filters.userType = authStore.currentUser.userType;
      }
      if (b2cAuth.currentB2CUser.isLoggedIn) {
        b2cAuth.currentB2CUser.internalUserPrinters.forEach((printer: any) => {
          if (printer.printerId && printer.printerId > 0) {
            printers.push(printer.printerName);
            printerIds.push(printer.printerId);
          } else {
            printers.push(b2cAuth.currentB2CUser.printerName);
          }
          printerUserIds = b2cAuth.currentB2CUser.printerUserIds as number[];
        });
        filters.roleKey = b2cAuth.currentB2CUser.roleKey;
        filters.userType = b2cAuth.currentB2CUser.userType;
      }
      /* If its is free text search then Pagination, Sorting, Filtering has to from stored data instead of API Call
        And Status should be completed (4) */
      if (
        this.textSearchData.query != "" &&
        this.textSearchData.query === getSearchParamsAsString(filters) &&
        filters.status === 4 &&
        (isDateFilterSame(this.textSearchData.queryStartDate, filters.startDate)
          ? true
          : this.textSearchData.hasDataForAllDates)
      ) {
        const filteredData = filter(
          this.textSearchData.data.reorderedData,
          filters,
          filterStore,
        );
        const totalRecords = filteredData.length;
        const reorderedData = handleSortPagination(
          filteredData,
          filters,
          this.pageState,
        );
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
      } else {
        const [sortByColumn, sortOrder] = filters.sortBy
          ? [filters.sortBy, filters.sortOrder]
          : ["OrderDate", false];
        const response = await ReorderService.getRecentReorders(
          filters?.query != "" && filters.query != null ? 4 : filters.status,
          filters.query,
          sortByColumn,
          sortOrder,
          this.pageState.page,
          this.pageState.rows,
          filters,
          filterStore,
          printers,
          printerUserIds,
        );
        if (response.result) {
          if (filters.status === 4 && response.data?.dataNotPaged) {
            this.textSearchData.query = getSearchParamsAsString(filters);
            this.textSearchData.queryStartDate = filters.startDate;
            this.textSearchData.data = {
              reorderedData:
                response.data?.reorderedData != null
                  ? sortBydate(response.data.reorderedData).reverse() //amazon discovery service do not support sorting. hence sorting on client-side
                  : [],
              totalRecords: response.data?.totalRecords
                ? response.data?.totalRecords
                : 0,
            };
            this.textSearchData.hasDataForAllDates =
              !!response.data?.hasDataForAllDates;
            const filteredData = filter(
              this.textSearchData.data.reorderedData,
              filters,
            );
            const totalRecords = filteredData.length;
            const reorderedData = handleSortPagination(
              filteredData,
              filters,
              this.pageState,
            );
            this.orders = reorderedData;
            this.totalRecords = totalRecords;
          } else {
            this.textSearchData.query = "";
            this.textSearchData.data = {
              reorderedData: [],
              totalRecords: 0,
            };
            this.textSearchData.hasDataForAllDates = false;

            this.orders = response.data?.reorderedData as any[];
            this.totalRecords = response.data?.totalRecords
              ? response.data?.totalRecords
              : 0;
          }
        } else {
          const notificationsStore = useNotificationsStore();
          notificationsStore.addNotification(
            Constants.FAILURE,
            response.exceptionDetails?.Message,
            { severity: "error", life: 5000 },
          );
          this.textSearchData.data = {
            reorderedData: [],
            totalRecords: 0,
          };
          this.textSearchData.hasDataForAllDates = false;
          this.orders = [];
          this.totalRecords = 0;
        }
      }
      this.loading.ordersList = false;
      this.decorateOrders();
    },
    async getBarcodeAndShirtail(order: any) {
      let barcodeDetails, shirttailDetails;
      if (order) {
        let jobNumber = "";
        if (!order.originalOrderId) {
          jobNumber = order.sgsId;
        } else {
          jobNumber = order.originalOrderId;
        }
        const promises: Promise<any>[] = [];
        promises.push(
          ReorderService.getBarcode(jobNumber).then((data) => {
            barcodeDetails = JSON.parse(JSON.stringify(data));
          }),
        );
        promises.push(
          ReorderService.getShirttail(jobNumber).then((data) => {
            shirttailDetails = JSON.parse(JSON.stringify(data));
          }),
        );
        await Promise.allSettled(promises);
      } else {
        barcodeDetails = null;
        shirttailDetails = null;
      }
      const notificationsStore = useNotificationsStore();
      if (!shirttailDetails.result) {
        notificationsStore.addNotification(
          Constants.FAILURE,
          shirttailDetails.exceptionDetails?.Message,
          { severity: "error", life: 5000 },
        );
      }
      if (!barcodeDetails.result) {
        notificationsStore.addNotification(
          Constants.FAILURE,
          barcodeDetails.exceptionDetails?.Message,
          { severity: "error", life: 5000 },
        );
      } else {
        this.selectedOrder = {
          ...order,
          ...mapPhotonOrderDetail(shirttailDetails.data, barcodeDetails.data),
        };
      }
    },
    decorateOrders() {
      for (let i = 0; i < this.orders.length; i++) {
        const sgsId =
          this.orders[i].id === 0
            ? this.orders[i].sgsId
            : this.orders[i].originalOrderId;
        ReorderService.getThumbnail(sgsId).then(
          (response: string | boolean) => {
            if (response && this.orders[i])
              this.orders[i].thumbNailPath = response;
          },
        );
        if (
          typeof this.orders[i].submittedDate === "string" &&
          this.orders[i].submittedDate?.includes("T")
        ) {
          const formattedDate: string = (
            this.orders[i].submittedDate + ""
          ).includes("Z")
            ? this.orders[i].submittedDate
            : this.orders[i].submittedDate + "Z";
          this.orders[i].submittedDateDisplay = DateTime.fromISO(
            formattedDate,
          ).toLocaleString(DateTime.DATETIME_MED);
        }
        this.orders[i].selected = false;
      }
    },
    initAdvancedFilters() {
      this.filters = newFilterProps();
      filterStore.state.brandNameFilter = null;
      filterStore.state.descriptionFilter = null;
      filterStore.state.packTypeFilter = null;
      filterStore.state.sortFields = null;
      this.textSearchData = {
        query: "",
        data: {
          reorderedData: [] as ReorderDto[],
          totalRecords: 0,
        },
        hasDataForAllDates: false,
        queryStartDate: null,
      };
    },
    async setFilter(field: any, value: any) {
      this.filters[field] = value;
    },

    updateCheckout(checkout: any) {
      this.checkout = { ...checkout };
      const POs = this.checkout?.purchaseOrder
        ?.filter(Boolean)
        .join(Constants.PO_DELIMITER);
      (this.selectedOrder as any).PO = POs;
      (this.selectedOrder as any).expectedDate = this.checkout.expectedDate;
      (this.selectedOrder as any).Notes = this.checkout.notes;
      (this.selectedOrder as any).isUrgent = this.checkout.isUrgent;
    },

    // color update flow
    async updateColor({ checkboxId, field, value }: any) {
      const colours = this.selectedOrder.editionColors;
      const selectedIndex = colours.findIndex(
        (c) => c.checkboxId === checkboxId,
      );
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder.editionColors[selectedIndex];
        if (colour) {
          const plateType = [...colour.plateDetails].map((plate) => {
            const p = toRaw(plate);
            return { ...p, [field]: value };
          });
          this.selectedOrder.editionColors[selectedIndex].plateDetails = [
            ...plateType,
          ];
          this.updateComputedColorFields(
            this.selectedOrder.editionColors[selectedIndex],
          );
        }
      }
    },
    // Add, Remove & Update Plates
    addPlate(params: any) {
      const colours = this.selectedOrder.editionColors;
      const selectedIndex = colours.findIndex(
        (c) => c.checkboxId === params.colourId,
      );
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder.editionColors[selectedIndex];
        colour.plateDetails.push({
          checkboxId: faker.datatype.uuid(),
          id: 0,
          plateTypeId: null,
          plateTypeDescription: null,
          plateThicknessId: colour.fullThicknessList[0].thicknessId,
          plateThicknessDescription: colour.fullThicknessList[0].thicknessDesc,
          comments: "",
          showComments: colour.showComments,
          sets: 1,
          isEditable: true,
          isThicknessEditable: false,
          plateList:
            colour.printerPlateList.length > 0
              ? colour.printerPlateList
              : colour.fullPlateList,
          hasAlternateOptions: colour.printerPlateList.length > 0,
          alternateOptions: colour.fullPlateList,
          thicknessList: colour.fullThicknessList,
          loading: false,
        });
      }
    },
    removePlate(params: any) {
      const colours = this.selectedOrder.editionColors;
      const selectedIndex = colours.findIndex(
        (c) => c.checkboxId === params.colourId,
      );
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder.editionColors[selectedIndex];
        if (colour) {
          const plateDetails =
            colour.plateDetails &&
            colour.plateDetails.filter(
              (plate: any) => plate.checkboxId !== params.checkboxId,
            );
          this.selectedOrder.editionColors[selectedIndex] = {
            ...colour,
            plateDetails,
          };
          this.updateComputedColorFields(
            this.selectedOrder.editionColors[selectedIndex],
          );
        }
      }
    },
    async updatePlate(params: any) {
      const notificationsStore = useNotificationsStore();
      const colours = this.selectedOrder.editionColors;
      const selectedIndex = colours.findIndex(
        (c) => c.checkboxId === params.colourId,
      );
      if (selectedIndex >= 0) {
        const colour = this.selectedOrder.editionColors[selectedIndex];
        if (colour) {
          const plateToUpdate = colour.plateDetails.find(
            (c) => c.checkboxId === params.checkboxId,
          );
          if (plateToUpdate != null) {
            plateToUpdate[params.field] = params.value;
            switch (params.field) {
              case "plateTypeId": {
                plateToUpdate.plateTypeDescription = colour.fullPlateList.find(
                  (p) => p.plateTypeId === params.value,
                )?.plateTypeName;
                const plateOcurrences = colour.plateDetails.filter(
                  (plateType) => {
                    return plateType[params.field] === params.value;
                  },
                );
                if (plateOcurrences.length > 1) {
                  if (colour.lenPath == Constants.NO_VISUALS) {
                    let sameComments = false;
                    for (let i = 0; i < plateOcurrences.length; i++)
                      for (let j = i + 1; j < plateOcurrences.length; j++)
                        if (
                          plateOcurrences[i].comments ===
                          plateOcurrences[j].comments
                        ) {
                          sameComments = true;
                          break;
                        }
                    if (sameComments)
                      notificationsStore.addNotification(
                        Constants.WARNING,
                        Constants.ADD_COMMENTS,
                        { severity: "warn", life: 5000 },
                      );
                  } else
                    notificationsStore.addNotification(
                      Constants.WARNING,
                      Constants.ALREADY_EXIST,
                      { severity: "warn", life: 3000 },
                    );
                }
                break;
              }
              case "plateThicknessId": {
                plateToUpdate.plateThicknessDescription =
                  plateToUpdate.thicknessList.find(
                    (p) => p.thicknessId === params.value,
                  )?.thicknessDesc;
                break;
              }
              case "sets": {
                const totalSets = sum(
                  colour.plateDetails.map((plate: any) => {
                    return plate.checkboxId === params.checkboxId &&
                      params.field === "sets"
                      ? params.value
                      : plate.sets;
                  }),
                );
                if (totalSets > 10) {
                  notificationsStore.addNotification(
                    Constants.WARNING,
                    Constants.MORE_THAN_TEN,
                    { severity: "warn" },
                  );
                  return;
                }
                break;
              }
            }
            this.updateComputedColorFields(
              this.selectedOrder.editionColors[selectedIndex],
            );
          }
        }
      }
    },
    validateColour(colour: any) {
      const notificationsStore = useNotificationsStore();
      const {
        isValid,
        hasEmptyPlateDescription,
        hasUniquePlates,
        hasComments,
        hasDifferentComments,
      } = validation(colour);
      if (!hasUniquePlates)
        notificationsStore.addNotification(
          Constants.WARNING,
          `You have selected the same plate type for ${colour.colourName}`,
          { severity: "warn" },
        );
      if (hasEmptyPlateDescription)
        notificationsStore.addNotification(
          Constants.WARNING,
          Constants.AVAILABLE_LIST,
          { severity: "warn" },
        );
      if (!hasComments)
        notificationsStore.addNotification(
          Constants.WARNING,
          `Enter a comment for all the  ${colour.colourName} plate(s)`,
          { severity: "warn", life: 5000 },
        );
      if (!hasDifferentComments)
        notificationsStore.addNotification(
          Constants.WARNING,
          Constants.ADD_COMMENTS + ` of  ${colour.colourName} colour`,
          { severity: "warn", life: 5000 },
        );
      return isValid;
    },
    updateComputedColorFields(color: any) {
      color.totalSets = 0;
      for (let i = 0; i < color.plateDetails.length; i++)
        color.totalSets += color.plateDetails[i].sets;
      color.sets = color.totalSets;
    },
    reorder(order: any) {
      router.push(
        `/dashboard/${
          order.originalOrderId ? order.originalOrderId : order.sgsId
        }`,
      );
    },
    async cancelOrder(orderId: number, isActive: boolean) {
      return await ReorderService.cancelOrder(orderId, isActive);
    },
    getSearchHistory(history: any) {
      this.searchHistory = [...history];
    },
    mapColorAndCustomerDetailsToOrder(details: any) {
      const colors = Array.from((details && details?.colors) || []);
      colors.map((color) => {
        (color as any).newColour = (color as any).isNew ? "New" : "Common";
      });
      (this.selectedOrder as any)["colors"] = colors;
      (this.selectedOrder as any)["customerContacts"] =
        details.customerContacts;
    },
    async setLenData(
      color: any,
      lenPath: any,
      lenData: any,
      showComments: boolean,
    ) {
      if (color.lenPath == lenPath) {
        color.lenData = lenData;
        color.checkboxId = faker.datatype.uuid();
        color.sets = color.totalSets;
        color.showComments = showComments;
        if (color.plates.length == 0) {
          color.plateDetails = [
            {
              id: 0,
              checkboxId: faker.datatype.uuid(),
              plateTypeId: null,
              plateTypeDescription: null,
              comments: "",
              showComments: showComments,
              sets: 0,
              loading: true,
            },
          ];
        } else {
          const editionPlates: any[] = [];
          color.plateDetails = editionPlates;
          color.plates.forEach((plate) => {
            plate.checkboxId = faker.datatype.uuid();
            plate.loading = true;
            (plate.showComments = showComments), color.plateDetails.push(plate);
          });
          delete color.plates;
        }
      }
    },
    async getLenFiles(order: any) {
      return new Promise((resolve) => {
        //make editable the colors:
        const sequenceList = order.colors.map(
          (plate: any) => plate.sequenceNumber,
        );
        let lenProcessed = 0;
        const asyncAvailablePlatesCall = ReorderService.getOrderAvailablePlates(
          order.originalOrderId ? order.originalOrderId : order.sgsId,
          order.printerName,
        );
        //for the colors with lenpath = no visuals:
        for (const color of order.editionColors) {
          this.setLenData(
            color,
            Constants.NO_VISUALS,
            new URL("@/assets/images/no_thumbnail.png", import.meta.url)
              .pathname,
            true,
          );
        }
        for (const sequence of sequenceList) {
          ReorderService.getLen(order.originalOrderId, sequence).then((res) => {
            lenProcessed++;
            for (let i = 0; i < res.length; i++) {
              for (const color of order.editionColors) {
                const lenData = getBlobUrl(res[i].lenData, "image");
                this.setLenData(color, res[i].lenPath, lenData, false);
              }
            }
            if (lenProcessed === order.colors.length) {
              this.getAvailablePlates(order, asyncAvailablePlatesCall).then(
                () => {
                  this.loading.cart = false;
                  resolve({ status: "finished", order: order });
                },
              );
            }
          });
        }
      });
    },
    async setPlateInfo(
      plate: any,
      availablePlates: any,
      printerPlateList: any,
      plateList: any,
    ) {
      //case when a plate belong to a draft and has value
      if (plate.plateTypeId > 0) {
        if (
          availablePlates.findIndex(
            (x) => x.plateTypeId === plate.plateTypeId,
          ) >= 0
        ) {
          plate.plateList = availablePlates;
          plate.hasAlternateOptions = false;
        } else {
          if (
            printerPlateList.findIndex(
              (x) => x.plateTypeId === plate.plateTypeId,
            ) >= 0
          ) {
            plate.plateList = printerPlateList;
            plate.alternateOptions = plateList;
            plate.hasAlternateOptions = true;
          } else {
            plate.plateList = plateList;
            plate.hasAlternateOptions = false;
          }
        }
      }
      //case when plate doesn't have a value
      else {
        //when no available plates: printer plates or all plates
        if (availablePlates.length === 0) {
          if (printerPlateList.length > 0) {
            plate.plateList = printerPlateList;
            plate.alternateOptions = plateList;
            plate.hasAlternateOptions = true;
          } else {
            plate.plateList = plateList;
            plate.hasAlternateOptions = false;
          }
        }
        //when one or more available plates for the colour.
        else {
          //when only one available plate, we set by default that value
          if (availablePlates.length === 1) {
            plate.plateTypeId = availablePlates[0].plateTypeId;
            plate.plateTypeDescription = availablePlates[0].plateTypeName;
          }
          plate.plateList = availablePlates;
          plate.hasAlternateOptions = false;
        }
      }
    },
    async decoratePlateList(mainList: Array<any>, alternateList: Array<any>) {
      mainList.unshift({ plateTypeId: -1, plateTypeName: "Show All..." });
      alternateList.unshift({
        plateTypeId: -1,
        plateTypeName: "Show Less...",
      });
    },
    async setThicknessInfo(
      plate: any,
      availableThicknesses: any,
      thicknessList: any,
    ) {
      if (plate.plateThicknessId > 0) {
        if (
          availableThicknesses.findIndex(
            (x) => x.thicknessId === plate.plateThicknessId,
          ) >= 0
        ) {
          plate.thicknessList = availableThicknesses;
        } else {
          plate.thicknessList = thicknessList;
        }
      } else {
        plate.thicknessList =
          availableThicknesses.length == 1
            ? availableThicknesses
            : thicknessList.length == 1
            ? thicknessList
            : [];
        if (plate.thicknessList.length === 1) {
          plate.plateThicknessId = plate.thicknessList[0].thicknessId;
          plate.plateThicknessDescription =
            plate.thicknessList[0].thicknessDesc;
        }
      }
      plate.loading = false;
    },
    async getAvailablePlates(
      order: any,
      asyncAvailablePlatesCall: Promise<any>,
    ) {
      return new Promise((resolve) => {
        asyncAvailablePlatesCall.then((response) => {
          if (response.result) {
            let count = order.editionColors.length;
            if (response.data.printerPlateList.length > 0)
              this.decoratePlateList(
                response.data.printerPlateList,
                response.data.plateList,
              );
            order.editionColors.forEach((color) => {
              color.printerPlateList = response.data.printerPlateList;
              color.fullPlateList = response.data.plateList;
              color.fullThicknessList = response.data.thicknessList;
              const availablePlateInfo =
                response.data.colorAvailablePlates.find(
                  (i) => i.colorSequence === color.sequenceNumber,
                );
              if (availablePlateInfo != null) {
                color.plateDetails.forEach((plate) => {
                  this.setPlateInfo(
                    plate,
                    availablePlateInfo.availablePlates,
                    response.data.printerPlateList,
                    response.data.plateList,
                  );
                  this.setThicknessInfo(
                    plate,
                    availablePlateInfo.availableThicknesses,
                    response.data.thicknessList,
                  );
                });
              } else {
                color.plateDetails.forEach((plate) => {
                  plate.hasAlternateOptions =
                    response.data.PrinterPlateList.length > 0;
                  plate.plateList =
                    response.data.PrinterPlateList.length > 0
                      ? response.data.PrinterPlateList
                      : response.data.plateList;
                  plate.alternateOptions = response.data.plateList;
                  plate.thicknessList = response.data.thicknessList;
                  plate.loading = false;
                });
              }
              count--;
              if (count <= 1) resolve({ status: "finished", order: order });
            });
          } else {
            const notificationsStore = useNotificationsStore();
            notificationsStore.addNotification(
              Constants.FAILURE,
              response.exceptionDetails?.Message,
              { severity: "error", life: 5000 },
            );
            resolve({ status: "finished", order: null });
          }
        });
      });
    },
    async getEditableColors(jobNumber: string, order: any) {
      if (!order.editionColors) {
        const editionColors: any[] = [];
        order.editionColors = editionColors;
      }
      return new Promise((resolve) => {
        let expectedColors = order.colors.length;
        const asyncAvailablePlatesCall = ReorderService.getOrderAvailablePlates(
          order.originalOrderId ? order.originalOrderId : order.sgsId,
          order.printerName,
        );
        order.colors.forEach((color) => {
          ReorderService.getLen(jobNumber, color.sequenceNumber).then((res) => {
            if (res.length == 0) {
              const colorCopy: any = JSON.parse(JSON.stringify(color));
              colorCopy.lenPath = Constants.NO_VISUALS;
              colorCopy.lenData = new URL(
                "@/assets/images/no_thumbnail.png",
                import.meta.url,
              ).pathname;
              colorCopy.checkboxId = faker.datatype.uuid();
              colorCopy.totalSets = 0;
              colorCopy.showComments = true;
              colorCopy.plateDetails = [
                {
                  checkboxId: faker.datatype.uuid(),
                  plateTypeId: null,
                  plateTypeDescription: null,
                  plateThicknessId: null,
                  plateThicknessDescription: null,
                  sets: 0,
                  loading: true,
                  showComments: true,
                  comments: "",
                },
              ];
              order.editionColors.push(colorCopy);
            } else {
              expectedColors += res.length - 1;
              for (let i = 0; i < res.length; i++) {
                const colorCopy: any = JSON.parse(JSON.stringify(color));
                colorCopy.lenPath = res[i].lenPath;
                colorCopy.lenData = getBlobUrl(res[i].lenData, "image");
                colorCopy.checkboxId = faker.datatype.uuid();
                colorCopy.totalSets = 0;
                colorCopy.showComments = false;
                colorCopy.plateDetails = [
                  {
                    checkboxId: faker.datatype.uuid(),
                    plateTypeId: null,
                    plateTypeDescription: null,
                    plateThicknessId: null,
                    plateThicknessDescription: null,
                    sets: 0,
                    loading: true,
                    showComments: false,
                    comments: "",
                  },
                ];
                order.editionColors.push(colorCopy);
              }
            }
            if (expectedColors === order.editionColors.length) {
              if (expectedColors === 0) {
                resolve({ status: "finished", order: null });
              }
              this.getAvailablePlates(order, asyncAvailablePlatesCall).then(
                () => {
                  resolve({ status: "finished", order: order });
                },
              );
            }
          });
        });
      });
    },
    notifyOrderCannotBeProcessed() {
      const notificationsStore = useNotificationsStore();
      const authStore = useAuthStore();
      let message = Constants.SEND_SGS_ERROR;
      let link: string = `/dashboard?showPM=true`;
      const linkLabel: string = `Here`;
      if (authStore.currentUser.isLoggedIn) {
        message = Constants.ORDER_ERROR;
        link = ``;
      }
      notificationsStore.addNotification(Constants.WARNING, message, {
        severity: "warn",
        life: 15000,
        link,
        linkLabel,
      });
    },
    getPdf(sgsId: string, pdfName: string) {
      return ReorderService.getPdf(sgsId, pdfName).then((response: any) => {
        if (response) {
          return getBlobUrl(response, "application/pdf");
        }
      });
    },
    async exportToExcel(filters: any) {
      console.log("My orders", filters);
      const notificationsStore = useNotificationsStore();
      this.filters = { ...this.filters, ...filters };
      this.loading.ordersList = true;
      const printers = [] as string[];
      const printerIds = [] as number[];
      let printerUserIds = [] as number[];

      const authStore = useAuthStore();
      const b2cAuth = useB2CAuthStore();
      if (authStore.currentUser.isLoggedIn) {
        // get printer Name
        authStore.currentUser.internalUserPrinters.forEach((printer: any) => {
          if (printer.printerId && printer.printerId > 0) {
            printers.push(printer.printerName);
            printerIds.push(printer.printerId);
          }
        });

        filters.roleKey = authStore.currentUser.roleKey;
        filters.userType = authStore.currentUser.userType;
      }
      if (b2cAuth.currentB2CUser.isLoggedIn) {
        b2cAuth.currentB2CUser.internalUserPrinters.forEach((printer: any) => {
          if (printer.printerId && printer.printerId > 0) {
            printers.push(printer.printerName);
            printerIds.push(printer.printerId);
          } else {
            printers.push(b2cAuth.currentB2CUser.printerName);
          }
          printerUserIds = b2cAuth.currentB2CUser.printerUserIds as number[];
        });
        filters.roleKey = b2cAuth.currentB2CUser.roleKey;
        filters.userType = b2cAuth.currentB2CUser.userType;
      }

      const fileresult = await ReorderService.exportToExcel(
        filters?.query != "" && filters.query != null ? 4 : filters.status,
        filters.query,
        filters.sortBy,
        filters.sortOrder,
        this.pageState.page,
        this.pageState.rows,
        filters,
        printers,
        printerUserIds,
      );

      if (fileresult.length === 0) {
        notificationsStore.addNotification(
          Constants.INFO,
          Constants.NO_RECORD_TO_EXPORT,
          {
            severity: "warn",
            life: 6000,
          },
        );
        this.loading.ordersList = false;
      } else {
        const byteCharacters = atob(fileresult.fileContents);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: fileresult.contentType });

        const link = document.createElement("a");

        // Set the link attributes
        link.href = URL.createObjectURL(blob);
        link.download = fileresult.fileDownloadName;

        // Trigger the download
        link.click();
        this.loading.ordersList = false;
      }
    },
    async updateOrderSgsId(oldRefId, newSGSRef) {
      const orderIndex = this.orders.findIndex(
        (order) => String(order.sgsId) === String(oldRefId),
      );
      if (orderIndex >= 0) {
        this.orders[orderIndex].sgsId = newSGSRef;
      }
    },
  },
});
