/*
 * @Description:
 * @Version: 1.0
 * @Author: 杨少华
 * @Date: 2023-08-03 09:57:32
 * @LastEditors: 杨少华
 * @LastEditTime: 2023-08-06 18:29:17
 */

import { http as request } from "@/utils/http";
export function smiles_list(id, params) {
  return request.post(`/api/jobs/${id}/result/molgen_pipeline/smiles_list`, params);
}
// like and dislike
export function smiles_action(id, params) {
  return request.post(`/api/jobs/${id}/result/molgen/smiles_action`, params);
}
