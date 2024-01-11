<template lang="pug">
.drag-drop-message(:class="{ highlight: entering }" @dragover="onDragOver" @drop="onDrop" @dragenter="entering = true" @dragleave="entering = false")
  p Drag &amp; Drop files here ...
  p.upload-option-divider OR
  label.file-upload(for="file-upload")
    input(id="file-upload" type="file" multiple @change="onFileSelected")
    sgs-button.file-upload-button(label="Browse for files" icon="upload" class="sm neutral")

</template>

<!-- eslint-disable no-undef -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
const emit = defineEmits(["filesInput"]);
const entering = ref();

function onDragOver(event) {
  event.preventDefault();
}
async function onFileSelected(e) {
  var filesToUpload = Array.from(e.target.files);
  if (filesToUpload.length === 0) {
    return;
  }
  emit("filesInput", filesToUpload);
}

async function onDrop(event: any) {
  event.preventDefault();
  const filesToUpload = Array.from(event.dataTransfer.files);
  emit("filesInput", filesToUpload);
}
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"
.drag-drop-message
  +flex
  flex-direction: column
  text-align: center
  font-size: 0.9rem
  font-weight: 600
  opacity: 0.8
  margin: $s 0
  border: 1px dashed $grey
  &.highlight
    background: rgba($sgs-blue, 0.2)
    border: 1px solid $sgs-blue
  padding: $s
  &:hover
    opacity: 1
  p.upload-option-divider
    width: 4rem
    position: relative
    margin: $s 0
    color: $grey
    font-size: 0.8rem
    font-weight: 600
    &:before, &:after
      content: " "
      width: 3rem
      height: 2px
      background: $grey-light-2
    &:before
      +absolute-ww
    &:after
      +absolute-ee
  .file-upload
    display: inline-block
    cursor: pointer
    > .file-upload-button:hover
      pointer-events: none
    > input[type="file"]
      display: none
</style>
