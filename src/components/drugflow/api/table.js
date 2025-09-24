import { http as request } from "@/utils/http";

function parse_value_filter_dict(filter_list) {
  const ret_dict = {};
  for (let i = 0; i < filter_list.length; i++) {
    const column_name = filter_list[i].name;
    ret_dict[column_name + "__gt"] = filter_list[i].min_max_list[0];
    ret_dict[column_name + "__lt"] = filter_list[i].min_max_list[1];
  }
  return ret_dict;
}

function parse_invalue_filter_dict(filter_list) {
  const ret_dict = {};
  for (let i = 0; i < filter_list.length; i++) {
    const column_name = filter_list[i].name;
    ret_dict[column_name + "__in"] = filter_list[i].value_list;
  }
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

export function table_getdata({ id, page = 1, page_size = 20, favourite = false, order = "_blank", filter_list = [], filter_equal_list = [], show_unvalid = true, residues__has_any_keys = [] }) {
  let url;
  let show_unvalid_query_string;
  if (order !== "_blank") {
    url = "/api/jobs/" + id + "/results?page=" + page + "&page_size=" + page_size + "&order=" + order;
  } else {
    url = "/api/jobs/" + id + "/results?page=" + page + "&page_size=" + page_size;
  }
  if (show_unvalid) {
    show_unvalid_query_string = "";
  } else {
    show_unvalid_query_string = "&finished=true";
  }
  if (favourite) {
    url += "&favourite=" + favourite;
  }
  const filter_minmax_dict = parse_value_filter_dict(filter_list);
  const filter_equal_dict = parse_invalue_filter_dict(filter_equal_list);
  const filter_arg_dict = Object.assign(filter_minmax_dict, filter_equal_dict);
  if (residues__has_any_keys.length > 0) {
    filter_arg_dict["residues__has_keys"] = residues__has_any_keys;
  }
  url += "&values=" + JSON.stringify(filter_arg_dict) + show_unvalid_query_string;
  return request.get(url);
}

export function table_getdata_distribute(id, ws_id) {
  const url = "/api/jobs/" + id + "?ws_id=" + ws_id;
  return request.get(url);
}

export function download_data(job_id, name = "DrugFlow", type = "csv", id_list = [], filter_list = [], rlist = [], ulist = [], flag = "1", prep = "", value = "values", favourite = false, residues_list = []) {
  // console.log(filter_list)
  // const mimeType = { zip: 'application/zip', csv: '' }
  const algo_type = name.split(" ")[1];
  const file_name = name + "." + type;
  let id_filter_dict = {};
  let value_filter_dict = {};
  if (flag === "0") {
    id_filter_dict = parse_id_filter_dict(id_list, algo_type);
    value_filter_dict = parse_value_filter_dict(filter_list);
  }
  const user_list = ulist.map(item => `ulist=${item}`).join("&");
  const row_list = rlist.map(item => `rlist=${item}`).join("&");

  const filter_dict = Object.assign({}, id_filter_dict, value_filter_dict, residues_list.length ? { residues__has_any_keys: residues_list } : {});
  let url = "downloads" + prep + "/" + "jobs/" + job_id + "/results." + type + "?" + value + "=" + JSON.stringify(filter_dict) + "&" + user_list + "&" + row_list;
  if (favourite) {
    url += "&favourite=" + favourite;
  }
  console.log(url);
  // const blob = new Blob([res.data], { type: mimeType.type })
  const downloadElement = document.createElement("a");
  const href = url;
  downloadElement.href = href;
  downloadElement.download = file_name;
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
}

export function table_getdata_by_smiles_id(task_id, smiles_id) {
  const url = "/api/jobs/" + task_id + "/results?values=" + JSON.stringify({ _id__exact: parseInt(smiles_id) });
  return request.get(url);
}
export function edit_table(params) {
  return request.post("/api/dataset/modify", params);
}
export function smiles_action(params) {
  return request.post("/api/jobs/results/action", params);
}
