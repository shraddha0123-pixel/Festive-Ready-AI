import { createFileRoute } from "@tanstack/react-router";

import palace from "@/assets/palace-bg.jpg";

import { FestiveHeader } from "@/components/festive/FestiveHeader";
import { EquipmentPanel } from "@/components/festive/EquipmentPanel";
import { CharacterStage } from "@/components/festive/CharacterStage";
import { InventoryPanel } from "@/components/festive/InventoryPanel";
import { FestiveControlBar } from "@/components/festive/FestiveControlBar";
import { FestiveProvider } from "@/components/festive/FestiveContext";
import { FestiveTutorial } from "@/components/festive/FestiveTutorial";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Festive Ready AI — RPG Festive Styling Room",
      },
      {
        name: "description",
        content:
          "Build your real-world festive family look like an RPG squad with virtual try-on, equipment slots and a cinematic dressing chamber.",
      },
      {
        property: "og:title",
        content:
          "Festive Ready AI — RPG Festive Styling Room",
      },
      {
        property: "og:description",
        content:
          "A gamified festive styling experience where your family builds and reveals their festive squad.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
  }),

  component: Index,
});

function Index() {
  return (
    <FestiveProvider>

      <main className="relative min-h-screen overflow-hidden">

        {/* Custom Theme Scrollbar Styles */}

        <style>{`
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: oklch(0.12 0.03 28 / 92%);
          }

          ::-webkit-scrollbar-thumb {
            background: color-mix(
              in oklab,
              var(--gold) 40%,
              transparent
            );

            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: var(--gold);
          }
        `}</style>

        <img
          src={palace}
          alt=""
          aria-hidden
          width={1536}
          height={1024}
          className="fixed inset-0 size-full object-cover opacity-45"
        />

        <div
          aria-hidden
          className="fixed inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--ember) 14%, transparent), transparent 60%), linear-gradient(180deg, oklch(0.14 0.03 30 / 70%), oklch(0.12 0.03 28 / 92%))",
          }}
        />

        <div className="relative mx-auto flex min-h-screen max-w-[1500px] flex-col gap-5 px-5 py-5">

          <FestiveHeader />

          <FestiveControlBar />

          {/* MAIN RPG DRESSING ROOM */}

          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_320px]">

            <EquipmentPanel />

            <CharacterStage />

            <InventoryPanel />

          </div>

        </div>

      </main>

      {/* PROFESSIONAL SPOTLIGHT TUTORIAL */}

      <FestiveTutorial />

    </FestiveProvider>
  );
}