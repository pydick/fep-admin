<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, type Ref } from "vue";
import molstar_btn from "./components/molstar_btn.vue";
import prolif_iframe from "./components/prolif_iframe.vue";
import "drugflow-molstar/build/drugflow-molstar-light.css";
import "drugflow-molstar/build/drugflow-molstar-component-0.3.43.js";
import { InteractionsRepresentationProvider } from "molstar/lib/mol-model-props/computed/representations/interactions";
import { Color, ColorMap } from "molstar/lib/mol-util/color";
import { ColorNames } from "molstar/lib/mol-util/color/names";
import { get_interaction_iframe_api } from "@/api/molecular.js";
import { throttle } from "@pureadmin/utils";

// ==================== 类型定义 ====================
/** 分子组件信息接口 */
interface MoleculeComponent {
  auth_asym_id: string;
  auth_residue_number: number | string;
  residue_name?: string;
  label_comp_id?: string;
  atom_id?: number;
  [key: string]: any;
}

/** PDB结构信息接口 */
interface PDBInfo {
  chain: MoleculeComponent[];
  ligand: MoleculeComponent[];
  pocket: MoleculeComponent[];
  other: MoleculeComponent[];
  water: MoleculeComponent[];
}

/** 表示方式状态接口 */
interface ReprState {
  cartoon: boolean;
  bs: boolean;
  sf: boolean;
  line: boolean;
}

/** 加载结构参数接口 */
interface LoadStructureParams {
  url?: string;
  format: string;
  is_binary?: boolean;
  input: string;
  if_render?: boolean;
  render_type: string;
  render_id: string;
  ligand_name?: string;
  if_clean?: boolean;
  pdb_name?: string;
  carbon_color?: string;
  residue_full_info?: any;
}

/** 相互作用数据接口 */
interface InteractionDict {
  ligand_name: string;
  ligand_chain_id: string;
  ligand_residue_number: string;
  ligand_atom_id: number;
  prot_atom_id: number;
  interaction_type: string;
}

/** PDB配体相互作用列表项接口 */
interface PDBLigandInteraction {
  pdb_string: string;
  pdb_name: string;
  ligand_list: MoleculeComponent[];
  prolif_data: any[];
  render_id: string;
  residue_full_info?: any;
  prolif_id_list: string[];
}

/** 表面信息接口 */
interface SurfaceInfo {
  cnt: number;
  timestamp: number;
  name: string;
  if_show_name: boolean;
  select_info: MoleculeComponent[];
  hide?: boolean;
}

/** RGB颜色接口 */
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/** Molstar实例接口（扩展声明） */
interface MolstarInstance {
  viewerInstance?: any;
  [key: string]: any;
}

/** 选择返回结果接口 */
interface SelectionResult {
  polymer: boolean;
  ligand: boolean;
  water: boolean;
}

// ==================== Molstar 核心组件引用 ====================
/** Molstar组件的DOM引用，用于获取viewerInstance实例 */
const molstar_ref: Ref<MolstarInstance | null> = ref(null);

/** 动态生成的Canvas容器ID，确保每个实例的唯一性 */
const canvas_id: string = "molstar-canvas-" + Date.now();

// ==================== 视图控制状态 ====================
/** 是否处于全屏模式 */
const full_screen_type: Ref<boolean> = ref(false);

/** 选择粒度级别：'chain'(链)、'residue'(残基)、'element'(原子) */
const granularity: Ref<string> = ref("residue");

/** 背景颜色：'white'(白色) 或 'black'(黑色) */
const background: Ref<string> = ref("white");

/** 选择扩展范围（单位：埃） */
const expand_number: Ref<number> = ref(5);

// ==================== 分子结构数据 ====================
/**
 * PDB结构信息对象，包含分子的各个组成部分
 * - chain: 蛋白质链信息数组
 * - ligand: 配体分子信息数组
 * - pocket: 口袋信息数组
 * - other: 其他分子组件数组
 * - water: 水分子信息数组
 */
const pdb_info: Ref<PDBInfo> = ref({
  chain: [],
  ligand: [],
  pocket: [],
  other: [],
  water: []
});

// ==================== 界面控制状态 ====================

// ==================== 分子表示方式控制 ====================
/**
 * 当前蛋白质链的表示方式
 * 可选值：'cartoon'(卡通)、'bs'(球棍)、'sf'(空间填充)、'line'(线条)
 */
const chain_repr: Ref<string> = ref("cartoon");

/** 上一个激活的表示方式，用于切换时的状态管理 */
const old_repr: Ref<string | null> = ref("Polymer_cartoon");

/**
 * 各种表示方式的显示状态
 * - cartoon: 卡通表示是否激活
 * - bs: 球棍表示是否激活
 * - sf: 空间填充表示是否激活
 * - line: 线条表示是否激活
 */
const repr_state: Ref<ReprState> = ref({ cartoon: true, bs: false, sf: false, line: false });

// ==================== 初始化和重置相关 ====================
/** 保存初始化参数，用于重置功能 */
const init_params: Ref<LoadStructureParams | Record<string, any>> = ref({});

// ==================== 功能模块状态标记 ====================
/** 是否当前存在口袋可视化 */
const has_pocket: Ref<boolean> = ref(false);

/** 是否当前存在表面可视化 */
const has_surface: Ref<boolean> = ref(false);

/** 是否隐藏非口袋区域的蛋白质链 */
const if_hide_chain: Ref<boolean> = ref(false);

// ==================== 2D相互作用图相关 ====================
/** 是否显示2D相互作用图对话框 */
const show_prolif: Ref<boolean> = ref(false);

/** 2D相互作用图组件的引用 */
const prolif_ref: Ref<any> = ref(null);

/**
 * PDB与配体相互作用数据列表
 * 存储每个加载的结构及其对应的相互作用分析结果
 */
const pdb_ligand_inter_list: Ref<PDBLigandInteraction[]> = ref([]);

/** 是否正在等待prolif数据计算完成 */
const wait_proif: Ref<boolean> = ref(true);

/** prolif相互作用分析的原始数据 */
const prolif_data: Ref<any[]> = ref([]);

/**
 * 组件属性定义
 * 用于配置Molstar分子可视化组件的外观和行为
 */
interface Props {
  /**
   * 3D场景背景颜色（十六进制颜色值）
   * 默认值：0x1100CC（深蓝色）
   */
  box_bg_color?: number;

  /**
   * 是否显示序列面板
   * true: 显示底部的蛋白质序列面板
   * false: 隐藏序列面板，获得更大的3D视图空间
   */
  if_sequence_panel?: boolean;

  /**
   * 是否显示工具栏
   * true: 显示顶部的分子操作工具栏
   * false: 隐藏工具栏，仅显示3D视图
   */
  show_tool?: boolean;

