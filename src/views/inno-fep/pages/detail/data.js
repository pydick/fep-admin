export const mockData1 = {
  id: 14232,
  name: "新调度器测试",
  type: "docking",
  state: "finished",
  compute: {
    total: 20,
    ligands: {
      error: "cs_5wpr8ulnmv_docking_lig_err_66bb10e6ee169d58b9af5992.json",
      total: 20,
      success: ["cs_e0y3t5pm9q_docking_ligands_chunk_0_66bb10e6ee169d58b9af5992.json"]
    },
    agg_revision: 1,
    aggregations: {
      histogram: {
        RTMS: {
          max: 37.423044159203904,
          min: 18.296592624338544,
          amount: {
            0: 2,
            2: 2,
            3: 4,
            4: 5,
            5: 4,
            6: 1,
            8: 1,
            9: 1
          }
        },
        affinity: {
          max: 4.5979413986206055,
          min: -3.1648593842983246,
          amount: {
            0: 4,
            1: 2,
            2: 2,
            3: 2,
            4: 2,
            5: 3,
            6: 2,
            7: 2,
            9: 1
          }
        },
        residues: ["A.LEU.777", "A.ALA.743", "A.VAL.726", "A.LEU.862", "A.LEU.844", "A.LEU.747", "A.LYS.745", "A.PHE.723", "A.ALA.763", "A.LYS.860", "A.GLU.762", "A.ASP.855", "A.LEU.858", "A.ILE.759", "A.THR.790", "A.MET.766", "A.PHE.856", "A.LEU.788", "A.THR.854"]
      }
    },
    created_time: "2024-08-13 07:50:46",
    finished_time: "2024-08-13 15:54:55",
    progress_show: 100,
    progress_stage: "carsidock"
  },
  args: {
    mol: ["lzb91ebvp70lzk7u"],
    pdb: ["5vynwiuvncoffe8z"],
    others: {
      pdb: "5vynwiuvncoffe8z",
      name: "新调度器测试",
      ws_id: "v4f772lfk8p7ntby",
      ligands: "lzb91ebvp70lzk7u",
      smiles_col: "Smiles",
      total_ligands: 20
    },
    account: "person",
    docking: {
      site: "A:KY9",
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
            residue_number: 1101
          },
          {
            chain_id: "A",
            residue_number: 1103
          },
          {
            chain_id: "A",
            residue_number: 1104
          },
          {
            chain_id: "A",
            residue_number: 1105
          },
          {
            chain_id: "A",
            residue_number: 1106
          },
          {
            chain_id: "A",
            residue_number: "1102"
          }
        ],
        water: [],
        chains: [],
        irrelevant_waters: true
      },
      delete_hets: [
        {
          chain_id: "A",
          residue_number: 1101
        },
        {
          chain_id: "A",
          residue_number: 1103
        },
        {
          chain_id: "A",
          residue_number: 1104
        },
        {
          chain_id: "A",
          residue_number: 1105
        },
        {
          chain_id: "A",
          residue_number: 1106
        },
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
      irrelevant_waters: true,
      need_prot_process: true,
      modify_protonation: true,
      add_missing_residue: true,
      if_delete_comps_by_user_define: true
    },
    pdb_name: "8a27.pdb",
    ligands_name: "Ligand_Example_01.csv"
  },
  created_at: "2024-08-13T07:50:46.733958Z",
  attachments: [
    {
      name: "prepared_pdb",
      content: "http://172.21.0.16:9010/cs-dev/job/14232/bidULsI8/cs_pbtzg36rmi_prot_process_66bb1056a9a85dc8cfb8b2dd.pdb?AWSAccessKeyId=drugflow&Signature=YjfXvNKgLLEKq14SiSXsRG5HcxQ%3D&Expires=1762330732"
    },
    {
      name: "ligands",
      content: "http://172.21.0.16:9010/cs-dev/docking_user_lzb91ebvp70lzk7u_cs_0pteg6.csv?AWSAccessKeyId=drugflow&Signature=5Jo0awSoHAcFYU4HuFd6JSEliWY%3D&Expires=1762330732"
    },
    {
      name: "pdb",
      content: "http://172.21.0.16:9010/cs-dev/job/14232/c9kaOg1y/blob?AWSAccessKeyId=drugflow&Signature=GwsY3atsJdvtvn3scRIGDsQbTH0%3D&Expires=1762330732"
    },
    {
      name: "ligands",
      content: "http://172.21.0.16:9010/cs-dev/docking_user_lzb91ebvp70lzk7u_cs_n2zveu.csv?AWSAccessKeyId=drugflow&Signature=eZVZ3l633ah8zKihi4CHt5tClnE%3D&Expires=1762330732"
    },
    {
      name: "ref_ligand",
      content: "http://172.21.0.16:9010/cs-dev/79149fa53d634677b3afbadb1516cd4e_ori_ligand_cs_kjgeo7.sdf?AWSAccessKeyId=drugflow&Signature=jrK2VuPd%2FcSZEmu61ssEfHQtfc0%3D&Expires=1762330732"
    }
  ]
};
