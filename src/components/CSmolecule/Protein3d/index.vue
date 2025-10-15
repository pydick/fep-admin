<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { parse_ligand_string, parse_pdb_info, search_centry } from "@/utils/molecule/pdb_parser.js";
import drugflow_molstar from "./../components/drugflow_molstar/index.vue";
import { change_pocket_to_xyz, calc_iou } from "@/utils/common.js";
import { ElLoading } from "element-plus";
import type { LoadingInstance } from "element-plus/es/components/loading/src/loading";

// 定义 Props
interface Props {
  box_x?: number;
  box_y?: number;
  box_z?: number;
  l1?: number;
  l2?: number;
  l3?: number;
  if_show_box?: boolean;
  ligand_select?: string;
  if_pocket?: boolean;
  if_show_contact?: boolean;
  always_show_ligands?: boolean;
  show_ligands_console?: boolean;
  surface_opacity?: number;
  if_can_change_ligand_type?: boolean;
  if_changed_box?: boolean;
  if_click_event?: boolean;
  pocket_check?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  if_pocket: false,
  if_show_contact: false,
  always_show_ligands: false,
  show_ligands_console: true,
  surface_opacity: 0.3,
  if_can_change_ligand_type: false,
  if_changed_box: false,
  if_click_event: true,
  pocket_check: false
});

// 定义 Emits
const emit = defineEmits<{
  (e: "update:box_x", value: number): void;
  (e: "update:box_y", value: number): void;
  (e: "update:box_z", value: number): void;
  (e: "update:ligand_select", value: string): void;
  (e: "update:if_changed_box", value: boolean): void;
  (e: "iou_func", value: boolean): void;
}>();

// 响应式数据
const { t } = useI18n();
const if_cover = ref(true);
const if_loading = ref(false);
const if_err = ref(false);
const chain_content = ref<any[]>([]);
const ligand_content = ref<any[]>([]);
const box_params = ref({
  x: 100,
  y: 100,
  z: 100
});
const loading = ref<LoadingInstance | null>(null);
const ligand_names_list = ref<any[]>([]);
const molstar_ref = ref<any>(null);
const pdb_string = ref("");
const shape_selector = ref<any>(null);

// 生命周期钩子
onMounted(() => {
  if (props.if_click_event) {
    setTimeout(() => {
      try {
        molstar_ref.value?.add_mouse_event(mouse_event);
      } catch (err) {
        console.log(err);
        //  忽略该错误
      }
    }, 2500);
  }
});

onBeforeUnmount(() => {
  // document.getElementById('protein_frame').innerHTML = ''
});

// 方法定义
/**
 * 异步加载蛋白质结构数据
 * @param {string} pdb_string_param - PDB格式的蛋白质结构字符串数据
 * @param {string} format - 结构数据格式，默认为'pdb'
 * @returns {Object} 返回包含蛋白质链信息和配体信息的对象
 */
const loadStructure = async (pdb_string_param: string, format = "pdb") => {
  // 显示加载动画
  open_loading();

  // 初始化错误状态和保存PDB数据
  if_err.value = false;
  pdb_string.value = pdb_string_param;

  // 解析PDB数据，提取配体和结构信息
  ligand_names_list.value = parse_ligand_string(pdb_string_param); // 解析配体名称列表
  const info_dict = parse_pdb_info(pdb_string_param); // 解析PDB结构信息
  chain_content.value = info_dict["chain"]; // 提取蛋白质链信息
  ligand_content.value = info_dict["ligand"]; // 提取配体信息

  // 如果没有配体且开启了口袋检查，触发相关事件
  if (ligand_names_list.value.length === 0 && props.pocket_check) {
    emit("iou_func", true);
  }

  try {
    // 配置Molstar加载参数
    const init_params = {
      url: undefined, // 不使用URL加载
      format: format, // 数据格式
      is_binary: false, // 非二进制格式
      input: pdb_string_param, // 输入的PDB字符串
      if_render: true, // 是否渲染
      render_type: "default", // 默认渲染类型
      render_id: "0", // 渲染ID
      if_clean: true, // 是否清理之前的结构
      pdb_name: "ref" // PDB结构名称
    };

    // 调用Molstar加载结构
    await molstar_ref.value?.load_structure(init_params);
  } catch (err) {
    // 捕获加载错误，记录日志并关闭加载动画
    console.log("err: ", err);
    close_loading(true);
    return;
  }

  // 合并配体信息
  combine_ligand_info();

  // 关闭加载动画
  close_loading();

  // 返回解析的蛋白质和配体信息
  return {
    protein_content: chain_content.value,
    protein_lig_content: ligand_content.value
  };
};

const combine_ligand_info = () => {
  const ligands = molstar_ref.value?.get_pdb_info().ligand;
  for (let i = 0; i < ligand_content.value.length; i++) {
    for (let j = 0; j < ligands.length; j++) {
      const chain_name = ligands[j].auth_asym_id;
      const residue_id = ligands[j].auth_residue_number;
      if (ligand_content.value[i].residue_id == residue_id && ligand_content.value[i].chain_name === chain_name) {
        ligand_content.value[i].auth_asym_id = ligands[j].auth_asym_id;
        ligand_content.value[i].auth_residue_number = ligands[j].auth_residue_number;
        break;
      }
    }
  }
  console.log("ligand_content", ligand_content.value);
};

