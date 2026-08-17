import {
  Download,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

type FestiveAIVideoGeneratorProps = {
  referenceImage: string | null;
  festivalId: string;
  festivalName: string;
  memberCount: number;
};

type StartResponse = {
  success?: boolean;
  videoId?: string;
  status?: string;
  progress?: number;
  error?: string;
};

type StatusResponse = {
  success?: boolean;
  videoId?: string;
  status?: string;
  progress?: number;
  ready?: boolean;
  failed?: boolean;
  downloadUrl?: string | null;
  error?: {
    message?: string;
  } | string | null;
};

export function FestiveAIVideoGenerator({
  referenceImage,
  festivalId,
  festivalName,
  memberCount,
}: FestiveAIVideoGeneratorProps) {
  const [
    videoId,
    setVideoId,
  ] = useState<string | null>(
    null,
  );

  const [
    status,
    setStatus,
  ] = useState<
    | "idle"
    | "starting"
    | "queued"
    | "in_progress"
    | "completed"
    | "failed"
  >("idle");

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    videoUrl,
    setVideoUrl,
  ] = useState<string | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /*
   * ============================================================
   * START AI VIDEO
   * ============================================================
   */

  async function generateVideo() {
    if (!referenceImage) {
      setError(
        "Prepare the AI Squad Reference first.",
      );

      return;
    }

    setStatus("starting");
    setError(null);
    setVideoUrl(null);
    setVideoId(null);
    setProgress(0);

    try {
      const response =
        await fetch(
          "/api/generate-festive-reel",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              festivalId,
              festivalName,
              memberCount,

              /*
               * FAST HACKATHON TEST:
               * Start with only 4 seconds.
               */

              seconds: "4",

              referenceImageDataUrl:
                referenceImage,
            }),
          },
        );

      const payload =
        (await response.json()) as StartResponse;

      if (
        !response.ok ||
        !payload.success
      ) {
        throw new Error(
          payload.error ??
            "AI Reel could not be started.",
        );
      }

      if (!payload.videoId) {
        throw new Error(
          "Video job ID was not returned.",
        );
      }

      setVideoId(
        payload.videoId,
      );

      setStatus(
        payload.status ===
          "in_progress"
          ? "in_progress"
          : "queued",
      );

      setProgress(
        payload.progress ??
          0,
      );
    } catch (requestError) {
      console.error(
        "AI Festive Reel start error:",
        requestError,
      );

      setStatus("failed");

      setError(
        requestError instanceof Error
          ? requestError.message
          : "AI Reel generation failed.",
      );
    }
  }

  /*
   * ============================================================
   * POLL VIDEO STATUS
   * ============================================================
   */

  useEffect(() => {
    if (!videoId) {
      return;
    }

    if (
      status === "completed" ||
      status === "failed"
    ) {
      return;
    }

    let cancelled = false;

    async function checkStatus() {
      try {
        const response =
          await fetch(
            `/api/generate-festive-reel?videoId=${encodeURIComponent(
              videoId!,
            )}`,
          );

        const payload =
          (await response.json()) as StatusResponse;

        if (cancelled) {
          return;
        }

        if (
          !response.ok ||
          !payload.success
        ) {
          const message =
            typeof payload.error ===
            "string"
              ? payload.error
              : payload.error
                    ?.message ??
                "Could not check AI video status.";

          throw new Error(
            message,
          );
        }

        setProgress(
          payload.progress ??
            0,
        );

        if (
          payload.failed ||
          payload.status ===
            "failed"
        ) {
          setStatus("failed");

          const failureMessage =
            typeof payload.error ===
            "string"
              ? payload.error
              : payload.error
                    ?.message ??
                "AI video generation failed.";

          setError(
            failureMessage,
          );

          return;
        }

        if (
          payload.ready ||
          payload.status ===
            "completed"
        ) {
          setStatus(
            "completed",
          );

          const finalUrl =
            payload.downloadUrl ??
            `/api/generate-festive-reel?videoId=${encodeURIComponent(
              videoId!,
            )}&download=1`;

          setVideoUrl(
            finalUrl,
          );

          setProgress(100);

          return;
        }

        setStatus(
          payload.status ===
            "in_progress"
            ? "in_progress"
            : "queued",
        );
      } catch (statusError) {
        if (cancelled) {
          return;
        }

        console.error(
          "AI Festive Reel status error:",
          statusError,
        );

        setStatus("failed");

        setError(
          statusError instanceof Error
            ? statusError.message
            : "Could not check AI video status.",
        );
      }
    }

    void checkStatus();

    const timer =
      window.setInterval(
        () => {
          void checkStatus();
        },
        4000,
      );

    return () => {
      cancelled = true;

      window.clearInterval(
        timer,
      );
    };
  }, [
    videoId,
    status,
  ]);

  /*
   * ============================================================
   * DOWNLOAD
   * ============================================================
   */

  function downloadVideo() {
    if (!videoUrl) {
      return;
    }

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href =
      `${videoUrl}${
        videoUrl.includes("?")
          ? "&"
          : "?"
      }downloadFile=1`;

    anchor.download =
      `festive-ready-${festivalId}-reel.mp4`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();
  }

  const generating =
    status === "starting" ||
    status === "queued" ||
    status === "in_progress";

  return (
    <div className="w-full max-w-md rounded-xl border border-gold/35 bg-black/40 p-4 text-center backdrop-blur-md">
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="size-4 text-gold" />

        <p className="font-display text-[10px] tracking-[0.14em] text-gold uppercase">
          AI Festive Video
        </p>
      </div>

      {!referenceImage && (
        <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
          Prepare the AI Squad Reference first.
        </p>
      )}

      {referenceImage &&
        status === "idle" && (
          <>
            <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">
              Ready to create a real
              4-second AI{" "}
              {festivalName} Squad Reel.
            </p>

            <button
              type="button"
              onClick={() =>
                void generateVideo()
              }
              className="mt-4 w-full rounded-lg border border-gold/60 bg-gold/15 px-4 py-3 font-display text-[10px] tracking-[0.12em] text-gold uppercase transition-all hover:bg-gold/25"
            >
              <span className="flex items-center justify-center gap-2">
                <Play className="size-4" />

                Generate AI Festive Reel
              </span>
            </button>
          </>
        )}

      {generating && (
        <div className="mt-4">
          <Loader2 className="mx-auto size-7 animate-spin text-gold" />

          <p className="mt-3 font-display text-[10px] tracking-[0.1em] text-gold uppercase">
            Creating Your Festival Reel
          </p>

          <p className="mt-2 text-[9px] text-muted-foreground">
            {status === "queued"
              ? "Waiting for AI video generation..."
              : status ===
                  "starting"
                ? "Sending your Festive Squad..."
                : `Generating... ${Math.round(
                    progress,
                  )}%`}
          </p>

          <div className="mx-auto mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{
                width: `${Math.max(
                  4,
                  progress,
                )}%`,
              }}
            />
          </div>

          <p className="mt-3 text-[8px] leading-relaxed text-muted-foreground">
            Keep this page open while the video is being created.
          </p>
        </div>
      )}

      {status ===
        "completed" &&
        videoUrl && (
          <div className="mt-4">
            <p className="font-display text-[10px] tracking-[0.12em] text-gold uppercase">
              AI Reel Ready ✓
            </p>

            <video
              src={videoUrl}
              controls
              playsInline
              className="mx-auto mt-3 aspect-[9/16] max-h-[500px] rounded-xl border border-gold/30 bg-black object-contain"
            />

            <button
              type="button"
              onClick={
                downloadVideo
              }
              className="mt-3 w-full rounded-lg border border-gold/60 bg-gold/15 px-4 py-3 font-display text-[10px] tracking-[0.12em] text-gold uppercase transition-all hover:bg-gold/25"
            >
              <span className="flex items-center justify-center gap-2">
                <Download className="size-4" />

                Download AI Reel
              </span>
            </button>
          </div>
        )}

      {status === "failed" && (
        <div className="mt-4 rounded-lg border border-red-400/25 bg-red-950/30 px-3 py-3">
          <p className="text-[9px] font-medium text-red-200">
            AI Reel could not be generated.
          </p>

          {error && (
            <p className="mt-2 break-words text-[8px] leading-relaxed text-red-200/80">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setError(null);
            }}
            className="mt-3 rounded-lg border border-gold/30 px-4 py-2 text-[8px] tracking-[0.1em] text-gold uppercase"
          >
            Try Again
          </button>
        </div>
      )}

      <p className="mt-3 text-[8px] leading-relaxed text-muted-foreground">
        Uses the already-prepared Squad reference.
        No new YouCam request is made.
      </p>
    </div>
  );
}