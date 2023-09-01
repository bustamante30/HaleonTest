<script lang="ts" setup>

const emit = defineEmits(['close'])

const issueTypes = ref([])
const browsers = ref([])

const issue = ref({
  userId: 'Abraham Lincoln',
  application: 'Image Carrier Reorder',
  issueType: null,
  browser: null,
  browserVersion: null,
  description: null,
  attachments: []
});
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
      strong.value {{ issue.userId }}
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
        prime-dropdown(:options="browsers" v-model="issue.browser" placeholder="-- None --")
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
      label.required
        span Include support material (screen image / recording) if needed
      label.drop-zone(for="files")
        input#files(type="file" name="files")
        span Drag &amp; Drop files here ...
  template(#footer)
    footer
      .actions
        sgs-button.default.sm(label="Cancel" @click="emit('close')")
        sgs-button.alert.sm(label="Report Issue")







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

</style>