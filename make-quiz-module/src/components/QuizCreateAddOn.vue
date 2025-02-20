<template>
  <!-- 미리보기 : 모든 상태에서 표시 -->
  <q-btn
    @click="()=>{ emit('showPreviewModal') }"
    outline
    class="size_sm addon__btn--preview"
  >
    <q-icon name="zoom_in" class="icon_svg"></q-icon>
    <span class="title3 btn_title3">미리보기</span>
  </q-btn>
  <!-- 퀴즈복사 : 임시저장, 저장 상태에서 표시 -->
  <q-btn
    v-if="props.storeQuizId"
    @click="()=>{ emit('copyQuiz') }"
    outline
    style="width: 100%; border-radius: 8px; margin: 12px 0 0 0"
    class="size_sm"
  >
    <q-icon name="content_copy" class="icon_svg"></q-icon>
    <span class="title3 btn_title3">퀴즈복사</span>
  </q-btn>
  <!-- 페이징 기능 -->
  <div class="control_box">
    <p class="body3" style="font-weight: 700">페이지목록</p>
    <div class="page_list">
      <Draggable
        v-model="pageComponents"
        :class="'dragClass'"
        :animation="200"
        :disabled="[QuizStatus.Drafting, QuizStatus.Temp, QuizStatus.NotStarted].indexOf(props.quizStat) === -1"
      >
        <template v-for="(component, idx) in pageComponents" :key="`queryCount${component.id}`">
          <QuizCreateAddOnPage
            :page-number="component?.id as number"
            :on-page-number="props.onPageNumber"
            :page-seq="idx"
          />
        </template>
      </Draggable>
      <div class="page_add_btn">
        <q-icon
          name="add_circle_outline"
          class="icon_svg filter-grey-5 page_add_icon"
          :class="{'disabled' : pageComponents.length === QuizOption.PagePerQuiz || [QuizStatus.Drafting, QuizStatus.Temp, QuizStatus.NotStarted].indexOf(props.quizStat) === -1}"
          style="font-size: 24px;"
          @click="addPage"
        />
        <p class="page_text" style="margin: 12px 0 0 0">
          페이지 추가
        </p>
      </div>
    </div>
  </div>
  <!-- 퀴즈 재시작 : 중지 상태 -->
  <q-btn
    @click="()=>{emit('restartQuiz')}"
    v-if="props.quizStat === QuizStatus.Stopped"
    outline
    style="width: 100%; border-radius: 8px; margin: 12px 0 0 0"
    class="size_sm"
  >
    <q-icon name="restart_alt" class="icon_svg"></q-icon>
    <span class="title3 btn_title3"
      >재시작&nbsp;&nbsp;&nbsp;&nbsp;</span
    >
  </q-btn>
  <!-- 퀴즈 중지 : 진행 중, 기간 연장 -->
  <q-btn
    @click="()=>{emit('stopQuiz')}"
    v-if="props.quizStat === QuizStatus.Started || props.quizStat === QuizStatus.Extended"
    outline
    style="width: 100%; border-radius: 8px; margin: 12px 0 0 0"
    class="size_sm"
  >
    <q-icon name="pause_circle" class="icon_svg"></q-icon>
    <span class="title3 btn_title3">퀴즈 중지</span>
  </q-btn>
  <!-- 조기종료 : 진행 중, 기간 연장, 중지 -->
  <q-btn
    @click="()=>{emit('endQuiz')}"
    v-if="props.quizStat === QuizStatus.Started ||
          props.quizStat === QuizStatus.Extended ||
          props.quizStat === QuizStatus.Stopped
         "
    outline
    style="width: 100%; border-radius: 8px; margin: 12px 0 0 0"
    class="size_sm"
  >
    <q-icon name="stop_circle" class="icon_svg"></q-icon>
    <span class="title3 btn_title3">조기종료</span>
  </q-btn>

  <div
    v-if="props.showTopButton"
    class="top_btn"
  >
    <q-icon
      name="keyboard_double_arrow_up"
      class="icon_svg"
      style="font-size: 45px;"
      @click="moveToTop"
    ></q-icon>
  </div>
</template>

<script lang="ts" setup>
import { ref, type Ref, watch, inject, onMounted, nextTick } from 'vue';
import { VueDraggableNext as Draggable } from 'vue-draggable-next';
import type { FlexibleObject, QuizPage } from '@/composables/quiz-interface';
import { QuizStatus, QuizOption } from '@/composables/quiz-interface';
import QuizCreateAddOnPage from '../components/QuizCreateAddOnPage.vue';

/* inject 받은 값 선언 */
// 퀴즈 페이지
const quizPageComponents = inject<Ref<FlexibleObject[]>>('quizPageComponents');

/* 에밋 선언 */
const emit = defineEmits(['addQuizPage','showPreviewModal','copyQuiz','restartQuiz','endQuiz','stopQuiz']);

