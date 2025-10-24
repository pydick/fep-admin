import { http as request } from "@/utils/http";
import { apiV1 } from "@/config/api";
import { ossBucket } from "@/config/api";

export function ossPostDownload(data) {
  return request.post(`${apiV1}/oss/download`, { data });
}

export function ossUpload(data) {
  return request.post(
    `${apiV1}/oss/upload`,
    { bucket: ossBucket, ...data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}

export function ossGetDownload(params) {
  return request.get(`${apiV1}/oss/download`, { bucket: ossBucket, ...params });
}

export function ossList(params) {
  return request.get(`${apiV1}/oss/list`, { bucket: ossBucket, ...params });
}

export function proteinInfo(data) {
  return request.post(
    `${apiV1}/protein/info/upload`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}
export function checkProtein(data) {
  return request.post(
    `${apiV1}/protein/check/upload?verbose=true`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}

export async function fetchFileAsBlob(url) {
  const res = await request.get(url, { params: { responseType: "blob" } });
  return res;
}