  /**
   * 是否禁用复杂操作按钮
   * true: 禁用表面创建、口袋分析、标签等计算密集型功能
   * false: 启用所有功能按钮
   * 用于性能较低的设备或简化界面的场景
   */
  disable_comp_btn?: boolean;

  /**
   * 在2D相互作用图中是否显示配体名称
   * true: 在prolif相互作用分析图中显示配体分子名称
   * false: 隐藏配体名称，简化显示
   */
  prolif_show_ligname?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  box_bg_color: 0x1100cc,
  if_sequence_panel: true,
  show_tool: true,
  disable_comp_btn: false,
  prolif_show_ligname: true
});

const emit = defineEmits<{
  (e: "init-complete"): void;
}>();

/**
 * 初始化Molstar 3D分子可视化插件
 * 创建Molstar实例并进行基本配置
 */
const init = async (): Promise<void> => {
  // 创建Drugflow定制的Molstar插件实例
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance = new (window as any).DrugflowMolstarPlugin();

  // 获取DOM容器元素
  const viewerContainer = document.getElementById(canvas_id);
  if (!viewerContainer) return;

  // 初始化Molstar插件，配置序列面板显示选项
  await molstar_ref.value.viewerInstance.init(viewerContainer, {
    if_sequence_panel: props.if_sequence_panel
  });

  // 关闭默认的选择模式
  molstar_ref.value.viewerInstance.canvas.toggleSelect(false);

  // 添加点击事件监听器
  molstar_ref.value.viewerInstance.add_click_listener();
};

/**
 * 异步加载分子结构到Molstar中
 * @param input_params - 加载参数配置对象
 */
const load_structure = async (input_params: LoadStructureParams): Promise<void> => {
  if (!molstar_ref.value) return;
  // 保存初始化参数用于重置功能
  init_params.value = input_params;

  // 调用Molstar核心方法加载结构树
  await molstar_ref.value.viewerInstance.load_tree(
    {
      url: input_params.url, // 结构文件URL
      format: input_params.format, // 文件格式
      isBinary: input_params.is_binary, // 是否二进制格式
      pdb_string: input_params.input, // 结构数据字符串
      if_render: input_params.if_render, // 是否渲染
      render_type: input_params.render_type, // 渲染类型
      render_id: input_params.render_id, // 渲染ID
      ligand_name: input_params.ligand_name // 配体名称
    },
    input_params.if_clean // 是否清理之前的结构
  );

  const render_id = input_params.render_id;

  // 获取并保存结构的基本信息（链、配体、水分子等）
  pdb_info.value = molstar_ref.value.viewerInstance.get_basic_info();

  // 根据渲染类型选择不同的表示方式
  if (input_params.render_type === "default") {
    // 默认渲染：显示完整的蛋白质结构
    await add_or_update_default_repr(1, true, false);
  } else {
    // 配体视图渲染：专注于配体及其周围环境
    await add_or_update_ligand_view_repr(render_id, input_params.carbon_color);
  }

  // 如果需要清理，重置相互作用数据列表
  if (input_params.if_clean) {
    pdb_ligand_inter_list.value = [];
  }

  // 异步获得后端的prolif数据
  const form = new FormData();
  const pdb_file = new File([input_params.input], "pdb.pdb");
  form.append("file", pdb_file);
  let args = null;
  let j = 0;
  if (input_params.render_type !== "default") {
    let chain_id = "A";
    let ligand_residue_number = "1";
    for (j = 0; j < pdb_info.value.ligand.length; j++) {
      if (pdb_info.value.ligand[j].residue_name === "UNL") {
        chain_id = pdb_info.value.ligand[j].auth_asym_id;
        ligand_residue_number = pdb_info.value.ligand[j].auth_residue_number.toString();
        break;
      }
    }
    args = JSON.stringify({
      chain_id: chain_id,
      ligand_name: "UNL",
      ligand_residue_number: ligand_residue_number,
      info_calculated: input_params.residue_full_info
    });
  } else {
    args = "{}";
  }
  const params = {
    args,
    file: form
  };
  const iframeRes = await get_interaction_iframe_api(params);
  if (iframeRes.success) {
    let res = {
      iframe_string: iframeRes.data.map(item => {
        return {
          interaction_dict: item.interactions,
          iframe: item.visualization_html
        };
      })
    };

    if (input_params.render_type !== "default") {
      pdb_ligand_inter_list.value.push({
        pdb_string: input_params.input,
        pdb_name: input_params.pdb_name,
        ligand_list: [pdb_info.value.ligand[j]],
        prolif_data: res.iframe_string,
        render_id: input_params.render_id,
        residue_full_info: input_params.residue_full_info,
        prolif_id_list: []
      });
    } else {
      pdb_ligand_inter_list.value.push({
        pdb_string: input_params.input,
        pdb_name: input_params.pdb_name,
        ligand_list: pdb_info.value.ligand,
        prolif_data: res.iframe_string,
        render_id: input_params.render_id,
        residue_full_info: input_params.residue_full_info,
        prolif_id_list: []
      });
    }

    // prolif_data.value = res.data.iframe_string
    wait_proif.value = false;
    if (input_params.render_type != "default") {
      const UNL_dict = find_UNL_dict(res.iframe_string);
      console.log("UNL_dict", UNL_dict);
      await find_and_add_prolif_data(UNL_dict, render_id);
    }
  }
};

const set_occlusion = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.plugin.canvas3d.setProps({
    postprocessing: { occlusion: { name: "off", params: {} } }
  });
};

const find_UNL_dict = (interaction_list: any[]): Record<string, any> => {
  const ret_dict: Record<string, any> = {};
  for (let i = 0; i < interaction_list.length; i++) {
    if (interaction_list[i].interaction_dict[0] && interaction_list[i].interaction_dict[0].ligand_name === "UNL") {
      ret_dict["auth_asym_id"] = interaction_list[i].interaction_dict[0].ligand_chain_id;
      ret_dict["auth_residue_number"] = interaction_list[i].interaction_dict[0].ligand_residue_number;
      break;
    }
  }
  return ret_dict;
};

