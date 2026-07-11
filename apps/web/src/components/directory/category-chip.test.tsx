import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CATEGORY_CHIP_BY_KEY } from "@/lib/categories";
import { CategoryChip } from "./category-chip";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  ),
}));

/** The chip icons are decorative (aria-hidden) — query them off the DOM. */
function iconBySrc(container: HTMLElement, fragment: string): HTMLImageElement {
  const img = Array.from(container.querySelectorAll("img")).find((el) =>
    (el.getAttribute("src") ?? "").includes(fragment),
  );
  if (!img) throw new Error(`No icon matching "${fragment}"`);
  return img;
}

describe("CategoryChip", () => {
  it("renders the chip label", () => {
    render(<CategoryChip chip={CATEGORY_CHIP_BY_KEY.comida} />);
    expect(screen.getByText("Comida")).toBeDefined();
  });

  it("reflects the active state via a data attribute", () => {
    const { rerender } = render(
      <CategoryChip chip={CATEGORY_CHIP_BY_KEY.comida} active />,
    );
    expect(
      screen.getByRole("button").getAttribute("data-active"),
    ).toBe("true");

    rerender(<CategoryChip chip={CATEGORY_CHIP_BY_KEY.comida} />);
    expect(
      screen.getByRole("button").getAttribute("data-active"),
    ).toBe("false");
  });

  it("shows the light icon resting and swaps to the navy icon when active", () => {
    const { container, rerender } = render(
      <CategoryChip chip={CATEGORY_CHIP_BY_KEY.comida} />,
    );
    expect(iconBySrc(container, "comida-light").className).not.toContain(
      "opacity-0",
    );
    expect(iconBySrc(container, "comida-navy").className).toContain(
      "opacity-0",
    );

    rerender(<CategoryChip chip={CATEGORY_CHIP_BY_KEY.comida} active />);
    expect(iconBySrc(container, "comida-light").className).toContain(
      "opacity-0",
    );
    expect(iconBySrc(container, "comida-navy").className).not.toContain(
      "opacity-0",
    );
  });

  it("calls onSelect with the chip key when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CategoryChip chip={CATEGORY_CHIP_BY_KEY.mascotas} onSelect={onSelect} />,
    );

    await user.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith("mascotas");
  });
});
