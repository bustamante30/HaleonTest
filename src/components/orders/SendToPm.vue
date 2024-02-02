<!-- eslint-disable vue/no-v-model-argument -->
<template lang="pug">
.send-to-pm
  .cta(:class="{'m-0':OrderValidation}")
    small(v-if="!OrderValidation") Urgent/ Missing Order?&nbsp;
    a(@click.prevent="initForm()")
      small Send to PM

  prime-dialog(v-model:visible="isFormVisible" modal :style="{ width: '80vw' }" header="Send to PM" @hide="clearForm")
    .hint
      h4(v-if="sendForm.isUrgent" style="margin-left: 18px;") Enter delivery date, delivery time. Enter either item code or product description or plate ID or attach document(s)
      h4(v-else style="margin-left: 18px;") Enter at least one field
      .urgent
        h5 Urgent Order? (within 24 hours)
        .switch
          prime-input-switch.checkbox.sm(v-model="sendForm.isUrgent" @change="handleUrgentToggle")
          span {{ sendForm.isUrgent ? 'Yes' : 'No'  }}  
    .content   
      main      
        .fields         
          .field-group
            .f
              label(for="name") Printer
              strong {{ sendToPmstore.externalPrinterName }}
            .f
              label(for="brand") Brand
              prime-inputtext#brand(v-model="sendForm.brand" name="brand")
            .f
              label(for="purchase_order") Purchase Order #
              prime-inputtext#purchase_order(v-model="sendForm.purchaseOrder" name="purchase_order")
            .f
              label(for="pack_type") Pack Type
              prime-dropdown#code-type(v-model="sendForm.packType" name="pack_type" :options="sendToPmstore.imageCarrierPackTypes" option-label="label" option-value="value")
            .f
              label(for="description") Product Description
              prime-inputtext#description(v-model="sendForm.description" name="description")
            .f
              label(for="item_code") Item Code
              prime-inputtext#item_code(v-model="sendForm.itemCode" name="item_code")
            .f
              label(for="plate_id") Plate ID
              prime-inputtext#plate_id(v-model="sendForm.plateId" name="plate_id")
            .f
              label.required(for="date") 
                span Delivery Date 
                span.warn(v-if="sendForm.isUrgent") &nbsp;(Urgent Order)
              span.input.calendar(name="date")
                prime-calendar.sm(v-model="sendForm.expectedDate" show-other-months="true" select-other-months="true" :min-date="minSelectableDate()" append-to="body" hour-format="12" required="true" @update:model-value="updateUrgent")
                span.material-icons calendar_month
            .f
              label.required(for="time") Delivery time
              span.input.calendar(name="time")
                prime-calendar(v-model="sendForm.expectedDate" show-other-months="true" select-other-months="true" :min-date="minSelectableDate()" time-only append-to="body" hour-format="12" required="true" @update:model-value="updateUrgent")
            .f
              label(for="code") Code #
              .field-group
                prime-dropdown#code-type(v-model="sendForm.carrierCode.type" name="code-type" :options="sendToPmstore.imageCarrierCodeTypes" option-label="label" option-value="value")
                prime-inputtext#code(v-model="sendForm.carrierCode.code" name="code")
            .f
              label(for="job_number") SGS Reference Number
              prime-inputtext#job_number(v-model="sendForm.jobNumber" name="job_number")
        .fields
        .divider
        colors-table-edit(:is-mandatory="!hasValidFiles" @update="updateColors")
        .divider
        .fields
          .f
            label(for="comments") Comments
            prime-textarea#comments(v-model="sendForm.comments" name="comments" rows="10")
      aside
        .file-acceptance-message.card
          div File types accepted are PDF, Image, Email, and Microsoft Office
          div Max file size is 10MB
        file-upload(@files-input="uploadFiles")
        .upload(v-if="sendUpload && sendUpload.length > 0")
          h4(v-if="hasValidFiles") Uploaded Files:
          ul.files 
            li(v-for="(file, index) in validFiles" :key="file") 
              .name {{ file.fileName }}
              sgs-button.delete.alert.secondary.sm(:id="`delete-file-${index}`" icon="delete" @click="onDeleteClick(file,index)")
    template(#footer)
      .actions(:class="{ disclaimer: sendForm.isUrgent }")
        span 
          span(v-if="sendForm.isUrgent") Additional charges may be applicable for urgent orders
        sgs-button#send(:label="sendForm.isUrgent ? 'Send as Urgent' : 'Send'" :class="{ alert: sendForm.isUrgent }" :icon="loading ? 'progress_activity' : 'send'" :icon-class="loading ? 'spin' : ''" icon-position="right" @click="submit")
</template>

<!-- eslint-disable no-undef --><!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import ColorsTableEdit from "./ColorsTableEdit.vue";
import FileUpload from "../common/FileUpload.vue";
import { useNotificationsStore } from "@/stores/notifications";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useSendToPmStore } from "@/stores/send-to-pm";
import {
  FileUploadService,
  type FileUploadResponse,
  type FileDelete,
} from "@/services/FileUploadService";
import { DateTime, Interval } from "luxon";
import * as Constants from "@/services/Constants";
const props = defineProps({
  order: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // eslint-disable-next-line vue/prop-name-casing
  OrderValidation: {
    type: Boolean,
    default: false,
  },
});
type ValidFiles = {
  fileName: string;
  uri: string;
};
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const sendToPmstore = useSendToPmStore();
const notificationsStore = useNotificationsStore();