const recreate_repr = async (alpha: number = 1, recreate_polymer: boolean = true, recreate_ligand: boolean = true, recreate_water: boolean = true): Promise<void> => {
  if (!molstar_ref.value) return;
  if (recreate_polymer) {
    await molstar_ref.value.viewerInstance.update_comp_repr("Polymer", "Polymer_cartoon", repr_state.value.cartoon, {
      type: "cartoon",
      typeParams: { alpha: alpha }
    });
    await molstar_ref.value.viewerInstance.update_comp_repr("Polymer", "Polymer_bs", repr_state.value.bs, {
      type: "ball-and-stick",
      size: "uniform",
      sizeParams: { value: 0.9 },
      typeParams: {
        alpha: alpha,
        ignoreHydrogens: "all",
        ignoreHydrogensVariant: "non-polar"
      },
      color: "element-symbol",
      colorParams: {
        carbonColor: { name: "element-symbol", params: {} },
        colors: { name: "custom", params: ColorMap({ C: ColorNames.gray }) }
      }
    });
    await molstar_ref.value.viewerInstance.update_comp_repr("Polymer", "Polymer_sf", repr_state.value.sf, {
      type: "spacefill",
      typeParams: { alpha: alpha }
    });
    await molstar_ref.value.viewerInstance.update_comp_repr("Polymer", "Polymer_line", repr_state.value.line, {
      type: "line",
      typeParams: { alpha: alpha }
    });
  }
  if (recreate_ligand) {
    await molstar_ref.value.viewerInstance.update_comp_repr("Ligand", "Ligand_bs", true, {
      type: "ball-and-stick",
      typeParams: {
        ignoreHydrogens: "all",
        ignoreHydrogensVariant: "non-polar"
      },
      color: "element-symbol",
      colorParams: {
        carbonColor: { name: "element-symbol", params: {} },
        colors: { name: "custom", params: ColorMap({ C: ColorNames.orange }) }
      }
    });
  }
  if (recreate_water) {
    await molstar_ref.value.viewerInstance.update_comp_repr("Water", "Water_bs", true, { type: "ball-and-stick" });
  }
  set_occlusion();
};

const add_or_update_ligand_view_repr = async (ligand_id: string, color_name: string): Promise<void> => {
  if (!molstar_ref.value) return;
  await molstar_ref.value.viewerInstance.update_comp_repr("Ligand_" + ligand_id, "Ligand_" + ligand_id + "_bs", true, {
    type: "ball-and-stick",
    typeParams: {
      alpha: 1,
      ignoreHydrogens: "all",
      ignoreHydrogensVariant: "non-polar"
    },
    color: "element-symbol",
    colorParams: {
      carbonColor: { name: "element-symbol", params: {} },
      colors: {
        name: "custom",
        params: ColorMap({ C: ColorNames[color_name] })
      }
    }
  });
  await molstar_ref.value.viewerInstance.update_comp_repr("Ligand_plus_" + ligand_id, "Ligand_plus_" + ligand_id + "_bs", true, {
    type: "ball-and-stick",
    color: "element-symbol",
    size: "uniform",
    sizeParams: { value: 0.9 },
    typeParams: {
      alpha: 0.8,
      ignoreHydrogens: "all",
      ignoreHydrogensVariant: "non-polar"
    },
    colorParams: {
      carbonColor: { name: "element-symbol", params: {} },
      colors: { name: "custom", params: ColorMap({ C: ColorNames.gray }) }
    }
  });
  await molstar_ref.value.viewerInstance.update_comp_repr("Ligand_plus_" + ligand_id, "Ligand_plus_" + ligand_id + "_label", false, {
    type: "label",
    sizeParams: { scale: 0.65 },
    colorParams: { value: 0xffffff },
    typeParams: { alpha: 1, level: granularity.value }
  });
  // await molstar_ref.value.viewerInstance.update_comp_repr('Ligand_' + ligand_id, 'Ligand_' + ligand_id + '_it', true, {
  //     type: InteractionsRepresentationProvider,
  //     typeParams: {includeParent: true, parentDisplay: 'between' }
  //   })
  // focus ligand
  for (let i = 0; i < pdb_info.value.ligand.length; i++) {
    if (pdb_info.value.ligand[i].residue_name === "UNL") {
      molstar_ref.value.viewerInstance.visual.focus([pdb_info.value.ligand[i]], undefined, 10);
      break;
    }
  }
  set_occlusion();
};

/**
 * 添加或更新默认的分子表示方式
 * 为蛋白质、配体和水分子设置标准的可视化表示
 * @param alpha - 透明度值 (0-1)
 * @param if_hetatm - 是否显示异原子分子（配体和水）
 * @param not_change_visible - 是否保持当前可见性状态
 */
const add_or_update_default_repr = async (alpha: number = 1, if_hetatm: boolean = true, not_change_visible: boolean = true): Promise<void> => {
  if (!molstar_ref.value) return;
  // 蛋白质主链：卡通表示法（默认显示）
  await molstar_ref.value.viewerInstance.update_comp_repr("Polymer", "Polymer_cartoon", true, { type: "cartoon", typeParams: { alpha: alpha } });

  // 蛋白质：球棍模型
  await molstar_ref.value.viewerInstance.update_comp_repr("Polymer", "Polymer_bs", not_change_visible, {
    type: "ball-and-stick",
    size: "uniform",
    sizeParams: { value: 0.9 },
    typeParams: {
      alpha: alpha,
      ignoreHydrogens: "all",
      ignoreHydrogensVariant: "non-polar"
    },
    color: "element-symbol",
    colorParams: {
      carbonColor: { name: "element-symbol", params: {} },
      colors: { name: "custom", params: ColorMap({ C: ColorNames.gray }) } // 碳原子显示为灰色
    }
  });

  // 蛋白质：空间填充模型
  await molstar_ref.value.viewerInstance.update_comp_repr("Polymer", "Polymer_sf", not_change_visible, {
    type: "spacefill",
    typeParams: { alpha: alpha }
  });

  // 蛋白质：线条模型
  await molstar_ref.value.viewerInstance.update_comp_repr("Polymer", "Polymer_line", not_change_visible, {
    type: "line",
    typeParams: { alpha: alpha }
  });

  // 如果需要显示异原子分子
  if (if_hetatm) {
    // 配体：球棍模型（橙色碳原子）
    if (pdb_info.value.ligand.length > 0) {
      await molstar_ref.value.viewerInstance.update_comp_repr("Ligand", "Ligand_bs", true, {
        type: "ball-and-stick",
        typeParams: {
          ignoreHydrogens: "all",
          ignoreHydrogensVariant: "non-polar"
        },
        color: "element-symbol",
        colorParams: {
          carbonColor: { name: "element-symbol", params: {} },
          colors: {
            name: "custom",
            params: ColorMap({ C: ColorNames.orange })
          } // 配体碳原子显示为橙色
        }
      });
    }

    // 水分子：球棍模型
    if (pdb_info.value.water.length > 0) {
      await molstar_ref.value.viewerInstance.update_comp_repr("Water", "Water_bs", true, { type: "ball-and-stick" });
    }
  }

  // 设置遮挡效果
  set_occlusion();
};

const reset_all = async (): Promise<void> => {
  if (!molstar_ref.value) return;
  await molstar_ref.value.viewerInstance.clear();
  await load_structure(init_params.value as LoadStructureParams);
};

