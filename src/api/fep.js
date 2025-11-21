import { http as request } from "@/utils/http";
import { apiV1 } from "@/config/api";
import { ossBucket as bucket } from "@/config/api";
import { useTaskStoreHook } from "@/store/modules/task";

const taskStore = useTaskStoreHook();

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
  data.append("task_id", taskStore.taskId);
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

export function ligandUpload(data) {
  data.append("task_id", taskStore.taskId);
  data.append("key", "uploaded_ligands");
  return request.post(
    `${apiV1}/ligand/parse/upload`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}

export function svgdraw(data) {
  return request.post(`${apiV1}/ligand/svgdraw`, { data });
}
export function getPerturbationGraphData(data) {
  return request.post(`${apiV1}/ligand/perturbation-graph`, { data });
}
export function removeLigand(data) {
  return request.post(`${apiV1}/ligand/remove-molecules`, { data: { ...data, task_id: taskStore.taskId } });
}

// mock
export function refresh_task() {
  return request.get(`/api/jobs/15337/args`);
}

export function selectLigandExample(data) {
  return request.post(`${apiV1}/ligand/select-example`, { data });
}
export function initTask() {
  return request.post(`${apiV1}/task/init`);
}
export function getLigandFromProtein(data) {
  return request.post(
    `${apiV1}/ligand/extract-from-protein`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}
export function validateProtein(data) {
  return request.post(
    `${apiV1}/protein/validate`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}
export function alignLigand(data) {
  return request.post(
    `${apiV1}/ligand/align`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}

export function appendMolecules(data) {
  return request.post(
    `${apiV1}/ligand/append-molecules`,
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}
export function prepareLigand(data) {
  return request.post(`${apiV1}/ligand/prepare`, { data });
}
// 提交计算任务
export function submitTask(data) {
  return request.post(`${apiV1}/cal-analysis/run-calculate`, { data });
}
