import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createFileRoute } from "@tanstack/react-router";

const YOUCAM_BASE_URL =
  "https://yce-api-01.makeupar.com";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

type UploadRequest = {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
};

type FileApiResponse = {
  status?: number;

  data?: {
    files?: Array<{
      file_id?: string;
      requests?: UploadRequest[];
    }>;
  };
};

type TaskCreateResponse = {
  status?: number;

  data?: {
    task_id?: string;
  };
};

type TaskResultResponse = {
  status?: number;

  data?: {
    task_status?: string;
    error?: unknown;

    results?: {
      url?: string;
    };
  };
};

function normaliseContentType(
  file: File,
) {
  const type =
    file.type.toLowerCase();

  if (
    type === "image/jpeg" ||
    type === "image/jpg"
  ) {
    return "image/jpg";
  }

  if (
    type === "image/png"
  ) {
    return "image/png";
  }

  throw new Error(
    "Only JPG and PNG images are supported.",
  );
}

function validateImage(
  file: File,
  label: string,
) {
  if (file.size <= 0) {
    throw new Error(
      `${label} image is empty.`,
    );
  }

  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      `${label} image must be under 10 MB.`,
    );
  }

  normaliseContentType(file);
}

function readableError(
  value: unknown,
) {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  try {
    return JSON.stringify(
      value,
    );
  } catch {
    return "Unknown YouCam error";
  }
}

async function uploadFileToYouCam(
  file: File,
  apiKey: string,
): Promise<string> {
  const contentType =
    normaliseContentType(
      file,
    );

  const createResponse =
    await fetch(
      `${YOUCAM_BASE_URL}/s2s/v2.0/file/cloth-v3`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          files: [
            {
              content_type:
                contentType,

              file_name:
                file.name ||
                "image.jpg",

              file_size:
                file.size,
            },
          ],
        }),
      },
    );

  const createText =
    await createResponse.text();

  if (
    !createResponse.ok
  ) {
    throw new Error(
      `YouCam File API failed (${createResponse.status}): ${createText}`,
    );
  }

  let createPayload:
    FileApiResponse;

  try {
    createPayload =
      JSON.parse(
        createText,
      ) as FileApiResponse;
  } catch {
    throw new Error(
      "YouCam File API returned invalid JSON.",
    );
  }

  const uploadedFile =
    createPayload.data
      ?.files?.[0];

  if (
    !uploadedFile?.file_id
  ) {
    throw new Error(
      "YouCam did not return a file_id.",
    );
  }

  const uploadRequest =
    uploadedFile.requests?.find(
      (request) =>
        request.method?.toUpperCase() ===
        "PUT",
    ) ??
    uploadedFile.requests?.[0];

  if (
    !uploadRequest?.url
  ) {
    throw new Error(
      "YouCam did not return an image upload URL.",
    );
  }

  const headers =
    new Headers();

  for (
    const [
      name,
      value,
    ] of Object.entries(
      uploadRequest.headers ??
        {},
    )
  ) {
    headers.set(
      name,
      String(value),
    );
  }

  if (
    !headers.has(
      "Content-Type",
    )
  ) {
    headers.set(
      "Content-Type",
      contentType,
    );
  }

  const fileBytes =
    await file.arrayBuffer();

  const uploadResponse =
    await fetch(
      uploadRequest.url,
      {
        method:
          uploadRequest.method ??
          "PUT",

        headers,

        body: fileBytes,
      },
    );

  if (
    !uploadResponse.ok
  ) {
    const uploadError =
      await uploadResponse.text();

    throw new Error(
      `Image upload failed (${uploadResponse.status}): ${uploadError}`,
    );
  }

  return uploadedFile.file_id;
}

async function createTryOnTask(
  personFileId: string,
  outfitFileId: string,
  apiKey: string,
) {
  const response =
    await fetch(
      `${YOUCAM_BASE_URL}/s2s/v2.0/task/cloth-v3`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          src_file_id:
            personFileId,

          ref_file_id:
            outfitFileId,

          garment_category:
            "full_body",
        }),
      },
    );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `YouCam Try-On task failed (${response.status}): ${text}`,
    );
  }

  let payload:
    TaskCreateResponse;

  try {
    payload =
      JSON.parse(
        text,
      ) as TaskCreateResponse;
  } catch {
    throw new Error(
      "YouCam task creation returned invalid JSON.",
    );
  }

  const taskId =
    payload.data?.task_id;

  if (!taskId) {
    throw new Error(
      "YouCam did not return a task_id.",
    );
  }

  return taskId;
}

function wait(
  milliseconds: number,
) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds,
      ),
  );
}

