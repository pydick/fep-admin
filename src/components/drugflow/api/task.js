import { http as request } from "@/utils/http";
// import { vue_gtag_event } from "@/components/common/vue_gtag";

export function spectrum_task(params) {
  return request.post("/api/jobs", params);
}
export function submit_task(params) {
  return request.post("/api/jobs", params);
}

export function refresh_task(job_id) {
  return request.get(`/api/jobs/${job_id}/args`);
}
