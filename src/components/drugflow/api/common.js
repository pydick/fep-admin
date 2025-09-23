import { http as request } from "@/utils/http";
// import { vue_gtag_event } from '@/components/common/vue_gtag'
import { user_login } from "@drugflow/utils/common";

const g_example_dict = {
  smiles_csv: "Example_Molecules.csv",
  Ligand_Example_01: "Ligand_Example_01.csv",
  Ligand_Example_02: "Ligand_Example_02.csv",
  Ligand_Example_03: "Ligand_Example_03.csv",
  "3v5w.pdb": "3v5w.pdb",
  "3v5w.sdf": "3v5w.sdf",
  "7kko.pdb": "7kko.pdb",
  "7kko.sdf": "7kko.sdf",
  "8a27": "8a27.pdb",
  "8a27.pdb": "8a27.pdb",
  "8a27.sdf": "8a27.sdf",
  "3v5w.zip": "3v5w.zip",
  "7kko.zip": "7kko.zip",
  "8a27.zip": "8a27.zip",
  "1iep": "1iep.pdb",
  "classification.csv": "classification.csv",
  "regression.csv": "regression.csv",
  "Example.csv": "Example.csv",
  "Classifcation-training.csv": "Classifcation-training.csv",
  "Regression-training.csv": "Regression-training.csv",
  "Classifcation-test.csv": "Classifcation-test.csv",
  "Regression-test.csv": "Regression-test.csv"
};

export async function download_common(id) {
  const url = "/api/download/" + id;
  return await request.get(url);
}

export function upload_file(form, type = "admet_dl") {
  if (user_login() === false) {
    window.location.href = "/#/Login";
  }
  // vue_gtag_event(type + '_upload', 'upload', '', 1)
  return request.post("/api/upload", form);
}

export function download_example(name) {
  download_example_api(name)
    .then(res => {
      console.log(res);
      download(res.data.data.url, name);
    })
    .catch(err => {
      console.log(err);
    });
}

export function download_example_from_static(name) {
  const tmpLink = document.createElement("a");
  const url = "/static/file/" + g_example_dict[name];
  tmpLink.href = url;
  tmpLink.download = g_example_dict[name];
  document.body.appendChild(tmpLink);
  tmpLink.click();
  document.body.removeChild(tmpLink);
}

export function get_example_from_static(name) {
  const url = "/static/file/" + g_example_dict[name];
  return request.get(url);
}

async function download_example_api(name) {
  const prefix_url = "/api/examples/";
  const url = prefix_url + name;
  return await request.get(url);
}

function download(url, name) {
  const tmpLink = document.createElement("a");
  tmpLink.href = url;
  tmpLink.download = g_example_dict[name];
  document.body.appendChild(tmpLink);
  tmpLink.click();
  document.body.removeChild(tmpLink);
  // vue_gtag_event(name + '_example_download', 'download', '', 1)
}

export function smiles2mol(smiles, add_hs) {
  const url = "/api/toolkits/mols/" + encodeURIComponent(smiles) + "?with_h=" + add_hs;
  return request.get(url);
}

export function smiles2svg(smiles, smarts = "") {
  const url = "/api/toolkits/rdkit/drawings/" + encodeURIComponent(smiles) + ".svg?smarts=" + encodeURIComponent(smarts);
  return request.get(url);
}

export function ligands_format_trans(params) {
  return request.post("/api/toolkits/mols/ligands_format_trans", params);
}

export function draw_api(data) {
  return request.post(
    "/api/toolkits/rdkit/svgdraw",
    { data },
    {
      headers: { "content-type": "multipart/form-data" }
    }
  );
}

export function seed_feedback(form) {
  // if (user_login() == false) {
  //   var redirect = "/screen_" + form.algo_type;
  //   router.push({
  //     path: "/Login",
  //     query: { redirect: redirect },
  //   });
  //   return;
  // }

  return request.post("/api/feed", form);
}
