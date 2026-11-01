import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeacherMarketplaceAndExpansionWorkspace } from "../components/TeacherMarketplaceAndExpansionWorkspace";

describe("TeacherMarketplaceAndExpansionWorkspace", () => {
  it("switches NCTB Class 1-10 stages and books verified human teacher with AI diagnostic brief hand-off", () => {
    render(<TeacherMarketplaceAndExpansionWorkspace />);

    expect(screen.getByTestId("selected-stage-panel").textContent).toContain(
      "এসএসসি প্রস্তুতি (৯ম–১০ম শ্রেণি)"
    );

    fireEvent.click(screen.getByTestId("stage-btn-primary"));
    expect(screen.getByTestId("selected-stage-panel").textContent).toContain(
      "প্রাথমিক স্তর (১ম–৫ম শ্রেণি)"
    );

    expect(
      screen.getByTestId("ai-diagnostic-handoff-summary").textContent
    ).toContain("৪৪% দক্ষতায় আছে");

    fireEvent.click(screen.getByTestId("book-verified-teacher-btn"));
    expect(
      screen.getByTestId("teacher-booking-confirmed-banner").textContent
    ).toContain("এআই ডায়াগনস্টিক ব্রিফ");
  });
});

