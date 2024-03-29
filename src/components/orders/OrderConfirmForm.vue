<template lang="pug">
.order-conformation-form(v-if="checkoutForm")
  .details
    .f
      label.required Delivery Date
      span.input.calendar
        prime-calendar(v-model="checkoutForm.expectedDate" show-other-months="true" select-other-months="true" :min-date="minSelectableDate()" append-to="body" hour-format="12" required="true" @update:model-value="updateExpectedDate()")
        span.material-icons calendar_month
    .f
      label.required Delivery Time
      span.input.calendar    
        prime-calendar(v-model="checkoutForm.expectedDate" show-other-months="true" select-other-months="true" :min-date="minSelectableDate()" :time-only="true" append-to="body" hour-format="12" required="true" @update:model-value="updateExpectedDate()")


    .f.po-numbers(v-for="po, i in checkoutForm.purchaseOrder" :key="i")
      label
        span(v-if="i === 0") Purchase Order #
      span.input.po
        .input-text
          prime-inputtext.po-number(v-model="checkoutForm.purchaseOrder[i]" maxlength="26" @update:model-value="updateCheckout()")
        a(v-if="i === 0" :class="{ disabled: checkoutForm.purchaseOrder.length >= 10 }" @click="addPurchaseOrder()")
          span Add&nbsp;
          i.material-icons add
        a.remove(v-else @click="removePurchaseOrder(i)")
          i.material-icons delete_outline


  .notes(v-if="showNotes()")
    .f
      label Notes
      span.input.notes
        prime-textarea(v-model="checkoutForm.notes" @update:model-value="updateCheckout()")
  aside
    label.doc-label Attach Documents
    .file-acceptance-message.card
      div File types accepted are PDF, Image, E-Mail, and all Microsoft Office documents
      div Max file size is 10MB
    file-upload(@files-input="uploadFiles")
    .upload(v-if="validFiles && validFiles.length > 0")
      h4 Uploaded Files:
      ul.files 
        li(v-for="(file, index) in validFiles" :key="file") 
          .name {{ file.fileName }}
          sgs-button.delete.alert.secondary.sm(:id="`delete-file-${index}`" icon="delete" @click="onDeleteClick(file,index)")

</template>

<script lang="ts" setup>
import { DateTime, Interval } from "luxon";
import { onBeforeMount, computed, ref, watch } from "vue";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useNotificationsStore } from "@/stores/notifications";
import { useAuthStore } from "@/stores/auth";
import {
  FileUploadService,
  type FileUploadResponse,
  type FileDelete,
} from "@/services/FileUploadService";
import * as Constants from "@/services/Constants";
import FileUpload from "../common/FileUpload.vue";
import { normalizeAndReplaceBlobName } from "@/stores/utils/photon";
import { v4 as uuidv4 } from "uuid";

type ValidFiles = {
  fileName: string;
  uri: string;
};
const props = defineProps({
  checkout: {
    type: Object,
    default: () => ({
      expectedDate: null,
      purchaseOrder: null,
      notes: null,
      isUrgent: false,
    }),
  },
});

const emit = defineEmits(["change"]);
const authb2cStore = useB2CAuthStore();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

const isb2cUserLoggedIn = computed(
  () => authb2cStore.currentB2CUser.isLoggedIn,
);
function isInvalidFileSize(file) {
  return file.size > 10 * 1048576; //1MiB = 1048576 bytes
}
const isInvalidFileType = (file: File) => {
  const allowedExtensions = [
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".tif",
    ".tiff",
    ".rtf",
    ".doc",
    ".docx",
    ".eml",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
  ];
  const lowercaseName = file.name.toLowerCase();
  return !allowedExtensions.some((extension) =>
    lowercaseName.endsWith(extension),
  );
};
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const checkoutForm = ref();
let validFiles = ref<ValidFiles[]>([]);

onBeforeMount(() => {
  checkoutForm.value = { ...props.checkout };
});

watch(
  () => props.checkout.expectedDate,
  (value) => {
    checkoutForm.value.expectedDate = value;
  },
);

watch(
  () => props.checkout.isUrgent,
  (value) => {
    checkoutForm.value.isUrgent = value;
  },
);

function addPurchaseOrder() {
  if (checkoutForm.value?.purchaseOrder?.length < 10)
    checkoutForm.value?.purchaseOrder.unshift("");
}

function removePurchaseOrder(index: number) {
  const po = checkoutForm.value?.purchaseOrder;
  if (po?.splice)
    checkoutForm.value.purchaseOrder = po.filter(
      (_: unknown, i: number) => i !== index,
    );
}

function updateExpectedDate() {
  let expectedDateTime = checkoutForm.value.expectedDate;
  if (expectedDateTime) {
    expectedDateTime.setHours(checkoutForm.value.expectedDate.getHours());
    expectedDateTime.setMinutes(checkoutForm.value.expectedDate.getMinutes());
    const selectedDate = DateTime.fromJSDate(checkoutForm.value.expectedDate);
    const today = DateTime.now();
    const diff = Interval.fromDateTimes(today, selectedDate);
    const diffHours = diff.length("hours");
    const isSameDay = today.hasSame(selectedDate, "day");
    if (Math.ceil(diffHours) <= 24 || isSameDay) {
      checkoutForm.value.isUrgent = true;
    } else {
      checkoutForm.value.isUrgent = false;
    }
  }
  updateCheckout();
}

