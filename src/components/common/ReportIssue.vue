<template lang="pug">
sgs-scrollpanel.report-issue
  .form
    .hint
      p
        span Please describe the nature of your problem in the fields below
        small
          label.required Indicates required
    .f
      label.required
        span Please select your issue from the following options
      prime-dropdown(v-model="issue.issueType" :options="issueTypes" placeholder="-- None --")
    .field-group
      .f
        label.required
          span Browser
        prime-dropdown(v-model="issue.browser" :options="browsers" placeholder="-- None --"  )
      .f
        label.required
          span Browser Versions
        prime-inputtext(v-model="issue.browserVersion")
    .f
      label.required
        span Briefly describe the issue
        span.tip(v-tooltip.right="{ value: 'Tell us what issue you are experiencing' }")
          i.material-icons help_outline
      prime-textarea(v-model="issue.description")
    .f
      label
        span Include support material (screen image / recording) if needed
      file-upload(@files-input="addFiles")
      .upload(v-if="validFiles.length > 0")
        h4 Uploaded Files:
        ui.files
          li(v-for="(file, index) in validFiles" :key="file")
            .name {{ file.filename }}
            sgs-button.delete.alert.secondary.sm(:id="`delete-file-${index}`" icon="delete" @click="onDeleteClick(file,index)")

  template(#footer)
    footer
      .actions
        sgs-button#close.default.sm(label="Cancel" @click="emit('close')")
        sgs-button#submit-report(label="Submit" @click="onSubmit()")
</template>

<!-- eslint-disable no-undef -->
<script lang="ts" setup>
import ReportIssueService from "@/services/ReportIssueService";
import { useNotificationsStore } from "@/stores/notifications";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import * as Constants from "@/services/Constants";
import FileUpload from "../common/FileUpload.vue";

const emit = defineEmits(["close"]);
const issueTypes = ref(Constants.ISSUE_TYPE);
const browsers = ref(Constants.BROWSERS);
const notificationsStore = useNotificationsStore();
let validFiles = ref<ValidFiles[]>([]);
const isb2cUserLoggedIn = computed(
  () => authb2cStore.currentB2CUser.isLoggedIn,
);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);

defineProps({
  userName: {
    type: String,
    default: "",
  },
});
type ValidFiles = {
  filename: string;
  contentType: string;
  contents: unknown;
};
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const issue = ref({
  userId: null,
  application: "Image Carrier Reorder",
  issueType: null,
  browser: null,
  browserVersion: null,
  description: null,
  attachments: [],
});

function onSubmit() {
  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    notificationsStore.addNotification(
      validationErrors.join("\n"),
      Constants.MANDATORY_FIELDS_MSG,
      { severity: "error", position: "top-right" },
    );
  } else {
    closeForm();
    reportIssue();
  }
}

const closeForm = () => {
  emit("close");
};

function validateForm() {
  const errorMessages = [] as string[];
  if (!issue.value?.browser) {
    errorMessages.push(Constants.SELECT_BROWSER);
  }
  if (issue.value?.browserVersion == null) {
    errorMessages.push(Constants.SELECT_BROWSER_VERSION);
  }
  if (issue.value?.issueType == null) {
    errorMessages.push(Constants.SELECT_ISSUE);
  }
  if (issue.value?.description == null) {
    errorMessages.push(Constants.SELECT_DISCRIPTION);
  }
  return errorMessages;
}

async function reportIssue() {
  const userName = await getUserName();
  let result = await ReportIssueService.submitIssue(
    issue.value,
    userName,
    validFiles.value,
  );
  if (result != null && result.success) {
    notificationsStore.addNotification("", Constants.REPORT_ISSUE_SUCCESS, {
      severity: "success",
      position: "top-right",
    });
  } else {
    notificationsStore.addNotification("", Constants.REPORT_ISSUE_FAILURE, {
      severity: "error",
      position: "top-right",
    });
  }
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base64String = (reader.result as any).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function getUserName() {
  let displayName = "";
  if (isUserLoggedIn.value) {
    displayName = await authStore.currentUser.displayName;
  }
  if (isb2cUserLoggedIn.value) {
    displayName = await authb2cStore.currentB2CUser.displayName;
  }
  return displayName;
}

function isValidFileType(file) {
  return (
    file.name.toLowerCase().endsWith(".exe") ||
    file.name.toLowerCase().endsWith(".bat") ||
    file.name.toLowerCase().endsWith(".com") ||
    file.name.toLowerCase().endsWith(".cmd") ||
    file.name.toLowerCase().endsWith(".inf") ||
    file.name.toLowerCase().endsWith(".ipa") ||
    file.name.toLowerCase().endsWith(".osx") ||
    file.name.toLowerCase().endsWith(".pif") ||
    file.name.toLowerCase().endsWith(".run") ||
    file.name.toLowerCase().endsWith(".wsh")
  );
}

async function addFiles(files) {
  const uploadPromises = files.map(async (file) => {
    if (isValidFileType(file)) {
      notificationsStore.addNotification(
        Constants.INVALID_FILE_TYPE_TITLE,
        Constants.INVALID_FILE_TYPE_MSG,
        { severity: "error", position: "top-right", life: null },
      );
      return null;
    } else if (file.size > Constants.MAX_FILE_SIZE) {
      notificationsStore.addNotification(``, Constants.FILE_SIZE_EXCEEDS, {
        severity: "error",
        position: "top-right",
      });
      return null;
    } else {
      const response = await convertToBase64(file);
      const parts = file.name.split(".");
      validFiles.value.push({
        filename: file.name as string,
        contentType: parts.length > 1 ? parts[parts.length - 1] : "",
        contents: response,
      });
    }
  });
  const results = await Promise.all(uploadPromises);
  const successfulUploads = results.filter((response) => response !== null);
  if (successfulUploads.length > 0) {
    if (validFiles.value.length > 0)
      notificationsStore.addNotification(
        Constants.UPLOAD_SUCCESSFULL,
        Constants.UPLOAD_SUCCESSFULL_MSG,
        { severity: "success", position: "top-right" },
      );
  }
}

async function convertToBase64(file) {
  return await blobToBase64(file);
}
const removeItemByProperty = (index: number) => {
  if (index !== -1) {
    validFiles.value.splice(index, 1);
  }
};

async function onDeleteClick(file: ValidFiles, index: number) {
  removeItemByProperty(index);
  notificationsStore.addNotification(
    Constants.DELETE_SUCCESSFULL,
    `Your file ${file.filename} was successfully deleted`,
    { severity: "success", position: "top-right" },
  );
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.report-issue
  .form
    padding: 0 $s
  .hint
    background: #f6f6f6
    padding: $s50 $s
    margin: $s50 0
    p
      line-height: 1.2
      margin: 0
      +flex-fill
  .required
    &:before
      content: "*"
      display: inline-block
      padding: 0 $s25
      color: $sgs-red

  .field-group
    +flex-fill
    gap: $s

  .f
    padding: $s50 $s125
    flex: 1
  label
    +flex
    align-items: baseline
    margin-bottom: $s25
    opacity: 0.7
    span.tip
      display: inline-block
      margin-left: $s
      i.material-icons
        font-size: inherit
        opacity: 0.6
        transform: translateY(3px)
      &:hover i.material-icons
        opacity: 1
  strong.value
    padding: 0 $s50

  .actions
    +flex($h: right)

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
