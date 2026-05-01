import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // 새 기능
        "fix",      // 버그 수정
        "docs",     // 문서 변경
        "style",    // 포맷, 세미콜론 등 (코드 변경 없음)
        "refactor", // 리팩토링
        "test",     // 테스트 추가/수정
        "chore",    // 빌드, 설정 변경
        "perf",     // 성능 개선
        "ci",       // CI 설정 변경
        "revert",   // 커밋 되돌리기
      ],
    ],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "subject-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 100],
  },
};

export default config;
