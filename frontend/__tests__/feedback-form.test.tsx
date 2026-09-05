/** FeedbackForm behaviour in both modes (§10 + contact surface). */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { FeedbackForm } from "@/components/FeedbackForm";

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => body,
  } as Response);
}

describe("FeedbackForm (feedback mode)", () => {
  it("submits feedback with category, message and rating", async () => {
    const fetchMock = mockFetch(201, { id: "f1", status: "new", duplicate: false });
    vi.stubGlobal("fetch", fetchMock);

    render(<FeedbackForm mode="feedback" defaultPageSlug="/feedback" />);
    await userEvent.selectOptions(screen.getByTestId("feedback-category"), "security");
    await userEvent.type(
      screen.getByTestId("feedback-message"),
      "There is a typo on the pricing page footer.",
    );
    await userEvent.click(screen.getByTestId("rating-4"));
    await userEvent.click(screen.getByTestId("feedback-submit"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/feedback");
    const body = JSON.parse(options.body);
    expect(body.category).toBe("security");
    expect(body.rating).toBe(4);
    expect(body.page_slug).toBe("/feedback");
    expect(await screen.findByTestId("feedback-success")).toBeInTheDocument();
  });

  it("blocks too-short messages client-side", async () => {
    const fetchMock = mockFetch(201, {});
    vi.stubGlobal("fetch", fetchMock);
    render(<FeedbackForm mode="feedback" />);
    await userEvent.type(screen.getByTestId("feedback-message"), "tiny");
    await userEvent.click(screen.getByTestId("feedback-submit"));
    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("FeedbackForm (contact mode)", () => {
  it("maps the topic to the API category and includes contact details", async () => {
    const fetchMock = mockFetch(201, { id: "f1", status: "new", duplicate: false });
    vi.stubGlobal("fetch", fetchMock);

    render(<FeedbackForm mode="contact" defaultPageSlug="/contact" />);
    await userEvent.type(screen.getByTestId("contact-name"), "Ada");
    await userEvent.type(screen.getByTestId("contact-email"), "ada@example.com");
    await userEvent.selectOptions(screen.getByTestId("contact-topic"), "sales");
    await userEvent.type(screen.getByTestId("feedback-message"), "We would love a demo.");
    await userEvent.click(screen.getByTestId("feedback-submit"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.category).toBe("sales");
    expect(body.contact_name).toBe("Ada");
    expect(body.contact_email).toBe("ada@example.com");
    expect(await screen.findByText(/Message sent/i)).toBeInTheDocument();
  });

  it("validates the contact email", async () => {
    const fetchMock = mockFetch(201, {});
    vi.stubGlobal("fetch", fetchMock);
    render(<FeedbackForm mode="contact" />);
    await userEvent.type(screen.getByTestId("contact-email"), "not-an-email");
    await userEvent.type(screen.getByTestId("feedback-message"), "This is a long enough message.");
    await userEvent.click(screen.getByTestId("feedback-submit"));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
