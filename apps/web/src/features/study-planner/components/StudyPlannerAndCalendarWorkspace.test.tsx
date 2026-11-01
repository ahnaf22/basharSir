import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudyPlannerAndCalendarWorkspace } from './StudyPlannerAndCalendarWorkspace';

vi.mock('../api/study-planner.api', () => ({
  studyPlannerApi: {
    createPlan: vi.fn().mockRejectedValue(new Error('offline_fallback')),
    rebalancePlan: vi.fn().mockRejectedValue(new Error('offline_fallback')),
    rescheduleItem: vi.fn().mockRejectedValue(new Error('offline_fallback')),
    sendHeartbeat: vi.fn().mockResolvedValue({
      log_id: 1,
      study_date: '2026-11-01',
      active_seconds: 30,
      paused_seconds: 0,
      questions_attempted: 0,
    }),
  },
}));

describe('StudyPlannerAndCalendarWorkspace (Chunk 2.8)', () => {
  it('renders the study plan wizard, calendar view switcher, and prerequisite remedial tasks', () => {
    render(<StudyPlannerAndCalendarWorkspace />);

    expect(
      screen.getByText('অষ্টম শ্রেণি গণিত ও বিজ্ঞান বার্ষিক প্রস্তুতি রুটিন')
    ).toBeInTheDocument();
    expect(
      screen.getByText('পূর্বজ্ঞান পুনরালোচনা: চলক ও সদৃশ পদের যোগ-বিয়োগ')
    ).toBeInTheDocument();
    expect(screen.getByTestId('plan-completion-pct')).toHaveTextContent('২৫%');

    // Switch calendar view from weekly to monthly
    fireEvent.click(screen.getByTestId('calendar-view-monthly'));
    expect(screen.getByTestId('calendar-active-mode-indicator')).toHaveTextContent(
      'সক্রিয় ভিউ: মাসিক ক্যালেন্ডার'
    );
  });

  it('completes a scheduled task, reschedules an item, and pings the 30s active study heartbeat', async () => {
    render(<StudyPlannerAndCalendarWorkspace />);

    // Complete task 902 -> completion jumps from 1/4 (২৫%) to 2/4 (৫০%)
    fireEvent.click(screen.getByTestId('complete-item-902'));

    await waitFor(() => {
      expect(screen.getByTestId('plan-completion-pct')).toHaveTextContent('৫০%');
    });

    // Reschedule task 903
    fireEvent.click(screen.getByTestId('reschedule-item-903'));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'পাঠটি নতুন তারিখে পুনঃনির্ধারণ (Reschedule) করা হয়েছে।'
      );
    });

    // Ping 30-second active study heartbeat
    fireEvent.click(screen.getByTestId('manual-heartbeat-ping-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('active-heartbeat-widget')).toHaveTextContent(
        'সক্রিয়: ৩০ সেকেন্ড'
      );
    });
  });
});

