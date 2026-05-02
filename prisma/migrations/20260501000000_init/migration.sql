-- CreateEnum
CREATE TYPE "Role" AS ENUM ('rep', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "CustomerGrade" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('draft', 'submitted', 'reviewed');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('visit', 'call', 'video', 'email');

-- CreateEnum
CREATE TYPE "TargetSection" AS ENUM ('problem', 'plan');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('comment', 'reminder', 'reviewed');

-- CreateTable
CREATE TABLE "sales_rep" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "territory" TEXT,
    "role" "Role" NOT NULL DEFAULT 'rep',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_rep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "contact_email" TEXT,
    "address" TEXT,
    "industry" TEXT,
    "grade" "CustomerGrade" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_rep_customer" (
    "id" SERIAL NOT NULL,
    "sales_rep_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "assigned_date" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "sales_rep_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report" (
    "id" SERIAL NOT NULL,
    "sales_rep_id" INTEGER NOT NULL,
    "report_date" DATE NOT NULL,
    "problem" TEXT,
    "plan" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_record" (
    "id" SERIAL NOT NULL,
    "daily_report_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "visit_type" "VisitType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "result" TEXT,
    "next_action" TEXT,
    "visited_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" SERIAL NOT NULL,
    "daily_report_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "target_section" "TargetSection" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "daily_report_id" INTEGER,
    "comment_id" INTEGER,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sales_rep_email_key" ON "sales_rep"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customer_company_name_key" ON "customer"("company_name");

-- CreateIndex
CREATE UNIQUE INDEX "sales_rep_customer_sales_rep_id_customer_id_key" ON "sales_rep_customer"("sales_rep_id", "customer_id");

-- CreateIndex
CREATE INDEX "sales_rep_customer_sales_rep_id_idx" ON "sales_rep_customer"("sales_rep_id");

-- CreateIndex
CREATE INDEX "sales_rep_customer_customer_id_idx" ON "sales_rep_customer"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_report_sales_rep_id_report_date_key" ON "daily_report"("sales_rep_id", "report_date");

-- CreateIndex
CREATE INDEX "daily_report_sales_rep_id_idx" ON "daily_report"("sales_rep_id");

-- CreateIndex
CREATE INDEX "daily_report_report_date_idx" ON "daily_report"("report_date");

-- CreateIndex
CREATE INDEX "daily_report_status_idx" ON "daily_report"("status");

-- CreateIndex
CREATE INDEX "visit_record_daily_report_id_idx" ON "visit_record"("daily_report_id");

-- CreateIndex
CREATE INDEX "visit_record_customer_id_idx" ON "visit_record"("customer_id");

-- CreateIndex
CREATE INDEX "comment_daily_report_id_idx" ON "comment"("daily_report_id");

-- CreateIndex
CREATE INDEX "comment_author_id_idx" ON "comment"("author_id");

-- CreateIndex
CREATE INDEX "notification_recipient_id_idx" ON "notification"("recipient_id");

-- CreateIndex
CREATE INDEX "notification_daily_report_id_idx" ON "notification"("daily_report_id") WHERE "daily_report_id" IS NOT NULL;

-- CreateIndex
CREATE INDEX "notification_comment_id_idx" ON "notification"("comment_id");

-- CreateIndex
CREATE INDEX "notification_is_read_idx" ON "notification"("is_read");

-- AddForeignKey
ALTER TABLE "sales_rep_customer" ADD CONSTRAINT "sales_rep_customer_sales_rep_id_fkey" FOREIGN KEY ("sales_rep_id") REFERENCES "sales_rep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_rep_customer" ADD CONSTRAINT "sales_rep_customer_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_sales_rep_id_fkey" FOREIGN KEY ("sales_rep_id") REFERENCES "sales_rep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_record" ADD CONSTRAINT "visit_record_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_record" ADD CONSTRAINT "visit_record_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "sales_rep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "sales_rep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_daily_report_id_fkey" FOREIGN KEY ("daily_report_id") REFERENCES "daily_report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
