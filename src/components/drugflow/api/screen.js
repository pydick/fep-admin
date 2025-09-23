import { http as request } from "@/utils/http";
export function screen_task(params) {
  return request.post("/api/jobs", params);
}
//
export function screen_get(ws_id, type = "all", state = "finished", page = 1, page_size = 20) {
  let id_query = "?";
  let type_query = "";
  let state_query = "";
  if (ws_id) {
    id_query = "?ws_id=" + ws_id;
  }
  if (type !== "all") {
    type_query = "&type=" + type;
  }
  if (state === "finished") {
    state_query = "&state=finished&state=aborted";
  } else if (state === "o_finished") {
    state_query = "&state=finished";
  } else if (state === "running") {
    state_query = "&state=pending&state=running&state=preparing&state=stopped";
  } else if (state === "all") {
    state_query = "&state=pending&state=running&state=preparing&state=stopped&state=finished&state=aborted";
  }
  return request.get("/api/jobs" + id_query + type_query + state_query + "&page=" + page + "&page_size=" + page_size);
}

export function screen_get_job(id) {
  return request.get("/api/jobs/" + id);
}

export function screen_get_pdb(task_id, ligand_id) {
  return request.get("/api/jobs/" + task_id + "/results/" + ligand_id + ".pdb");
}

export function screen_get_ori_pdb(task_id) {
  return request.get("/api/jobs/" + task_id + "/ref_ligand");
}

export function screen_result(id, page = 1, page_size = 20) {
  return request.get("/api/jobs/" + id + "/results?page=" + page + "&page_size=" + page_size);
}

export function ws_test() {
  const bear = "Bearer " + JSON.parse(localStorage.getItem("cs_TOKEN"));
  return request.get("/ws/subscribe/" + bear);
}

export function residues_missing(params) {
  return request.post("/api/toolkits/docking/residues_missing", params);
}
