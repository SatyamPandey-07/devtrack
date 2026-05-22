import ContributionGraph from "@/components/ContributionGraph";
import ContributionHeatmap from "@/components/ContributionHeatmap";
import PRMetrics from "@/components/PRMetrics";
import PRBreakdownChart from "@/components/PRBreakdownChart";
import GoalTracker from "@/components/GoalTracker";
import DashboardHeader from "@/components/DashboardHeader";
import StreakTracker from "@/components/StreakTracker";
import TopRepos from "@/components/TopRepos";
import PinnedRepos from "@/components/PinnedRepos";
import LanguageBreakdown from "@/components/LanguageBreakdown";
import CommitTimeChart from "@/components/CommitTimeChart";
import PRReviewTrendChart from "@/components/PRReviewTrendChart";
import CIAnalytics from "@/components/CIAnalytics";
import IssueMetrics from "@/components/IssueMetrics";
import StreakAtRiskBanner from "@/components/StreakAtRiskBanner";
import FriendComparison from "@/components/FriendComparison";
import WeeklySummaryCard from "@/components/WeeklySummaryCard";
import ExportButton from "@/components/ExportButton";
import Link from "next/link";
import PersonalRecords from "@/components/PersonalRecords";
import LocalCodingTime from "@/components/LocalCodingTime";
import RecentActivity from "@/components/RecentActivity";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  ACCESS_TOKEN_MAX_AGE,
  createAccessToken,
  createRefreshToken,
  getTokenCookieName,
  REFRESH_TOKEN_MAX_AGE,
  USE_SECURE_COOKIES,
} from "@/lib/auth-tokens";

export default async function DashboardPage() {
  const allowPlaywrightBypass =
    process.env.PLAYWRIGHT_AUTH_BYPASS === "1" &&
    cookies().get("playwright-dashboard-auth")?.value === "1";
  const session = allowPlaywrightBypass
    ? null
    : await getServerSession(authOptions);

  if (session?.githubId && session?.githubLogin) {
    const cookieStore = cookies();
    const accessToken = createAccessToken({
      githubId: session.githubId,
      githubLogin: session.githubLogin,
    });
    const refreshToken = createRefreshToken({
      githubId: session.githubId,
      githubLogin: session.githubLogin,
    });

    cookieStore.set({
      name: getTokenCookieName("access"),
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: USE_SECURE_COOKIES,
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    cookieStore.set({
      name: getTokenCookieName("refresh"),
      value: refreshToken,
      httpOnly: true,
      sameSite: "lax",
      secure: USE_SECURE_COOKIES,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  if (!session && !allowPlaywrightBypass) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8 text-[var(--foreground)] transition-colors">
      <DashboardHeader />
      <div className="mb-6 flex justify-end items-center gap-2">
        <Link
          href="/dashboard/settings"
          className="rounded-lg border border-[var(--border)] bg-[var(--control)] px-4 py-2 text-sm text-[var(--foreground)] hover:opacity-90 transition-opacity min-w-[140px] flex items-center justify-center"
        >
          Settings
        </Link>
        <ExportButton />
      </div>
      <StreakAtRiskBanner />

      <div className="mb-6">
        <WeeklySummaryCard />
      </div>

      <div className="mb-6">
        <PersonalRecords />
      </div>

      {/* Row 1: Contribution graph + Streak + Local Coding Time */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContributionGraph />
          <div className="mt-6">
            <ContributionHeatmap />
          </div>
          <div className="mt-6">
            <FriendComparison />
          </div>
        </div>

        <div>
          <StreakTracker />
          <LocalCodingTime />
        </div>
      </div>

      {/* Row 2: PR metrics, PR breakdown & Time Chart */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PRMetrics />
        <PRBreakdownChart />
        <CommitTimeChart />
      </div>

      <div className="mt-6">
        <PRReviewTrendChart />
      </div>

      {/* Row 3: Issue metrics + CI analytics */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IssueMetrics />
        </div>
        <CIAnalytics />
      </div>

      {/* Row 4: Pinned repositories */}
      <div className="mt-6">
        <PinnedRepos />
      </div>

      {/* Row 5: Top repos + Language breakdown + Goal tracker */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopRepos />
        <LanguageBreakdown />
        <GoalTracker />
      </div>

      {/* Row 6: Recent GitHub activity */}
      <div className="mt-6">
        <RecentActivity />
      </div>
    </div>
  );
}