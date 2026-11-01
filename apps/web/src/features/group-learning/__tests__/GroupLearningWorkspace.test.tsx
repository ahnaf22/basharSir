import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GroupLearningWorkspace } from "../components/GroupLearningWorkspace";

describe("GroupLearningWorkspace (Module 08 — Group Study / Batch Tutoring)", () => {
  it("enforces invitation-only cohort join code, auto-reveals batch broadcast poll on submission, supports individual side-assistance, and scrubs PII in FIFO raise-hand queue", () => {
    render(<GroupLearningWorkspace />);

    expect(screen.getByTestId("child-safety-policy-badge").textContent).toContain(
      "১-অন-১ চ্যাট বন্ধ"
    );
    expect(screen.getByTestId("active-cohort-count-badge").textContent).toContain(
      "৩ / ৫ জন"
    );

    // 1. Batch Mode Broadcast Question Poll -> submit student's individual response -> auto-reveals!
    fireEvent.click(screen.getByTestId("submit-broadcast-poll-btn"));
    expect(screen.getByTestId("broadcast-reveal-badge").textContent).toContain(
      "সঠিক উত্তর: B (12xy)"
    );

    // 2. Switch to Individual Assistance Mode (Side-Explanation without derailing shared group board)
    fireEvent.click(screen.getByTestId("switch-individual-mode-btn"));
    expect(screen.getByTestId("individual-assistance-drawer")).toBeDefined();
    fireEvent.click(screen.getByTestId("request-side-assistance-btn"));
    expect(screen.getAllByTestId("side-assistance-item").length).toBeGreaterThanOrEqual(2);

    // 3. Enqueue a Raise-Hand question containing a BD phone number -> automatically redacted by PII scrubber
    const handInput = screen.getByLabelText("হাত তোলার প্রশ্ন");
    fireEvent.change(handInput, {
      target: { value: "স্যার 01711880001 নাম্বারে কল না দিয়ে সূত্রটি বোঝান" },
    });
    fireEvent.click(screen.getByTestId("enqueue-raise-hand-btn"));

    expect(screen.getByTestId("pii-redacted-badge").textContent).toContain(
      "PII গোপনকৃত"
    );
    expect(screen.getByTestId("raise-hand-item-3").textContent).toContain(
      "[REDACTED_BD_PHONE]"
    );

    // 4. Resolve next in FIFO queue
    fireEvent.click(screen.getByTestId("resolve-fifo-hand-btn"));
    expect(screen.getByTestId("raise-hand-item-1").textContent).toContain(
      "answered"
    );
  });
});

