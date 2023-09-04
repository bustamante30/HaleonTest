import Message from 'primevue/message';

<template lang="pug">
.p-message-info
  message.nomargin(:closable='true' sticky='' life=3000) Welcome To Image Carrier Reorder
</template>

<script>
export default {
  name: "welcome",
  props: ["user"],
  data() {
    return {
      dialogVisible: true,
    };
  },
};
</script>
<style lang="sass" scoped>
@import "@/assets/styles/includes"
.nomargin
  margin-bottom: 0
</style>

