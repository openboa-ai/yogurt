import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Chart } from "@openboa/yogurt/chart";
import { Heading } from "@openboa/yogurt/heading";
import { RecordFacts } from "@openboa/yogurt/record-facts";
import { Result } from "@openboa/yogurt/result";
import { Stack } from "@openboa/yogurt/stack";
import { Text } from "@openboa/yogurt/text";
import { Yogurt } from "@openboa/yogurt/yogurt";
import "@openboa/yogurt/styles.css";

const readings = [
  { id: "09", label: "09:00", value: 0 },
  { id: "10", label: "10:00", value: null },
  { id: "11", label: "11:00", value: 0.16 },
];
const observation = {
  source: "Monitoring log",
  asOf: "2026-01-12T13:00:00Z",
  timeLabel: "13:00 UTC",
};
const coverage = "Two of three readings";
const overview = new URLSearchParams(window.location.search).get("composition") === "overview";

function RecordClient() {
  const [canRead, setCanRead] = useState(true);
  useEffect(() => {
    Object.assign(window, { fixture: { revoke: () => setCanRead(false) } });
  }, []);

  return (
    <Yogurt>
      <main data-composition={overview ? "overview" : "room"}>
        <Stack gap={24}>
          <Heading level={1}>Reading board</Heading>
          {canRead ? (
            <Stack gap={16}>
              {overview ? (
                <RecordFacts
                  title="Studio observations"
                  facts={[{ id: "coverage", label: "Coverage", value: coverage }]}
                  {...observation}
                />
              ) : (
                <Stack gap={4}>
                  <Heading level={2}>Room 4</Heading>
                  <Text variant="help">{coverage} available</Text>
                </Stack>
              )}
              <Chart
                title={overview ? "Room 4 readings" : "Readings over time"}
                series="Room 4"
                unit="mg"
                points={readings}
                {...observation}
              />
            </Stack>
          ) : (
            <Result title="Record unavailable">Access to the readings could not be confirmed.</Result>
          )}
        </Stack>
      </main>
    </Yogurt>
  );
}

createRoot(document.getElementById("app")!).render(<RecordClient />);
