import { http as request } from "@/utils/http";
import { apiV1 } from "@/config/api";

export function get_molfact_ref_lig(smiles_id) {
  return request.get("/api/jobs/simple_job/molfact_ref_lig?smiles_id=" + smiles_id);
}
// 获取对接参考配体
export function get_vir_molfact_ref_lig(job_id) {
  return request.get(`/api/vs/ref_lig?job_id=${job_id}`);
}
export function admet_dl_detail(params) {
  return request.post("/api/jobs/simple_job/admet_pre", params);
}
export function admet_fh_detail(params) {
  return request.post("/api/jobs/simple_job/admet_fh", params);
}
export function admet_sa_detail(params) {
  return request.post("/api/jobs/simple_job/admet_sa", params);
}
export function get_docked_pdb_api(smiles_id, need_smiles = false) {
  if (need_smiles) {
    return request.get("/api/jobs/simple_job/docking_result?need_smiles=true&smiles_id=" + smiles_id);
  } else {
    return request.get("/api/jobs/simple_job/docking_result?smiles_id=" + smiles_id);
  }
}
export function get_docked_lig_api(smiles_id) {
  return request.get("/api/jobs/simple_job/docking_lig?smiles_id=" + smiles_id);
}
export function get_ori_pdb_api(smiles_id) {
  return request.get("/api/jobs/simple_job/molfact_ref_lig?smiles_id=" + smiles_id);
}
export function get_smiles_detail(job_id, params) {
  return request.post("/api/jobs/" + job_id + "/result/molgen_pipeline/smiles_detail", params);
}
export function save_data(params) {
  return request.post("api/workspace/module_save", params);
}
export function download_data(job_id, params) {
  return request.post("/api/jobs/" + job_id + "/result/molgen_pipeline/download", params);
}

export function get_interaction_iframe_api(data) {
  const { args, file } = data;
  return request.post(
    `${apiV1}/protein/interaction/upload?args=${args}`,
    { data: file },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}
