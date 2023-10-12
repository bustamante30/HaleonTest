<script setup>
import { onMounted, ref } from "vue";
import { useFaqStore } from "@/stores/faq";

const faqStore = useFaqStore();
let faqs = ref([]);
onMounted(async () => {
  const faq = await faqStore.loadFaqs();
  faqs.value = faq.results;
});
</script>

<template lang="pug">
sgs-scrollpanel.project-job-detail
  template(#header)
  .projects.page
    header
      h1 FAQ
    .main
      prime-panel(v-for="faq in faqs" :header="faq.question" toggleable)
        .section(v-html="faq.answer")
          

</template>

<style lang="sass" scoped></style>
<style lang="sass" scoped>
@import "@/assets/styles/includes"

.project-job-detail
  height: calc(100vh - 70px)

.projects.page
  padding: $s $s2
  flex: 1
  overflow-x: hidden
  overflow-y: auto
  > header
    padding: $s 0
.section
  padding: $s $s2
  background: #ffffff
  font-size: 14px
.main
  gap: 2px
  display: flex
  flex-direction: column
</style>
