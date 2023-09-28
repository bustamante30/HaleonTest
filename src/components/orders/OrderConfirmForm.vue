<script lang="ts" setup>
import { DateTime } from 'luxon';
import { onBeforeMount,computed,ref, watch } from 'vue';
import { useB2CAuthStore } from "@/stores/b2cauth";
import { useNotificationsStore } from '@/stores/notifications';
import { useAuthStore } from "@/stores/auth";
import SendToPMService from "@/services/SendToPmService";
import { FileUploadService ,type FileUploadResponse, type FileDelete }from "@/services/FileUploadService";
import type { UploadFileDto } from '@/models/UploadFileDto';
import type { DeleteFileDto } from '@/models/DeleteFileDto';

type ValidFiles = {
  fileName : string,
  uri:string
}
const props = defineProps({
  checkout: {
    type: Object,
    default: {
      expectedDate: null,
      purchaseOrder: null,
      shippingAddrress: null
    }
  }
})

const emit = defineEmits(['change'])
const authb2cStore = useB2CAuthStore();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

const isb2cUserLoggedIn = computed(() => authb2cStore.currentB2CUser.isLoggedIn);
const isUserLoggedIn = computed(() => authStore.currentUser.isLoggedIn);
let entering = ref()
const sendUpload = ref([])
const checkoutForm = ref()
let validFiles = ref<ValidFiles[]>([]);
onBeforeMount(() => {
  checkoutForm.value = { ...props.checkout }
})

watch(props.checkout, () => {
  checkoutForm.value = { ...props.checkout }
})

function addPurchaseOrder() {
  if (checkoutForm.value?.purchaseOrder?.length < 10) checkoutForm.value?.purchaseOrder.unshift('')
}

function removePurchaseOrder(index : number) {
  const po = checkoutForm.value?.purchaseOrder
  checkoutForm.value.purchaseOrder = po.splice(index, 1) as string[]
}

function updateCheckout() {
  let expectedDateTime: Date = checkoutForm.value.expectedDate;
  if(checkoutForm.value.expectedDate) {
  expectedDateTime.setHours(checkoutForm.value.expectedDate.getHours());
  expectedDateTime.setMinutes(checkoutForm.value.expectedDate.getMinutes())
  }
  emit('change', { 
    purchaseOrder:checkoutForm.value.purchaseOrder? checkoutForm.value.purchaseOrder: null,
    expectedDate:expectedDateTime, 
    notes: checkoutForm.value.notes ? checkoutForm.value.notes: null,
    reorderdocs: validFiles.value.map(x=> {
      return  ({fileName: x.fileName,url: x.uri })
    })
  })
}

function minSelectableDate() {
  return DateTime.now().plus({ hour: 72 }).startOf('hour').toJSDate()
}
const validSpecialCharacters = ['-', '_', '/', '\\', '#', '.', ',', '+', '&', '(', ')', ' ', ':', ';', '<', '>', '\''];

const errorMessages = {
  minLength: 'Please enter at least 3 characters in the purchase order field.',
  maxLength: 'The Purchase order field cannot exceed 30 characters.',
  duplicateValue: 'Duplicate PO number',
  invalidCharacters: 'The Purchase order field contains invalid special characters. Only the following special characters are allowed: - _ / \\ # . , + & ( ) " : ; < > \'',
};

function validatePurchaseOrder(index: number): string {
  const purchaseorder = checkoutForm.value.purchaseOrder[index];  
  
  if (purchaseorder == null || purchaseorder.length == 0) {
    return "";
  }

  if (purchaseorder.length < 3) {
    return errorMessages.minLength;
  }
  
  if (purchaseorder.length > 30) {
    return errorMessages.maxLength;
  }

  for (let i = 0; i < checkoutForm.value.purchaseOrder.length; i++) {
    if(i != index && purchaseorder === checkoutForm.value.purchaseOrder[i]){
      return errorMessages.duplicateValue;
    }
  }
  
  for (let i = 0; i < purchaseorder.length; i++) {
    if (!validSpecialCharacters.includes(purchaseorder[i]) && !/^[a-zA-Z0-9]$/.test(purchaseorder[i])) {
      return errorMessages.invalidCharacters;
    }
  }
  
 return "";
}

function showNotes(): boolean {
  return authb2cStore.currentB2CUser.userType === 'EXT';
}

const isExpectedTimeDisabled = computed(() => {
  return !checkoutForm.value.expectedDate;
});


