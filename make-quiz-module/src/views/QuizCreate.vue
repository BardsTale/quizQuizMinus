<template>
  <div class="fregment">
    <div class="cnt_top">
      <h2 class="title">퀴즈 만들기 모듈</h2>
    </div>
    <div class="page_community">
      <div class="wrapper_tab">
        <q-tabs
          v-model="tab"
          dense
          class="tab_basic"
          active-bg-color="primary"
          active-color="white"
          indicator-color="transparent"
          align="justify"
          narrow-indicator
          outside-arrows
        >
          <q-tab name="editQuiz" label="퀴즈 만들기" :ripple="false" />
          <q-tab name="resultQuiz" label="퀴즈 DTO" :ripple="false" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated keep-alive>
          <q-tab-panel name="editQuiz" class="quiz__tab quiz__tab--edit">
            <div class="total_wrap">
              <div class="lh_area">
                <div class="wrap_table_box">
                  <!-- 퀴즈 설정 필터 영역 -->
                  <QuizCreateFilter ref="quizRgstFilter"
                    v-show="quizPageComponents[0].id === onPageNumber"
                    :quiz-stat="quizStat"
                    :filter-data="quizPropData as QuizInterface"
                  />
                </div>
                <!-- 퀴즈 본문 -->
                <div class="wrap_page">
                  <template v-for="(component, idx) in quizPageComponents" :key="`quizPageCount${component.id}`">
                    <!-- 퀴즈 컨텐츠 영역 -->
                    <div v-show="component.id === onPageNumber">
                      <QuizCreateContents
                        :quiz-page-number="component.id as number"
                        :quiz-page-seq="idx"
                        :surey-params="component.params as QuizPage"
                        :quiz-stat="quizStat"
                        @remove-quiz-page="removeQuizPage"
                      />
                    </div>

                    <!-- 퀴즈 질문 영역 -->
                    <div v-show="component.id === onPageNumber">
                      <QuizCreateQuerys
                        :quiz-page-number="component.id as number"
                        :quiz-page-seq="idx"
                        :surey-params="component.params as QuizPage"
                        :quiz-stat="quizStat"
                        :ref="el => setQuerysRef(el as InstanceType<typeof QuizCreateQuerys>, idx)"
                      />
                    </div>
                  </template>

                  <div class="confirm_area">
                    <!-- 하단 퀴즈 등록 폼 -->
                    <q-btn
                      v-if="[QuizStatus.Temp,QuizStatus.Drafting].includes(quizStat)"
                      outline
                      unelevated
                      class="size_sm quiz__btn--save-temp"
                      label="임시저장"
                      @click="()=>{ saveQuiz(true) }"
                    />
                    <q-btn
                      unelevated
                      color="black"
                      class="size_sm"
                      label="등록"
                      style="width: 160px"
                      @click="()=>{ saveQuiz(false) }"
                    />
                    <q-btn
                      v-if="![QuizStatus.Started, QuizStatus.Extended, QuizStatus.Drafting].includes(quizStat)"
                      outline
                      unelevated
                      class="size_sm"
                      label="삭제"
                      style="width: 160px"
                      @click="()=>{ deleteQuiz() }"
                    />
                  </div>
                </div>

              </div>

              <!-- 우측 애드온 -->
              <div class="rh_area">
                <QuizCreateAddOn ref="quizRgstAddOn"
                  :show-top-button="showTopButton"
                  :on-page-number="onPageNumber"
                  :query-quiz-id="storeQuizId"
                  :quiz-stat="quizStat"
                  :quiz-data="quizPropData as QuizInterface"
                  @add-quiz-page="addQuizPage"
                  @show-preview-modal="showPreviewModal"
                  @copy-quiz="copyQuiz"
                  @restart-quiz="restartQuiz"
                  @end-quiz="endQuiz"
                  @stop-quiz="stopQuiz"
                />
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="resultQuiz" keep-alive>
            <div>
              <q-input
                v-model="paramStringify"
                input-class="dto__input"
                outlined
                placeholder="퀴즈을 임시저장 혹은 등록 시 완성된 DTO를 볼 수 있습니다."
                type="textarea"
              >
                <template v-slot:label>메시지 내용</template>
              </q-input>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </div>

  <!-- 퀴즈 미리보기 모달 -->
  <QuizCreatePreview :quiz-stat="quizStat" ref="previewModal"/>
