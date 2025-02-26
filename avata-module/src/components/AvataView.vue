<template>
  <div class="w-[400px] h-64 overflow-hidden rounded-lg shadow-lg !mt-10">
    <img
      :src="`https://avatar.baram.nexon.com/Profile/RenderAvatar/${props.serverName}/${props.charName}?is=1&changeDir=2&ed=n&sc=-1`"
      alt="Example Image" class="w-full h-full object-contain"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  serverName: {
    type: String,
    required: true
  },
  charName: {
    type: String,
    required: true
  },
})

</script>

<style>

</style>
