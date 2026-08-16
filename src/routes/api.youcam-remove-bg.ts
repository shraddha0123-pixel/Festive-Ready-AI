import { createFileRoute } from "@tanstack/react-router";

const YOUCAM_BASE_URL =
  "https://yce-api-01.makeupar.com";

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

function getContentType(file: File) {
  const type = file.type.toLowerCase();

  if (
    type === "image/jpeg" ||
    type === "image/jpg"
  ) {
    return "image/jpg";
  }

  if (type === "image/png") {
    return "image/png";
  }

  throw new Error(
    "Please upload a JPG or PNG image.",
  );
}

function wait(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

function findResultUrl(
  payload: any,
): string | undefined {
  const data = payload?.data;

  const candidates = [
    data?.results?.url,
    data?.result?.url,
    data?.results?.[0]?.url,
    data?.result?.[0]?.url,
    data?.url,
    data?.dst_url,
    data?.results?.[0]?.dst_url,
  ];

  return candidates.find(
    (value) =>
      typeof value === "string" &&
      value.length > 0,
  );
}

async function uploadPhoto(
  file: File,
  apiKey: string,
) {
  const contentType =
    getContentType(file);

  const response = await fetch(
    `${YOUCAM_BASE_URL}/s2s/v2.0/file/sod`,
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
              "standing-photo.jpg",

            file_size:
              file.size,
          },
        ],
      }),
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Background upload failed (${response.status}): ${text}`,
    );
  }

  const payload =
    JSON.parse(
      text,
    ) as FileApiResponse;

  const uploaded =
    payload.data?.files?.[0];

  if (!uploaded?.file_id) {
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

  if (!uploadRequest?.url) {
    throw new Error(
      "YouCam did not return an upload URL.",
    );
  }

  const headers =
    new Headers();

  Object.entries(
    uploadRequest.headers ?? {},
  ).forEach(
    ([key, value]) => {
      headers.set(
        key,
        String(value),
      );
    },
  );

  if (
    !headers.has("Content-Type")
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

        body:
          await file.arrayBuffer(),
      },
    );

  if (!uploadResponse.ok) {
    throw new Error(
      `Image transfer failed (${uploadResponse.status}).`,
    );
  }

  return uploaded.file_id;
}

async function startRemoval(
  fileId: string,
  apiKey: string,
) {
  const response = await fetch(
    `${YOUCAM_BASE_URL}/s2s/v2.0/task/sod`,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${apiKey}`,
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        src_file_id: fileId,
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

  const payload =
    JSON.parse(
      text,
    ) as TaskCreateResponse;

  const taskId =
    payload.data?.task_id;

  if (!taskId) {
    throw new Error(
      "YouCam did not return a background-removal task ID.",
    );
  }

  return taskId;
}

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

    const payload =
      JSON.parse(text);

    const status =
      String(
        payload?.data
          ?.task_status ?? "",
      ).toLowerCase();

    if (status === "success") {
      const url =
        findResultUrl(payload);

      if (!url) {
        throw new Error(
          "Background removal finished but no result image was returned.",
        );
      }

      return url;
    }

    if (
      status === "error" ||
      status === "failed" ||
      status === "failure"
    ) {
      throw new Error(
        `YouCam background removal error: ${JSON.stringify(
          payload?.data?.error ??
            payload?.data,
        )}`,
      );
    }
  }

  throw new Error(
    "Background removal took too long.",
  );
}

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

            if (
              !(person instanceof File)
            ) {
              return Response.json(
                {
                  error:
                    "Standing photo was not received.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              person.size >
              10 * 1024 * 1024
            ) {
              return Response.json(
                {
                  error:
                    "Photo must be under 10 MB.",
                },
                {
                  status: 400,
                },
              );
            }

            console.log(
              "YouCam: uploading photo for background removal...",
            );

            const fileId =
              await uploadPhoto(
                person,
                apiKey,
              );

            console.log(
              "YouCam: removing background...",
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
              "YouCam: background removed.",
            );

            return Response.json({
              success: true,
              url,
            });
          } catch (error) {
            console.error(
              "Background removal error:",
              error,
            );

            return Response.json(
              {
                success: false,

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