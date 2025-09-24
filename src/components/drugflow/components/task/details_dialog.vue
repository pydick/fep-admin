<template>
  <div>
    <div style="max-height: 60vh; overflow-y: auto; padding-right: 10px">
      <div v-if="options.data.type == 'docking'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.others.name }}
        </div>
        <div>
          <span class="title">{{ t("result.蛋白文件名称") }}：</span>
          {{ params_data?.pdb_name }}
        </div>
        <div>
          <span class="title">{{ t("result.蛋白预处理") }}：</span>
        </div>
        <div class="table_box_column">
          <div class="table_item">
            <div class="table_title">Keep Chain</div>
            <div class="table_title">Add Missing Residue</div>
            <div class="table_title">Add Hydrogens</div>
            <div class="table_title">Modify Protonation at pH</div>
            <div class="table_title">Optimize Hydrogen Bonding Network</div>
            <div class="table_title">Energy Minimization Forcefield</div>
          </div>
          <div class="table_item" style="flex: 1">
            <div class="table_content">{{ params_data?.protein.chain.join(",") }}</div>
            <div class="table_content">{{ params_data?.protein.add_missing_residue }}</div>
            <div class="table_content">{{ params_data?.protein.addh }}</div>
            <div class="table_content">{{ params_data?.protein.ph }}</div>
            <div class="table_content">{{ params_data?.protein.opt_hydrogen }}</div>
            <div class="table_content">{{ params_data?.protein.force_field }}</div>
          </div>
        </div>
        <div>
          <span class="title">{{ t("result.配体文件名称") }}：</span>
          {{ params_data?.others.ligands_name }}
        </div>
        <div>
          <span class="title">{{ t("result.SMILES列") }}：</span>
          {{ params_data?.others.smiles_col }}
        </div>
        <div>
          <span class="title">{{ t("result.配体预处理") }}：</span>
        </div>
        <div class="table_box_column">
          <div class="table_item">
            <div class="table_title">Disconnect Group (Metal Ion/salt Ion)</div>
            <div class="table_title">Only Largest Molecular Fragment</div>
            <div class="table_title">Ionization</div>
            <div class="table_title">Tautomers</div>
            <div class="table_title">Stereoisomers</div>
            <div v-if="params_data?.ligands.is_isomer" class="table_title">Isomers Limit</div>
            <div class="table_title">Forcefield</div>
          </div>
          <div class="table_item" style="flex: 1">
            <div class="table_content">{{ params_data?.ligands.disconnect_group }}</div>
            <div class="table_content">{{ params_data?.ligands.keep_large_fragment }}</div>
            <div class="table_content">
              {{ params_data?.ligands.protonation == "keep" ? "Keep Original State" : params_data?.ligands.protonation }}
              <span v-if="params_data?.ligands.protonation == 'set_pH'">{{ params_data?.ligands.min_ph + "-" + params_data?.ligands.max_ph }}</span>
            </div>
            <div class="table_content">{{ params_data?.ligands.tautomers }}</div>
            <div class="table_content">{{ params_data?.ligands.stereoisomers == "keep" ? "Keep Original Structure" : params_data?.ligands.stereoisomers }}</div>
            <div v-if="params_data?.ligands.is_isomer" class="table_content">{{ params_data?.ligands.isomer_limit }}</div>
            <div class="table_content">{{ params_data?.ligands.molecule_minimize }}</div>
          </div>
        </div>
        <div>
          <span class="title">{{ t("result.对接方法") }}：</span>
          {{ params_data?.docking.scoring_function }}
        </div>
        <div>
          <span class="title">Docking Site：</span>
          {{ params_data?.docking.site }}
        </div>
        <div class="table_box">
          <div class="table_item">
            <div class="table_title">X</div>
            <div class="table_content">{{ Math.round(params_data?.docking.center[0] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Y</div>
            <div class="table_content">{{ Math.round(params_data?.docking.center[1] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Z</div>
            <div class="table_content">{{ Math.round(params_data?.docking.center[2] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Length</div>
            <div class="table_content">{{ Math.round(params_data?.docking.size[0] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Width</div>
            <div class="table_content">{{ Math.round(params_data?.docking.size[1] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Height</div>
            <div class="table_content">{{ Math.round(params_data?.docking.size[2] * 1000) / 1000 }}</div>
          </div>
        </div>
        <div>
          <span class="title">Docking Mode：</span>
          {{ params_data?.docking.flexible == "semi" ? "Semi flexible" : params_data?.docking.flexible }}
        </div>
        <div>
          <span class="title">Output Pose：</span>
          {{ params_data?.docking.num_poses }}
        </div>
      </div>
      <div v-if="options.data.type == 'rescoring'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.蛋白文件名称") }}：</span>
          {{ params_data?.pdb }}
        </div>
        <div>
          <span class="title">{{ t("result.配体文件名称") }}：</span>
          {{ params_data?.ligands }}
        </div>
      </div>
      <div v-if="options.data.type == 'admet-dl'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.方法") }}：</span>
          {{ params_data?.sme ? "MGA(Interpretability)" : "MERT(Pre-train)" }}
        </div>
        <div v-if="params_data?.sme">
          <span class="title">SME：</span>
          {{ params_data?.is_calc_vis }}
        </div>
        <div v-if="params_data?.input_tab">
          <span class="title">{{ t("result.输入方式") }}：</span>
          {{ t("task." + params_data?.input_tab) }}
        </div>
        <div v-if="params_data?.ligands_name">
          <span class="title">{{ t("result.文件名称") }}：</span>
          {{ params_data?.ligands_name }}
        </div>
        <div v-if="params_data?.smiles_col && params_data?.ligands_name.indexOf('.sdf') == -1">
          <span class="title">{{ t("result.SMILES列") }}：</span>
          {{ params_data?.smiles_col }}
        </div>
      </div>
      <div v-if="options.data.type == 'admet-fh' || options.data.type == 'admet-sa'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div v-if="params_data?.input_tab">
          <span class="title">{{ t("result.输入方式") }}：</span>
          {{ t("task." + params_data?.input_tab) }}
        </div>
        <div v-if="params_data?.ligands_name">
          <span class="title">{{ t("result.文件名称") }}：</span>
          {{ params_data?.ligands_name }}
        </div>
        <div v-if="params_data?.smiles_col && params_data?.ligands_name.indexOf('.sdf') == -1">
          <span class="title">{{ t("result.SMILES列") }}：</span>
          {{ params_data?.smiles_col }}
        </div>
      </div>
      <div v-if="options.data.type == 'qsar'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.建模类型") }}：</span>
          {{ params_data?.model_type }}
        </div>
        <div>
          <span class="title">{{ t("result.训练集文件名称") }}：</span>
          {{ params_data?.train_file_name }}
        </div>
        <div v-if="params_data?.dataset_id_test">
          <span class="title">{{ t("result.测试集文件名称") }}：</span>
          {{ params_data?.test_file_name }}
        </div>
        <div>
          <span class="title">{{ t("result.SMILES列") }}：</span>
          {{ params_data?.input_cols.join() }}
        </div>
        <div>
          <span class="title">{{ t("result.标签列") }}：</span>
          {{ params_data?.label_col }}
        </div>
        <div v-if="params_data?.carbonsilicon_train_active_val">
          <span class="title">{{ t("result.正例值") }}：</span>
          {{ params_data?.carbonsilicon_train_active_val }}
        </div>
        <div>
          <span class="title">{{ t("result.建模方法") }}：</span>
          {{ params_data?.train_method }}
        </div>
        <div v-if="params_data?.carbonsilicon_train_desc_name">
          <span class="title">{{ t("result.描述符") }}：</span>
          {{ params_data?.carbonsilicon_train_desc_name }}
        </div>
        <div v-if="train_method?.method === 'transformer'" style="padding-left: 20px">
          <div>
            <span class="title">{{ t("result.模型参数") }}：</span>
          </div>
          <div>
            <span class="title">num_train_epochs：</span>
            {{ params_data?.num_train_epochs }}
          </div>
          <div>
            <span class="title">batch_size：</span>
            {{ params_data?.batch_size }}
          </div>
          <div>
            <span class="title">learning_rate：</span>
            {{ params_data?.learning_rate }}
          </div>
        </div>
      </div>
      <div v-if="options.data.type == 'qsar-test'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.文件名称") }}：</span>
          {{ params_data?.file_name }}
        </div>
        <div>
          <span class="title">{{ t("result.SMILES列") }}：</span>
          {{ params_data?.smiles_col }}
        </div>
        <div>
          <span class="title">{{ t("result.QSAR模型") }}：</span>
          {{ params_data?.model_name }}
        </div>
      </div>
      <div v-if="options.data.type == 'molecular_factory'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.生成类型") }}：</span>
          {{ params_data?.origin_args.generate_mode }}
        </div>
        <div>
          <span class="title">{{ t("result.蛋白文件名称") }}：</span>
          {{ params_data?.origin_args.pdb_name || params_data?.origin_args.dock_pdb_name }}
        </div>
        <div v-if="params_data?.origin_args.docking">
          <span class="title">{{ t("result.口袋") }}：</span>
          {{ params_data?.origin_args.docking.docking.site == "default" ? t("task.自定义") : params_data?.origin_args.docking.docking.site }}
        </div>
        <div class="table_box">
          <div class="table_item">
            <div class="table_title">X</div>
            <div class="table_content">{{ Math.round(params_data?.origin_args.center[0] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Y</div>
            <div class="table_content">{{ Math.round(params_data?.origin_args.center[1] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Z</div>
            <div class="table_content">{{ Math.round(params_data?.origin_args.center[2] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Length</div>
            <div class="table_content">{{ Math.round(params_data?.origin_args.size[0] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Width</div>
            <div class="table_content">{{ Math.round(params_data?.origin_args.size[1] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Height</div>
            <div class="table_content">{{ Math.round(params_data?.origin_args.size[2] * 1000) / 1000 }}</div>
          </div>
        </div>
        <div>
          <span class="title">{{ t("result.参考分子") }}：</span>
          {{ params_data?.origin_args.ori_ligand_site }}
        </div>
        <div>
          <span class="title">{{ t("result.生长片段") }}：</span>
          <!-- {{ params_data?.origin_args.start_atoms.join() }} -->
        </div>
        <div v-if="params_data?.origin_args.ligand_sdf_2d" style="width: 200px; height: 200px; border: 1px solid #e4e7ed">
          <mol_sme_svg :atom_list="params_data?.origin_args.selected_atoms" :smiles="params_data?.origin_args.ligand_sdf_2d" base_font_size="1.1" height="200px" width="200px" :if_atom_index="true" :bond_list="[]" />
        </div>
        <div>
          <span class="title">{{ t("result.活性分子") }}：</span>
          {{ params_data?.origin_args.isActive ? "On" : "Off" }}
        </div>
        <div v-if="params_data?.origin_args.isActive">
          <span class="title">{{ t("result.文件名称") }}：</span>
          {{ params_data?.origin_args.active_file_name }}
        </div>
        <div v-if="params_data?.origin_args.isActive">
          <span class="title">{{ t("result.SMILES列") }}：</span>
          {{ params_data?.molfac_config.ligands_file_smiles_col }}
        </div>
        <div>
          <span class="title">{{ t("result.生成方法") }}：</span>
          {{ params_data?.origin_args.molgen_algos.join() }}
        </div>
        <div>
          <span class="title">{{ t("result.生成数量") }}：</span>
          {{ params_data?.origin_args.gen_num }}
        </div>
        <div>
          <span class="title">{{ t("result.生成时间") }}：</span>
          {{ params_data?.origin_args.gen_time / 60 }} h
        </div>
        <div>
          <span class="title">{{ t("result.过滤条件") }}：</span>
        </div>
        <div class="table_box">
          <div class="table_item">
            <div class="table_title">{{ params_data?.origin_args.filter_args[0].name }}</div>
            <div class="table_content">{{ params_data?.origin_args.filter_args[0].min }} - {{ params_data?.origin_args.filter_args[0].max }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">{{ params_data?.origin_args.filter_args[1].name }}</div>
            <div class="table_content">{{ params_data?.origin_args.filter_args[1].min }} - {{ params_data?.origin_args.filter_args[1].max }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">{{ params_data?.origin_args.filter_args[2].name }}</div>
            <div class="table_content">{{ params_data?.origin_args.filter_args[2].min }} - {{ params_data?.origin_args.filter_args[2].max }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">{{ params_data?.origin_args.filter_args[3].name }}</div>
            <div class="table_content">{{ params_data?.origin_args.filter_args[3].min }} - {{ params_data?.origin_args.filter_args[3].max }}</div>
          </div>
        </div>

        <div v-if="params_data?.origin_args.need_docking">
          <div>
            <span class="title">{{ t("result.配体预处理") }}：</span>
          </div>
          <div class="table_box_column">
            <div class="table_item">
              <div class="table_title">Ionization</div>
              <div class="table_title">Tautomers</div>
              <div class="table_title">Stereoisomers</div>
              <div v-if="params_data?.origin_args.docking.ligands.is_isomer" class="table_title">Isomers Limit</div>
              <div class="table_title">Forcefield</div>
            </div>
            <div class="table_item" style="flex: 1">
              <div class="table_content">
                {{ params_data?.origin_args.docking.ligands.protonation == "keep" ? "Keep Original State" : params_data?.origin_args.docking.ligands.protonation }}
                <span v-if="params_data?.origin_args.docking.ligands.protonation == 'set_pH'">{{ params_data?.origin_args.docking.ligands.min_ph + "-" + params_data?.origin_args.docking.ligands.max_ph }}</span>
              </div>
              <div class="table_content">{{ params_data?.origin_args.docking.ligands.tautomers }}</div>
              <div class="table_content">{{ params_data?.origin_args.docking.ligands.stereoisomers == "keep" ? "Keep Original Structure" : params_data?.origin_args.docking.ligands.stereoisomers }}</div>
              <div v-if="params_data?.origin_args.docking.ligands.is_isomer" class="table_content">{{ params_data?.origin_args.docking.ligands.isomer_limit }}</div>
              <div class="table_content">{{ params_data?.origin_args.docking.ligands.molecule_minimize }}</div>
            </div>
          </div>
          <div v-if="params_data?.origin_args.docking">
            <span class="title">{{ t("result.对接方法") }}：</span>
            {{ params_data?.origin_args.docking.docking.scoring_function }}
          </div>
        </div>
        <div v-if="params_data?.origin_args.is_compare && params_data?.origin_args.need_docking">
          <div v-if="params_data?.origin_args.generate_mode != 'DeNovo'"><span class="title">Docking conformation comparison：</span></div>
          <div v-for="(item, index) in params_data?.origin_args.show_rmsds" :key="index" style="width: 200px; height: 200px; margin: 0 15px 15px 0; border: 1px solid #e4e7ed">
            <span style="margin: 10px">RMSD{{ index + 1 }}</span>
            <mol_sme_svg :atom_list="item" :smiles="params_data?.origin_args.ligand_sdf_2d" base_font_size="1.1" height="180px" width="200px" :if_atom_index="true" :bond_list="[]" />
          </div>
        </div>
        <div v-if="params_data?.origin_args.need_docking">
          <div>
            <span class="title">Atomic Detection：</span>
            {{ params_data?.origin_args.is_position ? "On" : "Off" }}
          </div>
          <div v-if="params_data?.origin_args.atomPosition_labels">{{ params_data?.origin_args.atomPosition_labels.join() }}</div>
        </div>
      </div>
      <div v-if="options.data.type == 'virtual_screening'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.虚筛数据") }}：</span>
          {{ params_data?.input_type == "db" ? params_data?.input_source_labels?.join() : params_data?.virtual_name }}
        </div>
        <div>
          <span class="title">{{ t("result.蛋白文件名称") }}：</span>
          {{ params_data?.pdb_name }}
        </div>
        <div>
          <span class="title">{{ t("result.口袋") }}：</span>
          {{ params_data?.protein.site }}
        </div>
        <div class="table_box">
          <div class="table_item">
            <div class="table_title">X</div>
            <div class="table_content">{{ Math.round(params_data?.protein.center[0] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Y</div>
            <div class="table_content">{{ Math.round(params_data?.protein.center[1] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Z</div>
            <div class="table_content">{{ Math.round(params_data?.protein.center[2] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Length</div>
            <div class="table_content">{{ Math.round(params_data?.protein.size[0] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Width</div>
            <div class="table_content">{{ Math.round(params_data?.protein.size[1] * 1000) / 1000 }}</div>
          </div>
          <div class="table_item">
            <div class="table_title">Height</div>
            <div class="table_content">{{ Math.round(params_data?.protein.size[2] * 1000) / 1000 }}</div>
          </div>
        </div>
        <div v-if="params_data?.steps[0]">
          <div>
            <span class="title">{{ t("result.虚筛Step1") }}：</span>
            {{ params_data?.steps[0].type }}
          </div>
          <div v-if="params_data?.steps[0].args.filter.length > 0" class="table_box">
            <div v-for="item in params_data?.steps[0].args.filter" class="table_item">
              <div class="table_title">{{ item.name }}</div>
              <div class="table_content">{{ item.rules[0].value }} - {{ item.rules[1].value }}</div>
            </div>
          </div>
        </div>
        <div v-if="params_data?.steps[1]">
          <div>
            <span class="title">{{ t("result.虚筛Step2") }}：</span>
            {{ params_data?.steps[1].type }}, Top {{ params_data?.steps[1].args.filter.expect.value }}
          </div>
        </div>
        <div v-if="params_data?.steps[2]">
          <div>
            <span class="title">{{ t("result.虚筛Step3") }}：</span>
            <span v-if="params_data?.steps[2].args.filter.type == 'score'">{{ params_data?.steps[2].type }}, RTMScore ≥ {{ params_data?.steps[2].args.filter.expect.value }}</span>
            <span v-if="params_data?.steps[2].args.filter.type == 'top'">{{ params_data?.steps[2].type }}, Top {{ params_data?.steps[2].args.filter.expect.value }}</span>
            <span v-if="params_data?.steps[2].args.filter.type == 'percent'">{{ params_data?.steps[2].type }}, Top {{ params_data?.steps[2].args.filter.expect.value }}%</span>
          </div>
          <div v-if="params_data?.steps[2].args.isomers" class="table_box">
            <div class="table_item">
              <div class="table_title">Stereoisomers</div>
              <div class="table_content">{{ params_data?.steps[2].args.isomers.stereoisomers == "keep" ? "Keep Original Structure" : params_data?.steps[2].args.isomers.stereoisomers }}</div>
            </div>
            <div class="table_item">
              <div class="table_title">Isomers Limit</div>
              <div class="table_content">{{ params_data?.steps[2].args.isomers.isomer_limit }}</div>
            </div>
            <div class="table_item">
              <div class="table_title">Forcefield</div>
              <div class="table_content">{{ params_data?.steps[2].args.isomers.molecule_minimize }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="options.data.type == 'lig-prep'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.文件名称") }}：</span>
          {{ params_data?.ligands_name }}
        </div>
        <div>
          <span class="title">Disconnect Group：</span>
          {{ params_data?.disconnect_group }}
        </div>
        <div>
          <span class="title">Only Largest Molecular Fragment：</span>
          {{ params_data?.keep_large_fragment }}
        </div>
        <div>
          <span class="title">Ionization：</span>
          {{ params_data?.protonation == "keep" ? "Keep Original State" : params_data?.protonation }}
          <span v-if="params_data?.protonation == 'set_pH'">{{ params_data?.min_ph + "-" + params_data?.max_ph }}</span>
        </div>
        <div>
          <span class="title">Tautomers：</span>
          {{ params_data?.tautomers }}
        </div>
        <div>
          <span class="title">Stereoisomers：</span>
          {{ params_data?.stereoisomers == "keep" ? "Keep Original Structure" : params_data?.stereoisomers }}
        </div>
        <div v-if="params_data?.is_isomer">
          <span class="title">Isomers Limit：</span>
          {{ params_data?.isomer_limit }}
        </div>
        <div>
          <span class="title">Forcefield：</span>
          {{ params_data?.molecule_minimize }}
        </div>
      </div>
      <div v-if="options.data.type == 'protein_process'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.文件名称") }}：</span>
          {{ params_data?.pdb_name }}
        </div>
        <div>
          <span class="title">Keep Chain：</span>
          {{ params_data?.chain_list.join() }}
        </div>
        <div>
          <span class="title">Add Hydrogens：</span>
          {{ params_data?.addh }}
        </div>
        <div v-if="params_data?.modify_protonation">
          <span class="title">modify_protonation at pH：</span>
          {{ params_data?.ph }}
        </div>
        <div>
          <span class="title">Optimize Hydrogen Bonding Network：</span>
          {{ params_data?.opt_hydrogen }}
        </div>
        <div>
          <span class="title">Energy Minimization Forcefield：</span>
          {{ params_data?.force_field }}
        </div>
      </div>
      <div v-if="options.data.type == 'img2mol'">
        <div>
          <span class="title">{{ t("result.任务名称") }}：</span>
          {{ params_data?.name }}
        </div>
        <div>
          <span class="title">{{ t("result.文件名称") }}：</span>
          {{ params_data?.file_name }}
        </div>
        <div>
          <span class="title">{{ t("result.提取范围") }}：</span>
          {{ params_data?.page_list.join() }}
        </div>
      </div>
      <!-- <div v-if="options.data.type == 'cress' || options.data.type == 'cmgnet'">
        <div><span class="title">{{ t('result.任务名称') }}：</span>{{ params_data?.name }}</div>
        <div><span class="title">{{ t('result.碳谱') }}：</span>{{ params_data?.spectrum }}</div>
        <div><span class="title">Smiles：</span>{{ params_data?.smiles.join() }}</div>
      </div> -->
    </div>
    <div style="margin-top: 30px; width: 100%; text-align: right">
      <el-button type="success" @click="options.visible = false">{{ t("message.confirm") }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { refresh_task } from "@drugflow/api/task.js";
import { reactive, ref, defineProps, toRef, defineEmits, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Mol_sme_svg from "@drugflow/components/icon/mol_sme_svg.vue";

const props = defineProps({
  options: Object
});
const options = ref(props.options);
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const params_data = ref();

const form = ref({
  newTeam: [
    {
      name: "",
      quantity: "",
      user_type: "",
      license_time: ""
    }
  ]
});

const deleteRow = index => {
  form.value.newTeam.splice(index, 1);
};

const onAddItem = () => {
  form.value.newTeam.push({
    name: "",
    quantity: "",
    user_type: "",
    license_time: ""
  });
};
const get_date = () => {
  refresh_task(options.value.data.id).then(res => {
    params_data.value = res.data;
    if (options.value.data.type == "molecular_factory") {
      params_data.value.origin_args.molgen_algos.map((item, index) => {
        if (item == "3D-linker") {
          params_data.value.origin_args.molgen_algos[index] = "CarSiLinker";
        } else if (item == "Diff-linker") {
          params_data.value.origin_args.molgen_algos[index] = "CarsiLinker3D";
        }
      });
    }
  });
};
onMounted(() => {
  get_date();
});
</script>
<style scoped lang="scss">
.title {
  font-weight: bold;
}
.table_box {
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ebeef5;
  margin: 10px 0;
  .table_item {
    flex: auto;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
  }
  .table_title {
    white-space: nowrap;
    padding: 5px;
    font-weight: bold;
    border-bottom: 1px solid #ebeef5;
  }
  .table_content {
    white-space: nowrap;
    padding: 5px;
  }
}
.table_box_column {
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #ebeef5;
  margin: 10px 0;
  .table_item {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebeef5;
  }
  .table_title {
    white-space: nowrap;
    padding: 5px;
    font-weight: bold;
    border-bottom: 1px solid #ebeef5;
  }
  .table_content {
    white-space: nowrap;
    padding: 5px;
    border-bottom: 1px solid #ebeef5;
  }
}
</style>
