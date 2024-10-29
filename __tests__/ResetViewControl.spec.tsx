import React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { MapContainer, useMapEvents } from "react-leaflet";
import ResetViewControl from "../src/ResetViewControl";

import type { ResetViewControlOptions } from "../src/ResetViewControl";
import type { LatLngExpression, Map } from "leaflet";

describe("ResetViewControl", () => {
  const mockHandleViewReset = jest.fn();
  let mapInstance = null as Map | null
  const defaultMapCenter = [-96.8716348, 32.8205866] as LatLngExpression;
  const defaultMapZoom = 5

  const ControlWrapper = ({ title, icon }: ResetViewControlOptions) => {
    useMapEvents({
      viewreset: mockHandleViewReset,
    });

    return (
      <>
        <ResetViewControl
          title={title ?? "Reset view"}
          icon={icon ?? "\u2612"}
        />
      </>
    );
  };
  const Map = ({ title, icon }: ResetViewControlOptions) => {
    return (
      <MapContainer zoom={defaultMapZoom} center={defaultMapCenter} ref={map => mapInstance = map}>
        <ControlWrapper title={title} icon={icon} />
      </MapContainer>
    );
  };

  test("can reset map view", () => {
    render(<Map />);
    expect(mapInstance?.getCenter().lat).toBeCloseTo(defaultMapCenter[0], 1);
    expect(mapInstance?.getCenter().lng).toBeCloseTo(defaultMapCenter[1], 1);
    expect(mapInstance?.getZoom()).toEqual(defaultMapZoom)

    mapInstance?.setView([2, 46], 6)

    expect(mapInstance?.getCenter().lat).toBeCloseTo(2, 1);
    expect(mapInstance?.getCenter().lng).toBeCloseTo(46, 1);
    expect(mapInstance?.getZoom()).toEqual(6)

    userEvent.click(screen.getByTitle("Reset view"));

    expect(mapInstance?.getCenter().lat).toBeCloseTo(defaultMapCenter[0], 1);
    expect(mapInstance?.getCenter().lng).toBeCloseTo(defaultMapCenter[1], 1);
    expect(mapInstance?.getZoom()).toEqual(defaultMapZoom)

    expect(mockHandleViewReset).toHaveBeenCalledTimes(2);
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
