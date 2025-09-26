/*
 * @Description:
 * @Version: 1.0
 * @Author: 杨少华
 * @Date: 2023-07-25 17:33:43
 * @LastEditors: 杨少华
 * @LastEditTime: 2023-08-01 19:05:48
 */
import request from "@/utils/request.js";
// smiles转为mol_block
export function smiles2mol(params) {
  return request.post("/api/toolkits/rdkit/smiles2mol", params);
}
// sdf转smiles
export function mol2smiles(params) {
  return request.post("/api/toolkits/rdkit/mol2smiles", params);
}
// 从pdb文件中获取自带配体sdf
export function get_ligandsdf_from_pdb(params) {
  return request.post("/api/toolkits/rdkit/get_ligandsdf_from_pdb", params);
}
// 根据 dataset_id 获取 sdf 内容
export function sdf_ctx_common(id) {
  return request.get("/api/workspace/sdf_ctx_common?dataset_id=" + id);
}
// extract_partial_mol
export function extract_partial_mol(params) {
  return request.post("/api/toolkits/rdkit/extract_partial_mol", params);
}
// 分子断点识别
export function breakpoint_identification(params) {
  return request.post("/api/toolkits/rdkit/breakpoint_identification", params);
}
// 位置检测
export function mol_atom_info(params) {
  return request.post("/api/toolkits/rdkit/mol_atom_info", params);
}
export function check_pocket(params) {
  return request.post("/api/molfactory/check_pocket", params);
}
// 任务提交
export function jobs(params) {
  return request.post("/api/jobs", params);
}
