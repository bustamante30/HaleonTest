<script lang="ts" setup>
import { faker } from '@faker-js/faker'
import ColorsTableEdit from './ColorsTableEdit.vue'
import { inject, ref, computed, watch, reactive } from 'vue'
import SendToPMService from "@/services/SendToPmService";
// import JSZip from 'jszip';
import type { UploadFileDto } from '@/models/UploadFileDto';
import { useUploadFilesStore } from '@/stores/upload-files';
import { useAuthStore } from '@/stores/auth';
import { useB2CAuthStore } from '@/stores/b2cauth';
import { useToast } from 'primevue/usetoast';
import { useNotificationsStore } from '@/stores/notifications';
import type { DeleteFileDto } from '@/models/DeleteFileDto';
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

const emit = defineEmits(['create', 'submit'])

const entering = ref()
const options = inject('options')
const sendForm = ref(props.order)
const isFormVisible = computed(() => !!props.order)
const authStore = useAuthStore();
const authb2cStore = useB2CAuthStore();

const isb2cUserLoggedIn = computed(() => authb2cStore.currentB2CUser.isLoggedIn);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
const uploadStore = useUploadFilesStore()
const uploadedFiles = computed(() => uploadStore.uploadedFiles)
let uploadFiles = []
const toast = useToast()
const notificationsStore = useNotificationsStore()

watch(() => [props.order], (order) => {
  sendForm.value = { ...order }
})

function init() {
  emit('create')
}

async function submit() {
  try {
    const response = await SendToPMService.submitExitOrder(sendForm.value);
    if (response) {
      console.log('Exit Order submitted successfully');
    } else {
      console.log('Error submitting Exit order');
    }
  } catch (error) {
    console.error('An error occurred during Exit submission:', error);
  }

  emit('submit', sendForm);
}

async function blobToBase64(blob:any) {
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
    userId= (await authStore.currentUser.userId as any);
  }
  if (isb2cUserLoggedIn.value) {
    userId =  ( await authb2cStore.currentB2CUser.userId as any);
  } 
  return userId
}

async function removeFileExtension(fileName:any) {
  // Find the last index of the dot (.)
  const lastIndex = fileName.lastIndexOf('.');
  // If the dot is found and it is not the first or last character in the filename
  if (lastIndex !== -1 && lastIndex !== 0 && lastIndex !== fileName.length - 1) {
    return fileName.substring(0, lastIndex);
  }
  
  return fileName;
}

async function convertAndSendFile(file: any) {
  const zip = new JSZip();
  zip.file(file.name, file); // Add the file to the Zip
  // Generate the binary data of the Zip file
  const zipBinary = await zip.generateAsync({ type: 'blob' });
  // Convert the binary data (Blob) to Base64
  const zipBase64 = await blobToBase64(zipBinary);
  // const fileNameWithoutExtension= await removeFileExtension(file.name)
  //const fileName= fileNameWithoutExtension+'.zip'
  const fileName = file.name
  const id = await getUserId()
 
  const uploadInfo: UploadFileDto = {
    FileName: fileName,
    UserId: id as any,
    Data: zipBase64 as string
  }
  const uploadResponse = await SendToPMService.uploadFilesToBlobStorage(uploadInfo)
  if(uploadResponse)
    notificationsStore.addNotification(`Uploaded Successfully`, `Your file ${fileName} was successfully uploaded`, { severity: 'success', position: 'top-right' })
  else
    notificationsStore.addNotification(`Upload failed`, `Your file ${fileName} was not uploaded`, { severity: 'error', position: 'top-right' })
  console.log('uploadResponse', uploadResponse) 
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
  uploadFiles = event.dataTransfer.files;
  event.preventDefault();
  const validFiles = []
  for (let i = 0; i < uploadFiles.length; i++) {
    const file = uploadFiles[i];
    if(isValidFileType(file)) {
        notificationsStore.addNotification(`Invalid file type`, file.name, { severity: 'error', position: 'top-right' })
    } else {
      await convertAndSendFile(file)
      validFiles.push(file)
      console.log('Accepted file:', file.name);
    }
  }
  if(validFiles.length>0)
    uploadStore.uploadData(validFiles as [])
}

const removeItemByProperty = (propName: any, propValue: any) => {
  const index = (uploadedFiles as any).value.findIndex((uploadedFile: any) => uploadedFile[propName] === propValue);
  if (index !== -1) {
    (uploadedFiles as any).value.splice(index, 1);
  }
};

async function onDeleteClick(name: string) {
  const fullname = name
  //const fileNameWithoutExe = await removeFileExtension(name)
  const uploadInfo: DeleteFileDto = {
   // FileName: fileNameWithoutExe + ".zip",
    FileName:name,
    UserId: await getUserId() as any
  }
  const deleteResponse = await SendToPMService.deleteFilesToBlobStorage(uploadInfo)
  if(deleteResponse) {
    removeItemByProperty('name',fullname)
    notificationsStore.addNotification(`Deleted Successfully`, `Your file ${fullname} was successfully deleted`, { severity: 'success', position: 'top-right' })
  }
  else {
    notificationsStore.addNotification(`Delete failed`, `Your file ${fullname} was not deleted`, { severity: 'error', position: 'top-right' })
  }

}


const imageCarrierCodeTypestypes = ref([
  { label: "UPC Code", value: "UPC" },
  { label: "QR Code", value: "QR" },
  { label: "EAN Code", value: "EAN" },
  { label: "Data Matrix Code", value: "DATA_MATRIX" },
]);
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
              strong ABC INC
            .f
              label(for="location") Location
              prime-dropdown(:options="options.locations" v-model="sendForm.location")
              //- strong {{ faker.address.city() }}
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
            .f(v-if="sendForm.carrierCode && sendForm.carrierCode.type && sendForm.carrierCode.code")
              label(for="code") Code #
              .field-group
                prime-dropdown#code-type(v-model="sendForm.carrierCode.type" name="code-type" :options="imageCarrierCodeTypestypes" optionLabel="label" optionValue="value")
                prime-inputtext#code(v-model="sendForm.carrierCode.code" name="code")
            .f
              label(for="job_number") SGS Job #
              prime-inputtext#job_number(v-model="sendForm.jobNumber" name="job_number")
        .fields
        .divider
        colors-table-edit
        .divider
        .fields
          .f
            label(for="comments") Comments
            prime-textarea#comments(v-model="sendForm.comments" name="comments" rows="10")
      aside
        label.drop-zone(for="files" @dragover="onDragOver" @drop="onDrop" @dragenter="entering = true" @dragleave="entering = false" :class="{ highlight: entering }")
          input(type="file" multiple @input="handleInput($event)")
          span Drag &amp; Drop files here ...
        .upload(v-if="uploadedFiles && uploadedFiles.length > 0")
          h4 Uploaded Files:
          ul.files 
            li(v-for="file in uploadedFiles" :key="file.name") 
              .name {{ file.name }}
              sgs-button.delete.alert.secondary.sm(icon="delete" @click="onDeleteClick(file.name)")
    template(#footer)
      .actions
        sgs-button(label="Send" :icon="loading ? 'progress_activity' : 'send'" :iconClass="loading ? 'spin' : ''" @click="submit" iconPosition="right")
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
