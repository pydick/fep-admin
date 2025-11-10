export const data2 = [
  {
    SMILES: "[H]c1nc(C2(C([H])([H])N([H])C(=O)[C@](N([H])C(=O)N([H])c3c([H])c([H])c([N+](=O)[O-])c([H])c3[H])(C([H])([H])[H])C([H])([H])c3c([H])n([H])c4c([H])c([H])c([H])c([H])c34)C([H])([H])C([H])([H])C([H])([H])C([H])([H])C2([H])[H])c([H])c([H])c1OC([H])([H])[H]", // 配体分子的SMILES字符串表示（包含氢原子）
    _id: 5854914, // 内部唯一标识ID
    row_id: 0, // 行索引ID
    raw_data: {
      ID: "1", // 原始数据ID
      smiles: "COc1ccc(C2(CNC(=O)[C@](C)(Cc3c[nH]c4ccccc34)NC(=O)Nc3ccc([N+](=O)[O-])cc3)CCCCC2)nc1", // 原始SMILES字符串
      number: "CR51-101", // 化合物编号
      other_attr: "", // 其他属性
      trace: "P1" // 追踪标识
    },
    iso_id: 1, // 异构体ID
    ori_id: 1, // 原始ID
    show_id: "1-1-1", // 显示用的ID（格式：原始ID-异构体ID-残基索引）
    key: null, // 键值（可为空）
    values: {
      RTMScore: 38.611, // RTM评分
      _iso_id: 1, // 内部异构体ID
      _ori_id: 1, // 内部原始ID
      _res_idx: 1, // 残基索引
      _show_id: "1-1-1", // 内部显示ID
      CarsiScore: -1.741, // Carsi评分（结合亲和力评分）
      residues_full_info: [
        // 残基完整信息数组
        {
          distance: 3.84, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [1280], // 蛋白质原子ID数组
          ligand_atom_id: [7779], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "Hydrophobic", // 相互作用类型（疏水相互作用）
          prot_residue_name: "PRO", // 蛋白质残基名称
          prot_residue_number: "117", // 蛋白质残基编号
          ligand_atom_id_inres: [12], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        },
        {
          distance: 3.38, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [2554], // 蛋白质原子ID数组
          ligand_atom_id: [7802], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "Hydrophobic", // 相互作用类型（疏水相互作用）
          prot_residue_name: "PRO", // 蛋白质残基名称
          prot_residue_number: "198", // 蛋白质残基编号
          ligand_atom_id_inres: [35], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        },
        {
          distance: 3.9, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [2752], // 蛋白质原子ID数组
          ligand_atom_id: [7796], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "Hydrophobic", // 相互作用类型（疏水相互作用）
          prot_residue_name: "HIS", // 蛋白质残基名称（组氨酸）
          prot_residue_number: "210", // 蛋白质残基编号
          ligand_atom_id_inres: [29], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        },
        {
          distance: 3.6, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [2261], // 蛋白质原子ID数组
          ligand_atom_id: [7796], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "Hydrophobic", // 相互作用类型（疏水相互作用）
          prot_residue_name: "PHE", // 蛋白质残基名称（苯丙氨酸）
          prot_residue_number: "178", // 蛋白质残基编号
          ligand_atom_id_inres: [29], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        },
        {
          distance: 3.15, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [6770], // 蛋白质原子ID数组
          ligand_atom_id: [7771], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "Hydrophobic", // 相互作用类型（疏水相互作用）
          prot_residue_name: "TRP", // 蛋白质残基名称（色氨酸）
          prot_residue_number: "461", // 蛋白质残基编号
          ligand_atom_id_inres: [4], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        },
        {
          distance: 3.26, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [6813], // 蛋白质原子ID数组
          ligand_atom_id: [7804], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "Hydrophobic", // 相互作用类型（疏水相互作用）
          prot_residue_name: "ASN", // 蛋白质残基名称（天冬酰胺）
          prot_residue_number: "464", // 蛋白质残基编号
          ligand_atom_id_inres: [37], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        },
        {
          distance: 3.59, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [6879], // 蛋白质原子ID数组
          ligand_atom_id: [7803], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "Hydrophobic", // 相互作用类型（疏水相互作用）
          prot_residue_name: "TYR", // 蛋白质残基名称（酪氨酸）
          prot_residue_number: "468", // 蛋白质残基编号
          ligand_atom_id_inres: [36], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        },
        {
          distance: 5.16, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [2755, 2756, 2758, 2760, 2762], // 蛋白质原子ID数组
          ligand_atom_id: [7794, 7795, 7796, 7797, 7801, 7802], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "PiStacking", // 相互作用类型（π-π堆积）
          prot_residue_name: "HIS", // 蛋白质残基名称（组氨酸）
          prot_residue_number: "210", // 蛋白质残基编号
          ligand_atom_id_inres: [27, 28, 29, 30, 34, 35], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        },
        {
          distance: 4.78, // 相互作用距离（单位：埃）
          ligand_name: "UNL", // 配体名称
          prot_atom_id: [7276, 7279, 7282], // 蛋白质原子ID数组
          ligand_atom_id: [7769, 7770, 7771, 7772, 7808, 7809], // 配体原子ID数组
          ligand_chain_id: "A", // 配体链ID
          interaction_type: "PiCation", // 相互作用类型（π-阳离子相互作用）
          prot_residue_name: "ARG", // 蛋白质残基名称（精氨酸）
          prot_residue_number: "492", // 蛋白质残基编号
          ligand_atom_id_inres: [2, 3, 4, 5, 41, 42], // 配体残基内原子ID数组
          ligand_residue_number: "611", // 配体残基编号
          prot_residue_chain_id: "A" // 蛋白质残基链ID
        }
      ],
      Residues: ["A.PRO.117", "A.PRO.198", "A.HIS.210", "A.PHE.178", "A.TRP.461", "A.ASN.464", "A.TYR.468", "A.HIS.210", "A.ARG.492"] // 参与相互作用的残基列表（格式：链ID.残基名称.残基编号）
    },
    weight: 101, // 权重值
    finished: true, // 是否已完成计算
    affinity: -1.741, // 结合亲和力（与CarsiScore相同）
    RTMS: 38.611 // RTM评分（与RTMScore相同）
  }
];