</template>
<script lang="ts" setup>
import { Dialog } from 'quasar';
import { ref, provide, computed, onMounted, onUnmounted, watch } from 'vue';
import type { FlexibleObject, QuizInterface, QuizPage } from '@/composables/quiz-interface';
import { QuizStatus, QuizOption } from '@/composables/quiz-interface';
import eventBus from '@/composables/quiz-event-bus';
import { quizAwaitAxios, quizAxios } from '@/composables/quiz-util';
import { useQuizStore } from '@/stores/quiz-store';
import QuizCreateFilter from '@/components/QuizCreateFilter.vue';
import QuizCreateContents from '@/components/QuizCreateContents.vue';
import QuizCreateQuerys from '@/components/QuizCreateQuerys.vue';
import QuizCreateAddOn from '@/components/QuizCreateAddOn.vue';
import QuizCreatePreview from '@/components/QuizCreatePreview.vue';
import { useRoute } from 'vue-router';
import moment from'moment';
const store = useQuizStore();
const route = useRoute();

/* 라우트 파라미터 */
const storeQuizId = store.quizRgstQuizId; // 스토어에서 저장된 quizid.

/* 상단 탭 관리 */
const tab = ref(route.query.resultView === 'true'? 'resultQuiz':'editQuiz');

/* 퀴즈 페이지 관리 및 애드온 영역 페이지 관리 */
const quizPageComponents = ref<Array<FlexibleObject>>([
  {
    id: 1, // 고유 ID 생성
    name: 'quizPageComponent1',
  }
]);
provide('quizPageComponents', quizPageComponents); // 퀴즈 페이지 값 주입, 애드온 페이지 변경 시 정렬.
let quizPageidx = 1; // 동적 컴포넌트 순번
const onPageNumber = ref(1); // 현재 활성화 된 페이지 번호
const onPage = (pageNum: number): void => {
  onPageNumber.value = pageNum;
}

// 퀴즈 페이지 추가
const addQuizPage = (): void => {
  // 배열의 길이가 10 미만일 때만 추가, 이중 가드.
  if (quizPageComponents.value.length < QuizOption.PagePerQuiz) {
    quizPageComponents.value.push({
      id: ++quizPageidx, // 고유 ID 생성
      name: `quizPageComponent${quizPageidx}`,
    });
  }
}

// 퀴즈 페이지 삭제(2페이지 부터)
const quizRgstAddOn = ref();
const removeQuizPage = (id: number): void => {
  if (quizPageComponents.value.length === 1) return;

  // 퀴즈 페이지 컴포넌트 삭제
  quizPageComponents.value = quizPageComponents.value.reduce((acc: Array<FlexibleObject>, ele, idx, originArr)=>{
    if(ele.id !== id){
      // 삭제 대상이 아닌 퀴즈 페이지 컴포넌트 push
      acc.push(ele);
    } else {
      // 삭제 대상일 시 이전 혹은 다음 페이지 활성화 설정
      if(idx === 0) onPage(originArr[1].id as number);
      else onPage(acc[idx-1].id as number);
    }
    return acc;
  },[]);

  // 페이지 컴포넌트 삭제
  quizRgstAddOn.value.removePage(id);
};
provide('onPage', onPage); // 페이지 변경 메소드 주입

/* 페이지 변경 감지 시 활성화 된 질문 케이스들 일괄 비활성화 */
const quizQuerys = ref<InstanceType<typeof QuizCreateQuerys>[]>([]); // 각 페이지의 퀴즈들을 묶은 컴포넌트 ref
const setQuerysRef = (el: InstanceType<typeof QuizCreateQuerys>, idx: number)=> {
  if (el) quizQuerys.value[idx] = el; // 요소 추가
}
watch(onPageNumber, () => {
  quizQuerys.value?.forEach((querys: InstanceType<typeof QuizCreateQuerys>) => {
    querys.selectQuery(QuizOption.QueryPerPage+1); // 페이지당 최대 퀴즈 갯수+1을 함으로서 모두 초기화.
  });
});


/* 퀴즈 저장 및 수정 */
/* 퀴즈 저장 메소드
 * 이벤트 버스에 각 컴포넌트의 파라미터 제작 메소드를 등록 후 루트에서 사용.
 */
