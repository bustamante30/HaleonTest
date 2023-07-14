<script setup>
import Spinner from '@/components/ui/Spinner.vue'
</script>

<template lang="pug">
.block 
    spinner
</template>

<style>
.block {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #00000080;
  z-index: 999;
  justify-content: center;
  display: flex;
  align-items: center;
  border-radius: 8px;
}
</style>
