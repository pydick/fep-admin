import { http as request } from "@/utils/http";

function parse_value_filter_dict(filter_list) {
  const ret_dict = {};
  Object.keys(filter_list).map(key => {
    if (filter_list[key].length) {
      ret_dict[key + "__gt"] = filter_list[key][0];
      ret_dict[key + "__lt"] = filter_list[key][1];
    }
  });
  // for (let i = 0; i < filter_list.length; i++) {
  //   const column_name = filter_list[i].name
  //   ret_dict[column_name + '__gt'] = filter_list[i].min_max_list[0]
  //   ret_dict[column_name + '__lt'] = filter_list[i].min_max_list[1]
  // }
  return ret_dict;
}
function parse_id_filter_dict(id_list, algo_type) {
  const ret_dict = {};
  if (id_list.length > 0) {
    if (algo_type === "Docking") {
      const docking_id_list = [];
      const docking_pose_list = [];
      for (let i = 0; i < id_list.length; i++) {
        docking_id_list.push(parseInt(id_list[i].split("-")[0]));
        docking_pose_list.push(parseInt(id_list[i].split("-")[1]));
      }
      ret_dict._id__in = docking_id_list;
      ret_dict._pose__in = docking_pose_list;
    } else {
      ret_dict._id__in = id_list;
    }
  }
  return ret_dict;
}

export function get_vs_data(job_id, ws_id, page = 1, page_size = 20, action, query_parameters, order, residues__has_any_keys = []) {
  let url = "/api/vs/" + job_id + "/results?ws_id=" + ws_id + "&page=" + page + "&page_size=" + page_size;
  if (action) {
    url += "&action=" + action;
  }

  let ret_dict = {};
  if (query_parameters) {
    ret_dict = parse_value_filter_dict(query_parameters);
  }
  if (residues__has_any_keys.length > 0) {
    ret_dict["residues__has_any_keys"] = residues__has_any_keys;
  }
  if (query_parameters || residues__has_any_keys.length > 0) {
    url += "&properties=" + JSON.stringify(ret_dict);
  }

  if (order) {
    url += "&order=" + order;
  }
  return request.get(url);
}
export function get_agg_data(job_id, ws_id, page = 1, page_size = 20, action, query_parameters, order, residues__has_any_keys = []) {
  let url = "/api/vs/" + job_id + "/agg_results?ws_id=" + ws_id + "&page=" + page + "&page_size=" + page_size;
  if (action) {
    url += "&action=" + action;
  }

  let ret_dict = {};
  if (query_parameters) {
    ret_dict = parse_value_filter_dict(query_parameters);
  }
  if (residues__has_any_keys.length > 0) {
    ret_dict["residues__has_any_keys"] = residues__has_any_keys;
  }
  if (query_parameters || residues__has_any_keys.length > 0) {
    url += "&properties=" + JSON.stringify(ret_dict);
  }

  if (order) {
    url += "&order=" + order;
  }
  return request.get(url);
}
export function smiles_action(job_id, params) {
  return request.post("/api/vs/" + job_id + "/action", params);
}
export function specify_smiles(params) {
  return request.post("/api/vs/specify_smiles", params);
}
export function dock_lig(smiles_id) {
  return request.get("/api/vs/" + smiles_id + "/dock_lig");
}
export function ref_lig(job_id) {
  return request.get("/api/vs/" + job_id + "/ref_lig");
}
export function protein(job_id) {
  return request.get("/api/vs/" + job_id + "/protein");
}
export function docked_pdb_api(job_id, display_id, need_smiles = false) {
  if (need_smiles) {
    return request.get("/api/vs/docklig?job_id=" + job_id + "&display_id=" + display_id + "&need_smiles=true");
  }
  return request.get("/api/vs/docklig?job_id=" + job_id + "&display_id=" + display_id);
}
export function docked_lig_api(job_id) {
  return request.get("/api/vs/" + job_id + "/docklig");
}
export function ori_pdb_api(job_id) {
  return request.get("/api/vs/protein?job_id=" + job_id);
}

export function screen_get_ori_pdb(job_id) {
  return request.get("/api/vs/ref_lig?job_id=" + job_id);
}

export function download_data(job_id, name = "DrugFlow", type = "csv", action, query_parameters, raw_col_names = []) {
  const file_name = name + "." + type;
  const url = "/download/vs/" + job_id + "/" + type + "?action=" + action + "&properties=" + JSON.stringify(parse_value_filter_dict(query_parameters)) + "&raw_col_name=" + JSON.stringify(raw_col_names);

  console.log(url);
  const downloadElement = document.createElement("a");
  const href = url;
  downloadElement.href = href;
  downloadElement.download = file_name;
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
}