const paramStringify = ref(''); // 생성한 파라미터 데이터 직렬화 데이터
const saveParam = ref<QuizInterface>();
const saveQuiz = async (isTemp: boolean): Promise<void> => {
  // 퀴즈 중지 상태에서 참여 기간이 만료(오늘이 지남)인 경우 수정 불가 예외처리
  if(quizStat.value === QuizStatus.Stopped){
    const today = new Date();
    const todayMoment = moment(today, 'YYYY.MM.DD');
    const endMoment = moment(store.endDate, 'YYYY.MM.DD');
    if(todayMoment.diff(endMoment, 'days') > 0){
      Dialog.create({
        message: '퀴즈 기간을 확인해 주세요.',
      });
      return;
    }
  }

  // API 사용 변수
  let path = '/cmm/v1/sys/quiz';
  let confirmMsg = '등록 하시겠습니까?';
  let method = 'post';
  let dtoName = 'createQuizReqDto';
  let quizParamData;

  // 등록 퀴즈일 경우 추가 패스 및 api에 맞는 dto처리
  switch(quizStat.value){
    case QuizStatus.Temp:
    case QuizStatus.NotStarted:
      path += '/notStarted';
      dtoName = 'updateTempOrNotStartedQuizReqDto';
      break;
    case QuizStatus.Started:
    case QuizStatus.Extended:
    case QuizStatus.Stopped:
      path += '/extended';
      break;
    case QuizStatus.Ended:
      path += '/ended';
      break;
    case QuizStatus.EndedEarly:
      path += '/endedEarly';
      break;
    default:
      break;
  }

  // 기본 파라미터 생성
  saveParam.value = await eventBus.emit('createSearchParams','') as QuizInterface;

  // 퀴즈 수정 구분에 따른 변경
  if(isTemp) {
    if(saveParam.value) saveParam.value.tempYn = 'Y';
    confirmMsg = '임시 저장을 하시겠습니까?';
  } else if(storeQuizId) {
    if(saveParam.value) saveParam.value.quizId = Number(storeQuizId);
    confirmMsg = '수정 하시겠습니까?';
    method = 'put'
  }


  // 작성중, 시작전, 임시저장 상태의 퀴즈일 시 세부 파라미터 등록 과정 진행
  if([QuizStatus.Drafting, QuizStatus.NotStarted, QuizStatus.Temp].indexOf(quizStat.value) > -1){
    // 업로드를 위한 폼데이터 생성
    quizParamData = new FormData();

    // 이벤트 버스에서 등록된 이벤트의 키를 우선순위에 맞춰서 정렬.
    const sortedKeys = Object.keys(eventBus.eventBusList.value).sort((a: string, b: string) => {
      const [aPageSeq, aQuerySeq] = eventBus.eventBusList.value[a].priority.split('-').map(Number);
      const [bPageSeq, bQuerySeq] = eventBus.eventBusList.value[b].priority.split('-').map(Number);

      // 페이지 번호(pageSeq) 비교
      if (aPageSeq !== bPageSeq) {
        return aPageSeq - bPageSeq;
      }

      // 페이지 번호가 같으면, 쿼리 번호(querySeq) 비교
      return aQuerySeq - bQuerySeq;
    });
    // 페이지 & 쿼리 파라미터 삽입
    for (const ele of sortedKeys) {
      try {
        if (ele.indexOf('addQueryParams') > -1 || ele.indexOf('addPageParams') > -1) {
          saveParam.value = await eventBus.emit(ele, saveParam.value) as QuizInterface;
        }
      } catch (error) {
        console.error(error);
        return;  // 파라미터 등록 예외 처리 시 중단
      }
    }

    // 파일 객체 append
    saveParam.value.attachments?.forEach(ele=>{
      quizParamData!.append('attachments',ele);
    });
    delete (saveParam.value).attachments; // attachments는 append 후 불 필요하므로 삭제.
    quizParamData.append(dtoName, JSON.stringify(saveParam.value));
    paramStringify.value = JSON.stringify(saveParam.value, null, 2);
  } else {
    quizParamData = saveParam.value;
  }


  // axios 통신
  if(confirm(confirmMsg)){
    Dialog.create({
      title: '저장 안내',
      message: 'DTO가 저장되었습니다.',
      html: true, // HTML을 지원하도록 설정
    });

    // 모듈 예제에선 DTO Text return으로 변경
    // quizAxios(path, method, quizParamData,()=>{
    //   Dialog.create({
    //     title: '임시저장 안내',
    //     message: '임시저장 되었습니다.<br>[등록]을 클릭해야 퀴즈조사가 완성됩니다.',
    //     html: true, // HTML을 지원하도록 설정
    //   });
    // });
  }
}


/* 탑 버튼 관리 */
const showTopButton = computed(()=>{
  // 현재 페이지에서 질문 항목이 3개 이상일 경우 true
  return store.pagePerQuerys[onPageNumber.value] as number >= QuizOption.VisibleTopButtonNumber? true : false;
})


/* 미리보기 팝업 */
const previewModal = ref(); // 미리보기 모달 ref 정의
const previewParam = ref<QuizInterface>(); // 미리보기 데이터
// 모달 호출
const showPreviewModal = async (): Promise<void> =>{
  // 현재 작성한 퀴즈조사 정보 전달을 위한 파라미터 생성
  // 파라미터 생성
  previewParam.value = await eventBus.emit('createSearchParams', true) as QuizInterface;

  // 이벤트 버스에서 등록된 이벤트의 키를 우선순위에 맞춰서 정렬.
  const sortedKeys = Object.keys(eventBus.eventBusList.value).sort((a: string, b: string) => {
    const [aPageSeq, aQuerySeq] = eventBus.eventBusList.value[a].priority.split('-').map(Number);
    const [bPageSeq, bQuerySeq] = eventBus.eventBusList.value[b].priority.split('-').map(Number);

    // 페이지 번호(pageSeq) 비교
    if (aPageSeq !== bPageSeq) {
      return aPageSeq - bPageSeq;
    }

    // 페이지 번호가 같으면, 쿼리 번호(querySeq) 비교
    return aQuerySeq - bQuerySeq;
  });
  // 페이지 & 쿼리 파라미터 삽입
  sortedKeys.forEach(async (ele) => {
    // 페이지 파라미터 삽입
    if(ele !== 'createSearchParams') previewParam.value = await eventBus.emit(ele,previewParam.value) as QuizInterface;
  });

  previewModal.value.showModal(previewParam.value);
}


