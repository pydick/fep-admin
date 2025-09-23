import { http as request } from "@/utils/http";
// import { vue_gtag_event } from "@/components/common/vue_gtag";

// const converToUrl = requestParams => {
//   const params = []
//   Object.entries(requestParams).forEach(([key, value]) => {
//     const param = key + '=' + value
//     params.push(param)
//   })
//   return '?' + params.join('&')
// }

export function qsar_task(params) {
  return request.post("/api/dataset/upload", params);
}
export function task_start(params) {
  return request.post("/api/jobs", params);
}
export function table_getdata_distribute(id) {
  const url = "/api/jobs/" + id + "/results";
  return request.get(url);
}
// export function table_getdata(id) {
//   const url = '/api/jobs/' + id
//   return request.get(url)
// }
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
export function table_getdata(id, page = 1, page_size = 20, order = "_blank", filter_list = [], filter_equal_list = [], show_unvalid = true) {
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
  const filter_minmax_dict = parse_value_filter_dict(filter_list);
  const filter_equal_dict = parse_invalue_filter_dict(filter_equal_list);
  const filter_arg_dict = Object.assign(filter_minmax_dict, filter_equal_dict);
  url += "&extra_val=" + JSON.stringify(filter_arg_dict) + show_unvalid_query_string;
  return request.get(url);
}
export function change_name(params) {
  return request.post("/api/qsar/change_name", params);
}
export function dataset_metainfo(id) {
  const url = "/api/dataset/" + id + "/metainfo";
  return request.get(url);
}
export function dataset_content(id, page = 1, page_size = 50, order = "") {
  const url = "/api/dataset/" + id + "/content" + "?page=" + page + "&page_size=" + page_size + order;
  return request.get(url);
}
export function change_type(params) {
  return request.post("/api/dataset_col/type", params);
}
export function change_col_name(params) {
  return request.post("api/dataset_col/name", params);
}
export function plotinfo(params) {
  let str = "";
  for (let i = 0; i < params.cols.length; i++) {
    str += "cols=" + params.cols[i] + "&";
  }
  const url = "/api/dataset/" + params.dataset_id + "/plotinfo?" + str.slice(0, -1);
  return request.get(url);
}

export function dataset_delete_api(dataset_id, ws_id = undefined, name = undefined) {
  if (dataset_id) {
    return request.delete("/api/dataset/delete?dataset_id=" + dataset_id);
  } else {
    return request.delete("/api/dataset/delete?ws_id=" + ws_id + "&name=" + name);
  }
  // return Promise.resolve({ data: { status: true }})
}
