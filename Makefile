PROJECT_ID  := daily-report-495008
REGION      := asia-northeast3
SERVICE     := daily-report
REGISTRY    := $(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(SERVICE)/app
IMAGE_TAG   := $(shell git rev-parse --short HEAD 2>/dev/null || echo latest)
IMAGE       := $(REGISTRY):$(IMAGE_TAG)
IMAGE_LATEST:= $(REGISTRY):latest

.PHONY: help dev build lint test type-check \
        docker-build docker-push docker-run \
        gcp-auth gcp-create-repo deploy deploy-staging logs describe clean

# -------------------------------------------------------
# 기본
# -------------------------------------------------------
help: ## 사용 가능한 명령어 목록 출력
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

dev: ## 개발 서버 실행
	npm run dev

build: ## 프로덕션 빌드
	npm run build

lint: ## ESLint 검사
	npm run lint

lint-fix: ## ESLint 자동 수정
	npm run lint:fix

type-check: ## TypeScript 타입 검사
	npm run type-check

test: ## 테스트 실행 (watch)
	npm test

test-run: ## 테스트 단발 실행
	npm run test:run

test-coverage: ## 커버리지 포함 테스트
	npm run test:coverage

# -------------------------------------------------------
# Docker
# -------------------------------------------------------
docker-build: ## Docker 이미지 빌드
	docker build \
	  --tag $(IMAGE) \
	  --tag $(IMAGE_LATEST) \
	  -f Dockerfile \
	  .
	@echo "Built: $(IMAGE)"

docker-push: ## Artifact Registry에 이미지 푸시
	docker push $(IMAGE)
	docker push $(IMAGE_LATEST)
	@echo "Pushed: $(IMAGE)"

docker-run: ## Docker 컨테이너 로컬 실행 (port 3000)
	docker run --rm -p 3000:3000 \
	  -e NODE_ENV=production \
	  --name $(SERVICE) \
	  $(IMAGE_LATEST)

docker-build-push: docker-build docker-push ## 이미지 빌드 후 푸시

# -------------------------------------------------------
# GCP 초기 설정 (최초 1회)
# -------------------------------------------------------
gcp-auth: ## gcloud 인증 및 프로젝트 설정
	gcloud auth login
	gcloud config set project $(PROJECT_ID)
	gcloud auth configure-docker $(REGION)-docker.pkg.dev

gcp-create-repo: ## Artifact Registry 저장소 생성
	gcloud artifacts repositories create $(SERVICE) \
	  --repository-format docker \
	  --location $(REGION) \
	  --description "daily-report app images"

gcp-enable-apis: ## 필요한 GCP API 활성화
	gcloud services enable \
	  run.googleapis.com \
	  artifactregistry.googleapis.com \
	  cloudbuild.googleapis.com \
	  iam.googleapis.com

# -------------------------------------------------------
# 배포
# -------------------------------------------------------
deploy: docker-build-push ## 빌드 → 푸시 → Cloud Run 배포 (production)
	gcloud run deploy $(SERVICE) \
	  --image $(IMAGE) \
	  --region $(REGION) \
	  --platform managed \
	  --allow-unauthenticated \
	  --port 3000 \
	  --memory 512Mi \
	  --cpu 1 \
	  --min-instances 0 \
	  --max-instances 10 \
	  --set-env-vars NODE_ENV=production \
	  --project $(PROJECT_ID) \
	  --quiet
	@echo "✅ Deployed: $(SERVICE) → $(shell $(MAKE) _url)"

deploy-staging: docker-build-push ## 빌드 → 푸시 → Cloud Run 배포 (staging)
	gcloud run deploy $(SERVICE)-staging \
	  --image $(IMAGE) \
	  --region $(REGION) \
	  --platform managed \
	  --allow-unauthenticated \
	  --port 3000 \
	  --memory 256Mi \
	  --cpu 1 \
	  --min-instances 0 \
	  --max-instances 3 \
	  --set-env-vars NODE_ENV=staging \
	  --project $(PROJECT_ID) \
	  --quiet
	@echo "✅ Deployed (staging): $(SERVICE)-staging"

# -------------------------------------------------------
# 운영
# -------------------------------------------------------
logs: ## Cloud Run 실시간 로그 스트리밍
	gcloud run services logs tail $(SERVICE) \
	  --region $(REGION) \
	  --project $(PROJECT_ID)

describe: ## Cloud Run 서비스 상태 조회
	gcloud run services describe $(SERVICE) \
	  --region $(REGION) \
	  --project $(PROJECT_ID) \
	  --format "table(status.url, spec.template.spec.containers[0].resources.limits)"

rollback: ## 직전 revision으로 롤백
	@PREV=$$(gcloud run revisions list \
	  --service $(SERVICE) --region $(REGION) --project $(PROJECT_ID) \
	  --format 'value(name)' --limit 2 | tail -1); \
	gcloud run services update-traffic $(SERVICE) \
	  --region $(REGION) --project $(PROJECT_ID) \
	  --to-revisions $$PREV=100
	@echo "↩️  Rolled back to previous revision"

# -------------------------------------------------------
# 유틸리티
# -------------------------------------------------------
_url: ## (내부) 서비스 URL 출력
	@gcloud run services describe $(SERVICE) \
	  --region $(REGION) --project $(PROJECT_ID) \
	  --format 'value(status.url)' 2>/dev/null

clean: ## .next, coverage, node_modules 삭제
	rm -rf .next coverage node_modules