const add_mouse_event = (func: Function): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.add_mouse_event(func);
};

const get_pdb_info = (): PDBInfo => {
  return pdb_info.value;
};

const add_shape = (params: any): any => {
  if (!molstar_ref.value) return;
  const structure = molstar_ref.value.viewerInstance.plugin.state.data.select("Structure_0")[0];
  return molstar_ref.value.viewerInstance.add_shape(structure, params);
};

const remove_shape = (selector: string): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.remove_shape(selector);
};

/**
 * 切换全屏显示模式
 */
const full_screen = (): void => {
  if (!molstar_ref.value) return;
  full_screen_type.value = !full_screen_type.value;
  molstar_ref.value.viewerInstance.canvas.toggleExpanded(full_screen_type.value);
};

/**
 * 重置相机到初始位置和角度
 */
const reset_camera = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.visual.camera_reset();
};

/**
 * 截取当前3D视图的屏幕截图并下载
 */
const make_screenshot = (): void => {
  // 获取Canvas元素
  const c = document.getElementsByTagName("canvas")[0];
  if (!c) return;
  // 转换为base64图片数据
  const base64Img = c.toDataURL("image/png");
  // 创建下载链接
  const a = document.createElement("a");
  a.download = "Drugflow_Screenshot.png";
  a.href = base64Img;
  a.click();
  a.remove();
};

/**
 * 切换分子结构的自动旋转
 */
const toggle_spin = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.visual.toggleSpin();
};

/**
 * 根据当前背景设置切换背景颜色（黑白切换）
 */
const change_background = (): void => {
  if (background.value === "white") {
    set_background({ r: 255, g: 255, b: 255 }); // 设置为白色背景
  } else {
    set_background({ r: 0, g: 0, b: 0 }); // 设置为黑色背景
  }
};

const set_visibility = (ref: string): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.set_visibility(ref);
};

const change_repr = (): void => {
  if (!molstar_ref.value) return;
  if (old_repr.value === "Polymer_" + chain_repr.value) {
    return;
  }
  if (old_repr.value) {
    molstar_ref.value.viewerInstance.set_visibility(old_repr.value);
  }
  if (chain_repr.value === "hide") {
    old_repr.value = null;
    return;
  }
  if (chain_repr.value === "cartoon") {
    molstar_ref.value.viewerInstance.set_visibility("Polymer_cartoon");
    repr_state.value = { cartoon: true, bs: false, sf: false, line: false };
  } else if (chain_repr.value === "bs") {
    molstar_ref.value.viewerInstance.set_visibility("Polymer_bs");
    repr_state.value = { cartoon: false, bs: true, sf: false, line: false };
  } else if (chain_repr.value === "sf") {
    molstar_ref.value.viewerInstance.set_visibility("Polymer_sf");
    repr_state.value = { cartoon: false, bs: false, sf: true, line: false };
  } else if (chain_repr.value === "line") {
    molstar_ref.value.viewerInstance.set_visibility("Polymer_line");
    repr_state.value = { cartoon: false, bs: false, sf: false, line: true };
  }
  old_repr.value = "Polymer_" + chain_repr.value;
};

const hide_chain = (val: any): void => {
  if (!molstar_ref.value) return;
  if (old_repr.value) {
    molstar_ref.value.viewerInstance.set_visibility(old_repr.value);
  }
};

const set_ligand_view_id_visibility = (smiles_id: string): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.set_visibility("Ligand_" + smiles_id);
  molstar_ref.value.viewerInstance.set_visibility("Ligand_plus_" + smiles_id);

  for (let j = 0; j < pdb_ligand_inter_list.value.length; j++) {
    if (pdb_ligand_inter_list.value[j]["render_id"] === smiles_id) {
      for (let i = 0; i < pdb_ligand_inter_list.value[j].prolif_id_list.length; i++) {
        molstar_ref.value.viewerInstance.set_visibility(pdb_ligand_inter_list.value[j].prolif_id_list[i]);
      }
      break;
    }
  }
};

const remove_ligand_view_pdb = async (smiles_id: string): Promise<void> => {
  if (!molstar_ref.value) return;
  await remove_prolif_line(smiles_id);
  await molstar_ref.value.viewerInstance.remove_tmp_comp("Structure_" + smiles_id, smiles_id);

  for (let i = 0; i < pdb_ligand_inter_list.value.length; i++) {
    if (pdb_ligand_inter_list.value[i]["render_id"] === smiles_id) {
      // 删除这个元素
      pdb_ligand_inter_list.value.splice(i, 1);
      break;
    }
  }
};

const set_background = (color: RGBColor): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.canvas.setBgColor(color);
};

const set_granularity = (value: string): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.visual.changeProps(value);
};

/**
 * 快速选择分子结构中的特定组件
 * @param item - 要选择的项目对象或数组
 * @param type - 选择类型：'single'(单个)、'chains'(所有链)、'ligands'(所有配体)、'water'(水分子)
 * @param not_focus - 是否不进行焦点聚焦
 */
const quick_select = (item: MoleculeComponent | MoleculeComponent[], type: string = "single", not_focus?: boolean): void => {
  if (!molstar_ref.value) return;
  if (type === "chains") {
    // 选择所有蛋白质链
    molstar_ref.value.viewerInstance.visual.select(pdb_info.value.chain);
  } else if (type === "ligands") {
    // 选择所有配体分子
    molstar_ref.value.viewerInstance.visual.select(pdb_info.value.ligand);
  } else if (type === "water") {
    // 选择所有水分子（HOH）
    molstar_ref.value.viewerInstance.visual.select([{ label_comp_id: "HOH" }]);
  } else {
    // 选择单个或指定的项目
    if (item?.length >= 1) {
      molstar_ref.value.viewerInstance.visual.select(item);
    } else {
      molstar_ref.value.viewerInstance.visual.select([item]);
    }
  }

  // 如果不禁止聚焦，则将相机聚焦到选中的对象
  if (!not_focus) {
    molstar_ref.value.viewerInstance.visual.focus_now();
  }
};

const surface_list: Ref<SurfaceInfo[]> = ref([]);

/**
 * 创建分子表面
 * @param item - 要创建表面的分子组件对象
 * @param type - 操作类型：'single'(为选定组件创建表面)、'clean'(清理指定表面)
 * @param name - 表面名称标识符（用于清理操作）
 */