const isValidFileType = (file: File) => {
  const forbiddenExtensions = ['.exe', '.bat', '.com', '.cmd', '.inf', '.ipa', '.osx', '.pif', '.run', '.wsh'];
  const lowercaseName = file.name.toLowerCase();
  return forbiddenExtensions.some(extension => lowercaseName.endsWith(extension));
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

async function convertAndSendFile(file: any):Promise<FileUploadResponse> {
  const binaryToBase64 = await blobToBase64(file);
  const fileName = file.name.replace(/[(!$%&[\]{}]/g, '-')
  const id = await getUserId()

  const formdata = new FormData();
  formdata.append('file', file)
  formdata.append('UserId', id)
  formdata.append('FileName', fileName)
  formdata.append('Data', '')
  formdata.append('isReorderDocs', 'yes')
  return await FileUploadService.uploadFile(formdata)
}

async function onDrop(event: any) {
  event.preventDefault();
  const uploadFiles = Array.from(event.dataTransfer.files);
  const uploadPromises = uploadFiles.map(async (file: any) => {
    if (isValidFileType(file)) {
      // rename the File 

      notificationsStore.addNotification(
        `Invalid file type`,
        `File with the given format cannot be uploaded(exe,bat,com,cmd,inf,ipa,osx,pif,run,wsh)`,
        { severity: 'error', position: 'top-right' }
      );
      return null;
    } else {
      const response = await convertAndSendFile(file);
      if (response.status === 'OK') {
        validFiles.value.push({fileName : file.name as string , uri: response.uri} );
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
    notificationsStore.addNotification(
      `Uploaded successfully`,
      `You have uploaded ${successfulUploads.length} files successfully`,
      { severity: 'success', position: 'top-right' }
    );
  }
  updateCheckout()
}

const removeItemByProperty = (index: number) => {
  if (index !== -1) {
    validFiles.value.splice(index, 1);
  }
};

async function onDeleteClick(file: ValidFiles,index:number) {
  const deleteInfo: FileDelete = {
    isRedorder : true,
    uri :file.uri
  }
  const deleteResponse = await FileUploadService.deleteFilesToBlobStorage(deleteInfo)
  if (deleteResponse) {
    removeItemByProperty(index)
    notificationsStore.addNotification(`Deleted Successfully`, `Your file ${file.fileName} was successfully deleted`, { severity: 'success', position: 'top-right' })
  }
  else {
    notificationsStore.addNotification(`Delete failed`, `Your file ${file.fileName} was not deleted`, { severity: 'error', position: 'top-right' })
  }
  updateCheckout()
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

</script>

<template lang="pug">
.order-conformation-form(v-if="checkoutForm" @change.prevent="updateCheckout")
  .details
    .f
      label Delivery Date *
      span.input.calendar
        prime-calendar(v-model="checkoutForm.expectedDate" @update:modelValue="updateCheckout" :minDate="minSelectableDate()" appendTo="body" hourFormat="12" required="true")
        span.material-icons calendar_month
    .f
      label Delivery time *
      span.input.calendar    
        prime-calendar(v-model="checkoutForm.expectedDate" @update:modelValue="updateCheckout" :minDate="minSelectableDate()" timeOnly appendTo="body" hourFormat="12" required="true")
    

    .f.po-numbers(v-for="po, i in checkoutForm.purchaseOrder" :key="i")
      label
        span(v-if="i === 0") Purchase Order #
      span.input.po
        .input-text
          prime-inputtext.po-number(v-model="checkoutForm.purchaseOrder[i]" @update:modelValue="updateCheckout" maxlength="26")
          span.error(v-if="validatePurchaseOrder(i)") {{ validatePurchaseOrder(i) }}
        a(v-if="i === 0" @click="addPurchaseOrder()" :class="{ disabled: checkoutForm.purchaseOrder.length >= 10 }")
          span Add&nbsp;
          i.material-icons add
        a.remove(v-else @click="removePurchaseOrder(i)")
          i.material-icons delete_outline


  .notes(v-if="showNotes()")
    .f
      label Notes
      span.input.notes
        //- TODO Prepopulate
        prime-textarea(v-model="checkoutForm.notes")
  aside
    label.doc-label Attach Documents
    label.drop-zone(for="files" @dragover="onDragOver" @drop="onDrop" @dragenter="entering = true" @dragleave="entering = false" :class="{ highlight: entering }")
      input(type="file" multiple @input="handleInput($event)")
      span Drag &amp; Drop files here ...
    .upload(v-if="validFiles && validFiles.length > 0")
      h4 Uploaded Files:
      ul.files 
        li(v-for="(file, index) in validFiles" :key="file") 
          .name {{ file.fileName }}
          sgs-button.delete.alert.secondary.sm(icon="delete" @click="onDeleteClick(file,index)")

</template>

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
.drop-zone
  min-height: 5rem
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
