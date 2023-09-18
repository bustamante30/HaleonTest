<script lang="ts" setup>
import ReportIssueService from "@/services/ReportIssueService";
import { useNotificationsStore } from '@/stores/notifications';

const emit = defineEmits(['close'])

const issueTypes = ref(["Incorrect visuals (PDF/Thumbnail)","Incorrect Search List","Submission request error","Keyword/Advanced search issue","Timed out","Other"]);
const browsers = ref(["Firefox","Safari","Chrome","Other"]);
const notificationsStore = useNotificationsStore()

const props = defineProps({
  userName: {
    type: String,
    default: "" 
  }
});
const issue = ref({
  userId: 'Abraham Lincoln',
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
      "Please ensure you fill all required fields",
      { severity: 'error', position: 'top-right' }
    );
  }else{
   closeForm()
   const result = reportIssue(issue.value)
   notificationsStore.addNotification(
    validationErrors.join("\n"),
      "Issue submitted successfully",
      { severity: 'success', position: 'top-right' }
    );
  }
}

const closeForm = () => {
  emit('close');
};

function validateForm() {
  const errorMessages = [] as string[];
if (!issue.value?.browser) {
  errorMessages.push("You must select a browser.");
}
if (issue.value?.browserVersion == null) {
  errorMessages.push("You must select a browser version.");
}
if (issue.value?.issueType == null) {
  errorMessages.push("You must select an issue.");
}
if (issue.value?.description == null) {
  errorMessages.push("You must Briefly describe the issue.");
}
return errorMessages;
}

async function reportIssue(advancedSearchParameters?: any) {
  let result = await ReportIssueService.submitIssue(issue.value);
  alert(result)
  debugger
      
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
      label.required
        span Include support material (screen image / recording) if needed
      label.drop-zone(for="files")
        input#files(type="file" name="files")
        span Drag &amp; Drop files here ...
  template(#footer)
    footer
      .actions
        sgs-button.default.sm(label="Cancel" @click="emit('close')")
        sgs-button.alert.sm(label="Report Issue" @click="onSubmit()")
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