const create_surface = async (item?: MoleculeComponent | MoleculeComponent[], type: string = "single", name: string | number = "abcd"): Promise<void> => {
  if (!molstar_ref.value) return;
  if (type === "single") {
    // 清除当前选择并选择指定项目
    molstar_ref.value.viewerInstance.visual.select_none();
    quick_select(item, type);
  } else if (type === "clean") {
    // 清理指定的表面
    await molstar_ref.value.viewerInstance.remove_tmp_comp("Surface_" + name);

    // 从表面列表中移除对应项目
    for (let i = 0; i < surface_list.value.length; i++) {
      if (surface_list.value[i].timestamp === name) {
        surface_list.value.splice(i, 1);
        break;
      }
    }

    // 如果没有表面了，更新状态
    if (surface_list.value.length === 0) {
      has_surface.value = false;
    }
    return;
  }

  // 获取当前选择的组件信息
  const now_dict = molstar_ref.value.viewerInstance.selected_info.now;
  const select_info = [...now_dict.polymer, ...now_dict.ligand, ...now_dict.other];
  const timestamp = Date.now();

  // 标记存在表面
  has_surface.value = true;

  // 创建表面组件
  await molstar_ref.value.viewerInstance.create_surf_comp(timestamp);

  // 更新表面的表示方式（高斯表面，按疏水性着色）
  await molstar_ref.value.viewerInstance.update_comp_repr("Surface_" + timestamp, "Surface_gs_" + timestamp, true, {
    type: "gaussian-surface",
    color: "hydrophobicity"
  });

  // 清除选择
  molstar_ref.value.viewerInstance.visual.select_none();

  // 添加到表面列表
  if (surface_list.value.length === 0) {
    surface_list.value.push({
      cnt: 1,
      timestamp: timestamp,
      name: "Surf " + 1,
      if_show_name: true,
      select_info: select_info
    });
  } else {
    const max_cnt = surface_list.value.reduce((a, b) => (a.cnt > b.cnt ? a : b)).cnt + 1;
    surface_list.value.push({
      cnt: max_cnt,
      timestamp: timestamp,
      name: "Surf " + max_cnt,
      if_show_name: true,
      select_info: select_info
    });
  }
};

const find_and_add_prolif_data = async (item: Record<string, any>, render_id: string = "0"): Promise<void> => {
  if (!molstar_ref.value) return;
  const bond_color_dict = {
    VdWContact: ColorNames.orange,
    Hydrophobic: ColorNames.green,
    PiStacking: ColorNames.purple,
    Cationic: ColorNames.red,
    "HBDonor/HBAcceptor": ColorNames.blue,
    HBDonor: ColorNames.blue,
    HBAcceptor: ColorNames.blue
  };

  let prolif_data = [];
  let prolif_id_list = [];
  let pdb_string = "";
  for (let i = 0; i < pdb_ligand_inter_list.value.length; i++) {
    if (pdb_ligand_inter_list.value[i].render_id == render_id) {
      prolif_data = pdb_ligand_inter_list.value[i].prolif_data;
      prolif_id_list = pdb_ligand_inter_list.value[i].prolif_id_list;
      pdb_string = pdb_ligand_inter_list.value[i].pdb_string;
      break;
    }
  }

  let tmp_list = [];
  let interaction_list = [];
  for (let i = 0; i < prolif_data.length; i++) {
    tmp_list = prolif_data[i].interaction_dict;
    if (tmp_list.length > 0 && tmp_list[0]["ligand_chain_id"] == item["auth_asym_id"] && tmp_list[0]["ligand_residue_number"] == item["auth_residue_number"]) {
      interaction_list = prolif_data[i].interaction_dict;
      break;
    }
  }

  for (let i = 0; i < interaction_list.length; i++) {
    const prolif_id = "Prolif_contact_" + render_id + "_" + i;
    console.log("prolif_id", prolif_id);
    prolif_id_list.push(prolif_id);

    await molstar_ref.value.viewerInstance.add_contact({
      structure_ref: "Structure_" + render_id,
      start_query: [{ atom_id: interaction_list[i].ligand_atom_id }],
      end_query: [{ atom_id: interaction_list[i].prot_atom_id }],
      interactionType: interaction_list[i].interaction_type,
      color: bond_color_dict[interaction_list[i].interaction_type],
      id: prolif_id
    });
  }
};

const remove_prolif_line = async (render_id: string = "0"): Promise<void> => {
  if (!molstar_ref.value) return;
  for (let j = 0; j < pdb_ligand_inter_list.value.length; j++) {
    if (pdb_ligand_inter_list.value[j]["render_id"] === render_id) {
      for (let i = 0; i < pdb_ligand_inter_list.value[j].prolif_id_list.length; i++) {
        await molstar_ref.value.viewerInstance.remove_tmp_comp(pdb_ligand_inter_list.value[j].prolif_id_list[i], render_id);
      }
      pdb_ligand_inter_list.value[j].prolif_id_list = [];
      break;
    }
  }
};

/**
 * 创建结合口袋可视化
 * 高亮显示配体周围的结合位点并添加相互作用线条
 * @param item - 配体对象，包含链ID和残基编号
 * @param type - 操作类型：'single'(创建口袋)、'clean'(清理口袋)
 */
const create_pocket = async (item?: MoleculeComponent, type: string = "single"): Promise<void> => {
  if (!molstar_ref.value) return;
  // 移除之前的相互作用线条
  await remove_prolif_line();

  if (type === "clean") {
    // 清理模式：移除口袋相关的临时组件
    await molstar_ref.value.viewerInstance.remove_tmp_comp("Ligand_tmp");
    await molstar_ref.value.viewerInstance.remove_tmp_comp("Ligand_plus_tmp");

    // 恢复默认表示，不显示异原子分子
    await add_or_update_default_repr(1, false);
    has_pocket.value = false;
    return;
  }

  // 标记存在口袋
  has_pocket.value = true;

  // 创建临时配体组件以高亮口袋区域
  await molstar_ref.value.viewerInstance.create_tmp_ligand_comp(item.auth_asym_id, item.auth_residue_number);

  // 设置口袋周围残基的球棍模型表示
  await molstar_ref.value.viewerInstance.update_comp_repr("Ligand_plus_tmp", "Ligand_plus_tmp_bs", true, {
    type: "ball-and-stick",
    size: "uniform",
    sizeParams: { value: 0.9 },
    typeParams: {
      alpha: 0.8,
      ignoreHydrogens: "all",
      ignoreHydrogensVariant: "non-polar"
    },
    color: "element-symbol",
    colorParams: {
      carbonColor: { name: "element-symbol", params: {} },
      colors: { name: "custom", params: ColorMap({ C: ColorNames.gray }) } // 口袋残基碳原子为灰色
    }
  });

  // 添加残基标签
  await molstar_ref.value.viewerInstance.update_comp_repr("Ligand_plus_tmp", "Ligand_plus_tmp_label", true, {
    type: "label",
    sizeParams: { scale: 0.65 },
    colorParams: { value: 0xffffff }, // 白色标签
    typeParams: { alpha: 1, level: granularity.value }
  });

  // 将蛋白质主体设为半透明以突出口袋区域
  await add_or_update_default_repr(0.1, false);

  // 添加蛋白质-配体相互作用线条
  await find_and_add_prolif_data(item);

  // 将相机聚焦到配体
  molstar_ref.value.viewerInstance.visual.focus([item]);
};

