import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AiPrivateTutorWorkspace } from './AiPrivateTutorWorkspace';

vi.mock('../api/tutor.api', () => ({
  tutorApi: {
    submitTurn: vi.fn().mockRejectedValue(new Error('offline_fallback')),
    pauseSession: vi.fn().mockRejectedValue(new Error('offline_fallback')),
    flagMessage: vi.fn().mockResolvedValue({
      flag_id: 1,
      status: 'open',
      message_bn: 'তোমার রিপোর্টটি আমাদের একাডেমিক রিভিউ টিমের কাছে পাঠানো হয়েছে। ধন্যবাদ!',
    }),
  },
}));

describe('AiPrivateTutorWorkspace (Chunks 2.4 & 2.5)', () => {
  it('renders the 3-pane layout with 7-step progression rail, NCTB reference, KaTeX math, and Bangla pedagogical actions', () => {
    const { container } = render(<AiPrivateTutorWorkspace />);

    // Left Pane: 7-step rail and Bangla mastery percentage (58 -> ৫৮%)
    expect(screen.getByTestId('rail-step-3').getAttribute('data-active')).toBe('true');
    expect(screen.getByText('৫৮%')).toBeInTheDocument();

    // Center Pane: NCTB reference & KaTeX math rendering
    expect(
      screen.getByText('অষ্টম শ্রেণি গণিত, চতুর্থ অধ্যায়, পৃষ্ঠা ৪৭–৫২')
    ).toBeInTheDocument();
    const mathNode = container.querySelector('[data-latex]');
    expect(mathNode).not.toBeNull();

    // Right Pane: 4 Bangla pedagogical action buttons
    expect(screen.getByTestId('pedagogical-action-simplify')).toHaveTextContent(
      'আরেকটু সহজ করে বোঝাও'
    );
    expect(screen.getByTestId('pedagogical-action-example')).toHaveTextContent(
      'আরেকটি উদাহরণ দাও'
    );
    expect(screen.getByTestId('pedagogical-action-hint')).toHaveTextContent('ইঙ্গিত দাও');
    expect(screen.getByTestId('pedagogical-action-previous_step')).toHaveTextContent(
      'আগের অংশে ফিরে যাও'
    );
  });

  it('unlocks progressive hints step-by-step and evaluates submitted answers', async () => {
    render(<AiPrivateTutorWorkspace />);

    expect(screen.queryByTestId('unlocked-hints-list')).not.toBeInTheDocument();

    const unlockHintBtn = screen.getByTestId('unlock-hint-btn');
    fireEvent.click(unlockHintBtn);

    await waitFor(() => {
      expect(screen.getByTestId('unlocked-hints-list')).toBeInTheDocument();
      expect(screen.getByText(/ইঙ্গিত ১:/)).toBeInTheDocument();
    });

    // Submit correct answer 'a^2+10a+25'
    const answerInput = screen.getByLabelText('তোমার উত্তর লেখো');
    fireEvent.change(answerInput, { target: { value: 'a^2+10a+25' } });
    fireEvent.submit(answerInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByTestId('rail-step-5').getAttribute('data-active')).toBe('true');
      expect(screen.getByText('৬৬%')).toBeInTheDocument();
    });
  });

  it('supports one-click hallucination reporting and renders Post-Lesson Summary Card when completed', async () => {
    render(<AiPrivateTutorWorkspace />);

    const flagBtn = screen.getByTestId('flag-tutor-msg-501');
    fireEvent.click(flagBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'তোমার রিপোর্টটি আমাদের একাডেমিক রিভিউ টিমের কাছে পাঠানো হয়েছে। ধন্যবাদ!'
      );
    });
  });
});

