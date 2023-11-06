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

const handleSortPagination = (
  reorderedData: ReorderDto[],
  filters: any,
  pageState: any,
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
      let date;
      if (
        typeof order.submittedDate === "string" &&
        order.submittedDate?.includes("T")
      ) {
        date = DateTime.fromISO(order.submittedDate).toMillis();
      } else {
        const submittedDate = order.submittedDate
          ? order.submittedDate.toString()
          : "";
        date = DateTime.fromFormat(
          submittedDate,
          "MMM d, yyyy, h:mm a",
        ).toMillis();
      }
      if (
        date >= DateTime.fromJSDate(startDate).toMillis() &&
        date <= DateTime.fromJSDate(endDate).toMillis()
      ) {
        filteredresult.push(order);
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

  // Filter by Sorting
  //let resultForCache :any[] = reorderedData ;
  if (filters.sortBy) {
    if (filters?.sortBy?.toLowerCase().includes("date")) {
      resultForCache = sortBydate(resultForCache);
    } else {
      resultForCache = sortBy(resultForCache, [filters.sortBy]);
    }

    if (!filters.sortOrder) {
      resultForCache = resultForCache.reverse();
    }
  }
  console.log("totalCount", resultForCache.length);
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

const base64toBlob = (data: string) => {
  // Cut the prefix `data:application/pdf;base64` from the raw base 64
  const base64WithoutPrefix = data.substr(
    "data:application/pdf;base64,".length,
  );

  const bytes = atob(base64WithoutPrefix);
  let length = bytes.length;
  const out = new Uint8Array(length);

  while (length--) {
    out[length] = bytes.charCodeAt(length);
  }

  return new Blob([out], { type: "application/pdf" });
};

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
      expectedTime: null,
      notes: null,
    },
    totalRecords: 0,
    searchHistory: [] as any[],
    statusList: [
      { name: "Completed", value: 4 },
      { name: "Submitted", value: 2 },
      { name: "Cancelled", value: 3 },
      //{ name: "Draft", value: 1, },
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
      const result = await ReorderService.getRecentReorders(
        4,
        this.filters?.query ? this.filters.query : undefined,
        undefined,
        undefined,
        this.pageState.page,
        this.pageState.rows,
        { roleKey: this.userRoleKey, printerName: this.userPrinterName },
        undefined,
        undefined,
        printerUserIds,
      );
      this.loading.ordersList = false;
      if (Array.isArray(result)) {
        this.orders = [];
        this.totalRecords = 0;
      } else {
        const { reorderedData, totalRecords } = result;
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
      }
      this.decorateOrders();
    },
    async setOrderInStore(result: any) {
      const details = JSON.parse(JSON.stringify(result));
      this.successfullReorder = details;
    },
    async getOrderById(reorderId: any) {
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
        expectedTime: null,
        notes: null,
      };

      if (reorderId) {
        const cartStore = useCartStore();
        const cartOrder = cartStore.cartOrders.find(
          (order: any) => order.id === reorderId,
        );
        const isCartOrder = !!cartOrder;
        if (isCartOrder) {
          // Photon order loaded from cart
          const plateTypes = (await cartOrder?.plateTypes?.length)
            ? mapPlateTypes(cartOrder)
            : mapColorPlateTypes(cartOrder.colors);
          this.options.plateTypeDescription = plateTypes.filter(
            (plateType: any) => plateType.value !== 256,
          );
          this.selectedOrder = cartOrder;
          this.mapColorAndCustomerDetailsToOrder(this.selectedOrder);
          await this.getBarcodeAndShirtail(cartOrder);
          this.getPdfData(cartOrder.originalOrderId).then((response: any) => {
            if (response) this.selectedOrder.pdfData = response;
          });
          this.getLenFiles(cartOrder);
        } else {
          // MySGS(order.sgsId) and Photon Order(order.originalOrderId) loaded from dashboard
          this.selectedOrder = this.orders?.find(
            (order: any) =>
              order.sgsId === reorderId || order.originalOrderId === reorderId,
          );
          if (!this.selectedOrder || !this.selectedOrder.allDataLoaded) {
            const details = jsonify(
              await ReorderService.getOrderDetails(reorderId),
            );
            this.selectedOrder = this.selectedOrder ? this.selectedOrder : {};
            this.selectedOrder.originalOrderId = details?.jobId;
            this.selectedOrder.description = details?.jobDescription;
            this.selectedOrder.brandName = details?.jobDetails?.brand;
            this.selectedOrder.itemCode = details?.jobDetails?.endUserReference;
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
                if (response) this.selectedOrder.thumbNailPath = response;
              },
            );
            this.getPdfData(details.jobId).then((response: any) => {
              if (response) this.selectedOrder.pdfData = response;
            });
            const promises: Promise<any>[] = [];
            this.mapColorAndCustomerDetailsToOrder(details);
            promises.push(this.getBarcodeAndShirtail(this.selectedOrder));
            promises.push(
              this.getEditableColors(reorderId, this.selectedOrder),
            );
            Promise.allSettled(promises).then(() => {
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
            });
          }
        }
      }

      this.loading.order = false;
      return this.selectedOrder;
    },
    async setFilters(filters: any) {
      console.log("My orders", filters);
      this.filters = { ...this.filters, ...filters };
      this.loading.ordersList = true;
      const printers = [] as string[];
      const printerIds = [] as number[];
      let printerUserIds = [] as number[];
      //TODO: remove printers and sites unused code
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
      let result:
        | {
            reorderedData: ReorderDto[];
            totalRecords: number;
          }
        | never[];
      /* If its is free text search then Pagination, Sorting, Filtering has to from stored data instead of API Call
        And Status should be completed (4) */
      if (
        this.textSearchData.query != "" &&
        this.textSearchData.query === getSearchParamsAsString(filters) &&
        filters.status === 4 &&
        ((filters.userType !== "INT" &&
          filters.roleKey !== "PMSuperAdminUser") ||
          (filters.userType === "INT" && filters.roleKey === "PMUser"))
      ) {
        console.log("Showing result from Local Store");
        const reorderedData = handleSortPagination(
          this.textSearchData.data.reorderedData,
          filters,
          this.pageState,
          filterStore,
        );
        result = {
          reorderedData: reorderedData,
          totalRecords: this.textSearchData.data.reorderedData.length,
        };
      } else {
        result = await ReorderService.getRecentReorders(
          filters?.query != "" && filters.query != null ? 4 : filters.status,
          filters.query,
          filters.sortBy,
          filters.sortOrder,
          this.pageState.page,
          this.pageState.rows,
          filters,
          filterStore,
          printers,
          printerUserIds,
        );

        if (filters.status === 4) {
          console.log("Saving Search Result in Local Store", filters);
          this.textSearchData.query = getSearchParamsAsString(filters);
          if (Array.isArray(result)) {
            this.textSearchData.data = {
              reorderedData: [],
              totalRecords: 0,
            };
          } else {
            this.textSearchData.data = {
              reorderedData:
                result.reorderedData != null ? result.reorderedData : [],
              totalRecords: result.reorderedData.length,
            };
          }
          const reorderedData = handleSortPagination(
            this.textSearchData.data.reorderedData,
            filters,
            this.pageState,
          );
          result = {
            reorderedData: reorderedData,
            totalRecords: this.textSearchData.data.reorderedData.length,
          };
        } else {
          console.log("Clearing result from local store .. ");
          this.textSearchData.query = "";
          this.textSearchData.data = {
            reorderedData: [],
            totalRecords: 0,
          };

          if (
            "reorderedData" in result &&
            Array.isArray(result.reorderedData) &&
            result.reorderedData.length > 0
          ) {
            // TODO: need to check if this is required
            // const reorderedData = handleSortPagination(
            //   result.reorderedData,
            //   filters,
            //   this.pageState,
            // );
            result = {
              reorderedData: result.reorderedData,
              totalRecords: result.reorderedData.length,
            };
          }
        }
      }
      if (Array.isArray(result)) {
        this.orders = [];
        this.totalRecords = 0;
      } else {
        const { reorderedData, totalRecords } = result;
        this.orders = reorderedData;
        this.totalRecords = totalRecords;
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
      this.selectedOrder = {
        ...order,
        ...mapPhotonOrderDetail(shirttailDetails, barcodeDetails),
      };
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
          this.orders[i].submittedDate = DateTime.fromISO(
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
        this.selectedOrder.editionColors[selectedIndex].plateDetails.push({
          checkboxId: faker.datatype.uuid(),
          id: 0,
          plateTypeId: null,
          plateTypeDescription: null,
          plateThicknessId: null,
          plateThicknessDescription: null,
          sets: 0,
          isEditable: true,
          plateList:
            this.selectedOrder.editionColors[selectedIndex].fullPlateList,
          thicknessList:
            this.selectedOrder.editionColors[selectedIndex].fullThicknessList,
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
                ).length;
                if (plateOcurrences > 1) {
                  notificationsStore.addNotification(
                    "Warning",
                    `Plate type already exists for this colour`,
                    { severity: "warn", life: 3000 },
                  );
                }
                break;
              }
              case "plateThicknessId": {
                plateToUpdate.plateThicknessDescription =
                  colour.fullThicknessList.find(
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
                    "Warning",
                    `You cannot have more than 10 sets reordered for 1 colour`,
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
        hasEmptyPlateThickness,
      } = validation(colour);
      if (!hasUniquePlates)
        notificationsStore.addNotification(
          "Warning",
          `You have selected the same plate type for ${colour.colourName}`,
          { severity: "warn" },
        );
      if (hasEmptyPlateDescription)
        notificationsStore.addNotification(
          "Warning",
          `Please select the plate type from the available plate type list`,
          { severity: "warn" },
        );
      if (hasEmptyPlateThickness)
        notificationsStore.addNotification(
          "Warning",
          `Please select the plate thickness from the available plate thickness list`,
          { severity: "warn" },
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
    async getLenFiles(order: any) {
      return new Promise((resolve) => {
        //make editable the colors:
        const sequenceList = order.colors.map(
          (plate: any) => plate.sequenceNumber,
        );
        let lenProcessed = 0;
        const asyncAvailablePlatesCall = ReorderService.getOrderAvailablePlates(
          order.originalOrderId ? order.originalOrderId : order.sgsId,
        );
        for (const sequence of sequenceList) {
          ReorderService.getLen(order.originalOrderId, sequence).then((res) => {
            lenProcessed += res.length;
            for (let i = 0; i < res.length; i++) {
              for (const color of order.editionColors) {
                if (res[i].lenPath == color.lenPath) {
                  color.lenData = res[i].lenData;
                  color.checkboxId = faker.datatype.uuid();
                  color.sets = color.totalSets;
                  if (color.plates.length == 0) {
                    color.plateDetails = [
                      {
                        id: 0,
                        checkboxId: faker.datatype.uuid(),
                        plateTypeId: null,
                        plateTypeDescription: null,
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
                      color.plateDetails.push(plate);
                    });
                    delete color.plates;
                    console.log(color.plateDetails);
                  }
                }
              }
            }
            if (lenProcessed === order.editionColors.length) {
              this.getAvailablePlates(order, asyncAvailablePlatesCall).then(
                () => {
                  resolve({ status: "finished", order: order });
                },
              );
            }
          });
        }
      });
    },
    async getAvailablePlates(
      order: any,
      asyncAvailablePlatesCall: Promise<any>,
    ) {
      return new Promise((resolve) => {
        asyncAvailablePlatesCall.then((result) => {
          let count = order.editionColors.length;
          order.editionColors.forEach((color) => {
            color.fullPlateList = result.plateList;
            color.fullThicknessList = result.thicknessList;
            const availablePlateInfo = result.colorAvailablePlates.find(
              (i) => i.colorSequence === color.sequenceNumber,
            );
            if (availablePlateInfo != null) {
              color.plateDetails.forEach((plate) => {
                plate.plateList =
                  availablePlateInfo.availablePlates.length === 0
                    ? result.plateList
                    : availablePlateInfo.availablePlates;
                if (availablePlateInfo.availablePlates.length === 1) {
                  plate.plateTypeId =
                    availablePlateInfo.availablePlates[0].plateTypeId;
                  plate.plateTypeDescription =
                    availablePlateInfo.availablePlates[0].plateTypeName;
                }
                plate.thicknessList =
                  availablePlateInfo.availableThicknesses.length === 0
                    ? result.thicknessList
                    : availablePlateInfo.availableThicknesses;
                if (availablePlateInfo.availableThicknesses.length === 1) {
                  plate.plateThicknessId =
                    availablePlateInfo.availableThicknesses[0].thicknessId;
                  plate.plateThicknessDescription =
                    availablePlateInfo.availableThicknesses[0].thicknessDesc;
                }
                plate.loading = false;
              });
            } else {
              color.plateDetails.forEach((plate) => {
                plate.plateList = result.plateList;
                plate.thicknessList = result.thicknessList;
                plate.loading = false;
              });
            }
            count--;
            if (count <= 1) resolve({ status: "finished", order: order });
          });
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
        );
        order.colors.forEach((color) => {
          ReorderService.getLen(jobNumber, color.sequenceNumber).then((res) => {
            expectedColors += res.length - 1;
            console.log(expectedColors);
            console.log(res.length);
            for (let i = 0; i < res.length; i++) {
              const colorCopy: any = JSON.parse(JSON.stringify(color));
              colorCopy.lenPath = res[i].lenPath;
              colorCopy.lenData = res[i].lenData;
              colorCopy.checkboxId = faker.datatype.uuid();
              colorCopy.totalSets = 0;
              colorCopy.plateDetails = [
                {
                  checkboxId: faker.datatype.uuid(),
                  plateTypeId: null,
                  plateTypeDescription: null,
                  plateThicknessId: null,
                  plateThicknessDescription: null,
                  sets: 0,
                  loading: true,
                },
              ];
              order.editionColors.push(colorCopy);
            }
            if (expectedColors === order.editionColors.length) {
              if (expectedColors === 0) {
                const notificationsStore = useNotificationsStore();
                const authStore = useAuthStore();
                let message = `Your order cannot be processed. This request must be sent directly to a PM. To request it, please click `;
                let link: string = `/dashboard?showPM=true`;
                const linkLabel: string = `Here`;
                if (authStore.currentUser.isLoggedIn) {
                  message = `Your order cannot be processed through this portal.  Please go into MySGS directly to place your order`;
                  link = ``;
                }
                notificationsStore.addNotification("Warning", message, {
                  severity: "warn",
                  life: 15000,
                  link,
                  linkLabel,
                });
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
    getPdfData(sgsId: string) {
      return ReorderService.getPdfs(sgsId).then((response: any) => {
        if (response) {
          for (const pdfName in response) {
            const base64String = response[pdfName];
            const blob = base64toBlob(base64String);
            response[pdfName] = URL.createObjectURL(blob);
          }
          return response;
        }
      });
    },
  },
});