const create_label = async (item?: MoleculeComponent | MoleculeComponent[], type: string = "single"): Promise<void> => {
  if (!molstar_ref.value) return;
  if (type === "clean") {
    await molstar_ref.value.viewerInstance.remove_tmp_comp("Label_tmp");
    return;
  } else if (type === "ligands") {
    molstar_ref.value.viewerInstance.visual.select(pdb_info.value.ligand);
  }
  await molstar_ref.value.viewerInstance.create_tmp_label_comp();
  await molstar_ref.value.viewerInstance.update_comp_repr("Label_tmp", "Label_tmp_label", true, {
    type: "label",
    sizeParams: { scale: 0.65 },
    colorParams: { value: 0xffffff },
    typeParams: { alpha: 1, level: granularity.value }
  });
};

const hide_selection = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.visual.hideSelect();
};

const show_selection = async (type: string = "prev", show_params: MoleculeComponent[] = []): Promise<void> => {
  if (!molstar_ref.value) return;
  let ret;
  if (type === "prev") {
    ret = await molstar_ref.value.viewerInstance.visual.show_prev();
  } else if (type === "chain") {
    const ret_no = await molstar_ref.value.viewerInstance.visual._showSelect();
    if (ret_no === -1) {
      ret = { polymer: true, ligand: false, water: false };
      await molstar_ref.value.viewerInstance.recreate_s_c(ret);
      // 隐藏不显示的部分
      // 通过比较pdbinfo找到不显示的部分
      // hide_selection()
      await reverse_show(ret, show_params);
    } else {
      ret = { polymer: false, ligand: false, water: false };
    }
  } else if (type === "water") {
    const ret_no = await molstar_ref.value.viewerInstance.visual._showSelect("Water");
    if (ret_no === -1) {
      ret = { polymer: false, ligand: false, water: true };
      await molstar_ref.value.viewerInstance.recreate_s_c(ret);
      await reverse_show(ret, show_params);
    } else {
      ret = { polymer: false, ligand: false, water: false };
    }
  } else if (type === "ligand") {
    const ret_no = await molstar_ref.value.viewerInstance.visual._showSelect("Ligand");
    if (ret_no === -1) {
      ret = { polymer: false, ligand: true, water: false };
      await molstar_ref.value.viewerInstance.recreate_s_c(ret);
      await reverse_show(ret, show_params);
    } else {
      ret = { polymer: false, ligand: false, water: false };
    }
  } else {
    ret = await molstar_ref.value.viewerInstance.visual.show_all();
  }
  console.log("ret", ret);
  await recreate_repr(1, ret.polymer, ret.ligand, ret.water);
};

const reverse_show = async (ret: SelectionResult, show_params: MoleculeComponent[]): Promise<void> => {
  if (show_params.length === 0) {
    return;
  }
  let hide_params: MoleculeComponent[] = [];
  for (let i = 0; i < show_params.length; i++) {
    if (ret.polymer) {
      hide_params = pdb_info.value.chain.filter(item => item.auth_asym_id !== show_params[i].auth_asym_id);
    } else if (ret.ligand) {
      hide_params = pdb_info.value.ligand.filter(item => item.auth_residue_number !== show_params[i].auth_residue_number);
    } else if (ret.water) {
      hide_params = pdb_info.value.water.filter(item => item.auth_residue_number !== show_params[i].auth_residue_number);
    }
  }
  select_none();
  console.log("hide_params", hide_params);
  if (hide_params.length > 0) {
    quick_select(hide_params);
    hide_selection();
    select_none();
  }
};

const expand_selection = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.visual.expand_select(Number(expand_number.value));
};

/**
 * 添加距离测量（需要先选择两个原子）
 */
const add_distance = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.measure.add_distance();
};

/**
 * 添加角度测量（需要先选择三个原子）
 */
const add_angle = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.measure.add_angle();
};

/**
 * 添加二面角测量（需要先选择四个原子）
 */
const add_dihedral = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.measure.add_dihedral();
};

/**
 * 清除所有测量标记
 */
const clean_measure = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.measure.clean_all_measure();
};

/**
 * 选择所有可见的分子组件
 */
const select_all = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.visual.select_all();
};

/**
 * 取消所有选择
 */
const select_none = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.visual.select_none();
};

/**
 * 反选当前选择的组件
 */
const invert_select = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.visual.inverse_select();
};

const change_water_repr = (): void => {
  if (!molstar_ref.value) return;
  molstar_ref.value.viewerInstance.set_visibility("Water");
};

const show_prolif_func = (): void => {
  show_prolif.value = !show_prolif.value;
  if (show_prolif.value) {
    nextTick(() => {
      if (prolif_ref.value) {
        prolif_ref.value.set_ligand_from_outer();
      }
    });
  }
};

/**
 * 处理视图尺寸变化，重载 Molstar 视图
 */
const handleResize = (): void => {
  if (!molstar_ref.value?.viewerInstance) return;

  console.log("handleResize");
  molstar_ref.value.viewerInstance.plugin.handleResize();
};

// 创建节流版本的 handleResize（200ms 节流）
const throttledHandleResize = throttle(handleResize, 400);

onMounted(async () => {
  await init();
  emit("init-complete");

  // 监听容器尺寸变化（用于侧边栏展开/折叠等情况）
  const viewerContainer = document.getElementById(canvas_id);
  if (viewerContainer) {
    const resizeObserver = new ResizeObserver(() => {
      throttledHandleResize();
    });
    resizeObserver.observe(viewerContainer);

    // 保存 observer 引用以便清理
    (molstar_ref.value as any).resizeObserver = resizeObserver;
  }
});

onUnmounted(() => {
  // 清理 ResizeObserver
  if (molstar_ref.value && molstar_ref.value.resizeObserver) {
    molstar_ref.value.resizeObserver.disconnect();
  }
});

defineExpose({
  init,
  reset_all,
  load_structure,
  set_background,
  toggle_spin,
  full_screen,
  full_screen_type,
  add_shape,
  remove_shape,
  reset_camera,
  add_mouse_event,
  expand_selection,
  granularity,
  expand_number,
  pdb_info,
  chain_repr,
  old_repr,
  quick_select,
  hide_selection,
  show_selection,
  get_pdb_info,
  create_pocket,
  set_ligand_view_id_visibility,
  remove_ligand_view_pdb,
  select_none,
  change_water_repr,
  prolif_ref,
  show_prolif_func
});
</script>

