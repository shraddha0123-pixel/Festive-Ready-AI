import { createFileRoute } from "@tanstack/react-router";

const OPENAI_VIDEO_URL =
  "https://api.openai.com/v1/videos";

const MAX_REFERENCE_LENGTH =
  20 * 1024 * 1024;

type CreateReelBody = {
  festivalId?: string;
  festivalName?: string;
  memberCount?: number;
  referenceImageDataUrl?: string;
  seconds?: "4" | "8" | "12";
};

type OpenAIVideoJob = {
  id?: string;
  status?:
    | "queued"
    | "in_progress"
    | "completed"
    | "failed";
  progress?: number;
  error?: {
    code?: string;
    message?: string;
  } | null;
  seconds?: string;
  size?: string;
};

/*
 * ============================================================
 * FESTIVAL VIDEO PROMPTS
 * ============================================================
 */

function buildFestivalPrompt(
  festivalId: string,
  festivalName: string,
  memberCount: number,
) {
  const peopleDescription =
    memberCount === 1
      ? "one festive family member"
      : `${memberCount} festive family members`;

  const sharedRules = `
The reference image contains ${peopleDescription}.

Preserve every visible person's identity from the reference image:
face, skin tone, hairstyle, approximate body proportions,
age appearance and exact festive clothing.

Do not add extra people.
Do not remove people.
Do not merge people together.
Do not swap faces.
Do not change the outfits.
Do not invent different clothing.

Use natural realistic Indian family movement.
Keep faces stable.
Use realistic hands and body motion.
Use natural fabric movement.

Create the feeling of a premium cinematic
Indian festive advertisement.

Use vertical 9:16 composition.

The scene must work naturally whether there is
one person or several family members.

Use tasteful cinematic camera movement.

No spoken dialogue.

Do not render logos, QR codes, URLs or promotional text
inside the AI-generated scene.

Festive Ready AI will add branding,
shopping links and QR code separately.
`;

  switch (festivalId) {
    case "ganesh-chaturthi":
      return `
Create an elegant cinematic Ganesh Chaturthi family celebration.

${sharedRules}

Scene:
A beautiful traditional Ganesh Chaturthi mandap
decorated with marigold flowers,
warm diyas,
golden lights
and tasteful Indian festive decorations.

Beginning:
The family members are already present
in the festive environment.

They gently move into a comfortable
hero composition.

Middle:
They naturally turn slightly toward the camera.

They respectfully join their hands in namaste
near the Ganesh celebration.

Include flowers and a traditional modak offering
as subtle festive elements.

Keep the religious setting respectful.

Do not make exaggerated religious gestures.

Do not alter or animate the deity
in an inappropriate way.

Final moment:
The available family members naturally gather
into a warm Festive Squad pose.

They smile gently toward the camera.

The final frame should feel like a premium
family festival advertisement.

Festival:
${festivalName}
`;

    case "raksha-bandhan":
      return `
Create an elegant cinematic Raksha Bandhan family celebration.

${sharedRules}

Scene:
A warm premium Indian home decorated with
marigold flowers,
subtle rangoli,
warm diyas,
golden festive lighting
and a traditional rakhi thali.

Beginning:
The available family members gently enter
or settle into the festive scene together.

Middle:
Show a warm natural family interaction
around the decorated rakhi thali
and festive sweets.

Do not assume specific relationships such as
brother,
sister,
husband,
wife,
mother
or father.

The interaction must remain suitable
for any combination of family members.

Use gentle smiles,
natural eye contact,
small hand movements
and a warm celebratory atmosphere.

Final moment:
All available family members
turn toward the camera.

They form a warm coordinated
Festive Squad pose.

Festival:
${festivalName}
`;

    case "janmashtami":
      return `
Create an elegant cinematic Janmashtami family celebration.

${sharedRules}

Scene:
A beautiful Indian Janmashtami setting
with blue and gold festive lighting,
flower garlands,
traditional decorations,
subtle peacock-inspired details
and warm diyas.

Beginning:
The family members appear naturally
in the decorated festive environment.

Middle:
They gently move together.

Show a respectful devotional festive moment
with joined hands
or a graceful celebratory pose.

Keep all religious imagery
tasteful and respectful.

Do not transform the people
into religious figures.

Do not alter their clothing.

Final moment:
The available members gather naturally
into a joyful family squad composition.

They look toward the camera.

Festival:
${festivalName}
`;

    case "navratri":
      return `
Create an energetic but elegant
cinematic Navratri family celebration.

${sharedRules}

Scene:
A premium Indian Navratri courtyard
decorated with colourful lights,
festive fabric,
traditional garba decorations
and warm golden lighting.

Beginning:
The available family members appear together
in their exact festive outfits.

Middle:
They perform very simple,
graceful and natural
garba-inspired movements.

If there is only one person,
make the movement work naturally
as a solo festive moment.

If there are multiple people,
use gentle coordinated group movement.

Avoid fast or complicated choreography.

Keep faces stable.

Keep clothing consistent.

Final moment:
Everyone naturally forms
a joyful Festive Squad pose
toward the camera.

Festival:
${festivalName}
`;

    case "diwali":
      return `
Create an elegant cinematic Diwali family celebration.

${sharedRules}

Scene:
A luxurious Indian festive courtyard
with rows of glowing diyas,
golden lights,
marigold decorations,
subtle rangoli
and warm royal evening lighting.

Beginning:
The available family members appear naturally
inside the illuminated Diwali setting.

Middle:
Show gentle festive movement,
natural smiles
and a warm family celebration.

A diya or decorative light may appear
as part of the environment.

Avoid unsafe fire interaction
or exaggerated actions.

Keep the focus on the people,
their outfits
and the emotional family moment.

Final moment:
All available family members gather
into a beautiful coordinated
Festive Squad pose
facing the camera.

Festival:
${festivalName}
`;

    default:
      return `
Create a premium cinematic
Indian family festival video.

${sharedRules}

Festival:
${festivalName}

Use a beautiful traditional
Indian festive environment
appropriate for ${festivalName}.

Show the available family members
moving naturally,
smiling gently
and finishing together
in a polished Festive Squad hero pose.
`;
  }
}