/* 프롭 선언 */
const props = defineProps({
  onPageNumber: { // 현재 활성화 된 페이지
    type: Number,
    required: true
  },
  showTopButton: { // 탑 버튼 보이기 유무(질문 3개 이상)
    type: Boolean,
    required: true
  },
  storeQuizId: { // 스토어에서 가져온 quizId(등록된 퀴즈일 경우)
    type: Number,
    required: false
  },
  quizStat: { // 퀴즈 상태값(등록된 퀴즈일 경우)
    type: Number,
    required: true
  },
  quizData: { // 등록 퀴즈일 경우 데이터
    type: Object,
    required: true
  },
});


/* 페이지 관리 */
// 동적 페이지 데이터 배열
const pageComponents = ref<Array<FlexibleObject>>([
  {
    id: 1, // 고유 ID 생성
    name: 'pageComponent1',
  }
]);
let pageSeq = 1; // 동적 컴포넌트 순번

// 페이지 추가
const addPage = (): void => {
  // 배열의 길이가 10 미만일 때만 추가
  if (pageComponents.value.length < QuizOption.PagePerQuiz && [QuizStatus.Drafting, QuizStatus.Temp, QuizStatus.NotStarted].indexOf(props.quizStat) > -1) {
    pageComponents.value.push({
      id: ++pageSeq, // 고유 ID 생성
      name: `pageComponent${pageSeq}`,
    });
    emit('addQuizPage');
  }
}

// 페이지 삭제(2페이지 부터)
const removePage = (id: number): void => {
  if (pageComponents.value.length === 1 || [QuizStatus.Drafting, QuizStatus.Temp, QuizStatus.NotStarted].indexOf(props.quizStat) === -1) return;
  pageComponents.value = pageComponents.value.filter(ele=>{
    return ele.id !== id;
  });
};


/* 탑 이동 */
const moveToTop = (): void => {
  window.scrollTo({
      top: 0,
      behavior: 'smooth' // 부드러운 스크롤 효과
  });
}


/* 페이지 변경 시 퀴즈 페이지 컴포넌트도 재정렬 */
watch(() => pageComponents, () => {
  // 페이지 컴포넌트의 ID를 기준으로 정렬 순서를 결정
  const pageComponentIdOrder = new Map(pageComponents.value.map((comp, index) => [comp.id, index]));

  // 퀴즈 페이지 컴포넌트를 페이지 컴포넌트의 ID 순서에 맞게 정렬
  (quizPageComponents as Ref<FlexibleObject[]>).value.sort((a: FlexibleObject, b: FlexibleObject) => {
    const indexA = pageComponentIdOrder.get(a.id) ?? Infinity; // 기본값으로 Infinity를 사용하여 찾을 수 없을 때 맨 뒤로 이동
    const indexB = pageComponentIdOrder.get(b.id) ?? Infinity;
    return indexA - indexB;
  });
},{ deep: true });


/* 등록 퀴즈일 경우 데이터 바인딩 */
watch(() => props.quizData, () => {
  if(props.quizData){
    pageComponents.value = props.quizData.quizPageList.map((ele: QuizPage) => {
      return {
        id: ele.pageSeq,
        name: `pageComponent${ele.pageSeq}`,
      }
    });
    pageSeq = pageComponents.value.length;
  }
},{ deep: true });


/* Draggable의 disabled 옵션과 퀘이사의 [disabled] css 클래스 충돌 문제 해결 */
onMounted(async ()=>{
  await nextTick(); // 모든 엘리먼트가 렌더링 완료된 후
  if(document.querySelector('.dragClass')!.getAttribute('disabled') === 'false'){
    document.querySelector('.dragClass')!.removeAttribute('disabled');
  }
});

// 삭제 메서드 외부 노출
defineExpose({
  removePage
})
</script>

<style lang="scss" scoped>
.page_btn, .page_add_icon, .top_btn {
 cursor: pointer;
}

.btn_title3 {
  margin: 2px 0 0 10px;
  color: $grey-1;
}

.control_box {
  background-color: #fff;
  border: #ccc 1px solid;
  padding: 16px 12px 12px;
  border-radius: 10px;
  margin: 12px 0 0 0;
}

.page_list {
  margin: 12px 0 0 0;
}

.page_btn {
  @include flex_row_between;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 12px;
  height: 40px;
  margin: 0 0 4px 0;
  &.page_btn_on {
    color: #fff;
    background-color: #2e9dd1;
    border: 1px solid #257ea7;
    .page_text {
      color: $white;
    }
  }
}

.page_add_btn {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 93px;
}

.page_text {
  color: $grey-3;
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
}

.top_btn {
  position: fixed;
  right: 3%;
  top: 90%;
  border-radius: 10px;
  border: #2c3e50 2px solid;
  opacity: .8;
}

.addon__btn--preview{
  width: 100%;
  border-radius: 8px;
  background-color: white !important;
}
</style>
