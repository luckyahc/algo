// PRD 5.2: trim 후 한글(완성형)/영문/숫자가 최소 1자 이상 포함되는지 검사한다.
// 완성형 한글 음절(가-힣)만 인정하므로 "ㅋㅋㅋ" 같은 자음/모음 단독 입력은 걸러진다.
export function hasMeaningfulContent(text: string): boolean {
  return /[0-9A-Za-z가-힣]/.test(text)
}
