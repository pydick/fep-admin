

export function check_file(file, dict) {
  const name = file.name;
  const name_list = name.split(".");
  const type = name_list[name_list.length - 1];
  if (type !== dict.type) {
    return false;
  }
  if (file.size > dict.max) {
    return false;
  }
  return true;
}

export function check_number(value, dict) {
  const v = Number(value);
  if (isInteger(v) && dict.type === "int" && v >= dict.min && v <= dict.max) {
    return true;
  } else if (dict.type === "float" && v >= dict.min && v <= dict.max) {
    return true;
  }
  return false;
}

function isInteger(value) {
  return Math.floor(value) === value;
}

export function current() {
  const d = new Date();
  let str = "";
  str += d.getFullYear();
  str += d.getMonth() + 1;
  str += d.getDate();
  str += d.getHours();
  str += d.getMinutes();
  str += d.getSeconds();
  str += d.getMilliseconds();
  return str;
}

export function collect_file(div_id) {
  const objFile = document.getElementById(div_id);
  if (objFile.value === "") {
    alert("不能空");
  }

  const files = objFile.files;
  const name_list = files[0].name.split(".");
  const type = name_list[name_list.length - 1];
  const time = current();
  const new_file_name = name_list[0] + "_" + time + "." + type;
  return { file: files, new_file_name };
}

export function download_example(example_name) {
  const example_dict = {
    autodock_protein: "protein.pdb",
    autodock_ligand: "ligand.mol2",
    autodock_crystal: "crystal_ligand.mol2",
    reinvent_example: "mol_train_drd2.csv",
    mcmg_example: "mol_train_drd2.csv",
    admet_example: "smiles.csv"
  };
  const target = "/download_example/" + example_name;
  const a = document.createElement("a");
  const filename = example_dict[example_name];
  a.href = target;
  a.download = filename;
  a.click();
}

export const JSonToCSV = {
  /*
   * obj是一个对象，其中包含有：
   * ## data 是导出的具体数据
   * ## fileName 是导出时保存的文件名称 是string格式
   * ## showLabel 表示是否显示表头 默认显示 是布尔格式
   * ## columns 是表头对象，且title和key必须一一对应，包含有
        title:[], // 表头展示的文字
        key:[], // 获取数据的Key
        formatter: function() // 自定义设置当前数据的 传入(key, value)
   */
  setDataConver: function (obj) {
    const data = obj.data;
    let ShowLabel = typeof obj.showLabel === "undefined" ? true : obj.showLabel;
    const fileName = (obj.fileName || "UserExport") + ".csv";
    const columns = obj.columns || {
      title: [],
      key: [],
      formatter: undefined
    };
    ShowLabel = typeof ShowLabel === "undefined" ? true : ShowLabel;
    let row = "";
    let CSV = "";
    let key;
    // 如果要现实表头文字
    if (ShowLabel) {
      // 如果有传入自定义的表头文字
      if (columns.title.length) {
        columns.title.map(function (n) {
          row += n + ",";
        });
      } else {
        // 如果没有，就直接取数据第一条的对象的属性
        for (key in data[0]) row += key + ",";
      }
      row = row.slice(0, -1); // 删除最后一个,号，即a,b, => a,b
      CSV += row + "\r\n"; // 添加换行符号
    }
    // 具体的数据处理
    data.map(function (n) {
      row = "";
      // 如果存在自定义key值
      if (columns.key.length) {
        columns.key.map(function (m) {
          row += '"' + (typeof columns.formatter === "function" ? columns.formatter(m, n[m]) || n[m] : n[m]) + '",';
        });
      } else {
        for (key in n) {
          row += '"' + (typeof columns.formatter === "function" ? columns.formatter(key, n[key]) || n[key] : n[key]) + '",';
        }
      }
      row.slice(0, row.length - 1); // 删除最后一个,
      CSV += row + "\r\n"; // 添加换行符号
    });
    if (!CSV) return;
    this.SaveAs(fileName, CSV);
  },
  SaveAs: function (fileName, csvData) {
    // var bw = this.browser();
    // if (!bw['edge'] || !bw['ie']) {
    const alink = document.createElement("a");
    alink.id = "linkDwnldLink";
    alink.href = this.getDownloadUrl(csvData);
    document.body.appendChild(alink);
    const linkDom = document.getElementById("linkDwnldLink");
    linkDom.setAttribute("download", fileName);
    linkDom.click();
    document.body.removeChild(linkDom);
    // }
    // vue_gtag_event(fileName + '_download', 'download', '', 1)
  },
  getDownloadUrl: function (csvData) {
    const _utf = "\uFEFF"; // 为了使Excel以utf-8的编码模式，同时也是解决中文乱码的问题
    return "data:attachment/csv;charset=utf-8," + _utf + encodeURIComponent(csvData);
  }
  // browser: function () {
  //   var Sys = {};
  //   var ua = navigator.userAgent.toLowerCase();
  //   var s;
  //   (s = ua.indexOf('edge') !== - 1 ? Sys.edge = 'edge' : ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
  //     (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
  //       (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
  //         (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
  //           (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
  //             (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
  //   return Sys;
  // }
};

