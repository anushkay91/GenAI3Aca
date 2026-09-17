import React from "react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DisclaimerBanner } from "../../src/components/common/DisclaimerBanner";
import { Modal } from "../../src/components/common/Modal";

describe("DisclaimerBanner Component", () => {
  it("renders non-clinical reflective support notice", () => {
    render(<DisclaimerBanner />);
    expect(screen.getByText(/Reflective Support Notice/i)).toBeInTheDocument();
    expect(
      screen.getByText(/does not provide therapy, medical advice/i)
    ).toBeInTheDocument();
  });

  it("toggles crisis emergency resources when clicked", () => {
    render(<DisclaimerBanner />);
    const toggleButton = screen.getByRole("button", { name: /crisis resources/i });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/Immediate Support & Emergency Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/988/i)).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Modal Component Accessibility", () => {
  it("renders with correct ARIA attributes when open", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Dialog">
        <p>Dialog body content</p>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: "Test Dialog" })).toBeInTheDocument();
    expect(screen.getByText("Dialog body content")).toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Dialog">
        <button type="button">Focusable</button>
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
