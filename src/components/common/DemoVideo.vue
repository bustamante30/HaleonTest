<template lang="pug">
.demo-video 
  sgs-scrollpanel.chapters(v-if="props.showChapters")
    ul
      li.chapter(v-for="chapter in chapters" :key=chapter['Marker Name'] v-tooltip.right="{ value: chapter['Marker Name']}" :class="{ current: isCurrentChapter(chapter) }")
        i.material-icons.outline play_arrow
        a.name(@click="currentChapter = chapter") {{ chapter['Marker Name'] }}
        span.time {{ chapter['In'] }}
  figure.video
    video(:src="videour", type="video/mp4", autoplay, controls)
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
const props = defineProps({
  src: {
    type: String,
    default: null,
  },
  chapters: {
    type: Array,
    default: () => [],
  },
  showChapters: {
    type: Boolean,
    default: false,
  },
});

const currentChapter = ref(null);
const currentChapterInSecs = computed(() => {
  const time = currentChapter.value && currentChapter.value.In;
  if (time) {
    const t = time.split(":").map((t) => parseInt(t));
    const secs = t[0] * 216000 + t[1] * 3600 + t[2] * 60 + t[3];
    return secs;
  } else {
    return "";
  }
});
function isCurrentChapter(chapter) {
  return currentChapter.value && chapter.In === currentChapter.value.In;
}

const videoUrl = ref();
async function showDialog() {
  const useUploadFilesStore = async () =>
    await import("@/stores/upload-files").then(async (store) => {
      const uploadDocsStore = store.useUploadFilesStore();
      await uploadDocsStore.getSasPathDemoVideo();
      return uploadDocsStore.sasTokenUrl;
    });
  return await useUploadFilesStore();
}
const videour = computed(
  () =>
    videoUrl.value +
    (currentChapterInSecs.value ? `#t=${currentChapterInSecs.value}` : ""),
);
onMounted(async () => {
  videoUrl.value = await showDialog();
});
</script>

<style lang="sass" scoped>
@use "sass:math"
@import "@/assets/styles/includes"

.demo-video
  +container
  +flex
  align-items: stretch
  position: relative

  .chapters
    +absolute-w
    flex: 1
    width: 18rem
    background: #fff
    z-index: 1
    box-shadow: 5px 0 5px 3px rgba(#666, 0.3)
    ul
      +reset
      width: 100%
      overflow: hidden
      li.chapter
        +flex
        overflow: hidden
        padding: $s25 $s50 $s25 $s25
        border-bottom: 1px solid #f2f2f2
        cursor: pointer
        width: 100%
        i
          width: 1rem
          margin-right: $s50
          opacity: 0.1
        a, span
          display: inline-block
        a.name
          flex: 1
          white-space: nowrap
          display: inline-block
          text-overflow: ellipsis
          overflow: hidden
        span.time
          display: none
          width: 5rem
        &:last-child
          border-bottom: none
        &:hover, &.current
          background: #f6f6f6
          i
            opacity: 1
          span.time
            display: inline-block
  figure.video
    overflow: hidden
    width: 100%
    height: 100%
    margin: 0
    video
      width: 100%
      height: 100%
</style>
