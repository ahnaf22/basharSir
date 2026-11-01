import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimedExaminationWorkspace } from './TimedExaminationWorkspace';

vi.mock('../api/examinations.api', () => ({
  examinationsApi: {
    autosaveAnswers: vi.fn().mockRejectedValue(new Error('offline_fallback')),
    submitAttempt: vi.fn().mockRejectedValue(new Error('offline_fallback')),
  },
}));

describe('TimedExaminationWorkspace (Chunk 3.4)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders countdown timer, question palette, flag-for-review, localStorage autosave, and step-by-step rubric result breakdown', async () => {
    render(<TimedExaminationWorkspace />);

    // 1. Timer & Question 1 MCQ selection
    expect(screen.getByTestId('exam-countdown-timer')).toHaveTextContent('৩০:০০');
    fireEvent.click(screen.getByTestId('mcq-option-B'));

    expect(screen.getByTestId('palette-btn-q-2001').getAttribute('data-answered')).toBe(
      'true'
    );

    // Verify localStorage draft persistence
    const savedRaw = window.localStorage.getItem('basharsir_exam_draft_701');
    expect(savedRaw).toContain('"selected_option_key":"B"');

    // 2. Flag Question 1 for review
    fireEvent.click(screen.getByTestId('flag-review-toggle-btn'));
    expect(screen.getByTestId('palette-btn-q-2001').getAttribute('data-flagged')).toBe(
      'true'
    );

    // 3. Navigate to Question 3 (Math Problem) and enter step-wise solution
    fireEvent.click(screen.getByTestId('palette-btn-q-2003'));
    const textarea = screen.getByLabelText(
      'ধাপে ধাপে তোমার গাণিতিক বা সৃজনশীল উত্তর লেখো:'
    );
    fireEvent.change(textarea, {
      target: { value: 'a+b=7, ab=12 এবং (a-b)^2 = (a+b)^2 - 4ab = 49 - 48 = 1' },
    });

    // 4. Submit exam and verify Detailed Rubric Result Breakdown screen
    fireEvent.click(screen.getByTestId('submit-exam-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('exam-rubric-result-breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('result-obtained-marks')).toHaveTextContent('৫ / ৭');
      expect(
        screen.getByText(/অষ্টম শ্রেণি গণিত, পৃষ্ঠা ৫২, অনুশীলনী ৪\.১/)
      ).toBeInTheDocument();
    });
  });
});
