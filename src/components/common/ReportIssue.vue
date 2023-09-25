<script lang="ts" setup>
import ReportIssueService from "@/services/ReportIssueService";
import { useNotificationsStore } from '@/stores/notifications';
import JSZip from 'jszip';
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useSendToPmStore } from "@/stores/send-to-pm";
import { FileUploadService, type FileUploadResponse, type FileDelete } from '@/services/FileUploadService';
import * as Constants from '@/services/Constants';


const emit = defineEmits(['close'])

const issueTypes = ref(Constants.ISSUE_TYPE);
const browsers = ref(Constants.BROWSERS);
const notificationsStore = useNotificationsStore()
const entering = ref()
let validFiles = ref<ValidFiles[]>([]);
const isb2cUserLoggedIn = computed(() => authb2cStore.currentB2CUser.isLoggedIn);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const userName = isb2cUserLoggedIn ? computed(() => authb2cStore.currentB2CUser.displayName) : computed(() => authStore.currentUser.displayName);;
 


const props = defineProps({
  userName: {
    type: String,
    default: ""
  }
});
type ValidFiles = {
  filename: string,
  contentType: string,
  contents: any
}
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const issue = ref({
  userId: null,
  application: 'Image Carrier Reorder',
  issueType: null,
  browser: null,
  browserVersion: null,
  description: null,
  attachments: []
});
const error = ref("");
const showError = ref(false);

function onSubmit() {
  const validationErrors = validateForm();
  if (validationErrors.length > 0) {
    notificationsStore.addNotification(
      validationErrors.join("\n"),
      Constants.MANADTORY_FIELDS_MSG,
      { severity: 'error', position: 'top-right' }
    );
  } else {
    closeForm()
    reportIssue(issue.value)
  }
}

const closeForm = () => {
  emit('close');
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

async function reportIssue(report?: any) {
  const id = await getUserId()
  let result = await ReportIssueService.submitIssue(issue.value, id, validFiles.value);
  if (result.success) {
    notificationsStore.addNotification(
      '',
      Constants.REPORT_ISSUE_SUCCESS,
      { severity: 'success', position: 'top-right' }
    );
  } else {
    notificationsStore.addNotification(
      '',
      Constants.REPORT_ISSUE_FAILURE,
      { severity: 'error', position: 'top-right' });
  }
}

async function blobToBase64(blob: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as any).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function getUserId() {
  let userId = '6';
  if (isUserLoggedIn.value) {
    userId = (await authStore.currentUser.userId as any);
  }
  if (isb2cUserLoggedIn.value) {
    userId = (await authb2cStore.currentB2CUser.userId as any);
  }
  return userId
}

function onDragOver(event: any) {
  event.preventDefault();
}
function onDragEnter(event: any) {
  event.preventDefault();
}
function onDragLeave(event: any) {
  event.preventDefault();
}
function handleInput(e: any) {
  const files = Array.from(e.target.files);
  addFiles(files);
}

function isValidFileType(file: any) {
  return file.name.toLowerCase().endsWith('.exe') || file.name.toLowerCase().endsWith('.bat') || file.name.toLowerCase().endsWith('.com') ||
    file.name.toLowerCase().endsWith('.cmd') || file.name.toLowerCase().endsWith('.inf') || file.name.toLowerCase().endsWith('.ipa') ||
    file.name.toLowerCase().endsWith('.osx') || file.name.toLowerCase().endsWith('.pif') || file.name.toLowerCase().endsWith('.run') ||
    file.name.toLowerCase().endsWith('.wsh')
}

async function onDrop(event: any) {
  event.preventDefault();
  const fileList = Array.from(event.dataTransfer.files);
  addFiles(fileList);
}

async function addFiles(files: any) {

  const uploadPromises = files.map(async (file: any) => {
    if (isValidFileType(file)) {
      notificationsStore.addNotification(
        Constants.INVALID_FILE,
        Constants.INVALID_FILE_MSG,
        { severity: 'error', position: 'top-right' }
      );
      return null;
    } else if (file.size > Constants.MAX_FILE_SIZE) {
      notificationsStore.addNotification(
        ``,
        Constants.FILE_SIZE_EXCEEDS,
        { severity: 'error', position: 'top-right' }
      );
      return null;

    } else {
      const response = await convertToBase64(file);
      const parts = file.name.split(".");
      validFiles.value.push({ filename: file.name as string, contentType: parts.length > 1 ? parts[parts.length - 1] : '', contents: response });
    }
  });
  const results = await Promise.all(uploadPromises);
  const successfulUploads = results.filter((response) => response !== null);
  if (successfulUploads.length > 0) {
    if (validFiles.value.length > 0)
      notificationsStore.addNotification(
        Constants.UPLOAD_SUCCESSFULL,
        Constants.UPLOAD_SUCCESSFULL_MSG,
        { severity: 'success', position: 'top-right' }
      );
  }
}


async function convertToBase64(file: any) {
  return await blobToBase64(file);
}
const removeItemByProperty = (index: number) => {
  if (index !== -1) {
    validFiles.value.splice(index, 1);
  }
};

async function onDeleteClick(file: ValidFiles, index: number) {
  removeItemByProperty(index)
  notificationsStore.addNotification(`Deleted Successfully`, `Your file ${file.filename} was successfully deleted`, { severity: 'success', position: 'top-right' })
}
</script>

<template lang="pug">
sgs-scrollpanel.report-issue
  .form
    .hint
      p
        small Report an Issue to the support team
        small
          label.required Indicates required
      p
        span Please describe the nature of your problem in the fields below
    .f
      label.required
        span Open on behalf of this user
        span.tip(v-tooltip.right="{ value: 'Individual reporting the issue' }")
          i.material-icons help_outline
      strong.value {{ userName }}
    .f
      label.required
        span Which Photon Application are you reporting an issue on?
      strong.value {{ issue.application }}
    .f
      label.required
        span Please select your issue from the following options
      prime-dropdown(:options="issueTypes" v-model="issue.issueType" placeholder="-- None --")
    .field-group
      .f
        label.required
          span Browser
        prime-dropdown(:options="browsers" v-model="issue.browser" placeholder="-- None --"  )
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
      label.drop-zone(for="files" @dragover="onDragOver" @drop="onDrop" @dragenter="entering = true" @dragleave="entering = false" :class="{ highlight: entering }")
        input#files(type="file" multiple @input="handleInput($event)")
        span Drag &amp; Drop files here ...
      .upload(v-if="validFiles.length > 0")
        h4 Uploaded Files:
        ui.files
          li(v-for="(file, index) in validFiles" :key="file")
            .name {{ file.filename }}
            sgs-button.delete.alert.secondary.sm(icon="delete" @click="onDeleteClick(file,index)")

  template(#footer)
    footer
      .actions
        sgs-button.default.sm(label="Cancel" @click="emit('close')")
        sgs-button(label="Submit" @click="onSubmit()")
</template>

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

  .drop-zone
    min-height: 7rem
    margin: $s 0
    border: 1px dashed rgba($sgs-gray, 0.3)
    border-radius: 5px
    +flex(center, center)
    input[type="file"]
      display: none
    &:hover
      border: 1px dashed rgba($sgs-gray, 1)

  .actions
    +flex($h: right)

.upload
  h4 
    padding: 0 $s
  .file
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
