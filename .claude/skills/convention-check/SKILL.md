---
name: convention-check
description: 커밋 전 변경된 코드를 검토한다. 코딩 컨벤션 준수 여부와 코드 품질을 점검한다.
disable-model-invocation: true
allowed-tools: Bash(git*)
---

# 커밋 전 코드 검토

커밋 전에 변경된 코드가 코딩 컨벤션을 지키는지, 코드 품질에 문제가 없는지 검토한다.

검토 기준: [convention.md](convention.md)

## 절차

1. 현재 브랜치에서 변경된 코드를 가져온다.
   - `git status`로 변경된 파일을 확인한다.
   - `git diff HEAD`로 staged·unstaged 변경 내용을 확인한다. 새로 추가된 파일(untracked)은 내용을 직접 읽는다.
2. [convention.md](convention.md)의 규칙을 기준으로 변경된 코드의 각 항목을 '통과' 또는 '개선 필요'로 표시한다.
   - 네이밍, 포매팅, 코드 품질의 모든 규칙을 항목별로 빠짐없이 표시한다.
   - '개선 필요'에는 해당 파일과 위치를 함께 적는다.
3. '개선 필요' 항목이 있으면 어떻게 수정해야 하는지 코드 예시(수정 전/후)와 함께 알려 준다.
4. 모든 항목이 '통과'라면 "커밋 준비가 완료 되었습니다!"를 출력한다.

## 주의

- 검토만 한다. 코드를 직접 수정하거나 커밋하지 않는다.
