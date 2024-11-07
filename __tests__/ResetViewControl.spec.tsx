import React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { MapContainer, useMapEvents } from "react-leaflet";
import ResetViewControl from "../src/ResetViewControl";

import type { ResetViewControlOptions } from "../src/ResetViewControl";
import { LatLng } from "leaflet";
import type { Map } from "leaflet";

describe("ResetViewControl", () => {
  const mockHandleViewReset = jest.fn();
  let mapInstance = null as Map | null
  const defaultMapCenter = new LatLng(-96.8716348, 32.8205866);
  const defaultMapZoom = 5

  const ControlWrapper = ({ title, icon, centerToReset, zoomToReset }: ResetViewControlOptions) => {
    useMapEvents({
      viewreset: mockHandleViewReset,
    });

    return (
      <ResetViewControl
        title={title ?? "Reset view"}
        icon={icon ?? "\u2612"}
        centerToReset={centerToReset}
        zoomToReset={zoomToReset}
      />
    );
  };
  const Map = ({ title, icon, centerToReset, zoomToReset }: ResetViewControlOptions) => {
    return (
      <MapContainer zoom={defaultMapZoom} center={defaultMapCenter} ref={map => mapInstance = map}>
        <ControlWrapper title={title} icon={icon} centerToReset={centerToReset} zoomToReset={zoomToReset} />
      </MapContainer>
    );
  };

  test("can reset map view", () => {
    render(<Map />);
    expect(mapInstance?.getCenter().lat).toBeCloseTo(defaultMapCenter.lat, 1);
    expect(mapInstance?.getCenter().lng).toBeCloseTo(defaultMapCenter.lng, 1);
    expect(mapInstance?.getZoom()).toEqual(defaultMapZoom)

    mapInstance?.setView(new LatLng(2, 46), 6)

    expect(mapInstance?.getCenter().lat).toBeCloseTo(2, 1);
    expect(mapInstance?.getCenter().lng).toBeCloseTo(46, 1);
    expect(mapInstance?.getZoom()).toEqual(6)

    userEvent.click(screen.getByTitle("Reset view"));

    expect(mapInstance?.getCenter().lat).toBeCloseTo(defaultMapCenter.lat, 1);
    expect(mapInstance?.getCenter().lng).toBeCloseTo(defaultMapCenter.lng, 1);
    expect(mapInstance?.getZoom()).toEqual(defaultMapZoom)

    expect(mockHandleViewReset).toHaveBeenCalledTimes(2);
  });

  test("can reset the map view to a zoom and center different from those mounted by the map", () => {
    const centerToReset = new LatLng(44.8, 6.3);
    const zoomToReset = 17;
    render(<Map centerToReset={centerToReset} zoomToReset={zoomToReset} />);

    expect(mapInstance?.getCenter().lat).toBeCloseTo(defaultMapCenter.lat, 1);
    expect(mapInstance?.getCenter().lng).toBeCloseTo(defaultMapCenter.lng, 1);
    expect(mapInstance?.getZoom()).toEqual(defaultMapZoom)

    userEvent.click(screen.getByTitle("Reset view"));

    expect(mapInstance?.getCenter().lat).toBeCloseTo(centerToReset.lat, 1);
    expect(mapInstance?.getCenter().lng).toBeCloseTo(centerToReset.lng, 1);
    expect(mapInstance?.getZoom()).toEqual(zoomToReset)

    expect(mockHandleViewReset).toHaveBeenCalledTimes(3);
  });

  test("can see icon", () => {
    render(<Map />);

    screen.getByText("\u2612");
  });

  test("can set icon", () => {
    render(<Map icon="url(/some/relative/path.png)" />);

    expect(screen.getByTitle("Reset view")).toHaveStyle({
      "background-image": "url(/some/relative/path.png)",
    });
  });

  test("link has href", () => {
    render(<Map />);
    expect(screen.getByTitle("Reset view")).toHaveAttribute("href", "#");
  });
});
