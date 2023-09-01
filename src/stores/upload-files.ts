
import { FileUploadService } from '@/services/FileUploadService'
import { defineStore } from 'pinia'

export const useUploadFilesStore = defineStore('upload-files', {
  state: () => ({
    uploadedFiles: [],
    sasTokenUrl:''
  }),
  getters: {
  },
  actions: {
    uploadData(files: []) {
      this.uploadedFiles = files
    },
    async getSasPathDemoVideo(){
      this.sasTokenUrl = await FileUploadService.getDemoVideo()
    },
  }
})