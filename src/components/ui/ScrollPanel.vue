<script setup>
const props = defineProps({
  scroll: {
    type: Boolean,
    default: true
  },
  top: {
    type: Number,
    default: 0
  }
})
</script>

<template lang="pug">
.panel
  header.panel-header
    slot(name="header")
  main.panel-content(ref="content", :class="{ 'scroll': scroll }")
    slot
  footer.panel-footer
    slot(name="footer")
</template>

<!-- <script>
export default {
  props: {
    scroll: { type: Boolean, default: true },
    top: { type: Boolean, default: false },
    bottom: { type: Boolean, default: false },
  },
  watch: {
    top() {
      if (this.top) this.defaultScroll()
    },
    bottom() {
      if (this.bottom) this.defaultScroll()
    }
  },
  mounted() {
    this.defaultScroll()
  },
  methods: {
    scrollTo(pos) {
      this.$refs.content.scrollTo(pos)
    },
    defaultScroll() {
      this.retries = 0
      this.scrolledOnce = false
      if (this.bottom) {
        this.scrollTo(2000)
      } else if (this.top) {
        this.scrollTo(0)
      } else if (this.scrollToEl) {
        this.scrollTo(this.scrollToEl)
      }
    },
    getCoords() {
      const box = this.$refs.content.getBoundingClientRect()

      const body = document.body
      const docEl = document.documentElement

      const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop
      const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft

      const clientTop = docEl.clientTop || body.clientTop || 0
      const clientLeft = docEl.clientLeft || body.clientLeft || 0

      const top  = box.top +  scrollTop - clientTop
      const left = box.left + scrollLeft - clientLeft

      return { top: Math.round(top), left: Math.round(left) }
    }
  }
}
</script> -->

<style lang="sass" scoped>
@import "@/assets/styles/includes"

.panel
  height: 100%
  width: 100%
  flex: 1
  display: flex
  flex-direction: column
  overflow: hidden
  align-items: stretch
  > header.panel-header,
  > footer.panel-footer
    margin: 0 !important
    padding: 0 !important
  > main.panel-content
    flex: 1
    overflow: hidden
    display: flex
    flex-direction: column
    &.scroll
      overflow-y: auto
      scroll-behavior: smooth
      scrollbar-color: transparent transparent
      scrollbar-width: thin
</style>
