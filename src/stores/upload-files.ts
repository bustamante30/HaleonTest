
import { defineStore } from 'pinia'

export const useUploadFilesStore = defineStore('upload-files', {
  state: () => ({
    uploadedFiles: []
  }),
  getters: {
  },
  actions: {
    uploadData(files: []) {
      this.uploadedFiles = files
    },
  }
})