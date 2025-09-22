const g_file_error = -1
const g_name_error = -2
const g_memory_error = -3

export function user_login() {
  if (localStorage.getItem('cs_TOKEN')) {
    return true
  } else {
    return false
  }
}

// 位数不足length的部分填充0
export function fixnumber(num, length) {
  return ('' + num).length < length
    ? (new Array(length + 1).join('0') + num).slice(-length)
    : '' + num
}

// 错误告警
export function alert_error(error_no) {
  if (error_no === g_file_error) {
    alert('文件过期或者不存在!')
  } else if (error_no === g_name_error) {
    alert('输入参数名字错误!')
  } else if (error_no === g_memory_error) {
    alert('内存错误!')
  } else {
    alert('其他错误!')
  }
}
export function time_format(time) {
  const date = time.split('T')[0]
  const mon = date.split('-')[1]
  const day = date.split('-')[2]
  const t = time.split('T')[1].split('.')[0]
  const hour = t.split(':')[0]
  const min = t.split(':')[1]
  let second = t.split(':')[2]
  if (second[second.length - 1] === 'Z') {
    second = second.slice(0, second.length - 1)
  }
  const res = mon + '-' + day + ' ' + hour + ':' + min + ':' + second
  return res
}
// 获得时间
export function current() {
  const d = new Date()
  let str = ''
  str += d.getFullYear() // 获取当前年份
  str += d.getMonth() + 1 // 获取当前月份（0——11）
  str += d.getDate()
  str += d.getHours()
  str += d.getMinutes()
  str += d.getSeconds()
  str += d.getMilliseconds()
  return str
}

export function current_show() {
  const d = new Date()
  let str = ''
  str += fixnumber(d.getFullYear(), 4) + '/'
  str += fixnumber(d.getMonth() + 1, 2) + '/'
  str += fixnumber(d.getDate(), 2) + '  '
  str += fixnumber(d.getHours(), 2) + ':'
  str += fixnumber(d.getMinutes(), 2) + ':'
  str += fixnumber(d.getSeconds(), 2)
  return str
}
// 获得0~255的随机数
export function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}
// 删除列表某个元素，生成新列表
export function delete_list_item(list, item) {
  const ret_arr = []
  for (let i = 0; i < list.length; i++) {
    if (list[i] !== item) {
      ret_arr.push(list[i])
    }
  }
  return ret_arr
}

export const router_dict = {
  mcmg: 'molgen_table',
  ms_ign: 'screen_docking_results',
  admet_dl: 'admet_table',
  'admet-dl': 'admet_table',
  admet_fh: 'admetfh_table',
  'admet-fh': 'admetfh_table',
  admet_sa: 'admetsa_table',
  'admet-sa': 'admetsa_table',
  docking: 'screen_docking_results',
  molgen_relation: 'molgen_table',
  'molgen-relation': 'molgen_table',
  qsar: 'model_qsar_results',
  'qsar-test': 'model_qsar_use',
  cress: 'spectrum_table',
  cmgnet: 'spectrum_table',
  rescoring: 'screen_rescoring_results',
  'lig-prep': 'ligand_prep_results',
  'admet-sme': 'admet_table',
  molgen_pocket: 'molgen_cluster_table',
  molgen_ligand: 'molgen_cluster_table',
  molecular_factory: 'molecular_factory_task_result',
  virtual_screening: 'screen_virtual_result',
  protein_process: 'protein_preparation_result',
  img2mol: 'extraction_results'
}

