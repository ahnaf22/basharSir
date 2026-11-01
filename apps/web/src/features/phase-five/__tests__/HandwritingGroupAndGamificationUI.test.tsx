import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HandwritingGroupAndGamificationWorkspace } from "../components/HandwritingGroupAndGamificationWorkspace";

describe("HandwritingGroupAndGamificationWorkspace", () => {
  it("applies human reviewer override, resolves FIFO raise-hand queue, and renders pseudonymous leaderboard", () => {
    render(<HandwritingGroupAndGamificationWorkspace />);

    expect(screen.getByTestId("script-review-status-badge").textContent).toContain(
      "escalated_to_human"
    );

    fireEvent.click(screen.getByTestId("apply-reviewer-override-btn"));
    expect(screen.getByTestId("script-review-status-badge").textContent).toContain(
      "human_reviewed"
    );
    expect(screen.getByTestId("script-review-status-badge").textContent).toContain(
      "৮.৫"
    );

    expect(screen.getByTestId("raise-hand-item-1").textContent).toContain("queued");
    fireEvent.click(screen.getByTestId("resolve-fifo-hand-btn"));
    expect(screen.getByTestId("raise-hand-item-1").textContent).toContain("answered");
    expect(screen.getByTestId("raise-hand-item-2").textContent).toContain("queued");

    expect(screen.getByTestId("pseudonymous-leaderboard-top").textContent).toContain(
      "শিক্ষার্থী-5001"
    );
  });
});