const add_shape = (x: number, y: number, z: number, l1: number, l2: number, l3: number, flag = true) => {
  if (shape_selector.value) {
    molstar_ref.value?.remove_shape(shape_selector.value);
  }
  const params = {
    x: Number(x),
    y: Number(y),
    z: Number(z),
    l1: Number(l1),
    l2: Number(l2),
    l3: Number(l3)
  };
  molstar_ref.value?.add_shape(params).then((c: any) => {
    shape_selector.value = c;
    emit("update:box_x", x);
    emit("update:box_y", y);
    emit("update:box_z", z);
    if (flag) {
      emit("update:ligand_select", "default");
    }
  });
};

const get_pdb_info = () => {
  return molstar_ref.value?.get_pdb_info();
};

const remove_shape = () => {
  if (shape_selector.value) {
    molstar_ref.value?.remove_shape(shape_selector.value);
  }
};

const change_chain = async (chain_name: string, if_show: boolean, chain_id: string) => {
  molstar_ref.value?.select_none();
  if (!if_show) {
    await molstar_ref.value?.quick_select({
      auth_asym_id: chain_name,
      group_PDB: "ATOM"
    });
    await molstar_ref.value?.hide_selection();
  } else {
    await molstar_ref.value?.quick_select({
      auth_asym_id: chain_name,
      group_PDB: "ATOM"
    });
    await molstar_ref.value?.show_selection("chain", [{ auth_asym_id: chain_name, group_PDB: "ATOM" }]);
  }
};

const calc_coords_info = (ligand_atoms_list: any[]) => {
  let max_x = -1000;
  let max_y = -1000;
  let max_z = -1000;
  let min_x = 1000;
  let min_y = 1000;
  let min_z = 1000;
  for (let i = 0; i < ligand_atoms_list.length; i++) {
    const atom = ligand_atoms_list[i];
    if (Number(atom[0]) > max_x) {
      max_x = atom[0];
    }
    if (Number(atom[1]) > max_y) {
      max_y = atom[1];
    }
    if (Number(atom[2]) > max_z) {
      max_z = atom[2];
    }
    if (Number(atom[0]) < min_x) {
      min_x = atom[0];
    }
    if (Number(atom[1]) < min_y) {
      min_y = atom[1];
    }
    if (Number(atom[2]) < min_z) {
      min_z = atom[2];
    }
  }
  return {
    max_x,
    max_y,
    max_z,
    min_x,
    min_y,
    min_z
  };
};

const calc_ligand_box = (ligand_dict: any, expand = 10) => {
  // 绘制pocket view
  console.log("ligand_dict", ligand_dict);
  if (!ligand_dict) {
    const centry = search_centry(pdb_string.value);
    return {
      x: centry[0],
      y: centry[1],
      z: centry[2],
      l1: 25,
      l2: 25,
      l3: 25
    };
  }
  // molstar_ref.value?.create_pocket(ligand_dict)
  // get ligand coord info
  const coords_info = calc_coords_info(ligand_dict.coords);
  let l1;
  let l2;
  let l3;

  l1 = coords_info.max_x - coords_info.min_x + expand;
  l2 = coords_info.max_y - coords_info.min_y + expand;
  l3 = coords_info.max_z - coords_info.min_z + expand;
  return {
    x: (coords_info.max_x + coords_info.min_x) / 2,
    y: (coords_info.max_y + coords_info.min_y) / 2,
    z: (coords_info.max_z + coords_info.min_z) / 2,
    l1,
    l2,
    l3
  };
};

const select_and_focus = (d: any) => {
  const data = change_data_name(d);
  molstar_ref.value?.select_none();
  if (data.struct_asym_id != undefined) {
    molstar_ref.value?.quick_select({
      auth_asym_id: data.struct_asym_id,
      start_residue_number: data.start_residue_number,
      end_residue_number: data.end_residue_number,
      focus: true
    });
  } else if (data.start_residue_number) {
    molstar_ref.value?.quick_select({
      start_residue_number: data.start_residue_number,
      end_residue_number: data.end_residue_number,
      focus: true
    });
  } else if (data.auth_asym_id && data.residue_number) {
    molstar_ref.value?.quick_select({
      auth_asym_id: data.auth_asym_id,
      residue_number: data.residue_number,
      focus: true
    });
  } else {
    molstar_ref.value?.quick_select({
      residue_number: data.residue_number,
      focus: true
    });
  }
};

const change_data_name = (data: any) => {
  const ret = data;
  if (ret.chain_id != undefined) {
    ret.auth_asym_id = ret.chain_id;
  }
  return ret;
};

