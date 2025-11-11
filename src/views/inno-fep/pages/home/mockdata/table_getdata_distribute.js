export const distribute_data = {
  id: 15337,
  name: "Docking Task 2917",
  type: "docking",
  state: "finished",
  compute: {
    total: 20,
    ligands: {
      error: "cs_c7a372ej2l_docking_lig_err_69032ac59a07344f97985f7f.json",
      total: 20,
      success: ["cs_e3ck6efzbo_docking_ligands_chunk_0_69032ac59a07344f97985f7f.json"]
    },
    agg_revision: 1,
    aggregations: {
      histogram: {
        RTMS: {
          max: 34.682224586784905,
          min: 18.746433339295763,
          amount: [1, 1, 1, 5, 2, 4, 3, 2, 1]
        },
        affinity: {
          max: 8.312792003154755,
          min: -3.2078026682138443,
          amount: [6, 3, 4, 3, 1, 1, 1, 1]
        },
        residues: ["A.THR.790", "A.ALA.755", "A.LEU.862", "A.ILE.759", "A.ALA.743", "A.VAL.786", "A.MET.766", "A.LEU.858", "A.LEU.777", "A.LEU.747", "A.LEU.788", "A.GLU.762", "A.ASP.855", "A.GLY.857", "A.THR.854", "A.PHE.723", "A.THR.751", "A.LYS.745", "A.ALA.763", "A.PHE.856"]
      }
    },
    created_time: "2025-10-30 09:04:59",
    finished_time: "2025-10-30 17:09:10",
    progress_show: 100,
    progress_stage: "carsidock"
  },
  args: {
    mol: ["axok73hd0a06d4xb"],
    pdb: ["qn1jl84fu3lislun"],
    others: {
      pdb: "qn1jl84fu3lislun",
      name: "Docking Task 2917",
      ws_id: "v4f772lfk8p7ntby",
      ligands: "axok73hd0a06d4xb",
      smiles_col: "Smiles",
      total_ligands: 20
    },
    account: "person",
    docking: {
      site: "A:KY9:1102",
      size: [28.217, 18.051, 23.973],
      center: ["24.702", "-10.003", "-13.378"],
      radius: 20.595766670604906,
      distance: 4.5,
      flexible: "semi",
      num_poses: 1,
      scoring_function: "carsidock",
      rescoring_functions: ["RTMS"]
    },
    ligands: {
      max_ph: 7.6,
      min_ph: 7.2,
      ligands: "Ligand_Example_01.csv",
      mol_tab: "示例文件",
      is_isomer: true,
      tautomers: false,
      protonation: "set_pH",
      isomer_limit: 5,
      stereoisomers: "retain",
      disconnect_group: true,
      molecule_minimize: "MMFF94",
      keep_large_fragment: true
    },
    protein: {
      ph: 7.4,
      addh: true,
      chain: ["A"],
      pdb_tab: "示例文件",
      delete_args: {
        hets: [
          {
            chain_id: "A",
            residue_number: "1102"
          }
        ],
        water: [],
        chains: [],
        irrelevant_waters: false
      },
      delete_hets: [
        {
          chain_id: "A",
          residue_number: "1102"
        }
      ],
      force_field: "amber14/protein.ff14SB",
      delete_water: [],
      opt_hydrogen: true,
      delete_chains: [],
      if_delete_hets: true,
      irrelevant_waters: false,
      need_prot_process: true,
      modify_protonation: true,
      add_missing_residue: true,
      if_delete_comps_by_user_define: true
    },
    pdb_name: "8a27.pdb",
    ligands_name: "Ligand_Example_01.csv"
  },
  created_at: "2025-10-30T09:04:59.605814Z",
  attachments: [
    {
      name: "pdb",
      content: "http://172.21.0.16:9010/cs-dev/job/15337/vibLTsxx/blob?AWSAccessKeyId=drugflow&Signature=f9bGFvZOCP%2BpFvsikhCJhf7cU8Q%3D&Expires=1762853064"
    },
    {
      name: "ligands",
      content: "http://172.21.0.16:9010/cs-dev/docking_user_axok73hd0a06d4xb_cs_k1gp9e.csv?AWSAccessKeyId=drugflow&Signature=IOIpVgoyul576cIetskTRjMVNEc%3D&Expires=1762853064"
    },
    {
      name: "ref_ligand",
      content: "http://172.21.0.16:9010/cs-dev/cc082cb7d7834c5da0cda9543ad4222b_ori_ligand_cs_qksbg0.sdf?AWSAccessKeyId=drugflow&Signature=ZoqYt12NTEgS1PeVpjq2%2FtJxdr4%3D&Expires=1762853064"
    },
    {
      name: "prepared_pdb",
      content: "http://172.21.0.16:9010/cs-dev/job/15337/dGK0L6EO/cs_got09m5ww7_prot_process_69032a3b9a07344f97985f7d.pdb?AWSAccessKeyId=drugflow&Signature=W0UnYtzCfc1VKsyAPahKd47Rz6o%3D&Expires=1762853064"
    },
    {
      name: "ligands",
      content: "http://172.21.0.16:9010/cs-dev/docking_user_axok73hd0a06d4xb_cs_orpbxr.csv?AWSAccessKeyId=drugflow&Signature=DfTZKzL95b31WZ4ALFYlze%2BA87E%3D&Expires=1762853064"
    }
  ]
};