<template>
  <div class="relative w-full h-full" :class="{ full_frame: full_screen_type }">
    <div :id="canvas_id" ref="molstar_ref" class="drugflow_molstar w-full h-full min-w-[300px] min-h-[300px]" :class="{ drugflow_molstar_no_sequence: !props.if_sequence_panel }" />
    <div v-show="props.show_tool" class="absolute top-[8px] w-full">
      <el-row class="mx-auto w-[40rem]">
        <el-col :span="3" class="flex_def" />
        <el-col :span="3" class="flex_def">
          <el-popover placement="bottom" title="Set Granularity" :width="80" trigger="hover" popper-class="molstar_popper">
            <template #reference>
              <molstar_btn svg_name="granularity" title="Set Granularity" />
            </template>
            <el-radio-group v-model="granularity" @change="set_granularity">
              <el-radio label="chain" size="small">Chain</el-radio>
              <el-radio label="residue" size="small">Residue</el-radio>
              <el-radio label="element" size="small">Atom</el-radio>
            </el-radio-group>
          </el-popover>
          <el-popover placement="bottom" title="Quick Select" :width="80" trigger="hover" popper-class="molstar_popper">
            <template #reference>
              <molstar_btn svg_name="quick_select" title="Quick Select" />
            </template>
            <div class="flex_column">
              <div>
                <el-button link size="small" class="molstar_btn_inner" @click="quick_select(undefined, 'chains')">All Chains</el-button>
              </div>
              <div v-for="item in pdb_info.chain" :key="item.key">
                <el-button link size="small" class="molstar_btn_inner" @click="quick_select(item)">Chain: {{ item.auth_asym_id }}</el-button>
              </div>
              <el-divider v-if="pdb_info.ligand.length" class="my-[8px]" />
              <div>
                <el-button link size="small" class="molstar_btn_inner" @click="quick_select(undefined, 'ligands')">All Ligands</el-button>
              </div>
              <div v-for="item in pdb_info.ligand" :key="item.key">
                <el-button link size="small" class="molstar_btn_inner" @click="quick_select(item)">{{ item.auth_asym_id }}: {{ item.residue_name }}: {{ item.auth_residue_number }}</el-button>
              </div>
              <el-divider v-if="pdb_info.water.length" class="my-[8px]" />
              <div v-if="pdb_info.water.length">
                <el-button link size="small" class="molstar_btn_inner" @click="quick_select(undefined, 'water')">All Water</el-button>
              </div>
            </div>
          </el-popover>
          <el-popover placement="bottom" title="More Selection" :width="80" trigger="hover" popper-class="molstar_popper">
            <template #reference>
              <molstar_btn svg_name="expand" title="More Selection" />
            </template>
            <div>
              <el-button link size="small" class="molstar_btn_inner" @click="select_all()">Select All</el-button>
            </div>
            <div>
              <el-button link size="small" class="molstar_btn_inner" @click="select_none()">Select None</el-button>
            </div>
            <div>
              <el-button link size="small" class="molstar_btn_inner" @click="invert_select()">Invert Select</el-button>
            </div>
            <el-divider class="my-[8px]" />
            <div class="text-[12px] my-[8px]">Expand</div>
            <el-row :gutter="8">
              <el-col :span="12">
                <el-input v-model="expand_number" size="small" :min="1" :max="10" />
              </el-col>
              <el-col :span="2">
                <div class="text-[12px]">Å</div>
              </el-col>
              <el-col :span="10" class="flex_def">
                <el-button type="primary" size="small" class="w-[30px] ml-[8px]" @click="expand_selection">OK</el-button>
              </el-col>
            </el-row>
          </el-popover>
        </el-col>
        <el-col :span="1" class="flex_def" />
        <el-col :span="5" class="flex_def">
          <el-popover placement="bottom" title="Create Surface" :width="180" trigger="hover" popper-class="molstar_popper" :disabled="props.disable_comp_btn">
            <template #reference>
              <molstar_btn svg_name="create_surface" title="Create Surface" :disabled="props.disable_comp_btn" />
            </template>
            <div class="flex_column">
              <div>
                <el-button link size="small" class="molstar_btn_inner" @click="create_surface(undefined, 'selection')">For Selection</el-button>
              </div>
              <el-divider v-if="pdb_info.chain.length" class="my-[8px]" />
              <div v-for="item in pdb_info.chain" :key="item.key">
                <el-button link size="small" class="molstar_btn_inner" @click="create_surface(item)">Chain: {{ item.auth_asym_id }}</el-button>
              </div>
              <el-divider v-if="pdb_info.ligand.length" class="my-[8px]" />
              <div v-for="item in pdb_info.ligand" :key="item.key">
                <el-button link size="small" class="molstar_btn_inner" @click="create_surface(item)">{{ item.auth_asym_id }}: {{ item.residue_name }}: {{ item.auth_residue_number }}</el-button>
              </div>
              <el-divider v-if="surface_list.length" class="my-[8px]" />
              <div v-for="item in surface_list" :key="item.timestamp" class="mb-[5px]">
                <el-button
                  v-show="item.if_show_name"
                  type="primary"
                  :class="{ gray_btn: item.hide }"
                  size="small"
                  class="w-[70px] mr-[12px]"
                  @click="
                    item.hide = !item.hide;
                    set_visibility('Surface_' + item.timestamp);
                  "
                >
                  {{ item.name }}
                </el-button>
                <el-input v-show="!item.if_show_name" v-model="item.name" size="small" class="w-[70px] mr-[12px]" @keyup.enter="item.if_show_name = !item.if_show_name" />
                <el-button size="small" circle @click="item.if_show_name = !item.if_show_name">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="danger" size="small" circle @click="create_surface(undefined, 'clean', item.timestamp)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </el-popover>
          <el-popover placement="bottom" title="Create Pocket" :width="180" trigger="hover" popper-class="molstar_popper" :disabled="props.disable_comp_btn || wait_proif">
            <template #reference>
              <molstar_btn svg_name="create_pocket" title="Create Pocket" :disabled="props.disable_comp_btn" />
            </template>
            <div class="flex_column">
              <div v-for="item in pdb_info.ligand" :key="item.key">
                <el-button link size="small" class="molstar_btn_inner" @click="create_pocket(item)">{{ item.auth_asym_id }}: {{ item.residue_name }}: {{ item.auth_residue_number }}</el-button>
              </div>
              <div v-if="pdb_info.ligand.length === 0">
                <el-button link size="small" class="molstar_btn_inner" disabled>No Pocket</el-button>
              </div>
              <el-divider class="my-8px" />
              <div>
                <el-button link size="small" class="molstar_btn_inner" @click="create_pocket(undefined, 'clean')">Clean Pocket</el-button>
              </div>
              <el-divider v-if="has_pocket" class="my-8px" />
              <div v-if="has_pocket">
                <el-checkbox v-model="if_hide_chain" label="Hide Non-Pocket Atoms" size="small" @change="hide_chain" />
              </div>
            </div>
          </el-popover>
          <el-popover placement="bottom" title="Create Label" :width="80" trigger="hover" popper-class="molstar_popper" :disabled="props.disable_comp_btn">
            <template #reference>
              <molstar_btn svg_name="create_label" title="Create Label" :disabled="props.disable_comp_btn" />
            </template>
            <div class="flex_column">
              <div>
                <el-button link size="small" class="molstar_btn_inner" @click="create_label(undefined, 'selection')">For Selection</el-button>
              </div>
              <div>
                <el-button link size="small" class="molstar_btn_inner" @click="create_label(undefined, 'ligands')">All Ligands</el-button>
              </div>
              <el-divider class="my-[8px]" />
              <div>
                <el-button link size="small" class="molstar_btn_inner" @click="create_label(undefined, 'clean')">Clean Label</el-button>
              </div>
            </div>
          </el-popover>

          <el-popover placement="bottom" title="Create Measurement" :width="80" trigger="hover" popper-class="molstar_popper">
            <template #reference>
              <molstar_btn svg_name="measure" title="Measure" />
            </template>
            <div class="flex_column">
              <div>
                <el-tooltip effect="light" content="请先选择两个原子再添加距离测量" placement="right">
                  <el-button link size="small" class="molstar_btn_inner" @click="add_distance()">Add Distance</el-button>
                </el-tooltip>
              </div>
              <div>
                <el-tooltip effect="light" content="请先选择三个原子再添加角度测量" placement="right">
                  <el-button link size="small" class="molstar_btn_inner" @click="add_angle()">Add Angle</el-button>
                </el-tooltip>
              </div>
              <div>
                <el-tooltip effect="light" content="请先选择四个原子再添加二面角测量" placement="right">
                  <el-button link size="small" class="molstar_btn_inner" @click="add_dihedral()">Add Dihedral</el-button>
                </el-tooltip>
              </div>
              <el-divider class="my-[8px]" />
              <div>
                <el-button link size="small" class="molstar_btn_inner" @click="clean_measure()">Clean Measure</el-button>
              </div>
            </div>
          </el-popover>

          <el-popover placement="bottom" title="More" :width="80" trigger="hover" popper-class="molstar_popper" :disabled="props.disable_comp_btn">
            <template #reference>
              <molstar_btn svg_name="more" title="More" :disabled="props.disable_comp_btn" />
            </template>
            <div class="flex_column">
              <div>
                <el-button link size="small" class="molstar_btn_inner" :disabled="has_pocket || has_surface || props.disable_comp_btn" @click="hide_selection()">Hide Selection</el-button>
              </div>
              <div>
                <el-button link size="small" class="molstar_btn_inner" :disabled="has_pocket || has_surface || props.disable_comp_btn" @click="show_selection('prev')">Show Selection</el-button>
              </div>
              <div>
                <el-button link size="small" class="molstar_btn_inner" :disabled="has_pocket || has_surface || props.disable_comp_btn" @click="show_selection('all')">Show All</el-button>
              </div>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="1" class="flex_def" />
        <el-col :span="8" class="flex_def">
          <el-popover placement="bottom" title="Change Background" :width="80" trigger="hover" popper-class="molstar_popper">
            <template #reference>
              <molstar_btn svg_name="moon" title="Change Background" />
            </template>
            <el-radio-group v-model="background" @change="change_background">
              <el-radio label="white" size="small">White</el-radio>
              <el-radio label="black" size="small">Black</el-radio>
            </el-radio-group>
          </el-popover>
          <el-popover placement="bottom" title="Change Repr" :width="80" trigger="hover" popper-class="molstar_popper" :disabled="props.disable_comp_btn">
            <template #reference>
              <molstar_btn svg_name="cartoon" title="Change Repr" :disabled="props.disable_comp_btn" />
            </template>
            <el-radio-group v-model="chain_repr" class="items-start flex-col" @change="change_repr">
              <el-radio label="cartoon" size="small">Cartoon</el-radio>
              <el-radio label="bs" size="small">Ball & Stick</el-radio>
              <el-radio label="sf" size="small">
                Spacefill
                <span class="w-[60px]" />
              </el-radio>
              <el-radio label="line" size="small">Line</el-radio>
            </el-radio-group>
          </el-popover>
          <molstar_btn svg_name="interaction" title="Show 2D Interaction" @click="show_prolif_func" />
          <molstar_btn svg_name="screen_shot" title="Screen Shot" @click="make_screenshot" />
          <molstar_btn svg_name="goto_center" title="Goto Center" @click="reset_camera" />
          <molstar_btn svg_name="rotate" title="Rotate" @click="toggle_spin" />
          <molstar_btn svg_name="full_screen" @click="full_screen" />
          <molstar_btn svg_name="reset" title="Reset" @click="reset_all" />
        </el-col>
        <el-col :span="3" class="flex_def" />
      </el-row>
    </div>
    <el-dialog v-model="show_prolif" title="2D Interaction" width="70%" top="4vh">
      <prolif_iframe ref="prolif_ref" :pdb_ligand_inter_list="pdb_ligand_inter_list" :show_ligname="props.prolif_show_ligname" />
    </el-dialog>
  </div>