export const refresh_dict = {
  mcmg: 'molgen_mcmg',
  ms_ign: 'screen_docking',
  admet_dl: 'admet_dl',
  'admet-dl': 'admet_dl',
  admet_fh: 'admet_fh',
  'admet-fh': 'admet_fh',
  admet_sa: 'admet_sa',
  'admet-sa': 'admet_sa',
  docking: 'screen_docking',
  molgen_relation: 'molgen_relation',
  'molgen-relation': 'molgen_relation',
  qsar: 'model_qsar',
  'qsar-test': 'model_use',
  cress: 'spectrum_ai',
  cmgnet: 'spectrum_ai',
  rescoring: 'screen_rescoring',
  'lig-prep': 'ligand_prep',
  'admet-sme': 'admet_dl',
  molgen_pocket: 'molgen_cluster',
  molgen_ligand: 'molgen_cluster',
  molecular_factory: 'molecular_factory',
  virtual_screening: 'screen_virtual',
  protein_process: 'protein_preparation'
}
export const function_list = [
  {
    router: 'screen_docking',
    name: '对接重打分',
    intro: 'screen_docking_intro'
  },
  {
    router: 'screen_rescoring',
    name: '重打分',
    intro: 'screen_rescoring_intro'
  },
  {
    router: 'admet_dl',
    name: 'Inno-ADMET',
    intro: 'admet_dl_intro'
  },
  {
    router: 'admet_fh',
    name: 'ChemFH',
    intro: 'admet_fh_intro'
  },
  {
    router: 'admet_sa',
    name: 'Inno-SA',
    intro: 'admet_sa_intro'
  },
  {
    router: 'model_qsar',
    name: 'QSAR',
    intro: 'model_qsar_intro'
  },
  {
    router: 'model_use',
    name: 'Inno_qsar_app',
    intro: 'model_use_intro'
  },
  {
    router: 'molecular_factory',
    name: 'molecular_Factory',
    intro: 'molecular_factory_intro'
  },
  {
    router: 'screen_virtual',
    name: 'screen_virtual',
    intro: 'screen_virtual_intro'
  },
  {
    router: 'ligand_prep',
    name: 'ligand_prep',
    intro: 'ligand_prep_intro'
  },
  {
    router: 'protein_preparation',
    name: 'protein_prep',
    intro: 'protein_preparation_intro'
  },
  {
    router: 'spectrum_ai',
    name: 'spectrum_title',
    intro: 'spectrum_ai_intro'
  },
  {
    router: 'data_extraction2',
    name: 'data_extract',
    intro: 'data_extract_intro'
  }
]
export const menu = [
  {
    title: 'index.活性预测',
    tab: 'Main Module',
    children: [
      {
        label: 'index.对接重打分',
        link: 'screen_docking',
        tips: 'index.screen_docking_intro'
      },
      {
        label: 'index.重打分',
        link: 'screen_rescoring',
        tips: 'index.screen_rescoring_intro'
      }
    ]
  },
  {
    title: 'index.成药性预测',
    tab: 'Druggability',
    children: [
      {
        label: 'index.Inno-ADMET',
        link: 'admet_dl',
        tips: 'index.admet_dl_intro'
      },
      // {
      //   label: 'index.ChemFH',
      //   link: 'admet_fh',
      //   tips: 'index.admet_fh_intro'
      // },
      // {
      //   label: 'index.Inno-SA',
      //   link: 'admet_sa',
      //   tips: 'index.admet_sa_intro'
      // }
    ]
  },
  {
    title: 'index.Inno_modeling',
    tab: 'Inno Modeler',
    children: [
      {
        label: 'index.QSAR',
        link: 'model_qsar',
        tips: 'index.model_qsar_intro'
      },
      {
        label: 'index.Inno_qsar_app',
        link: 'model_use',
        tips: 'index.model_use_intro'
      }
    ]
  },
  {
    title: 'index.应用场景',
    tab: 'Denove',
    children: [
      {
        label: 'index.molecular_Factory',
        link: 'molecular_factory',
        tips: 'index.molecular_factory_intro'
      },
      {
        label: 'index.虚拟筛选',
        link: 'screen_virtual',
        tips: 'index.screen_virtual_intro',
        // disabled: true
      }
    ]
  },
  {
    title: 'message.OtherTools',
    tab: 'Tools',
    children: [
      {
        label: 'index.ligand_prep',
        link: 'ligand_prep',
        tips: 'index.ligand_prep_intro'
      },
      {
        label: 'index.protein_prep',
        link: 'protein_preparation',
        tips: 'index.protein_preparation_intro'
        // disabled: true
      },
      {
        label: 'spec.spectrum_title',
        link: 'spectrum_ai',
        tips: 'index.spectrum_ai_intro'
      },
      {
        label: 'task.结构识别及数据提取',
        link: 'data_extraction',
        tips: 'task.数据提取介绍'
      }
    ]
  }
]
export const ment_dictionary = {
  'admet-dl': 'admet_dl',
  'admet-fh': 'admet_fh',
  'admet-sa': 'admet_sa',
  docking: 'screen_docking',
  qsar: 'model_qsar',
  'qsar-test': 'model_use',
  cress: 'spectrum_ai',
  cmgnet: 'spectrum_ai',
  rescoring: 'screen_rescoring',
  'lig-prep': 'ligand_prep',
  molecular_factory: 'molecular_factory',
  virtual_screening: 'screen_virtual',
  protein_process: 'protein_preparation',
  'img2mol': 'data_extraction',
}
export function algo_type_change(row) {
  const type_dict = {
    'admet-dl': 'ADMET',
    'admet-fh': 'ChemFH',
    'admet-sa': 'SA',
    docking: 'Docking',
    'molgen-relation': 'Relation',
    qsar: 'QSAR-Create',
    'qsar-test': 'QSAR-Apply',
    cress: 'CReSS',
    cmgnet: 'CMGNet',
    rescoring: 'Rescoring',
    'lig-prep': 'Lig-Prep',
    molgen_pocket: 'Molgen Pocket',
    molgen_ligand: 'Molgen Ligand',
    molecular_factory: 'Molecular Factory',
    virtual_screening: 'Virtual Screening',
    protein_process: 'Protein Preparation',
    'img2mol': 'Data Extraction',
  }
  const algo_type = type_dict[row.type]
  let prefix = ''
  let suffix = ''
  if (algo_type === 'ADMET' && row.args.sme !== undefined) {
    suffix = row.args.sme ? '-MGA' : '-MERT'
  }
  if (algo_type === 'Docking') {
    prefix = row.args.docking.flexible === 'semi' ? 'Semi-' : 'Flexible-'
  }
  return prefix + algo_type + suffix
}