const select_show_hide = async (data: any, isShow: boolean) => {
  molstar_ref.value?.select_none();
  if (data.struct_asym_id != undefined) {
    await molstar_ref.value?.quick_select({
      auth_asym_id: data.struct_asym_id,
      start_residue_number: data.start_residue_number,
      end_residue_number: data.end_residue_number,
      focus: true
    });
  } else if (data.start_residue_number) {
    await molstar_ref.value?.quick_select({
      start_residue_number: data.start_residue_number,
      end_residue_number: data.end_residue_number,
      focus: true
    });
  } else {
    await molstar_ref.value?.quick_select({
      residue_number: data.residue_number,
      focus: true
    });
  }

  if (isShow) {
    await molstar_ref.value?.show_selection("chain");
  } else {
    await molstar_ref.value?.hide_selection();
  }
};

const select_none = () => {
  molstar_ref.value?.select_none();
};

const quick_select = (params: any, type = "single", not_focus?: any) => {
  molstar_ref.value?.quick_select(params, type, not_focus);
};

const show_selection = async (type = "prev") => {
  await molstar_ref.value?.show_selection(type);
};

const hide_selection = async () => {
  await molstar_ref.value?.hide_selection();
};

const reset_camera = () => {
  molstar_ref.value?.reset_camera();
};

const clean_old_data = () => {
  // molstar_ref.value?.reset_all()
  chain_content.value = [];
  ligand_content.value = [];
  shape_selector.value = null;
};

const open_loading = (content?: string) => {
  if_cover.value = false;
  if (loading.value) {
    loading.value.close();
    loading.value = null;
  }
  loading.value = ElLoading.service({
    target: document.getElementById("protein_frame") as HTMLElement,
    text: content,
    background: "rgba(255, 255, 255, 0.4)"
  });
};

const close_loading = (flag?: boolean) => {
  loading.value?.close();
  loading.value = null;
  if (flag) {
    if_err.value = true;
  }
};

const mouse_event = (e: any) => {
  if (e.button === 1 && e.current && e.current.loci.kind !== "empty-loci") {
    const position = e.position;
    let flag = false;
    if (props.if_show_box === true) {
      if (props.pocket_check) {
        for (let i = 0; i < ligand_content.value.length; i++) {
          const pocket_coord_dict = change_pocket_to_xyz(ligand_content.value[i].max_min_coord);
          const iou = calc_iou(pocket_coord_dict, {
            x: position[0],
            y: position[1],
            z: position[2],
            l1: props.l1,
            l2: props.l2,
            l3: props.l3
          });
          console.log("iou: ", iou);
          if (iou > 0.5) {
            flag = true;
            break;
          }
          flag = false;
        }
      }

      emit("update:if_changed_box", true);
      add_shape(position[0], position[1], position[2], props.l1!, props.l2!, props.l3!);
      console.log("click func flag: ", flag);
      if (!flag) {
        // 触发父组件函数
        emit("iou_func", true);
      } else {
        emit("iou_func", false);
      }
    }
  }
};

// 暴露给父组件的方法
defineExpose({
  loadStructure,
  add_shape,
  get_pdb_info,
  remove_shape,
  change_chain,
  calc_ligand_box,
  select_and_focus,
  select_show_hide,
  select_none,
  quick_select,
  show_selection,
  hide_selection,
  reset_camera,
  clean_old_data
});
</script>

<template>
  <div id="protein_frame" class="relative h-full min-w-[200px] min-h-[400px]">
    <div class="relative h-[calc(100%)] min-h-[500px] min-w-[540px] w-[calc(100%)] overflow-visible">
      <drugflow_molstar ref="molstar_ref" />
    </div>

    <div v-if="if_cover == true" class="cover_frame">
      <img src="@/assets/protein3DCover.png" class="cover_img" alt="protein3D cover" />
    </div>
    <div v-if="if_err == true" class="flex_def cover_tips">
      <div class="text09rem text-[#409eff]">
        {{ t("screen.请检查输入和网络连接") }}
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
:deep(.el-radio-button--small .el-radio-button__inner) {
  padding: 4px;
  border-radius: 4px !important;
  margin-top: 0.3rem;
}
:deep(.el-checkbox-button__inner) {
  padding: 4px;
  border-radius: 4px !important;
  margin-top: 0.3rem;
}
:deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
  background-color: #777;
  border-color: #777;
}
:deep(.el-button--small) {
  padding: 4px;
  border-radius: 4px !important;
  margin-top: 0.3rem;
}
:deep(.el-input--small .el-input__inner) {
  width: 3rem;
}
.console_group {
  padding: 0px 6px 6px 6px;
  background-color: #dddddd60;
  border-radius: 0.25rem;
  margin-top: 1rem;
  width: 2.25rem;
}
.console_frame {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1001;
}
.cover_img {
  width: 800px;
  max-width: 800px;
  opacity: 0.2;
  display: block;
  margin: 0 auto;
}
.cover_frame {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
  top: 0;
  left: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover_tips {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
  top: 0;
  left: 0;
  z-index: 1002;
}
</style>
