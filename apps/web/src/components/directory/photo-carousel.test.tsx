import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PhotoCarousel } from "./photo-carousel";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

describe("PhotoCarousel", () => {
  it("renders one slide and one dot per photo", () => {
    render(
      <PhotoCarousel name="Sazón" photos={["/a.jpg", "/b.jpg", "/c.jpg"]} />,
    );
    expect(screen.getAllByTestId("carousel-slide")).toHaveLength(3);
    expect(screen.getAllByTestId("carousel-dot")).toHaveLength(3);
  });

  it("renders each photo with the commerce name as alt text", () => {
    render(<PhotoCarousel name="Sazón de la Abuela" photos={["/a.jpg"]} />);
    expect(screen.getByAltText(/Sazón de la Abuela/)).toBeDefined();
  });

  it("shows a single gradient placeholder and no dots when there is no photo", () => {
    render(<PhotoCarousel name="Sazón" photos={[]} />);
    const slides = screen.getAllByTestId("carousel-slide");
    expect(slides).toHaveLength(1);
    expect(slides[0].getAttribute("data-placeholder")).toBe("true");
    expect(screen.queryAllByTestId("carousel-dot")).toHaveLength(0);
  });

  it("marks the first dot active initially", () => {
    render(<PhotoCarousel name="X" photos={["/a.jpg", "/b.jpg"]} />);
    const dots = screen.getAllByTestId("carousel-dot");
    expect(dots[0].getAttribute("data-active")).toBe("true");
    expect(dots[1].getAttribute("data-active")).toBe("false");
  });
});

describe("PhotoViewer", () => {
  async function openViewer(photos: string[]) {
    const user = userEvent.setup();
    render(<PhotoCarousel name="X" photos={photos} />);
    await user.click(
      screen.getByRole("button", { name: /Ver la foto 1 en pantalla completa/ }),
    );
    expect(screen.getByTestId("photo-viewer")).toBeDefined();
    return user;
  }

  it("shows the position counter in n/total form", async () => {
    await openViewer(["/a.jpg", "/b.jpg", "/c.jpg"]);
    expect(screen.getByTestId("viewer-counter").textContent).toBe("1/3");
  });

  it("keeps the counter even with a single photo", async () => {
    await openViewer(["/a.jpg"]);
    expect(screen.getByTestId("viewer-counter").textContent).toBe("1/1");
  });

  it("zoom buttons only change the zoom level — they never close the viewer", async () => {
    const user = await openViewer(["/a.jpg", "/b.jpg"]);

    const zoomIn = screen.getByRole("button", { name: "Acercar" });
    const zoomOut = screen.getByRole("button", { name: "Alejar" });
    // Not zoomed yet: − is disabled, + is not.
    expect(zoomOut.hasAttribute("disabled")).toBe(true);

    await user.click(zoomIn);
    expect(screen.getByTestId("photo-viewer")).toBeDefined();
    // Now zoomed: − becomes usable, and clicking it must not close either.
    expect(zoomOut.hasAttribute("disabled")).toBe(false);

    await user.click(zoomOut);
    expect(screen.getByTestId("photo-viewer")).toBeDefined();
    expect(zoomOut.hasAttribute("disabled")).toBe(true);
  });

  it("the navigation arrows switch photos without closing the viewer", async () => {
    const user = await openViewer(["/a.jpg", "/b.jpg"]);
    // The carousel behind has its own « Foto siguiente » — scope to the viewer.
    const viewer = within(screen.getByTestId("photo-viewer"));
    await user.click(viewer.getByRole("button", { name: "Foto siguiente" }));
    expect(screen.getByTestId("viewer-counter").textContent).toBe("2/2");
    expect(screen.getByTestId("photo-viewer")).toBeDefined();
  });

  it("closes from the close button", async () => {
    const user = await openViewer(["/a.jpg"]);
    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByTestId("photo-viewer")).toBeNull();
  });
});