export function get_cookie(c_name) {
  if (document.cookie.length > 0) {
    let c_start = document.cookie.indexOf(c_name + '=')
    if (c_start !== -1) {
      c_start = c_start + c_name.length + 1
      let c_end = document.cookie.indexOf(';', c_start)
      if (c_end === -1) c_end = document.cookie.length
      return unescape(document.cookie.substring(c_start, c_end))
    }
  }
  return ''
}
export function err_code(err) {
  let type = ''
  if (
    [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 199].indexOf(err) > -1
  ) {
    type = 'common'
  } else if (err === 400) {
    type = 'outer_service'
  }
  return type
}
export function check_file_size(size) {
  if (size / 1024 / 1024 / 10 < 1) {
    return true
  } else {
    return false
  }
}
export function link_list(type) {
  let arr
  if (type === 'csv') {
    arr = [
      { value: 'screen_docking', label: 'index.对接重打分', disabled: false },
      { value: 'screen_rescoring', label: 'index.重打分', disabled: true },
      { value: 'admet_dl', label: 'index.Inno-ADMET', disabled: false },
      { value: 'admet_fh', label: 'index.ChemFH', disabled: false },
      { value: 'admet_sa', label: 'index.Inno-SA', disabled: false },
      { value: 'model_qsar', label: 'index.QSAR', disabled: false },
      { value: 'model_use', label: 'index.Inno_qsar_app', disabled: false },
      { value: 'molecular_factory', label: 'index.molecular_Factory', disabled: false },
      { value: 'ligand_prep', label: 'index.ligand_prep', disabled: false }
      // { value: 'protein_prep', label: 'index.protein_prep' },
      // { value: 'spectrum_ai', label: 'spec.spectrum_title' }
    ]
  } else if (type === 'sdf') {
    arr = [
      { value: 'screen_docking', label: 'index.对接重打分', disabled: false },
      { value: 'screen_rescoring', label: 'index.重打分', disabled: false },
      { value: 'admet_dl', label: 'index.Inno-ADMET', disabled: false },
      { value: 'admet_fh', label: 'index.ChemFH', disabled: false },
      { value: 'admet_sa', label: 'index.Inno-SA', disabled: false },
      { value: 'model_qsar', label: 'index.QSAR', disabled: false },
      { value: 'model_use', label: 'index.Inno_qsar_app', disabled: false },
      { value: 'molecular_factory', label: 'index.molecular_Factory', disabled: false },
      { value: 'ligand_prep', label: 'index.ligand_prep', disabled: false }
      // { value: 'protein_prep', label: 'index.protein_prep' },
      // { value: 'spectrum_ai', label: 'spec.spectrum_title' }
    ]
  } else if (type === 'pdf') {
    arr = [
      { value: 'data_extraction', label: 'task.结构识别及数据提取', disabled: false },

    ]
  } else {
    arr = [
      { value: 'screen_docking', label: 'index.对接重打分', disabled: false },
      { value: 'screen_rescoring', label: 'index.重打分', disabled: false },
      { value: 'admet_dl', label: 'index.Inno-ADMET', disabled: true },
      { value: 'admet_fh', label: 'index.ChemFH', disabled: true },
      { value: 'admet_sa', label: 'index.Inno-SA', disabled: true },
      { value: 'model_qsar', label: 'index.QSAR', disabled: true },
      { value: 'model_use', label: 'index.Inno_qsar_app', disabled: true },
      { value: 'molecular_factory', label: 'index.molecular_Factory', disabled: false },
      { value: 'ligand_prep', label: 'index.ligand_prep', disabled: true }
      // { value: 'protein_prep', label: 'index.protein_prep' },
      // { value: 'spectrum_ai', label: 'spec.spectrum_title' }
    ]
  }
  return arr
}