async function waitForTryOnResult(
  taskId: string,
  apiKey: string,
) {
  for (
    let attempt = 0;
    attempt < 48;
    attempt += 1
  ) {
    await wait(2500);

    const response =
      await fetch(
        `${YOUCAM_BASE_URL}/s2s/v2.0/task/cloth-v3/${encodeURIComponent(
          taskId,
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",
          },
        },
      );

    const text =
      await response.text();

    if (!response.ok) {
      throw new Error(
        `YouCam task status failed (${response.status}): ${text}`,
      );
    }

    let payload:
      TaskResultResponse;

    try {
      payload =
        JSON.parse(
          text,
        ) as TaskResultResponse;
    } catch {
      throw new Error(
        "YouCam task status returned invalid JSON.",
      );
    }

    const status =
      payload.data
        ?.task_status
        ?.toLowerCase();

    if (
      status === "success"
    ) {
      const resultUrl =
        payload.data
          ?.results?.url;

      if (!resultUrl) {
        throw new Error(
          "YouCam completed the task but returned no result image.",
        );
      }

      return resultUrl;
    }

    if (
      status === "error" ||
      status === "failed" ||
      status === "failure"
    ) {
      throw new Error(
        `YouCam processing failed: ${readableError(
          payload.data?.error,
        )}`,
      );
    }
  }

  throw new Error(
    "YouCam is taking too long. Please try again.",
  );
}

/*
 * ============================================================
 * SAVE RESULT LOCALLY
 *
 * YouCam result URLs can later become unavailable.
 * We immediately copy the completed VTO image into:
 *
 * public/generated-vto/
 *
 * Then the app stores our stable local URL instead.
 * ============================================================
 */

async function saveTryOnResultLocally(
  resultUrl: string,
  taskId: string,
) {
  console.log(
    "YouCam: saving VTO result locally...",
  );

  const response =
    await fetch(resultUrl);

  if (!response.ok) {
    throw new Error(
      `Could not save completed VTO image (${response.status}).`,
    );
  }

  const contentType =
    response.headers
      .get("content-type")
      ?.toLowerCase() ?? "";

  const extension =
    contentType.includes("png")
      ? "png"
      : "jpg";

  const safeTaskId =
    taskId.replace(
      /[^a-zA-Z0-9_-]/g,
      "",
    );

  const fileName =
    `${safeTaskId}.${extension}`;

  const publicDirectory =
    path.join(
      process.cwd(),
      "public",
      "generated-vto",
    );

  await mkdir(
    publicDirectory,
    {
      recursive: true,
    },
  );

  const filePath =
    path.join(
      publicDirectory,
      fileName,
    );

  const bytes =
    Buffer.from(
      await response.arrayBuffer(),
    );

  if (
    bytes.length === 0
  ) {
    throw new Error(
      "Completed VTO image was empty.",
    );
  }

  await writeFile(
    filePath,
    bytes,
  );

  console.log(
    `YouCam: VTO saved locally as ${fileName}`,
  );

  return {
    fileName,
    relativeUrl:
      `/generated-vto/${fileName}`,
  };
}

export const Route =
  createFileRoute(
    "/api/youcam-tryon",
  )({
    server: {
      handlers: {
        POST: async ({
          request,
        }) => {
          try {
            /*
             * Secret stays server-side.
             */

            const apiKey =
              process.env[
                "YOUCAM_API_KEY"
              ]?.trim();

            if (!apiKey) {
              return Response.json(
                {
                  error:
                    "YOUCAM_API_KEY is missing. Check .env.local and restart the dev server.",
                },
                {
                  status: 500,
                },
              );
            }

            const formData =
              await request.formData();

            const person =
              formData.get(
                "person",
              );

            const outfit =
              formData.get(
                "outfit",
              );

            if (
              !(
                person instanceof
                File
              )
            ) {
              return Response.json(
                {
                  error:
                    "Standing person photo was not received.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              !(
                outfit instanceof
                File
              )
            ) {
              return Response.json(
                {
                  error:
                    "Outfit reference image was not received.",
                },
                {
                  status: 400,
                },
              );
            }

            validateImage(
              person,
              "Standing photo",
            );

            validateImage(
              outfit,
              "Outfit",
            );

            console.log(
              "YouCam: uploading person photo...",
            );

            const personFileId =
              await uploadFileToYouCam(
                person,
                apiKey,
              );

            console.log(
              "YouCam: uploading outfit...",
            );

            const outfitFileId =
              await uploadFileToYouCam(
                outfit,
                apiKey,
              );

            console.log(
              "YouCam: creating VTO task...",
            );

            const taskId =
              await createTryOnTask(
                personFileId,
                outfitFileId,
                apiKey,
              );

            console.log(
              `YouCam: task created ${taskId}`,
            );

            const resultUrl =
              await waitForTryOnResult(
                taskId,
                apiKey,
              );

            console.log(
              "YouCam: VTO completed.",
            );

            /*
             * IMPORTANT:
             * Copy the result immediately,
             * while the YouCam URL is still valid.
             */

            const saved =
              await saveTryOnResultLocally(
                resultUrl,
                taskId,
              );

            /*
             * Build URL using the same host
             * the user currently opened.
             */

            const requestUrl =
              new URL(
                request.url,
              );

            const stableUrl =
              `${requestUrl.origin}${saved.relativeUrl}`;

            console.log(
              `YouCam: stable VTO URL ${stableUrl}`,
            );

            return Response.json({
              success: true,

              taskId,

              /*
               * The frontend already expects "url".
               * So no frontend code change needed.
               */

              url: stableUrl,
            });
          } catch (error) {
            console.error(
              "YouCam VTO error:",
              error,
            );

            const message =
              error instanceof
              Error
                ? error.message
                : "Unknown YouCam error";

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