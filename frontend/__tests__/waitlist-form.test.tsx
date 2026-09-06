/** WaitlistForm behaviour: validation, submission payload, success/429/error. */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { WaitlistForm } from "@/components/WaitlistForm";

const PRODUCTS = [
  { id: "p-aurora", slug: "aurora", name: "Aurora" },
  { id: "p-beacon", slug: "beacon", name: "Beacon" },
];

function mockFetchResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: async () => body,
  } as Response);
}

describe("WaitlistForm", () => {
  it("shows client-side validation errors before submitting", async () => {
    render(<WaitlistForm products={PRODUCTS} />);
    await userEvent.click(screen.getByTestId("waitlist-submit"));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText(/consent to waitlist contact is required/i)).toBeInTheDocument();
  });

  it("submits the validated payload to the API", async () => {
    const fetchMock = mockFetchResponse(201, {
      entry_id: "e1", product_id: "p-aurora", status: "registered", already_present: false,
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<WaitlistForm products={PRODUCTS} />);
    await userEvent.type(screen.getByTestId("waitlist-email"), "ada@example.com");
    await userEvent.selectOptions(screen.getByTestId("waitlist-product"), "p-beacon");
    await userEvent.click(screen.getByTestId("waitlist-consent"));
    await userEvent.click(screen.getByTestId("waitlist-submit"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/waitlist");
    const body = JSON.parse(options.body);
    expect(body.email).toBe("ada@example.com");
    expect(body.product_id).toBe("p-beacon");
    expect(body.consent_waitlist_contact).toBe(true);
    expect(body.company_website).toBe("");
    expect(typeof body.client_ts).toBe("number");
    expect(await screen.findByTestId("waitlist-success")).toBeInTheDocument();
  });

  it("treats already_present as a success with the right message", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(200, {
      entry_id: "e1", product_id: "p-aurora", status: "registered", already_present: true,
    }));
    render(<WaitlistForm products={PRODUCTS} />);
    await userEvent.type(screen.getByTestId("waitlist-email"), "ada@example.com");
    await userEvent.click(screen.getByTestId("waitlist-consent"));
    await userEvent.click(screen.getByTestId("waitlist-submit"));
    expect(await screen.findByText(/already on the list/i)).toBeInTheDocument();
  });

  it("surfaces the Retry-After guidance on 429", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(429, {
      error: { code: "rate_limited", message: "Too many requests." },
    }, { "Retry-After": "45" }));
    render(<WaitlistForm products={PRODUCTS} />);
    await userEvent.type(screen.getByTestId("waitlist-email"), "ada@example.com");
    await userEvent.click(screen.getByTestId("waitlist-consent"));
    await userEvent.click(screen.getByTestId("waitlist-submit"));
    expect(await screen.findByTestId("waitlist-error")).toHaveTextContent(/45 seconds/);
  });

  it("shows backend error messages from the envelope", async () => {
    vi.stubGlobal("fetch", mockFetchResponse(422, {
      error: { code: "disposable_email", message: "Please use a personal email address." },
    }));
    render(<WaitlistForm products={PRODUCTS} />);
    await userEvent.type(screen.getByTestId("waitlist-email"), "x@mailinator.com");
    await userEvent.click(screen.getByTestId("waitlist-consent"));
    await userEvent.click(screen.getByTestId("waitlist-submit"));
    expect(await screen.findByTestId("waitlist-error")).toHaveTextContent("personal email");
  });

  it("handles network failure gracefully", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    render(<WaitlistForm products={PRODUCTS} />);
    await userEvent.type(screen.getByTestId("waitlist-email"), "ada@example.com");
    await userEvent.click(screen.getByTestId("waitlist-consent"));
    fireEvent.click(screen.getByTestId("waitlist-submit"));
    expect(await screen.findByTestId("waitlist-error")).toHaveTextContent(/network/i);
  });
});