export function calc_iou(pocket_a, pocket_b) {
  // pocket_a [x, y, z, l1, l2, l3]
  // pocket_b [x, y, z, l1, l2, l3]
  const x1 = Number(pocket_a.x)
  const y1 = Number(pocket_a.y)
  const z1 = Number(pocket_a.z)
  const l1 = Number(pocket_a.l1)
  const l2 = Number(pocket_a.l2)
  const l3 = Number(pocket_a.l3)
  const x2 = Number(pocket_b.x)
  const y2 = Number(pocket_b.y)
  const z2 = Number(pocket_b.z)
  const l4 = Number(pocket_b.l1)
  const l5 = Number(pocket_b.l2)
  const l6 = Number(pocket_b.l3)
  const x_min = Math.min(x1 - l1 / 2, x2 - l4 / 2)
  const x_max = Math.max(x1 + l1 / 2, x2 + l4 / 2)
  const y_min = Math.min(y1 - l2 / 2, y2 - l5 / 2)
  const y_max = Math.max(y1 + l2 / 2, y2 + l5 / 2)
  const z_min = Math.min(z1 - l3 / 2, z2 - l6 / 2)
  const z_max = Math.max(z1 + l3 / 2, z2 + l6 / 2)
  const x = x_max - x_min
  const y = y_max - y_min
  const z = z_max - z_min
  const v1 = l1 * l2 * l3
  const v2 = l4 * l5 * l6
  const v3 = x * y * z
  const v4 = Math.max(0, v1 + v2 - v3)
  const iou = v4 / (v1 + v2 - v4)
  return iou
}

export function change_pocket_to_xyz(coords_info, expand = 10) {
  return {
    x: (coords_info.max_x + coords_info.min_x) / 2,
    y: (coords_info.max_y + coords_info.min_y) / 2,
    z: (coords_info.max_z + coords_info.min_z) / 2,
    l1: coords_info.max_x - coords_info.min_x + expand,
    l2: coords_info.max_y - coords_info.min_y + expand,
    l3: coords_info.max_z - coords_info.min_z + expand
  }
}
