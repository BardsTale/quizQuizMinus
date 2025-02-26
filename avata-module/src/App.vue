<template>
  <main>
    <AvataDemo
      @defineAvatar="setAvatarInfo"
    />
    <AvataView
      :serverName="serverName"
      :charName="charName"
    />
  </main>
  <bottom>
    <AvataList/>
  </bottom>
</template>

<script setup>
import AvataDemo from './components/AvataDemo.vue';
import AvataView from './components/AvataView.vue'
import AvataList from './components/AvataList.vue'
import { ref } from 'vue';

/* 아바타 조회 로직 */
// 조회한 아바타 정보
const serverName = ref('');
const charName = ref('');

// 아바타 정보 저장
const setAvatarInfo = (serverInfo, charInfo) => {
  serverName.value = serverInfo;
  charName.value = charInfo;
}

</script>

<style scoped>
main {
  width: 400px;
  margin-right: 50px;
}

bottom {
  width: 900px;
  margin-top: 50px;
}
</style>