</template>

<style scoped lang="css">
:deep(.drugflow_molstar .msp-plugin .msp-viewport) {
  background-color: #fcfbf9 !important;
}

.gray_btn {
  background-color: #888888 !important;
}
.molstar_btn_inner {
  margin: 0.3rem 0;
  display: block;
}
.full_frame {
  position: fixed !important;
  left: 0;
  top: 0;
  z-index: 1001;
  width: 100vw !important;
  height: 100vh !important;
}
</style>

<style>
.molstar_popper .el-popover__title {
  font-size: 12px !important;
  font-weight: 600;
  color: #999;
}
.drugflow_molstar .msp-layout-main {
  top: 0px !important;
  bottom: 97px !important;
}
.drugflow_molstar_no_sequence .msp-layout-main {
  bottom: 0px !important;
}
.drugflow_molstar .msp-layout-top {
  bottom: 0 !important;
  top: auto !important;
}
.drugflow_molstar .msp-plugin .msp-viewport-top-left-controls {
  display: none;
}
.drugflow_molstar .msp-plugin .msp-selection-viewport-controls {
  display: none;
}
.drugflow_molstar .msp-plugin .msp-viewport-controls {
  display: none;
}
.drugflow_molstar .msp-plugin .msp-layout-standard {
  border: none;
}
</style>
