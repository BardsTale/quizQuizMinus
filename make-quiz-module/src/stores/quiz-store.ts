import { ref } from 'vue';
import type { SimpleObject } from '../composables/quiz-interface';
import { defineStore } from 'pinia';

// 퀴즈조사 스토어
export const useQuizStore = defineStore('quiz', () => {
  /* state 정의 */
  const pagePerQuerys = ref<SimpleObject>({}); // 페이지 당 쿼리 수 (탑 버튼 컨트롤 용)
  const startDate = ref<string>(''); // 필터영역 퀴즈 시작일자
  const endDate = ref<string>(''); // 필터영역 퀴즈 종료일자
  const quizCandAnymYn = ref<string>('N'); // 필터영역 익명 여부
  const rspnModfPosbYn = ref<string>('Y'); // 필터영역 참여 후 수정 여부
  const quizRgstQuizId = ref<number>(0); // 퀴즈조사 만들기 quizId
  const quizWrteQuizId = ref<number>(0); // 퀴즈조사 참여 quizId

  // 스토어 초기화 메서드
  function resetState() {
    pagePerQuerys.value = {};
    startDate.value = '';
    endDate.value = '';
    quizCandAnymYn.value = 'N';
    rspnModfPosbYn.value = 'Y';
    quizRgstQuizId.value = 0;
    quizWrteQuizId.value = 0;
  }

  /* action(setter) 정의 */
  function setPagePerQuerys(page: number, queryCount: number) {
    pagePerQuerys.value[page] = queryCount;
  }
  function setStartDate(value: string) {
    startDate.value = value;
  }
  function setEndDate(value: string) {
    endDate.value = value;
  }
  function setQuizCandAnymYn(value: string) {
    quizCandAnymYn.value = value;
  }
  function setRspnModfPosbYn(value: string) {
    rspnModfPosbYn.value = value;
  }
  function setQuizCreateQuizId(value: number) {
    quizRgstQuizId.value = value;
  }
  function setQuizWrteQuizId(value: number) {
    quizWrteQuizId.value = value;
  }

  return {
    // State
    pagePerQuerys,
    startDate,
    endDate,
    quizCandAnymYn,
    rspnModfPosbYn,
    quizRgstQuizId,
    quizWrteQuizId,
    // Actions
    setPagePerQuerys,
    setStartDate,
    setEndDate,
    setQuizCandAnymYn,
    setRspnModfPosbYn,
    setQuizCreateQuizId,
    setQuizWrteQuizId,
    // reset
    resetState,
  }
});