/*
 * ============================================================
 * OPENAI API KEY
 * ============================================================
 */

function getOpenAIKey() {
  const apiKey =
    process.env["OPENAI_API_KEY"]?.trim();

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to .env.local and restart the dev server.",
    );
  }

  return apiKey;
}

/*
 * ============================================================
 * READ API ERROR
 * ============================================================
 */

async function readApiError(
  response: Response,
) {
  const text =
    await response.text();

  try {
    const payload =
      JSON.parse(text) as {
        error?: {
          message?: string;
        };
      };

    return (
      payload.error?.message ??
      text
    );
  } catch {
    return text;
  }
}

/*
 * ============================================================
 * CONVERT IMAGE DATA URL TO BLOB
 * ============================================================
 */

function dataUrlToImageBlob(
  dataUrl: string,
) {
  const match =
    dataUrl.match(
      /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i,
    );

  if (!match) {
    throw new Error(
      "Squad reference image format is invalid.",
    );
  }

  /*
   * These checks are important because this project
   * has strict TypeScript settings enabled.
   */

  const rawMimeType =
    match[1];

  const base64Data =
    match[2];

  if (
    !rawMimeType ||
    !base64Data
  ) {
    throw new Error(
      "Squad reference image data is incomplete.",
    );
  }

  const loweredMimeType =
    rawMimeType.toLowerCase();

  const mimeType =
    loweredMimeType ===
    "image/jpg"
      ? "image/jpeg"
      : loweredMimeType;

  const binary =
    atob(base64Data);

  const bytes =
    new Uint8Array(
      binary.length,
    );

  for (
    let index = 0;
    index < binary.length;
    index += 1
  ) {
    bytes[index] =
      binary.charCodeAt(
        index,
      );
  }

  const blob =
    new Blob(
      [bytes],
      {
        type: mimeType,
      },
    );

  return {
    blob,
    mimeType,
  };
}

/*
 * ============================================================
 * CREATE AI VIDEO
 * ============================================================
 */

async function createVideo(
  apiKey: string,
  prompt: string,
  referenceImageDataUrl: string,
  seconds: "4" | "8" | "12",
) {
  const {
    blob,
    mimeType,
  } =
    dataUrlToImageBlob(
      referenceImageDataUrl,
    );

  let extension =
    "jpg";

  if (
    mimeType ===
    "image/png"
  ) {
    extension =
      "png";
  }

  if (
    mimeType ===
    "image/webp"
  ) {
    extension =
      "webp";
  }

  const formData =
    new FormData();

  formData.append(
    "model",
    "sora-2",
  );

  formData.append(
    "prompt",
    prompt,
  );

  formData.append(
    "seconds",
    seconds,
  );

  formData.append(
    "size",
    "720x1280",
  );

  formData.append(
    "input_reference",
    blob,
    `festive-squad-reference.${extension}`,
  );

  const response =
    await fetch(
      OPENAI_VIDEO_URL,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,
        },

        /*
         * DO NOT manually add Content-Type.
         * fetch creates the multipart boundary.
         */

        body: formData,
      },
    );

  if (!response.ok) {
    const message =
      await readApiError(
        response,
      );

    throw new Error(
      `AI video creation failed (${response.status}): ${message}`,
    );
  }

  return (
    await response.json()
  ) as OpenAIVideoJob;
}

/*
 * ============================================================
 * GET VIDEO STATUS
 * ============================================================
 */

async function getVideoStatus(
  apiKey: string,
  videoId: string,
) {
  const response =
    await fetch(
      `${OPENAI_VIDEO_URL}/${encodeURIComponent(
        videoId,
      )}`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,
        },
      },
    );

  if (!response.ok) {
    const message =
      await readApiError(
        response,
      );

    throw new Error(
      `Video status check failed (${response.status}): ${message}`,
    );
  }

  return (
    await response.json()
  ) as OpenAIVideoJob;
}

/*
 * ============================================================
 * DOWNLOAD COMPLETED VIDEO
 * ============================================================
 */