onMounted(async () => {
  sendToPmstore.externalPrinterName = authb2cStore.currentB2CUser.printerName;
});

const printerName = computed(() => {
  const user = authb2cStore.currentB2CUser;

  return user?.printerName || "";
});
const emit = defineEmits(["create", "submit"]);
const sendForm = ref(props.order);
let isFormVisible = ref(false);
const isb2cUserLoggedIn = computed(
  () => authb2cStore.currentB2CUser.isLoggedIn,
);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const sendUpload = computed(() => sendToPmstore.newOrder.uploadedFiles);
let validFiles = ref<ValidFiles[]>([]);
const hasValidFiles = computed(() => validFiles?.value?.length > 0);

watch(
  () => props.order,
  (order) => {
    sendForm.value = { ...order };
    if (order) isFormVisible.value = true;
    else isFormVisible.value = false;
  },
);

function initForm() {
  validFiles.value = [];
  (sendUpload as any).value = [];
  emit("create");
}

function updateColors(colors) {
  sendForm.value.colors = [...colors];
  sendToPmstore.updateColors(colors);
}

async function submit() {
  sendForm.value.printerName = printerName?.value;
  const isValid = sendToPmstore.validate(sendForm.value, sendUpload.value);

  if (isValid) {
    (sendUpload as any).value = [];
    sendForm.value.expectedDate = formatExpectedDateTime(sendForm.value);
    const submitResponse = await sendToPmstore.submitorder(sendForm.value);
    if (submitResponse) {
      notificationsStore.addNotification(
        Constants.ORDER_SENT,
        Constants.ORDER_SENT_MSG,
        { severity: "success", life: 3000, position: "top-right" },
      );
      return;
    } else {
      notificationsStore.addNotification(
        Constants.ORDER_SENT_FAILURE,
        Constants.ORDER_SENT_FAILURE_MSG,
        { severity: "error", life: 3000, position: "top-right" },
      );
      return;
    }
  }
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

function minSelectableDate() {
  return DateTime.now().startOf("hour").toJSDate();
}

function isInvalidFileSize(file) {
  return file.size > 10 * 1048576; //1MiB = 1048576
}
const isInvalidFileType = (file: File) => {
  const allowedExtensions = [
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".tif",
    ".tiff",
    ".doc",
    ".docx",
    ".rtf",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".eml",
  ];
  const lowercaseName = file.name.toLowerCase();
  return !allowedExtensions.some((extension) =>
    lowercaseName.endsWith(extension),
  );
};

async function uploadFiles(filesToUpload) {
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
    const uploadPromises = filesToUpload.map(async (file: any) => {
      const response = await convertAndSendFile(file);
      if (response.status === "OK") {
        validFiles.value.push({
          fileName: file.name as string,
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
      if (validFiles.value.length > 0)
        await sendToPmstore.uploadData(validFiles.value as []);
      notificationsStore.addNotification(
        Constants.UPLOAD_SUCCESSFULL,
        Constants.UPLOAD_SUCCESSFULL_MSG,
        { severity: "success", position: "top-right" },
      );
    }
  }
}

async function convertAndSendFile(file): Promise<FileUploadResponse> {
  const fileName = file.name.replace(/[(!$%&[\]{}]/g, "-");
  const id = await getUserId();

  const formdata = new FormData();
  formdata.append("file", file);
  formdata.append("UserId", id);
  formdata.append("FileName", fileName);
  formdata.append("Data", "");
  formdata.append("isSendToPm", "yes");
  return await FileUploadService.uploadFile(formdata);
}
const removeItemByProperty = (index: number) => {
  if (index !== -1) {
    validFiles.value.splice(index, 1);
  }
};

function formatExpectedDateTime(order) {
  let expectedDateTime: Date = order.expectedDate;
  if (sendForm.value?.expectedDate) {
    expectedDateTime.setHours(sendForm.value?.expectedDate?.getHours());
    expectedDateTime.setMinutes(sendForm.value?.expectedDate?.getMinutes());
  }
  return expectedDateTime;
}

function updateUrgent(date) {
  const selectedDate = DateTime.fromJSDate(date);
  const today = DateTime.now();
  const diff = Interval.fromDateTimes(today, selectedDate);
  const diffHours = diff.length("hours");
  const isSameDay = today.hasSame(selectedDate, "day");
  if (Math.ceil(diffHours) <= 24 || isSameDay) {
    sendForm.value.isUrgent = true;
  } else {
    sendForm.value.isUrgent = false;
  }
}

function handleUrgentToggle() {
  sendForm.value.expectedDate = null;
}

async function onDeleteClick(file: ValidFiles, index: number) {
  const deleteInfo: FileDelete = {
    isSendToPm: true,
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
}

function clearForm() {
  sendToPmstore.clearForm();
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.hint
  +flex-fill
  h4
    flex: 1
  border-bottom: 1px solid rgba($sgs-gray, 0.1)

.urgent
  +flex-fill
  background: $sgs-red
  color: #FFF
  padding: $s25 $s
  margin: $s $s4
  border-radius: 3px
  width: 21rem
  .checkbox
    margin: $s50
  .switch
    +flex
  h5
    margin: 0

.content
  padding: 0 $s2
  min-height: 80vh
  +flex-fill
  align-items: stretch
  main
    flex: 1
    padding: $s2 0
  aside
    width: 25rem
    margin-left: $s
    border-left: 1px solid rgba($sgs-gray, 0.1)
    padding: $s2 $s

.cta
  +flex
  margin: 0 $s
.m-0
  margin: 0 6px
.fields
  .field-group
    display: grid
    grid-template-columns: repeat(2, 1fr)
    gap: $s
    .f
      label
        display: block
        opacity: 0.7
        font-size: 0.9rem
        margin-bottom: $s25
        span.warn
          color: $sgs-red

span.input
  position: relative
  span.material-icons
    +absolute-e
    right: $s50
    margin: 0
    color: rgba($sgs-gray, 0.4)
    pointer-events: none

.actions
  +flex-fill
  padding: $s50 $s
  margin-top: $s50
  border-top: 1px solid rgba($sgs-gray, 0.2)
  width: 100%
  flex: 1
  &.disclaimer
    background: $accent-light-3
    > span
      display: inline-block
      text-align: left
      flex: 1

.file-acceptance-message
  background-color: $sgs-yellow

.required
  &:after
    content: "*"
    display: inline-block
    padding: 0 $s25
    color: $sgs-red

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