/* 퀴즈복사 기능 - 등록된 퀴즈에 한정 */
const copyQuiz = (): void => {
  // axios 통신
  if(confirm('이 퀴즈을 복사하시겠습니까?')){
    quizAxios('/cmm/v1/sys/quiz/copy', 'post', { quizId: storeQuizId },()=>{
      Dialog.create({
        title: '복사 안내',
        message: '복사 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}

/* 퀴즈삭제 */
const deleteQuiz = (): void => {
  // axios 통신
  if(confirm('이 퀴즈을 삭제하시겠습니까?')){
    quizAxios('/cmm/v1/sys/qivs', 'delete', { qivsIdList: [storeQuizId] }, ()=>{
      Dialog.create({
        title: '삭제 안내',
        message: '삭제 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}

/* 퀴즈중지 */
const stopQuiz = (): void => {
  // axios 통신
  if(confirm('이 퀴즈을 중지하시겠습니까?')){
    quizAxios('/cmm/v1/sys/quiz/stop?quizId=${Number(storeQuizId)}', 'put', {}, ()=>{
      Dialog.create({
        title: '중지 안내',
        message: '중지 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}

/* 퀴즈 조기종료 */
const endQuiz = (): void => {
  // axios 통신
  if(confirm('조기 종료 시 퀴즈을 재시작할 수 없습니다.<br>강제 종료하시겠습니까?')){
    quizAxios('/cmm/v1/sys/quiz/endEarly', 'put', {}, ()=>{
      Dialog.create({
        title: '종료 안내',
        message: '종료 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}


/* 퀴즈 재시작 */
const restartQuiz = (): void => {
  // 파라미터 생성
  const params = {
    quizId: storeQuizId,
    quizPrdEndDate: store.endDate,
    quizCandAnymYn: store.quizCandAnymYn,
    rspnModfPosbYn: store.rspnModfPosbYn
  }

  // axios 통신
  if(confirm('중지된 퀴즈을 재시작하시겠습니까?')){
    quizAxios('/cmm/v1/sys/quiz/restart', 'put', params, ()=>{
      Dialog.create({
        title: '재시작 안내',
        message: '재시작 되었습니다.',
        html: true, // HTML을 지원하도록 설정
      });
    });
  }
}

/* 기 등록된 퀴즈 처리 */
// 퀴즈 상태
const quizStat = ref(QuizStatus.Drafting); // 기본은 작성 중 상태

// 프롭용 데이터
const quizPropData = ref<QuizInterface>();

// 라이프사이클 훅 - mounted
onMounted(async ()=>{
  // 기 등록된 퀴즈조사 처리
  if(storeQuizId){
    const quizData = (await quizAwaitAxios('/cmm/v1/sys/quiz','get',{ quizId: storeQuizId })) as QuizInterface

    // 조회 후 데이터 바인딩 처리
    quizStat.value = quizData.quizStat as QuizStatus; // 조회한 퀴즈의 현재 상태
    quizPropData.value = quizData; // 필터 및 애드온 페이징에 사용

    /* 페이지 */
    // 페이지 컴포넌트 변수 생성
    quizPageComponents.value = quizData.quizPageList.map((ele: QuizPage) => {
      return {
        id: ele.pageSeq,
        name: `quizPageComponent${ele.pageSeq}`,
        params: ele // 하위 노드에서 사용할 데이터
      }
    });
    quizPageidx = quizPageComponents.value.length;
  }
})

/* 컴포넌트 unmount 시 스토어 초기화 */
onUnmounted(()=>{
  store.resetState();
})
</script>

<style lang="scss">

.total_wrap {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}
.wrap_table_box {
  margin: 0 !important;
}
.lh_area {
  flex: 1;
  position: relative;
}
.rh_area {
  width: 129px;
}

.confirm_area {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 25px 0 20px;
  margin: 20px 0 0 0;
}

.dto__input {
  height: 600px;
}

.quiz__btn--save-temp {
  width: 160px;
  background-color: white !important;
}

.quiz__tab--edit{
  /* background-color: rgb(248, 248, 248); */
}
</style>
