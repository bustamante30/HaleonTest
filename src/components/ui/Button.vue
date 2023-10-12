<template lang="pug">
button(:disabled="disabled" :class="{ rounded: rounded, icon: icon && !label }")
  i.icon.material-icons.outline(v-if="icon && iconPosition === 'left'" :class="[icon, iconClass]") {{ icon }}
  span(v-if="label") {{ label }}
  i.icon.material-icons.outline(v-if="icon && iconPosition === 'right'" :class="[icon, iconClass]") {{ icon }}
  span.badge
    slot(name="badge")
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
  iconPosition: {
    type: String,
    default: "left",
  },
  iconClass: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="sass" scoped>
@import "@/assets/styles/includes"

$button-font-size: 1rem
$button-font-weight: 500

@keyframes spin
  0%
    transform: rotate(0)
  to
    transform: rotate(359deg)

button
  +reset
  appearance: none
  cursor: pointer
  font-size: $button-font-size
  font-weight: $button-font-weight
  border-radius: var(--border-radius)
  transition: $transition
  +flex($h: center)
  white-space: nowrap

button
  padding: $s75 $s
  position: relative
  &.lg
    padding: 15px 45px
  &.sm
    font-size: 13px
    font-weight: 600
    padding: 8px 16px
    border-radius: var(--border-radius-sm)
  &.icon
    padding: 10px
  &.icon.lg
    padding: 15px
  &.icon.sm
    padding: 8px
  &.block
    width: 100%
  &.rounded
    border-radius: 3rem

button
  background-color: var(--button-primary-bg-color)
  border: 1px solid var(--button-primary-border-color)
  color: var(--button-primary-text-color)
  &:hover
    background-color: var(--button-primary-hover-bg-color)
    border: 1px solid var(--button-primary-hover-border-color)
    color: var(--button-primary-hover-text-color)
  &.default
    background-color: var(--button-default-bg-color)
    border: 1px solid var(--button-default-border-color)
    color: var(--button-default-text-color)
    &:hover
      background-color: var(--button-default-hover-bg-color)
      border: 1px solid var(--button-default-hover-border-color)
      color: var(--button-default-hover-text-color)
    &:disabled
      cursor: default
      background-color: var(--button-default-bg-color) !important
      border: 1px solid var(--button-default-border-color) !important
      color: var(--button-default-text-color) !important
      opacity: 0.3
  &.secondary
    background-color: var(--button-secondary-bg-color)
    border: 1px solid var(--button-secondary-border-color)
    color: var(--button-secondary-text-color)
    &:hover
      background-color: var(--button-secondary-hover-bg-color)
      border: 1px solid var(--button-secondary-hover-border-color)
      color: var(--button-secondary-hover-text-color)
  &.ai
    background-color: var(--button-ai-bg-color)
    border: 1px solid var(--button-ai-border-color)
    color: var(--button-ai-text-color)
    &:hover
      background-color: var(--button-ai-hover-bg-color)
      border: 1px solid var(--button-ai-hover-border-color)
      color: var(--button-ai-hover-text-color)
  &.alert
    background-color: var(--button-alert-bg-color)
    border: 1px solid var(--button-alert-border-color)
    color: var(--button-alert-text-color)
    &:hover
      background-color: var(--button-alert-hover-bg-color)
      border: 1px solid var(--button-alert-hover-border-color)
      color: var(--button-alert-hover-text-color)
  &.alert.secondary
    background-color: var(--button-alert-secondary-bg-color)
    border: 1px solid var(--button-alert-secondary-border-color)
    color: var(--button-alert-secondary-text-color)
    &:hover
      background-color: var(--button-alert-secondary-hover-bg-color)
      border: 1px solid var(--button-alert-secondary-hover-border-color)
      color: var(--button-alert-secondary-hover-text-color)
  &.link
    background-color: var(--button-link-bg-color)
    border: 1px solid var(--button-link-border-color)
    color: var(--button-link-text-color)
    // text-decoration: underline
    &:hover
      background-color: var(--button-link-hover-bg-color)
      border: 1px solid var(--button-link-hover-border-color)
      color: var(--button-link-hover-text-color)
      text-decoration: none
    .alt &
      color: var(--button-link-alt-text-color)
      &:hover
        color: var(--button-link-hover-text-color)
  &:disabled
    cursor: default
    background-color: var(--button-disabled-bg-color) !important
    border: 1px solid var(--button-disabled-border-color) !important
    color: var(--button-disabled-text-color) !important
    &:hover
      background-color: var(--button-disabled-hover-bg-color) !important
      border: 1px solid var(--button-disabled-hover-border-color) !important
      color: var(--button-disabled-hover-text-color) !important


i.icon
  font-size: inherit
  display: inline-block
  + span:not(.badge)
    margin-left: $s50
  &.spin
    animation: spin 2s linear infinite

span
  display: inline-block
  + i.icon
    margin-left: $s50

span.badge
  +absolute-ne
  transform: translate(50%,-50%)
  transform-origin: 100% 0
  margin: 0
</style>