export function export_table(table_data, props_list, check_id_list, filename = "DrugFlow_Results", use_check_saved = false) {
  let download_data = [];
  if (use_check_saved) {
    download_data = table_data;
  } else {
    if (check_id_list.length > 0) {
      for (let j = 0; j < table_data.length; j++) {
        if (check_id_list.indexOf(table_data[j].id) !== -1) {
          download_data.push(table_data[j]);
        }
      }
    } else {
      download_data = table_data;
    }
  }
  console.log(download_data);

  const title_list = ["No.", "SMILES"];
  const key_list = ["id", "SMILES"];

  for (let i = 0; i < props_list.length; i++) {
    title_list.push(props_list[i]);
    key_list.push(props_list[i]);
  }

  JSonToCSV.setDataConver({
    data: download_data,
    fileName: filename,
    columns: {
      title: title_list,
      key: key_list,
      formatter: function (n, v) {
        if (n === "amont" && !isNaN(Number(v))) {
          v = v + "";
          v = v.split(".");
          v[0] = v[0].replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"); // 千分位的设置
          return v.join(".");
        }
        if (n === "proportion") return v + "%";
      }
    }
  });
}

export function get_svg_from_smiles(smiles) {
  try {
    const mol = window.RDKitModule.get_mol(smiles);
    let svg = mol.get_svg();
    svg = svg.replace(/250px/g, "150px");
    svg = svg.replace(/200px/g, "150px");
    svg = svg.replace(/opacity:1.0/g, "opacity:0");
    return { err: 0, smiles_svg: svg };
  } catch (err) {
    alert("rdkit 导致 内存不足，请刷新或者联系开发人员");
    return { err: -1, smiles_svg: "" };
  }
}

export async function init_rdkit_module() {
  for (let i = 0; i < 1000; i++) {
    if (window.RDKit) {
      return true;
    } else {
      console.log("rdkit wait!");
      await sleep(100);
    }
  }
  return false;
}

export async function init_ketcher_module(domId) {
  let ketcher_name = "ketcher";
  if (domId === "idKetcher") {
    ketcher_name = "ketcher";
  } else {
    ketcher_name = "ketcher" + domId;
  }
  try {
    for (let i = 0; i < 1000; i++) {
      const ketcherFrame = document.getElementById(domId);

      if ("contentDocument" in ketcherFrame) {
        window[ketcher_name] = ketcherFrame.contentWindow.ketcher;
      } else {
        window[ketcher_name] = document.frames[domId].window.ketcher;
      }
      if (window[ketcher_name]) {
        return true;
      } else {
        console.log("ketcher wait!");
        await sleep(100);
      }
    }
    return false;
  } catch {
    console.log("wait ketcher");
  }
}

export const sleep = (delaytime = 1000) => {
  return new Promise(resolve => setTimeout(resolve, delaytime));
};

export function get_svg_from_smarts(smiles, smarts) {
  try {
    const mol = window.RDKitModule.get_mol(smiles);
    const qmol = window.RDKitModule.get_qmol(smarts);
    const mdetails = mol.get_substruct_match(qmol);
    let svg = mol.get_svg_with_highlights(mdetails);
    svg = svg.replace(/opacity:1.0/g, "opacity:0");
    return { err: 0, smarts_svg: svg };
  } catch (err) {
    alert("rdkit 导致 内存不足，请刷新或者联系开发人员");
    return { err: -1, smarts_svg: "" };
  }
}

export function show_loading(load_id = "load_id") {
  document.getElementById(load_id).style.display = "block";
}

export function hide_loading(load_id = "load_id") {
  document.getElementById(load_id).style.display = "none";
}

export function time_format(time) {
  const date = new Date(time);
  const mon = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");
  const res = mon + "-" + day + " " + hour + ":" + min + ":" + second;
  return res;
}
/**
 * <p> 获取加载图片地址 </p>
 * examples: assets/bg/bg.png
 * @param imgPath: string
 */
export function requireImg(imgPath) {
  return new URL(`../assets/${imgPath}`, import.meta.url).href;
}