async function downloadVideo(
  apiKey: string,
  videoId: string,
) {
  const response =
    await fetch(
      `${OPENAI_VIDEO_URL}/${encodeURIComponent(
        videoId,
      )}/content`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,
        },
      },
    );

  if (!response.ok) {
    const message =
      await readApiError(
        response,
      );

    throw new Error(
      `Video download failed (${response.status}): ${message}`,
    );
  }

  const bytes =
    await response.arrayBuffer();

  return new Response(
    bytes,
    {
      status: 200,

      headers: {
        "Content-Type":
          response.headers.get(
            "Content-Type",
          ) ??
          "video/mp4",

        "Content-Disposition":
          `inline; filename="festive-ready-reel-${videoId}.mp4"`,

        "Cache-Control":
          "no-store",
      },
    },
  );
}

/*
 * ============================================================
 * TANSTACK ROUTE
 * ============================================================
 */

export const Route =
  createFileRoute(
    "/api/generate-festive-reel",
  )({
    server: {
      handlers: {
        /*
         * =====================================================
         * POST
         * Start an AI video generation job.
         * =====================================================
         */

        POST: async ({
          request,
        }) => {
          try {
            const apiKey =
              getOpenAIKey();

            const body =
              (await request.json()) as CreateReelBody;

            const festivalId =
              body.festivalId?.trim();

            const festivalName =
              body.festivalName?.trim();

            const rawMemberCount =
              Number(
                body.memberCount ??
                  1,
              );

            const memberCount =
              Math.max(
                1,
                Math.min(
                  4,
                  Number.isFinite(
                    rawMemberCount,
                  )
                    ? rawMemberCount
                    : 1,
                ),
              );

            const referenceImageDataUrl =
              body.referenceImageDataUrl;

            const seconds =
              body.seconds ??
              "8";

            if (!festivalId) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Festival ID is missing.",
                },
                {
                  status: 400,
                },
              );
            }

            if (!festivalName) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Festival name is missing.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              !referenceImageDataUrl
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Squad reference image is missing.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              !referenceImageDataUrl.startsWith(
                "data:image/",
              )
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Squad reference must be an image data URL.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              referenceImageDataUrl.length >
              MAX_REFERENCE_LENGTH
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Squad reference image is too large.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              seconds !== "4" &&
              seconds !== "8" &&
              seconds !== "12"
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Video duration must be 4, 8 or 12 seconds.",
                },
                {
                  status: 400,
                },
              );
            }

            const prompt =
              buildFestivalPrompt(
                festivalId,
                festivalName,
                memberCount,
              );

            console.log(
              `Festive Reel: starting ${festivalName} video for ${memberCount} member(s)...`,
            );

            const video =
              await createVideo(
                apiKey,
                prompt,
                referenceImageDataUrl,
                seconds,
              );

            if (!video.id) {
              throw new Error(
                "OpenAI did not return a video ID.",
              );
            }

            console.log(
              `Festive Reel: job created ${video.id}`,
            );

            return Response.json({
              success: true,

              videoId:
                video.id,

              status:
                video.status ??
                "queued",

              progress:
                video.progress ??
                0,
            });
          } catch (error) {
            console.error(
              "Festive Reel create error:",
              error,
            );

            const message =
              error instanceof Error
                ? error.message
                : "Unknown AI video error";

            return Response.json(
              {
                success: false,
                error: message,
              },
              {
                status: 502,
              },
            );
          }
        },

        /*
         * =====================================================
         * GET
         *
         * ?videoId=...
         * checks status.
         *
         * ?videoId=...&download=1
         * downloads completed MP4.
         * =====================================================
         */

        GET: async ({
          request,
        }) => {
          try {
            const apiKey =
              getOpenAIKey();

            const url =
              new URL(
                request.url,
              );

            const videoId =
              url.searchParams
                .get(
                  "videoId",
                )
                ?.trim();

            const shouldDownload =
              url.searchParams.get(
                "download",
              ) === "1";

            if (!videoId) {
              return Response.json(
                {
                  success: false,
                  error:
                    "videoId is missing.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              shouldDownload
            ) {
              return await downloadVideo(
                apiKey,
                videoId,
              );
            }

            const video =
              await getVideoStatus(
                apiKey,
                videoId,
              );

            return Response.json({
              success: true,

              videoId:
                video.id ??
                videoId,

              status:
                video.status ??
                "queued",

              progress:
                video.progress ??
                0,

              error:
                video.error ??
                null,

              ready:
                video.status ===
                "completed",

              failed:
                video.status ===
                "failed",

              downloadUrl:
                video.status ===
                "completed"
                  ? `/api/generate-festive-reel?videoId=${encodeURIComponent(
                      videoId,
                    )}&download=1`
                  : null,
            });
          } catch (error) {
            console.error(
              "Festive Reel status error:",
              error,
            );

            const message =
              error instanceof Error
                ? error.message
                : "Unknown AI video error";

            return Response.json(
              {
                success: false,
                error: message,
              },
              {
                status: 502,
              },
            );
          }
        },
      },
    },
  }); 