<script lang="ts" setup>
import { faker } from '@faker-js/faker'
import ColorsTableEdit from './ColorsTableEdit.vue'
import JSZip from 'jszip';
import type { UploadFileDto } from '@/models/UploadFileDto';
import { useUploadFilesStore } from '@/stores/upload-files';
import { useToast } from 'primevue/usetoast';
import { useNotificationsStore } from '@/stores/notifications';
import type { DeleteFileDto } from '@/models/DeleteFileDto';
import { inject, ref, computed, watch, onBeforeMount, reactive } from 'vue'
import SendToPMService from "@/services/SendToPmService";
import { useAuthStore } from "@/stores/auth";
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useSendToPmStore } from "@/stores/send-to-pm";
const props = defineProps({
  order: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();
const sendToPmstore = useSendToPmStore();
const notificationsStore = useNotificationsStore()
const printerName = computed(() => {
  const user = authb2cStore.currentB2CUser;
  return user?.printerName || '';
});

const prntLocation = computed(() => {
  const user = authb2cStore.currentB2CUser;
  return user?.prtLocation || [];
});


const emit = defineEmits(['create', 'submit'])
const entering = ref()
const options = inject('options') || { locations: [] }
const sendForm = ref(props.order)
let isFormVisible = ref(false)
const isb2cUserLoggedIn = computed(() => authb2cStore.currentB2CUser.isLoggedIn);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const sendUpload = computed(() => sendToPmstore.newOrder.uploadedFiles);
const toast = useToast()


watch(() => props.order, (order) => {
  sendForm.value = { ...order }
  if (order)
    isFormVisible.value = true
  else
    isFormVisible.value = false
})

function init() {
  emit('create')
}

function updateColors(colors: any) {
  sendToPmstore.updateColors(colors)

}

async function submit() {
  sendForm.value.printerName = printerName
  await sendToPmstore.getPmusersForLocation(await authb2cStore.currentB2CUser.printerId as any)
  await sendToPmstore.submitorder(sendForm.value)
  emit('submit', sendForm);
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
  const files = e.target.files;
}

function isValidFileType(file: any) {
  return file.name.toLowerCase().endsWith('.exe') || file.name.toLowerCase().endsWith('.bat') || file.name.toLowerCase().endsWith('.com') ||
    file.name.toLowerCase().endsWith('.cmd') || file.name.toLowerCase().endsWith('.inf') || file.name.toLowerCase().endsWith('.ipa') ||
    file.name.toLowerCase().endsWith('.osx') || file.name.toLowerCase().endsWith('.pif') || file.name.toLowerCase().endsWith('.run') ||
    file.name.toLowerCase().endsWith('.wsh')
}

async function onDrop(event: any) {
  event.preventDefault();
  const uploadFiles = Array.from(event.dataTransfer.files);
  const validFiles: any[] = [];
  const uploadPromises = uploadFiles.map(async (file: any) => {
    if (isValidFileType(file)) {
      notificationsStore.addNotification(
        `Invalid file type`,
        `File with the given format cannot be uploaded(exe,bat,com,cmd,inf,ipa,osx,pif,run,wsh)`,
        { severity: 'error', position: 'top-right' }
      );
      return null;
    } else {
      const response = await convertAndSendFile(file);
      if (response) {
        validFiles.push(file.name);
        return response;
      } else {
        notificationsStore.addNotification(
          `Upload failed`,
          `Your file was not uploaded. Please try again.`,
          { severity: 'error', position: 'top-right' }
        );
        return null;
      }
    }
  });
  const results = await Promise.all(uploadPromises);
  const successfulUploads = results.filter((response) => response !== null);
  if (successfulUploads.length > 0) {
    if(validFiles.length>0)
    await sendToPmstore.uploadData(validFiles as []);
    notificationsStore.addNotification(
      `Uploaded successfully`,
      `Your files were successfully uploaded`,
      { severity: 'success', position: 'top-right' }
    );
  }
}


async function convertAndSendFile(file: any) {
  const binaryToBase64 = await blobToBase64(file);
  const fileName = file.name
  const id = await getUserId()

  const uploadInfo: UploadFileDto = {
    FileName: fileName,
    UserId: id as any,
    Data: binaryToBase64 as string
  }
  return await SendToPMService.uploadFilesToBlobStorage(uploadInfo)
}
const removeItemByProperty = (propName: any, propValue: any) => {
  const index = (sendForm.value.uploadedFiles as any).value.findIndex((uploadedFile: any) => uploadedFile[propName] === propValue);
  if (index !== -1) {
    (sendForm.value.uploadedFiles as any).value.splice(index, 1);
  }
};

async function onDeleteClick(name: string) {
  const fullname = name
  //const fileNameWithoutExe = await removeFileExtension(name)
  const uploadInfo: DeleteFileDto = {
    // FileName: fileNameWithoutExe + ".zip",
    FileName: name,
    UserId: await getUserId() as any
  }
  const deleteResponse = await SendToPMService.deleteFilesToBlobStorage(uploadInfo)
  if (deleteResponse) {
    removeItemByProperty('name', fullname)
    notificationsStore.addNotification(`Deleted Successfully`, `Your file ${fullname} was successfully deleted`, { severity: 'success', position: 'top-right' })
  }
  else {
    notificationsStore.addNotification(`Delete failed`, `Your file ${fullname} was not deleted`, { severity: 'error', position: 'top-right' })
  }

}

</script>

<template lang="pug">
.send-to-pm
  .cta
    small Cannot find your order?&nbsp;
    a(@click="init()")
      small Send to PM
  prime-dialog(v-model:visible="isFormVisible" modal :style="{ width: '80vw' }" header="Send to PM")
    .content
      main
        .fields
          .field-group
            .f
              label(for="name") Printer
              strong {{printerName}}
            .f
              label(for="location") Location
              prime-dropdown(:options="prntLocation" v-model="sendForm.location" optionLabel="locationName" optionValue="printerLocationId")
        .divider
        h4 Items Details
        .fields
          .field-group
            .f
              label(for="brand") Brand
              prime-inputtext#brand(v-model="sendForm.brand" name="brand")
            .f
              label(for="description") Product Description
              prime-inputtext#description(v-model="sendForm.description" name="description")
            .f
              label(for="pack_type") Pack Type
              prime-inputtext#pack_type(v-model="sendForm.packType" name="pack_type")
            .f
              label(for="purchase_order") Purchase Order #
              prime-inputtext#purchase_order(v-model="sendForm.purchaseOrder" name="purchase_order")
            .f
              label(for="item_code") Item Code
              prime-inputtext#item_code(v-model="sendForm.itemCode" name="item_code")
            .f
              label(for="plate_id") Plate ID
              prime-inputtext#plate_id(v-model="sendForm.plateId" name="plate_id")
            .f
              label(for="code") Code #
              .field-group
                prime-dropdown#code-type(v-model="sendForm.carrierCode.type" name="code-type" :options="sendToPmstore.imageCarrierCodeTypes" optionLabel="label" optionValue="value")
                prime-inputtext#code(v-model="sendForm.carrierCode.code" name="code")
            .f
              label(for="job_number") SGS Job #
              prime-inputtext#job_number(v-model="sendForm.jobNumber" name="job_number")
        .fields
        .divider
        colors-table-edit(@update="updateColors")
        .divider
        .fields
          .f
            label(for="comments") Comments
            prime-textarea#comments(v-model="sendForm.comments" name="comments" rows="10")
      aside
        label.drop-zone(for="files" @dragover="onDragOver" @drop="onDrop" @dragenter="entering = true" @dragleave="entering = false" :class="{ highlight: entering }")
          input(type="file" multiple @input="handleInput($event)")
          span Drag &amp; Drop files here ...
        .upload(v-if="sendUpload && sendUpload.length > 0")
          h4 Uploaded Files:
          ul.files 
            li(v-for="name in sendUpload" :key="name") 
              .name {{ name }}
              sgs-button.delete.alert.secondary.sm(icon="delete" @click="onDeleteClick(name)")
    template(#footer)
      .actions
        sgs-button(label="Send" :icon="loading ? 'progress_activity' : 'send'" :iconClass="loading ? 'spin' : ''" @click="submit" iconPosition="right")
        //sgs-button(label="Close" @click="isFormVisible = false")
</template>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.content
  padding: $s2
  min-height: 80vh
  +flex-fill
  align-items: stretch
  main
    flex: 1
  aside
    width: 25rem
    padding: 0 $s
    margin-left: $s
    border-left: 1px solid rgba($sgs-gray, 0.1)

.cta
  +flex
  margin: 0 $s

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

.actions
  +flex($h: right)
  padding-top: $s50
  margin-top: $s50
  border-top: 1px solid rgba($sgs-gray, 0.2)

.drop-zone
  min-height: 20rem
  margin: $s
  border: 1px dashed rgba($sgs-gray, 0.3)
  border-radius: 5px
  +flex(center, center)
  .highlight
    background: rgba($sgs-blue, 0.1)
  input[type="file"]
    display: none
  &:hover
    border: 1px dashed rgba($sgs-gray, 1)

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
