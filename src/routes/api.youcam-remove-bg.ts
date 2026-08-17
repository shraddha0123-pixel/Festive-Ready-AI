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
  data?: {
    files?: Array<{
      file_id?: string;
      requests?: UploadRequest[];
    }>;
  };
};

type TaskCreateResponse = {
  data?: {
    task_id?: string;
  };
};

function normaliseContentType(
  type: string,
) {
  const lowered =
    type.toLowerCase();

  if (
    lowered === "image/jpeg" ||
    lowered === "image/jpg"
  ) {
    return "image/jpg";
  }

  if (
    lowered === "image/png"
  ) {
    return "image/png";
  }

  throw new Error(
    "Background removal supports JPG or PNG images.",
  );
}

function wait(ms: number) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms,
      ),
  );
}

function findResultUrl(
  payload: unknown,
): string | undefined {
  const data =
    (
      payload as {
        data?: any;
      }
    )?.data;

  const candidates = [
    data?.results?.url,
    data?.result?.url,
    data?.results?.[0]?.url,
    data?.result?.[0]?.url,
    data?.url,
    data?.dst_url,
    data?.results?.[0]
      ?.dst_url,
  ];

  return candidates.find(
    (value) =>
      typeof value ===
        "string" &&
      value.length > 0,
  );
}

/*
 * ============================================================
 * DOWNLOAD FINALIZED VTO IMAGE
 * ============================================================
 */

async function downloadImageFromUrl(
  imageUrl: string,
) {
  let parsedUrl: URL;

  try {
    parsedUrl =
      new URL(imageUrl);
  } catch {
    throw new Error(
      "Finalized image URL is invalid.",
    );
  }

  if (
    parsedUrl.protocol !==
      "https:" &&
    parsedUrl.protocol !==
      "http:"
  ) {
    throw new Error(
      "Finalized image URL is not supported.",
    );
  }

  const response =
    await fetch(
      imageUrl,
    );

  if (!response.ok) {
    throw new Error(
      `Could not download finalized image (${response.status}).`,
    );
  }

  const contentType =
    normaliseContentType(
      response.headers.get(
        "content-type",
      ) ??
        "image/jpeg",
    );

  const bytes =
    await response.arrayBuffer();

  if (
    bytes.byteLength <= 0
  ) {
    throw new Error(
      "Finalized image is empty.",
    );
  }

  if (
    bytes.byteLength >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "Finalized image must be under 10 MB.",
    );
  }

  return {
    bytes,
    contentType,
    fileName:
      contentType ===
      "image/png"
        ? "finalized-look.png"
        : "finalized-look.jpg",
  };
}

/*
 * ============================================================
 * UPLOAD TO YOUCAM
 * ============================================================
 */

async function uploadPhoto(
  bytes: ArrayBuffer,
  contentType: string,
  fileName: string,
  apiKey: string,
) {
  const response =
    await fetch(
      `${YOUCAM_BASE_URL}/s2s/v2.0/file/sod`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            files: [
              {
                content_type:
                  contentType,

                file_name:
                  fileName,

                file_size:
                  bytes.byteLength,
              },
            ],
          }),
      },
    );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Background upload failed (${response.status}): ${text}`,
    );
  }

  let payload:
    FileApiResponse;

  try {
    payload =
      JSON.parse(
        text,
      ) as FileApiResponse;
  } catch {
    throw new Error(
      "YouCam background upload returned invalid JSON.",
    );
  }

  const uploaded =
    payload.data
      ?.files?.[0];

  if (
    !uploaded?.file_id
  ) {
    throw new Error(
      "YouCam did not return a file ID.",
    );
  }

  const uploadRequest =
    uploaded.requests?.find(
      (request) =>
        request.method?.toUpperCase() ===
        "PUT",
    ) ??
    uploaded.requests?.[0];

  if (
    !uploadRequest?.url
  ) {
    throw new Error(
      "YouCam did not return an upload URL.",
    );
  }

  const headers =
    new Headers();

  for (
    const [
      key,
      value,
    ] of Object.entries(
      uploadRequest.headers ??
        {},
    )
  ) {
    headers.set(
      key,
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

  const uploadResponse =
    await fetch(
      uploadRequest.url,
      {
        method:
          uploadRequest.method ??
          "PUT",

        headers,

        body: bytes,
      },
    );

  if (
    !uploadResponse.ok
  ) {
    const uploadError =
      await uploadResponse.text();

    throw new Error(
      `Image transfer failed (${uploadResponse.status}): ${uploadError}`,
    );
  }

  return uploaded.file_id;
}

/*
 * ============================================================
 * START REMOVAL
 * ============================================================
 */

async function startRemoval(
  fileId: string,
  apiKey: string,
) {
  const response =
    await fetch(
      `${YOUCAM_BASE_URL}/s2s/v2.0/task/sod`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            src_file_id:
              fileId,
          }),
      },
    );

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Background removal failed (${response.status}): ${text}`,
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
      "YouCam background task returned invalid JSON.",
    );
  }

  const taskId =
    payload.data
      ?.task_id;

  if (!taskId) {
    throw new Error(
      "YouCam did not return a background-removal task ID.",
    );
  }

  return taskId;
}

