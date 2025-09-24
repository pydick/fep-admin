import { http as request } from "@/utils/http";
// import { vue_gtag_event } from '@/components/common/vue_gtag'

export function get_datalist_onload() {
  return request.get("/api/predictor/list?pagesize=-1");
}

export function api_delete_task(id, type = "running") {
  // vue_gtag_event(type + '_task_remove', 'remove task', '', 1)
  return request.get("/api/predictor/delete/" + id);
}

export function change_name_api(id, ws_id, param, url) {
  return request.patch("/api/" + url + "/" + id + "?ws_id=" + ws_id, param);
}

export function delete_jobs_api(id, ws_id) {
  return request.delete("/api/jobs/" + id + "?ws_id=" + ws_id);
}

export function stop_jobs_api(id, ws_id) {
  return request.post("/api/jobs/" + id + "/stop?ws_id=" + ws_id, { id });
}

export function start_jobs_api(id) {
  return request.post("/api/jobs/" + id + "/start", { id });
}

export function get_job_id_api() {
  return request.get("api/jobs/serial");
}
