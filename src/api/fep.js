import { http as request } from "@/utils/http";
import { apiV1 } from "@/config/api";
import { ossBucket as bucket } from "@/config/api";

export function ossPostDownload(data) {
  return request.post(`${apiV1}/oss/download`, { data });
}

export function ossUpload(data) {
  return request.post(
    `${apiV1}/oss/upload?bucket=${bucket}`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}

export function ossGetDownload(params) {
  return request.get(`${apiV1}/oss/download`, { params: { bucket, ...params } });
}

export function ossList(params) {
  return request.get(`${apiV1}/oss/list`, { params: { bucket, ...params } });
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

// 预处理,传参是记录删除
export function componentsDelete(data) {
  return request.post(
    `${apiV1}/protein/components/delete`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}
// 预处理,传参是记录删除
export function residueErrorFind(data) {
  return request.post(
    `${apiV1}/protein/residue-error/find`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}
export function residueErrorFix(data) {
  return request.post(
    `${apiV1}/protein/residue-error/fix`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}
export function residueMissingFind(data) {
  return request.post(
    `${apiV1}/protein/residue-missing/find`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}

export function residueMissingFix(data) {
  return request.post(
    `${apiV1}/protein/residue-missing/fix`,
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
