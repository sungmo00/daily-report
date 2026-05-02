import { PrismaClient } from "../src/generated/prisma/client.js";
import { Role, CustomerGrade, ReportStatus, VisitType, TargetSection, NotificationType } from "../src/generated/prisma/enums.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

async function main() {
  console.log("Seeding database...");

  // ─── Sales Reps ────────────────────────────────────────────────────────────
  const adminPassword = await hashPassword("admin1234");
  const managerPassword = await hashPassword("manager1234");
  const repPassword = await hashPassword("rep12345");

  const admin = await prisma.salesRep.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "시스템관리자",
      email: "admin@example.com",
      passwordHash: adminPassword,
      phone: "010-0000-0001",
      territory: "전국",
      role: Role.admin,
      isActive: true,
    },
  });

  const manager = await prisma.salesRep.upsert({
    where: { email: "kim.manager@example.com" },
    update: {},
    create: {
      name: "김팀장",
      email: "kim.manager@example.com",
      passwordHash: managerPassword,
      phone: "010-0000-0002",
      territory: "서울",
      role: Role.manager,
      isActive: true,
    },
  });

  const rep1 = await prisma.salesRep.upsert({
    where: { email: "hong@example.com" },
    update: {},
    create: {
      name: "홍길동",
      email: "hong@example.com",
      passwordHash: repPassword,
      phone: "010-1234-5678",
      territory: "서울 북",
      role: Role.rep,
      isActive: true,
    },
  });

  const rep2 = await prisma.salesRep.upsert({
    where: { email: "lee@example.com" },
    update: {},
    create: {
      name: "이영희",
      email: "lee@example.com",
      passwordHash: repPassword,
      phone: "010-2345-6789",
      territory: "서울 남",
      role: Role.rep,
      isActive: true,
    },
  });

  const rep3 = await prisma.salesRep.upsert({
    where: { email: "park@example.com" },
    update: {},
    create: {
      name: "박철수",
      email: "park@example.com",
      passwordHash: repPassword,
      phone: "010-3456-7890",
      territory: "경기",
      role: Role.rep,
      isActive: true,
    },
  });

  console.log("SalesReps created:", { admin, manager, rep1, rep2, rep3 });

  // ─── Customers ─────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { id: 1 },
      update: {},
      create: {
        companyName: "(주)ABC테크",
        contactName: "이담당",
        contactPhone: "010-1111-2222",
        contactEmail: "contact@abc.co.kr",
        address: "서울시 강남구 테헤란로 123",
        industry: "IT/소프트웨어",
        grade: CustomerGrade.A,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 2 },
      update: {},
      create: {
        companyName: "XYZ상사",
        contactName: "박담당",
        contactPhone: "010-2222-3333",
        contactEmail: "contact@xyz.co.kr",
        address: "서울시 서초구 반포대로 456",
        industry: "유통",
        grade: CustomerGrade.B,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 3 },
      update: {},
      create: {
        companyName: "(주)미래제조",
        contactName: "최담당",
        contactPhone: "010-3333-4444",
        contactEmail: "contact@mj.co.kr",
        address: "경기도 성남시 분당구 판교로 789",
        industry: "제조업",
        grade: CustomerGrade.A,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 4 },
      update: {},
      create: {
        companyName: "글로벌트레이딩",
        contactName: "정담당",
        contactPhone: "010-4444-5555",
        contactEmail: "contact@gt.co.kr",
        address: "서울시 중구 을지로 321",
        industry: "무역",
        grade: CustomerGrade.B,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 5 },
      update: {},
      create: {
        companyName: "(주)한국금융",
        contactName: "강담당",
        contactPhone: "010-5555-6666",
        contactEmail: "contact@hkf.co.kr",
        address: "서울시 영등포구 여의도동 123",
        industry: "금융",
        grade: CustomerGrade.A,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 6 },
      update: {},
      create: {
        companyName: "스마트물류",
        contactName: "조담당",
        contactPhone: "010-6666-7777",
        contactEmail: "contact@sl.co.kr",
        address: "경기도 이천시 산업단지로 555",
        industry: "물류",
        grade: CustomerGrade.C,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 7 },
      update: {},
      create: {
        companyName: "(주)디지털미디어",
        contactName: "윤담당",
        contactPhone: "010-7777-8888",
        contactEmail: "contact@dm.co.kr",
        address: "서울시 마포구 홍대로 222",
        industry: "미디어",
        grade: CustomerGrade.B,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 8 },
      update: {},
      create: {
        companyName: "에코에너지",
        contactName: "임담당",
        contactPhone: "010-8888-9999",
        contactEmail: "contact@eco.co.kr",
        address: "충남 천안시 서북구 에너지로 888",
        industry: "에너지",
        grade: CustomerGrade.C,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 9 },
      update: {},
      create: {
        companyName: "(주)바이오헬스",
        contactName: "한담당",
        contactPhone: "010-9999-0000",
        contactEmail: "contact@bh.co.kr",
        address: "대전시 유성구 과학로 999",
        industry: "바이오/헬스케어",
        grade: CustomerGrade.A,
        isActive: true,
      },
    }),
    prisma.customer.upsert({
      where: { id: 10 },
      update: {},
      create: {
        companyName: "푸드서비스",
        contactName: "신담당",
        contactPhone: "010-1234-0000",
        contactEmail: "contact@food.co.kr",
        address: "부산시 해운대구 마린시티로 777",
        industry: "식품/외식",
        grade: CustomerGrade.C,
        isActive: true,
      },
    }),
  ]);

  console.log("Customers created:", customers.length);

  // ─── SalesRep-Customer Assignments ─────────────────────────────────────────
  const assignments = [
    { salesRepId: rep1.id, customerId: customers[0].id },
    { salesRepId: rep1.id, customerId: customers[1].id },
    { salesRepId: rep1.id, customerId: customers[2].id },
    { salesRepId: rep2.id, customerId: customers[3].id },
    { salesRepId: rep2.id, customerId: customers[4].id },
    { salesRepId: rep2.id, customerId: customers[5].id },
    { salesRepId: rep3.id, customerId: customers[6].id },
    { salesRepId: rep3.id, customerId: customers[7].id },
    { salesRepId: rep3.id, customerId: customers[8].id },
    { salesRepId: rep3.id, customerId: customers[9].id },
  ];

  for (const assignment of assignments) {
    await prisma.salesRepCustomer.upsert({
      where: {
        salesRepId_customerId: {
          salesRepId: assignment.salesRepId,
          customerId: assignment.customerId,
        },
      },
      update: {},
      create: assignment,
    });
  }

  console.log("SalesRepCustomer assignments created:", assignments.length);

  // ─── Daily Reports ──────────────────────────────────────────────────────────
  const today = new Date("2026-05-01");
  const yesterday = new Date("2026-04-30");
  const dayBefore = new Date("2026-04-29");
  const twoDaysBefore = new Date("2026-04-28");
  const threeDaysBefore = new Date("2026-04-27");

  const report1 = await prisma.dailyReport.upsert({
    where: { salesRepId_reportDate: { salesRepId: rep1.id, reportDate: today } },
    update: {},
    create: {
      salesRepId: rep1.id,
      reportDate: today,
      problem: "ABC테크 견적 마감 촉박. 결재 라인 확인 필요.",
      plan: "오전: ABC테크 후속 방문 / 오후: XYZ상사 클레임 처리 확인",
      status: ReportStatus.submitted,
      submittedAt: new Date("2026-05-01T18:00:00Z"),
    },
  });

  const report2 = await prisma.dailyReport.upsert({
    where: { salesRepId_reportDate: { salesRepId: rep1.id, reportDate: yesterday } },
    update: {},
    create: {
      salesRepId: rep1.id,
      reportDate: yesterday,
      problem: "미래제조 납기 지연 이슈 발생. 해결책 모색 필요.",
      plan: "내일 오전 미래제조 담당자와 긴급 미팅 예정.",
      status: ReportStatus.reviewed,
      submittedAt: new Date("2026-04-30T17:45:00Z"),
      reviewedAt: new Date("2026-04-30T19:00:00Z"),
    },
  });

  const report3 = await prisma.dailyReport.upsert({
    where: { salesRepId_reportDate: { salesRepId: rep1.id, reportDate: dayBefore } },
    update: {},
    create: {
      salesRepId: rep1.id,
      reportDate: dayBefore,
      problem: null,
      plan: "신규 고객 발굴을 위한 콜드콜 계획.",
      status: ReportStatus.reviewed,
      submittedAt: new Date("2026-04-29T17:30:00Z"),
      reviewedAt: new Date("2026-04-29T18:30:00Z"),
    },
  });

  const report4 = await prisma.dailyReport.upsert({
    where: { salesRepId_reportDate: { salesRepId: rep2.id, reportDate: today } },
    update: {},
    create: {
      salesRepId: rep2.id,
      reportDate: today,
      problem: "글로벌트레이딩 계약 갱신 협상 진행 중.",
      plan: "내일 법무팀과 계약서 검토 회의.",
      status: ReportStatus.submitted,
      submittedAt: new Date("2026-05-01T17:50:00Z"),
    },
  });

  const report5 = await prisma.dailyReport.upsert({
    where: { salesRepId_reportDate: { salesRepId: rep3.id, reportDate: twoDaysBefore } },
    update: {},
    create: {
      salesRepId: rep3.id,
      reportDate: twoDaysBefore,
      problem: "에코에너지 예산 삭감으로 인한 프로젝트 축소 우려.",
      plan: "다음 주 추가 제안서 제출 예정.",
      status: ReportStatus.draft,
    },
  });

  console.log("DailyReports created:", [report1, report2, report3, report4, report5].length);

  // ─── Visit Records ──────────────────────────────────────────────────────────
  await prisma.visitRecord.createMany({
    data: [
      {
        dailyReportId: report1.id,
        customerId: customers[0].id,
        visitType: VisitType.visit,
        purpose: "제안서 전달 및 설명",
        content: "신규 솔루션 제안서 전달. 담당자와 기능별 데모 진행.",
        result: "2차 미팅 요청 수락. 의사결정권자 동석 예정.",
        nextAction: "다음 주 화요일 2차 미팅 일정 확정",
        visitedAt: "10:30",
      },
      {
        dailyReportId: report1.id,
        customerId: customers[1].id,
        visitType: VisitType.call,
        purpose: "클레임 처리 확인",
        content: "고객 불만 사항 청취 및 처리 일정 안내",
        result: "다음 주 내 처리 완료 약속",
        nextAction: "처리 완료 후 결과 보고",
        visitedAt: "14:00",
      },
      {
        dailyReportId: report1.id,
        customerId: customers[2].id,
        visitType: VisitType.email,
        purpose: "견적서 발송",
        content: "요청 사양에 맞는 견적서 작성 후 이메일 발송",
        result: "수신 확인 완료. 검토 후 연락 예정.",
        nextAction: "3일 내 회신 없으면 팔로업 전화",
        visitedAt: "16:00",
      },
      {
        dailyReportId: report2.id,
        customerId: customers[0].id,
        visitType: VisitType.visit,
        purpose: "납기 지연 현황 파악",
        content: "생산팀 담당자와 납기 지연 원인 논의",
        result: "부품 수급 이슈로 인한 지연 확인. 대안 모색 중.",
        nextAction: "내일 공급업체 확인 후 대안 제시",
        visitedAt: "11:00",
      },
      {
        dailyReportId: report2.id,
        customerId: customers[2].id,
        visitType: VisitType.video,
        purpose: "프로젝트 진행 상황 보고",
        content: "화상 회의로 1개월 진행 현황 및 이슈 공유",
        result: "고객 만족도 양호. 추가 모듈 도입 검토 중.",
        nextAction: "추가 모듈 견적서 준비",
        visitedAt: "15:00",
      },
      {
        dailyReportId: report3.id,
        customerId: customers[1].id,
        visitType: VisitType.visit,
        purpose: "신규 담당자 인사",
        content: "기존 담당자 퇴사로 인한 신규 담당자 방문 및 관계 형성",
        result: "우호적 분위기. 기존 계약 유지 의향 확인.",
        nextAction: "다음 달 계약 갱신 협의 일정 잡기",
        visitedAt: "13:00",
      },
      {
        dailyReportId: report4.id,
        customerId: customers[3].id,
        visitType: VisitType.visit,
        purpose: "계약 갱신 협상",
        content: "연간 계약 갱신 조건 협의. 가격 조정 요청 수렴.",
        result: "5% 할인 요청. 내부 검토 후 답변 예정.",
        nextAction: "영업팀 내 가격 정책 확인 후 역제안",
        visitedAt: "10:00",
      },
    ],
    skipDuplicates: true,
  });

  console.log("VisitRecords created");

  // ─── Comments ───────────────────────────────────────────────────────────────
  const comment1 = await prisma.comment.create({
    data: {
      dailyReportId: report1.id,
      authorId: manager.id,
      targetSection: TargetSection.problem,
      content: "견적 마감일 공유해 주세요. 내일 회의에서 논의합니다.",
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      dailyReportId: report2.id,
      authorId: manager.id,
      targetSection: TargetSection.problem,
      content: "납기 지연 건은 긴급 보고 사항입니다. 오늘 중으로 처리 결과 알려주세요.",
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      dailyReportId: report4.id,
      authorId: manager.id,
      targetSection: TargetSection.plan,
      content: "계약 갱신 협상 진행 시 법무팀 검토를 반드시 거쳐주세요.",
    },
  });

  console.log("Comments created:", [comment1, comment2, comment3].length);

  // ─── Notifications ──────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        recipientId: rep1.id,
        dailyReportId: report1.id,
        commentId: comment1.id,
        type: NotificationType.comment,
        message: `김팀장님이 2026-05-01 보고서에 댓글을 남겼습니다.`,
        isRead: false,
      },
      {
        recipientId: rep1.id,
        dailyReportId: report2.id,
        commentId: comment2.id,
        type: NotificationType.comment,
        message: `김팀장님이 2026-04-30 보고서에 댓글을 남겼습니다.`,
        isRead: false,
      },
      {
        recipientId: rep1.id,
        dailyReportId: report2.id,
        commentId: null,
        type: NotificationType.reviewed,
        message: `2026-04-30 보고서가 확인 완료되었습니다.`,
        isRead: true,
      },
      {
        recipientId: rep1.id,
        dailyReportId: report3.id,
        commentId: null,
        type: NotificationType.reviewed,
        message: `2026-04-29 보고서가 확인 완료되었습니다.`,
        isRead: true,
      },
      {
        recipientId: rep2.id,
        dailyReportId: report4.id,
        commentId: comment3.id,
        type: NotificationType.comment,
        message: `김팀장님이 2026-05-01 보고서에 댓글을 남겼습니다.`,
        isRead: false,
      },
    ],
  });

  console.log("Notifications created");
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