function updateCheckout() {
  emit("change", {
    isUrgent: checkoutForm.value.isUrgent,
    purchaseOrder: checkoutForm.value.purchaseOrder
      ? checkoutForm.value.purchaseOrder
      : null,
    expectedDate: checkoutForm.value.expectedDate,
    notes: checkoutForm.value.notes ? checkoutForm.value.notes : null,
    reorderdocs: validFiles.value.map((x) => {
      return { fileName: x.fileName, url: x.uri };
    }),
  });
}

function minSelectableDate() {
  return DateTime.now().startOf("hour").toJSDate();
}

function showNotes(): boolean {
  return authb2cStore.currentB2CUser.userType === "EXT";
}

async function getUserId() {
  let userId;
  if (isUserLoggedIn.value) {
    userId = await authStore.currentUser.userId;
  }
  if (isb2cUserLoggedIn.value) {
    userId = await authb2cStore.currentB2CUser.userId;
  }
  return userId;
}

async function convertAndSendFile(file, fileName): Promise<FileUploadResponse> {
  const id = await getUserId();

  const formdata = new FormData();
  formdata.append("file", file);
  formdata.append("UserId", id);
  formdata.append("FileName", fileName);
  formdata.append("Data", "");
  formdata.append("isReorderDocs", "yes");
  formdata.append("reorderDocsFolderName", reorderDocsFolderName);
  return await FileUploadService.uploadFile(formdata);
}

const reorderDocsFolderName = uuidv4();

async function uploadFiles(filesToUpload) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = filesToUpload.map((file: any) => {
    if (isInvalidFileType(file)) {
      return Constants.INVALID_FILE_TYPE_MSG_2.replace("{filename}", file.name);
    } else if (isInvalidFileSize(file)) {
      return Constants.INVALID_FILE_SIZE_MSG.replace("{filename}", file.name);
    } else {
      return null;
    }
  });
  if (errors.filter((response) => response !== null).length > 0) {
    notificationsStore.addNotification(
      Constants.INVALID_FILE_TITLE,
      errors.join(""),
      { severity: "error", position: "top-right", life: null },
    );
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadPromises = filesToUpload.map(async (file: any) => {
      const fileName = normalizeAndReplaceBlobName(file.name);
      const response = await convertAndSendFile(file, fileName);
      if (response.status === "OK") {
        validFiles.value.push({
          fileName: fileName,
          uri: response.uri,
        });
        return response;
      } else {
        notificationsStore.addNotification(
          Constants.UPLOAD_FAILED,
          Constants.UPLOAD_FAILED_MSG,
          { severity: "error", position: "top-right" },
        );
        return null;
      }
    });
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((response) => response !== null);
    if (successfulUploads.length > 0) {
      notificationsStore.addNotification(
        Constants.UPLOAD_SUCCESSFULL,
        `You have uploaded ${successfulUploads.length} files successfully`,
        { severity: "success", position: "top-right" },
      );
    }
    updateCheckout();
  }
}

const removeItemByProperty = (index: number) => {
  if (index !== -1) {
    validFiles.value.splice(index, 1);
  }
};

async function onDeleteClick(file: ValidFiles, index: number) {
  const deleteInfo: FileDelete = {
    isRedorder: true,
    uri: file.uri,
  };
  const deleteResponse =
    await FileUploadService.deleteFilesToBlobStorage(deleteInfo);
  if (deleteResponse) {
    removeItemByProperty(index);
    notificationsStore.addNotification(
      Constants.DELETE_SUCCESSFULL,
      `Your file ${file.fileName} was successfully deleted`,
      { severity: "success", position: "top-right" },
    );
  } else {
    notificationsStore.addNotification(
      Constants.DELETE_FAILED,
      `Your file ${file.fileName} was not deleted`,
      { severity: "error", position: "top-right" },
    );
  }
  updateCheckout();
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
</style>

.order-conformation-form
<style lang="sass" scoped>
@import "@/assets/styles/includes"

.order-conformation-form
  width: 40rem
  padding: $s
  .address .f
    &:last-child
      border-bottom: none
  .f
    +flex
    align-items: flex-start
    padding: $s25 $s
    font-weight: 600
    border-bottom: 1px solid rgba($sgs-gray, 0.05)
    label
      width: 10rem
      font-weight: 500
      display: inline-block
      &.required
        &:after
          content: "*"
          display: inline-block
          padding: 0 $s25
          color: $sgs-red
    span.input
      flex: 1
      position: relative
      width: 18rem
      max-width: 15rem
      &.notes > *
        width: 25rem
      span.material-icons
        +absolute-e
        right: $s50
        margin: $s25 0
        color: rgba($sgs-gray, 0.4)
        pointer-events: none

      span.warning-message
        color: red
        font-weight: bolder
        font-size: 14px

      span.error
        color: $sgs-red
        display: block
        padding: $s25 0
        font-size: 0.9rem
        font-weight: 500

    span.input.po
      +flex
      width: auto
      max-width: none
      .po-number
        width: 18rem
      a
        +flex
        font-size: 0.9rem
        margin: 0 $s50
        font-weight: 700
        .material-icons
          font-size: 0.7rem
      a.remove .material-icons
        color: $sgs-red
.doc-label
  padding: 1rem
.drag-drop-message
  margin: $s
.file-acceptance-message
  background-color: $sgs-yellow
  margin: $s
.upload
  h4
    padding: 0 $s
  .files
    +reset
    li
      +flex
      padding: $s25 $s
      white-space: nowrap
      border-bottom: 1px solid #eee
      &:last-child
        border-bottom: none
      .name
        flex: 1
        overflow: hidden
        text-overflow: ellipsis
      .delete
        visibility: hidden
        margin-right: $s125
      &:hover
        background: rgba($sgs-blue, 0.1)
        .delete
          visibility: visible
</style>
