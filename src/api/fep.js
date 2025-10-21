import { http as request } from "@/utils/http";
import { apiV1 } from "@/config/api";

export function ossPostDownload(data) {
  return request.post(`${apiV1}/oss/download`, { data });
}

export function ossUpload(data) {
  return request.post(
    `${apiV1}/oss/upload`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}

export function ossGetDownload(params) {
  return request.get(`${apiV1}/oss/download`, { params });
}

export function ossList(params) {
  return request.get(`${apiV1}/oss/list`, { params });
}

export async function fetchFileAsBlob(url) {
  const res = await request.get(url, { params: { responseType: "blob" } });
  return res;
}
