<template>
  <div class="relative">
    <h1 class="text-3xl font-bold underline !mb-6">
      바람의나라 아바타 데모
    </h1>
  </div>

  <div>
    <div class="flex flex-col gap-2 !mb-3">
      <select v-model="serverName"
        class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <option value="" disabled selected>서버를 선택하세요</option>
        <option value="연">연</option>
        <option value="무휼">무휼</option>
        <option value="유리">유리</option>
        <option value="진">진</option>
        <option value="하자">하자</option>
        <option value="호동">호동</option>
      </select>
      <input type="text" placeholder="캐릭터 명"
        v-model="charName"
        class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div class="relative !mb-3">
      <button
        v-if="!isSearching"
        @click="() => searchValidation() && searchThrottle(searchBaramChar,500)"
        class="w-30 flex items-center gap-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        🔍 <span>검색</span>
      </button>
      <button
        v-else
        class="w-30 bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
      >
        <span class="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        로딩 중...
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
/* emit 선언 */
const emits = defineEmits(['defineAvatar']);

/* 캐릭터 검색 */
// 기본 변수 선언
const serverName = ref('');
const charName = ref('');
const isSearching = ref(false);


// 검색 함수
const searchBaramChar = ()=>{
  // 파라미터 설정
  const params = {
    'character_name': charName.value,
    'server_name': serverName.value,
  };

  // 헤더 설정
  const headers = {
  'Accept': 'application/json',
  'x-nxopen-api-key': 'test_6e43020fd5dcbb6c5306d35c6bc027cdd223991177bf295b7322e5f5c49de3daefe8d04e6d233bd35cf2fabdeb93fb0d',
};

  // url 설정
  const url = new URL('https://open.api.nexon.com/baram/v1/id');
  url.search = new URLSearchParams(params).toString();

  // fetch 통신
  fetch(url, {
    method: 'GET',
    headers: headers,
  })
  .then(response => {
    if (!response.ok) {
      alert('존재하지 않는 캐릭터입니다!');
      throw new Error('응답이 올바르지 않습니다');
    }
    return response.json();
  })
  .then(data => {
    // 조회 성공(존재하는 캐릭터)
    if(data.ocid) emits("defineAvatar", serverName.value, charName.value);
  })
  .catch(error => console.error('에러:', error))
  .finally(() => {
    isSearching.value = false; // 검색 완료
  });
}

// 검색 쓰로틀링 함수(HoF)
const searchThrottle = (fn, delay) => {
  let timeoutId = null;
  // 검색중으로 전환
  isSearching.value = true;

  return (function (...args) {
    if (timeoutId) return; // 이미 대기 중이면 실행하지 않음
    console.log()
    timeoutId = setTimeout(() => {
      fn(...args);  // 실제 함수 호출
      timeoutId = null;  // 타임아웃 종료 후 timeoutId 초기화
    }, delay);
  })();
}

// 검색 벨리데이션 함수
const searchValidation = () => {
  if(!serverName.value) {
    alert('서버명을 입력하세요.');
    return false;
  }
  if(!charName.value) {
    alert('캐릭터명을 입력하세요.');
    return false;
  }
  return true
}
</script>

<style>
@import "tailwindcss";
</style>
