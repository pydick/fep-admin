export const mockSmiles = String.raw`COC1=CN=C(C2(CNC(=O)[C@](C)(C/C3=C4\C=CC=C\C4=N\C3)NC(=O)NC3=CC=C([N+](=O)[O-])C=C3)CCCCC2)C=C1`;

export const mockrow1 = {
  id: 5940408,
  SMILES: "[H]C([H])=C([H])C(=O)N([H])c1c(OC([H])([H])[H])c([H])c2nc([H])nc(N([H])c3c([H])c([H])c(F)c(Cl)c3[H])c2c1[H]",
  finished: true,
  values: {
    RTMScore: 24.669,
    _iso_id: 1,
    _ori_id: 1,
    _res_idx: 1,
    _show_id: "1-1-1",
    CarsiScore: -3.208,
    residues_full_info: [
      {
        distance: 3.9,
        ligand_name: "UNL",
        prot_atom_id: [735],
        ligand_atom_id: [4671],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "LYS",
        prot_residue_number: "745",
        ligand_atom_id_inres: [0],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      },
      {
        distance: 3.57,
        ligand_name: "UNL",
        prot_atom_id: [1074],
        ligand_atom_id: [4680],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "MET",
        prot_residue_number: "766",
        ligand_atom_id_inres: [9],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      },
      {
        distance: 3.47,
        ligand_name: "UNL",
        prot_atom_id: [2564],
        ligand_atom_id: [4688],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "LEU",
        prot_residue_number: "858",
        ligand_atom_id_inres: [17],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      },
      {
        distance: 3.29,
        ligand_name: "UNL",
        prot_atom_id: [781],
        ligand_atom_id: [4688],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "LEU",
        prot_residue_number: "747",
        ligand_atom_id_inres: [17],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      },
      {
        distance: 3.67,
        ligand_name: "UNL",
        prot_atom_id: [1407],
        ligand_atom_id: [4695],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "LEU",
        prot_residue_number: "788",
        ligand_atom_id_inres: [24],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      }
    ],
    Residues: ["A.LYS.745", "A.MET.766", "A.LEU.858", "A.LEU.747", "A.LEU.788"]
  },
  extra_val: {
    dock_lig: "cs_xk484zpoc5_docking_69032ae09a07344f97985f80_1-1.mol"
  },
  attachments: [],
  raw_data: {
    Smiles: "C=CC(=O)Nc1cc2c(Nc3ccc(F)c(Cl)c3)ncnc2cc1OC"
  },
  weight: 100
};

export const mockrow2 = {
  id: 5940409,
  SMILES: "[H]c1nn([H])c([H])c1-c1nc(N([H])c2nn([H])c3c(Cl)c([H])c([H])c([H])c23)c2c(n1)C(C([H])([H])[H])(C([H])([H])[H])OC2([H])[H]",
  finished: true,
  values: {
    RTMScore: 25.099,
    _iso_id: 1,
    _ori_id: 2,
    _res_idx: 1,
    _show_id: "2-1-1",
    CarsiScore: 2.391,
    residues_full_info: [
      {
        distance: 3.35,
        ligand_name: "UNL",
        prot_atom_id: [1012],
        ligand_atom_id: [4675],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "GLU",
        prot_residue_number: "762",
        ligand_atom_id_inres: [4],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      },
      {
        distance: 3.48,
        ligand_name: "UNL",
        prot_atom_id: [1407],
        ligand_atom_id: [4689],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "LEU",
        prot_residue_number: "788",
        ligand_atom_id_inres: [18],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      },
      {
        distance: 3.43,
        ligand_name: "UNL",
        prot_atom_id: [2568],
        ligand_atom_id: [4688],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "LEU",
        prot_residue_number: "858",
        ligand_atom_id_inres: [17],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      }
    ],
    Residues: ["A.GLU.762", "A.LEU.788", "A.LEU.858"]
  },
  extra_val: {
    dock_lig: "cs_5uekd8rjrw_docking_69032ae09a07344f97985f80_1-1.mol"
  },
  attachments: [],
  raw_data: {
    Smiles: "CC1(C)OCc2c(Nc3n[nH]c4c(Cl)cccc34)nc(-c3cn[nH]c3)nc21"
  },
  weight: 100
};

export const mockrow3 = {
  id: 5940410,
  SMILES: "[H]c1nc(N2C([H])([H])C([H])([H])C([H])(OC([H])([H])[H])C([H])([H])C2([H])[H])nc(N([H])c2nc([H])c3c(N([H])[H])nn(C([H])(C([H])([H])[H])C([H])([H])[H])c3c2[H])c1[H]",
  finished: true,
  values: {
    RTMScore: 27.633,
    _iso_id: 1,
    _ori_id: 3,
    _res_idx: 1,
    _show_id: "3-1-1",
    CarsiScore: -2.774,
    residues_full_info: [
      {
        distance: 3.64,
        ligand_name: "UNL",
        prot_atom_id: [964],
        ligand_atom_id: [4688],
        ligand_chain_id: "A",
        interaction_type: "Hydrophobic",
        prot_residue_name: "ILE",
        prot_residue_number: "759",
        ligand_atom_id_inres: [17],
        ligand_residue_number: "1621",
        prot_residue_chain_id: "A"
      }
    ],
    Residues: ["A.ILE.759"]
  },
  extra_val: {
    dock_lig: "cs_77bzkwx5ja_docking_69032ae09a07344f97985f80_1-1.mol"
  },
  attachments: [],
  raw_data: {
    Smiles: "COC1CCN(c2nccc(Nc3cc4c(cn3)c(N)nn4C(C)C)n2)CC1"
  },
  weight: 100
};
