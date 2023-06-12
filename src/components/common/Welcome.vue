<!-- <template lang="pug">
.welcome-dialog
prime-dialog(v-model:visible="dialogVisible" :closable="true" :style="{ width: '20rem',height:'10rem', border: '1px solid black', position: 'absolute', top: 0 }")
    //- h2 Welcome back {{ user }}!
    h3 Hope you have a good day
</template> -->
<!-- <template lang="pug">
.welcome-dialog
    prime-dialog(v-model:visible="dialogVisible" :closable="true" :style="{ width: '20rem', border: '1px solid #ccc' }")
      .dialog-content
        h6(style="font-family: 'Arial', sans-serif; font-size: px; color: #333;") Welcome back, {{ user }}!
        h6(style="font-family: 'Arial', sans-serif; font-size: 16px; color: #666;") Hope you have a good day
</template> -->

<!-- var(--button-primary-bg-color); -->
import Message from 'primevue/message';

<template lang="pug">
.p-message-info
  message(:closable='true' sticky='' life="3000") Welcome To Image Carrier Reorder
</template>

<script>
export default {
  name: "Welcome",
  props: ["user"],
  data() {
    return {
      dialogVisible: true,
    };
  },
};
</script>


