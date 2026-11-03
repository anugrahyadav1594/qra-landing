/** The college picker never lets a participant invent a college (Journey D/E). */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CollegeSelect } from "@/components/tournament/CollegeSelect";
import type { College } from "@/lib/tournament";

const colleges: College[] = [
  {
    id: "ict",
    name: "Institute of Chemical Technology",
    location: "Mumbai",
    logo_url: null,
    description: null,
    is_active: true,
    accepts_registrations: true,
  },
  {
    id: "vjti",
    name: "Veermata Jijabai Technological Institute",
    location: "Mumbai",
    logo_url: null,
    description: null,
    is_active: true,
    accepts_registrations: true,
  },
];

describe("CollegeSelect", () => {
  it("lists every onboarded college", async () => {
    const onChange = vi.fn();
    render(<CollegeSelect colleges={colleges} value={null} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    expect(screen.getByText("Institute of Chemical Technology")).toBeInTheDocument();
    expect(screen.getByText("Veermata Jijabai Technological Institute")).toBeInTheDocument();
  });

  it("filters by typed text", async () => {
    render(<CollegeSelect colleges={colleges} value={null} onChange={vi.fn()} />);
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "veermata");
    expect(screen.getByText("Veermata Jijabai Technological Institute")).toBeInTheDocument();
    expect(screen.queryByText("Institute of Chemical Technology")).toBeNull();
  });

  it("tells the participant when nothing onboarded matches", async () => {
    render(<CollegeSelect colleges={colleges} value={null} onChange={vi.fn()} />);
    await userEvent.type(screen.getByRole("combobox"), "Harvard");
    expect(screen.getByText(/No onboarded college matches/i)).toBeInTheDocument();
  });

  it("commits a college id when an option is chosen", async () => {
    const onChange = vi.fn();
    render(<CollegeSelect colleges={colleges} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByText("Institute of Chemical Technology"));
    expect(onChange).toHaveBeenCalledWith("ict");
  });

  it("supports keyboard selection", async () => {
    const onChange = vi.fn();
    render(<CollegeSelect colleges={colleges} value={null} onChange={onChange} />);
    const input = screen.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it("shows the selected college in the collapsed state", () => {
    render(<CollegeSelect colleges={colleges} value="vjti" onChange={vi.fn()} />);
    expect(screen.getByText("Veermata Jijabai Technological Institute")).toBeInTheDocument();
    expect(screen.getByText("Change")).toBeInTheDocument();
  });
});
