<template>
  <div style="position: relative; margin: 0 auto" class="flex_def text_c3 text08rem" :style="{ width: width, height: height }">
    <div v-if="request_cpld">
      <div v-if="if_svg" v-html="svg" />
      <p v-else>{{ placeholder }}</p>
    </div>
    <div v-else>
      <el-skeleton :style="{ width: width, height: height }" :loading="loading" animated>
        <template #template>
          <el-skeleton-item variant="image" :style="{ width: width, height: height }" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
import { ref, toRefs, watch } from "vue";
import { init_rdkit_module } from "@drugflow/common/utils.js";
import { draw_api } from "@drugflow/api/common.js";

export default {
  name: "mol_sme_svg",
  components: {},
  props: {
    smiles: {
      type: String,
      default: "Cc1occc1C(=O)Nc1ccccc1"
    },
    width: {
      type: String,
      default: "150px"
    },
    height: {
      type: String,
      default: "120px"
    },
    atom_list: {
      type: Array,
      default: function () {
        return [0, 1, 2];
      }
    },
    atom_color_list: {
      type: Object
    },
    bond_list: {
      type: Array,
      default: function () {
        return [0, 1, 2];
      }
    },
    bond_color_list: {
      type: Object
    },
    if_wait: {
      type: Boolean,
      default: false
    },
    if_atom_index: {
      type: Boolean,
      default: false
    },
    base_font_size: {
      type: Number,
      default: 0.6
    },
    error: {
      type: String,
      default: "draw svg failed"
    },
    change_size: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const svg = ref("");
    const if_svg = ref(false);
    const request_cpld = ref(false);
    const placeholder = ref("Waiting...");

    const atom_list = toRefs(props).atom_list;

    const draw = () => {
      const mol = window.RDKit.get_mol(props.smiles);
      const obj = {};
      if (props.atom_list) {
        obj.atoms = props.atom_list;
      }
      if (props.bonds_list) {
        obj.bonds = props.bonds_list;
      }
      if (props.atom_color_list) {
        obj.highlightAtomColors = props.atom_color_list;
      }
      if (props.bond_color_list) {
        obj.highlightBondColors = props.bond_color_list;
      }
      if (props.if_atom_index) {
        obj.addAtomIndices = props.if_atom_index;
      }
      if (props.base_font_size) {
        obj.baseFontSize = props.base_font_size;
      }
      let s = mol.get_svg_with_highlights(JSON.stringify(obj));
      s = s.replace(/250px/g, props.width);
      s = s.replace(/200px/g, props.height);
      s = s.replace(/opacity:1.0/g, "opacity:0");
      mol.delete();
      svg.value = s;
    };
    const process_dict = dict => {
      const ret = {};
      for (const key in dict) {
        ret[parseInt(key)] = dict[key].slice(0, 4);
      }
      return ret;
    };
    const draw_by_rdkit_end = () => {
      const formdata = new FormData();
      formdata.append("smiles", props.smiles);
      if (!props.change_size) {
        formdata.append("change_size", false);
      }

      const config = {
        highlight_atoms_list: atom_list.value,
        highlight_bonds_list: props.bond_list,
        atom_colors_dict: process_dict(props.atom_color_list),
        bond_colors_dict: process_dict(props.bond_color_list),
        smarts: "",
        show_index: props.if_atom_index
      };
      formdata.append("config", JSON.stringify(config));
      draw_api(formdata)
        .then(res => {
          request_cpld.value = true;
          let s = res.data;
          s = s.replace(/250px/g, props.width);
          s = s.replace(/200px/g, props.height);
          s = s.replace(/opacity:1.0/g, "opacity:0");
          svg.value = s;
          if_svg.value = true;
        })
        .catch(err => {
          request_cpld.value = true;
          console.error(err);
          if_svg.value = false;
          placeholder.value = props.error;
        });
    };

    watch(atom_list, (newValue, oldValue) => {
      draw_by_rdkit_end();
    });

    return {
      svg,
      if_svg,
      request_cpld,
      placeholder,
      draw,
      draw_by_rdkit_end
    };
  },
  mounted() {
    this.draw_by_rdkit_end();
  },
  methods: {
    // async init_and_draw_svg() {
    //   await init_rdkit_module()
    //   this.request_cpld = true
    //   this.draw()
    //   this.if_svg = true
    // }
  }
};
</script>

<style lang="css" scoped></style>
