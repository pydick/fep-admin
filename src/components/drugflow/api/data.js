import { http as request } from "@/utils/http";

export function create_new_space(params) {
  return request.post("/api/workspace/create", params);
}

export function get_space() {
  return request.get("/api/workspace/list");
}

export function rename(params) {
  return request.post("/api/workspace/rename", params);
}

export function set_default(params) {
  return request.post("/api/workspace/set_default", params);
}

export function delete_space(ws_id) {
  return request.delete("/api/workspace/delete?ws_id=" + ws_id);
}

export function upload(params) {
  return request.post("/api/dataset/upload", params);
}

export function ds_duplicate(id, name) {
  return request.get(`/api/workspace/ds_duplicate?ws_id=${id}&name=${name}`);
}

export function datalists(id, filter = "all") {
  return request.get(`/api/workspace/datalists?ws_id=${id}&filter=${filter}`);
}
export function pdb_datalists(id) {
  return request.get(`/api/workspace/pdb_datalists?dataset_id=${id}`);
}
export function pdb_ctx(file_path) {
  return request.get(`/api/workspace/pdb_ctx?file_path=${file_path}`);
}
export function download_data(params) {
  return request.post("api/workspace/dowload", params);
}
export function module_save(params) {
  return request.post("api/workspace/module_save", params);
}
export function jobs_migrate(params) {
  return request.post("api/workspace/jobs_migrate", params);
}
export function examples(module) {
  return request.get(`/api/workspace/examples?module=${module}`);
}
export function databases() {
  return request.get("/api/vs/databases");
}

export function check_pdb_api(params) {
  return request.post("api/toolkits/protein/protein_check", params);
}
//蛋白预处理
export function get_pdb_url(file_path) {
  return request.get(`/api/workspace/pdb_url?file_path=${file_path}`);
}

export function basic_info(params) {
  return request.post("/api/toolkits/protein/get_basic_info", params);
}

export function delete_components_api(params) {
  return request.post("/api/toolkits/protein/delete_components", params);
}

export function find_residue_error_api(params) {
  return request.post("/api/toolkits/protein/find_residue_error", params);
}

export function fix_residue_error_api(params) {
  return request.post("/api/toolkits/protein/fix_residue_error", params);
}

export function find_residue_missing_api(params) {
  return request.post("/api/toolkits/protein/find_residue_missing", params);
}

export function fix_residue_missing_api(params) {
  return request.post("/api/toolkits/protein/fix_residue_missing", params);
}

export function get_disul_api(params) {
  return request.post("/api/toolkits/protein/get_disul", params);
}

export function get_url_data(params) {
  return request.get(params);
}

export function jobs_api(params) {
  return request.post("/api/jobs", params);
}
export function ds_rename(params) {
  return request.post("/api/workspace/ds_rename", params);
}
export function dataset_content(id, page = 1, page_size = 50, order = "") {
  const url = "/api/dataset/" + id + "/content" + "?page=" + page + "&page_size=" + page_size + order;
  return request.get(url);
}
export function get_feedback(params) {
  return request.post("/api/feedback", params);
}
export function presign_url(name) {
  return request.get("/api/workspace/presign_url?filename=" + name);
}
export function create_oss(params) {
  return request.post("api/dataset/create_oss", params);
}
export function save_file(url, file) {
  return request.put(url, file);
}

export function download_extraction({ name, job_id, action, file_type, tab, table_uuid }) {
  const file_name = name + "." + file_type;
  let _action = action ? action : "";
  let url = `/download/img2mol/${job_id}?action=${_action}&file_type=${file_type}`;
  if (tab) {
    url += `&tab=${tab}`;
  }
  if (tab) {
    url += `&table_uuid=${table_uuid}`;
  }
  if (file_type === "zip") {
    url = `/download/img2mol/${job_id}/zip?action=${_action}`;
  }
  console.log("download_extraction url", url);
  // console.log(url)
  const downloadElement = document.createElement("a");
  const href = url;
  downloadElement.href = href;
  downloadElement.download = file_name;
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
}