/*
 * ============================================================
 * WAIT FOR RESULT
 * ============================================================
 */

async function waitForResult(
  taskId: string,
  apiKey: string,
) {
  for (
    let attempt = 0;
    attempt < 40;
    attempt += 1
  ) {
    await wait(1500);

    const response =
      await fetch(
        `${YOUCAM_BASE_URL}/s2s/v2.0/task/sod/${encodeURIComponent(
          taskId,
        )}`,
        {
          headers: {
            Authorization:
              `Bearer ${apiKey}`,
          },
        },
      );

    const text =
      await response.text();

    if (!response.ok) {
      throw new Error(
        `Background status failed (${response.status}): ${text}`,
      );
    }

    let payload: any;

    try {
      payload =
        JSON.parse(
          text,
        );
    } catch {
      throw new Error(
        "YouCam background status returned invalid JSON.",
      );
    }

    const status =
      String(
        payload?.data
          ?.task_status ??
          "",
      ).toLowerCase();

    if (
      status ===
      "success"
    ) {
      const url =
        findResultUrl(
          payload,
        );

      if (!url) {
        throw new Error(
          "Background removal finished but no result image was returned.",
        );
      }

      return url;
    }

    if (
      status === "error" ||
      status ===
        "failed" ||
      status ===
        "failure"
    ) {
      throw new Error(
        `YouCam background removal error: ${JSON.stringify(
          payload?.data
            ?.error ??
            payload?.data,
        )}`,
      );
    }
  }

  throw new Error(
    "Background removal took too long.",
  );
}

/*
 * ============================================================
 * ROUTE
 * ============================================================
 */

export const Route =
  createFileRoute(
    "/api/youcam-remove-bg",
  )({
    server: {
      handlers: {
        POST: async ({
          request,
        }) => {
          try {
            const apiKey =
              process.env[
                "YOUCAM_API_KEY"
              ]?.trim();

            if (!apiKey) {
              return Response.json(
                {
                  success:
                    false,

                  error:
                    "YOUCAM_API_KEY is missing.",
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

            const personUrlValue =
              formData.get(
                "personUrl",
              );

            const personUrl =
              typeof personUrlValue ===
              "string"
                ? personUrlValue.trim()
                : "";

            let bytes:
              ArrayBuffer;

            let contentType:
              string;

            let fileName:
              string;

            /*
             * ====================================================
             * OPTION 1:
             * Direct uploaded File
             * ====================================================
             */

            if (
              person instanceof
              File
            ) {
              if (
                person.size <=
                0
              ) {
                return Response.json(
                  {
                    success:
                      false,

                    error:
                      "Standing photo is empty.",
                  },
                  {
                    status:
                      400,
                  },
                );
              }

              if (
                person.size >
                MAX_FILE_SIZE
              ) {
                return Response.json(
                  {
                    success:
                      false,

                    error:
                      "Photo must be under 10 MB.",
                  },
                  {
                    status:
                      400,
                  },
                );
              }

              contentType =
                normaliseContentType(
                  person.type,
                );

              bytes =
                await person.arrayBuffer();

              fileName =
                person.name ||
                (contentType ===
                "image/png"
                  ? "standing-photo.png"
                  : "standing-photo.jpg");
            }

            /*
             * ====================================================
             * OPTION 2:
             * Existing finalized YouCam VTO URL
             * ====================================================
             */

            else if (
              personUrl
            ) {
              console.log(
                "YouCam BG: downloading finalized VTO image...",
              );

              const downloaded =
                await downloadImageFromUrl(
                  personUrl,
                );

              bytes =
                downloaded.bytes;

              contentType =
                downloaded.contentType;

              fileName =
                downloaded.fileName;
            }

            /*
             * ====================================================
             * NOTHING RECEIVED
             * ====================================================
             */

            else {
              return Response.json(
                {
                  success:
                    false,

                  error:
                    "No person image was received.",
                },
                {
                  status: 400,
                },
              );
            }

            console.log(
              "YouCam BG: uploading person image...",
            );

            const fileId =
              await uploadPhoto(
                bytes,
                contentType,
                fileName,
                apiKey,
              );

            console.log(
              "YouCam BG: starting background removal...",
            );

            const taskId =
              await startRemoval(
                fileId,
                apiKey,
              );

            const url =
              await waitForResult(
                taskId,
                apiKey,
              );

            console.log(
              "YouCam BG: transparent cutout ready.",
            );

            return Response.json({
              success: true,
              taskId,
              url,
            });
          } catch (error) {
            console.error(
              "Background removal error:",
              error,
            );

            return Response.json(
              {
                success:
                  false,

                error:
                  error instanceof
                  Error
                    ? error.message
                    : "Background removal failed.",
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