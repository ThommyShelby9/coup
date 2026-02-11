<template>
  <component :is="iconComponent" v-bind="$attrs" />
</template>

<script setup lang="ts">
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  name: string
}>()

const iconComponent = computed(() => {
  // Convert "lucide:arrow-left" to "ArrowLeft"
  const iconName = props.name.replace('lucide:', '')
  const pascalCase = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  return (icons as any)[pascalCase] || (icons as any).HelpCircle
})
</script>
