<template>
  <div id="protein_frame" style="position: relative; height: 100%; min-width: 200px; min-height: 400px">
    <div style="height: calc(100% + 1px); min-height: 500px; min-width: 540px; width: calc(100% + 1px); overflow: visible; position: relative">
      <drugflow_molstar ref="molstar_ref" />
    </div>

    <div v-if="if_cover == true" class="cover_frame">
      <img :src="requireImg('protein3DCover.png')" class="cover_img" alt="protein3D cover" />
    </div>
    <div v-if="if_err == true" class="flex_def cover_tips">
      <div class="text09rem" style="color: #409eff">
        {{ t("screen.请检查输入和网络连接") }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { parse_ligand_string, parse_pdb_info, search_centry } from "./pdb_parser.js";
import drugflow_molstar from "./drugflow_molstar.vue";
import { change_pocket_to_xyz, calc_iou } from "@/components/drugflow-components/utils/common.js";
import { requireImg } from "@/components/drugflow-components/common/utils.js";
import { ElLoading } from "element-plus";

export default {
  name: "protein3d_molstar",
  components: { drugflow_molstar },
  props: {
    box_x: { type: Number },
    box_y: { type: Number },
    box_z: { type: Number },
    l1: { type: Number },
    l2: { type: Number },
    l3: { type: Number },
    if_show_box: { type: Boolean },
    ligand_select: { type: String },
    if_pocket: { type: Boolean, default: false },
    if_show_contact: { type: Boolean, default: false },
    always_show_ligands: { type: Boolean, default: false },
    show_ligands_console: { type: Boolean, default: true },
    surface_opacity: { type: Number, default: 0.3 },
    if_can_change_ligand_type: { type: Boolean, default: false },
    if_changed_box: { type: Boolean, default: false },
    if_click_event: { type: Boolean, default: true },
    pocket_check: { type: Boolean, default: false }
  },
  setup(props, context) {
    const { t } = useI18n();
    const if_cover = ref(true);
    const if_loading = ref(false);
    const if_err = ref(false);
    const chain_content = ref([]);
    const ligand_content = ref([]);
    const box_params = ref({
      x: 100,
      y: 100,
      z: 100
    });
    const loading = ref(null);
    const ligand_names_list = ref([]);
    const molstar_ref = ref(null);
    const pdb_string = ref("");

    return {
      t,
      context,
      if_cover,
      if_loading,
      loading,
      if_err,
      chain_content,
      ligand_content,
      box_params,
      ligand_names_list,
      molstar_ref,
      pdb_string,
      requireImg
    };
  },
  mounted() {
    if (this.if_click_event) {
      setTimeout(() => {
        try {
          this.molstar_ref.add_mouse_event(this.mouse_event);
        } catch (err) {
          console.log(err);
          //  忽略该错误
        }
      }, 2500);
    }
  },
  onBeforeUnmount() {
    // document.getElementById('protein_frame').innerHTML = ''
  },
  methods: {
    /**
     * 异步加载蛋白质结构数据
     * @param {string} pdb_string - PDB格式的蛋白质结构字符串数据
     * @param {string} format - 结构数据格式，默认为'pdb'
     * @returns {Object} 返回包含蛋白质链信息和配体信息的对象
     */
    async loadStructure(pdb_string, format = "pdb") {
      // 显示加载动画
      this.open_loading();

      // 初始化错误状态和保存PDB数据
      this.if_err = false;
      this.pdb_string = pdb_string;

      // 解析PDB数据，提取配体和结构信息
      this.ligand_names_list = parse_ligand_string(pdb_string); // 解析配体名称列表
      const info_dict = parse_pdb_info(pdb_string); // 解析PDB结构信息
      this.chain_content = info_dict["chain"]; // 提取蛋白质链信息
      this.ligand_content = info_dict["ligand"]; // 提取配体信息

      // 如果没有配体且开启了口袋检查，触发相关事件
      if (this.ligand_names_list.length === 0 && this.pocket_check) {
        this.context.emit("iou_func", true);
      }

      try {
        // 配置Molstar加载参数
        const init_params = {
          url: undefined, // 不使用URL加载
          format: format, // 数据格式
          is_binary: false, // 非二进制格式
          input: pdb_string, // 输入的PDB字符串
          if_render: true, // 是否渲染
          render_type: "default", // 默认渲染类型
          render_id: "0", // 渲染ID
          if_clean: true, // 是否清理之前的结构
          pdb_name: "ref" // PDB结构名称
        };

        // 调用Molstar加载结构
        await this.molstar_ref.load_structure(init_params);
      } catch (err) {
        // 捕获加载错误，记录日志并关闭加载动画
        console.log("err: ", err);
        this.close_loading(true);
        return;
      }

      // 合并配体信息
      this.combine_ligand_info();

      // 关闭加载动画
      this.close_loading();

      // 返回解析的蛋白质和配体信息
      return {
        protein_content: this.chain_content,
        protein_lig_content: this.ligand_content
      };
    },
    combine_ligand_info() {
      const ligands = this.molstar_ref.get_pdb_info().ligand;
      for (let i = 0; i < this.ligand_content.length; i++) {
        for (let j = 0; j < ligands.length; j++) {
          const chain_name = ligands[j].auth_asym_id;
          const residue_id = ligands[j].auth_residue_number;
          if (this.ligand_content[i].residue_id == residue_id && this.ligand_content[i].chain_name === chain_name) {
            this.ligand_content[i].auth_asym_id = ligands[j].auth_asym_id;
            this.ligand_content[i].auth_residue_number = ligands[j].auth_residue_number;
            break;
          }
        }
      }
      console.log("ligand_content", this.ligand_content);
    },

    add_shape(x, y, z, l1, l2, l3, flag = true) {
      if (this.shape_selector) {
        this.molstar_ref.remove_shape(this.shape_selector);
      }
      const params = {
        x: Number(x),
        y: Number(y),
        z: Number(z),
        l1: Number(l1),
        l2: Number(l2),
        l3: Number(l3)
      };
      this.molstar_ref.add_shape(params).then(c => {
        this.shape_selector = c;
        this.context.emit("update:box_x", x);
        this.context.emit("update:box_y", y);
        this.context.emit("update:box_z", z);
        if (flag) {
          this.context.emit("update:ligand_select", "default");
        }
      });
    },

    get_pdb_info() {
      return this.molstar_ref.get_pdb_info();
    },

    remove_shape() {
      if (this.shape_selector) {
        this.molstar_ref.remove_shape(this.shape_selector);
      }
    },

    async change_chain(chain_name, if_show, chain_id) {
      this.molstar_ref.select_none();
      if (!if_show) {
        await this.molstar_ref.quick_select({
          auth_asym_id: chain_name,
          group_PDB: "ATOM"
        });
        await this.molstar_ref.hide_selection();
      } else {
        await this.molstar_ref.quick_select({
          auth_asym_id: chain_name,
          group_PDB: "ATOM"
        });
        await this.molstar_ref.show_selection("chain", [{ auth_asym_id: chain_name, group_PDB: "ATOM" }]);
      }
    },

    calc_coords_info(ligand_atoms_list) {
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
    },
    calc_ligand_box(ligand_dict, expand = 10) {
      // 绘制pocket view
      console.log("ligand_dict", ligand_dict);
      if (!ligand_dict) {
        const centry = search_centry(this.pdb_string);
        return {
          x: centry[0],
          y: centry[1],
          z: centry[2],
          l1: 25,
          l2: 25,
          l3: 25
        };
      }
      // this.molstar_ref.create_pocket(ligand_dict)
      // get ligand coord info
      const coords_info = this.calc_coords_info(ligand_dict.coords);
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
    },
    select_and_focus(d) {
      const data = this.change_data_name(d);
      this.molstar_ref.select_none();
      if (data.struct_asym_id != undefined) {
        this.molstar_ref.quick_select({
          auth_asym_id: data.struct_asym_id,
          start_residue_number: data.start_residue_number,
          end_residue_number: data.end_residue_number,
          focus: true
        });
      } else if (data.start_residue_number) {
        this.molstar_ref.quick_select({
          start_residue_number: data.start_residue_number,
          end_residue_number: data.end_residue_number,
          focus: true
        });
      } else if (data.auth_asym_id && data.residue_number) {
        this.molstar_ref.quick_select({
          auth_asym_id: data.auth_asym_id,
          residue_number: data.residue_number,
          focus: true
        });
      } else {
        this.molstar_ref.quick_select({
          residue_number: data.residue_number,
          focus: true
        });
      }
    },
    change_data_name(data) {
      const ret = data;
      if (ret.chain_id != undefined) {
        ret.auth_asym_id = ret.chain_id;
      }
      return ret;
    },
    async select_show_hide(data, isShow) {
      this.molstar_ref.select_none();
      if (data.struct_asym_id != undefined) {
        await this.molstar_ref.quick_select({
          auth_asym_id: data.struct_asym_id,
          start_residue_number: data.start_residue_number,
          end_residue_number: data.end_residue_number,
          focus: true
        });
      } else if (data.start_residue_number) {
        await this.molstar_ref.quick_select({
          start_residue_number: data.start_residue_number,
          end_residue_number: data.end_residue_number,
          focus: true
        });
      } else {
        await this.molstar_ref.quick_select({
          residue_number: data.residue_number,
          focus: true
        });
      }

      if (isShow) {
        await this.molstar_ref.show_selection("chain");
      } else {
        await this.molstar_ref.hide_selection();
      }
    },
    select_none() {
      this.molstar_ref.select_none();
    },
    quick_select(params, type = "single", not_focus) {
      this.molstar_ref.quick_select(params, type, not_focus);
    },
    async show_selection(type = "prev") {
      await this.molstar_ref.show_selection(type);
    },
    async hide_selection() {
      await this.molstar_ref.hide_selection();
    },
    reset_camera() {
      this.molstar_ref.reset_camera();
    },
    clean_old_data() {
      // this.molstar_ref.reset_all()
      this.chain_content = [];
      this.ligand_content = [];
      this.shape_selector = null;
    },
    open_loading(content) {
      this.if_cover = false;
      if (this.loading) {
        this.loading.close();
        this.loading = null;
      }
      this.loading = ElLoading.service({
        target: document.getElementById("protein_frame"),
        text: content,
        background: "rgba(255, 255, 255, 0.4)"
      });
    },
    close_loading(flag) {
      this.loading.close();
      this.loading = null;
      if (flag) {
        this.if_err = true;
      }
    },
    mouse_event(e) {
      if (e.button === 1 && e.current && e.current.loci.kind !== "empty-loci") {
        const position = e.position;
        let flag = false;
        if (this.if_show_box === true) {
          if (this.pocket_check) {
            for (let i = 0; i < this.ligand_content.length; i++) {
              const pocket_coord_dict = change_pocket_to_xyz(this.ligand_content[i].max_min_coord);
              const iou = calc_iou(pocket_coord_dict, {
                x: position[0],
                y: position[1],
                z: position[2],
                l1: this.l1,
                l2: this.l2,
                l3: this.l3
              });
              console.log("iou: ", iou);
              if (iou > 0.5) {
                flag = true;
                break;
              }
              flag = false;
            }
          }

          this.context.emit("update:if_changed_box", true);
          this.add_shape(position[0], position[1], position[2], this.l1, this.l2, this.l3);
          console.log("click func flag: ", flag);
          if (!flag) {
            // 触发父组件函数
            this.context.emit("iou_func", true);
          } else {
            this.context.emit("iou_func", false);
          }
        }
      }
    }
  }
};
</script>

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
  width: 70%;
  max-width: 500px;
  margin-top: 100px;
  opacity: 0.2;
}
.cover_frame {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #fff;
  top: 0;
  left: 0;
  z-index: 1001;
  text-align: center;
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
