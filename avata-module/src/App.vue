<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <AvataDemo
        @defineAvatar="setAvatarInfo"
      />
    </div>
  </header>

  <main>
    <AvataView
      :serverName="serverName"
      :charName="charName"
    />
  </main>
</template>

<script setup>
import AvataDemo from './components/AvataDemo.vue';
import AvataView from './components/AvataView.vue'
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
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
