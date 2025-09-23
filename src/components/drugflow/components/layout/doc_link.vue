<template>
  <a
    class="blue_a"
    :href="dock_link_dict[algo_type].en"
    target="_blank"
    v-if="proxy.$i18n.locale === 'en'"
  >
    {{ t('index.更多详情') }}
  </a>
  <a class="blue_a" :href="dock_link_dict[algo_type].zh" target="_blank" v-else>
    {{ t('index.更多详情') }}
  </a>
</template>

<script>
import { getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'doc_link',
  props: {
    algo_type: {
      type: String,
      default: 'ADMET'
    }
  },
  components: {},
  setup() {
    const { proxy } = getCurrentInstance()
    const { t } = useI18n()
    return {
      t,
      proxy,
      dock_link_dict: {
        ADMET: {
          en: 'https://documents.drugflow.com/guide/ADMET.html',
          zh: 'https://documents.drugflow.com/zh/guide/ADMET.html'
        },
        ChemFH: {
          en: 'https://documents.drugflow.com/guide/ChemFH.html',
          zh: 'https://documents.drugflow.com/zh/guide/ChemFH.html'
        },
        'Substruct Alert': {
          en: 'https://documents.drugflow.com/guide/Structure-Alert.html',
          zh: 'https://documents.drugflow.com/zh/guide/Structure-Alert.html'
        },
        QSAR: {
          en: 'https://documents.drugflow.com/guide/QSAR.html',
          zh: 'https://documents.drugflow.com/zh/guide/QSAR.html'
        },
        'QSAR Application': {
          en: 'https://documents.drugflow.com/guide/QSAR-Application.html',
          zh: 'https://documents.drugflow.com/zh/guide/QSAR-Application.html'
        },
        RELATION: {
          en: 'https://documents.drugflow.com/guide/RELATION.html',
          zh: 'https://documents.drugflow.com/zh/guide/RELATION.html'
        },
        Docking: {
          en: 'https://documents.drugflow.com/guide/Docking.html',
          zh: 'https://documents.drugflow.com/zh/guide/Docking.html'
        },
        Rescoring: {
          en: 'https://documents.drugflow.com/guide/Rescoring.html',
          zh: 'https://documents.drugflow.com/zh/guide/Rescoring.html'
        },
        'Molecular Factory': {
          en: 'https://documents.drugflow.com/guide/Molecular-Factory.html',
          zh: 'https://documents.drugflow.com/zh/guide/Molecular-Factory.html'
        },
        'Virtual Screening': {
          en: 'https://documents.drugflow.com/guide/Virtual-Screening.html',
          zh: 'https://documents.drugflow.com/zh/guide/Virtual-Screening.html'
        },
        'Ligand Preparation': {
          en: 'https://documents.drugflow.com/guide/Ligand-Process.html',
          zh: 'https://documents.drugflow.com/zh/guide/Ligand-Process.html'
        },
        'Protein preparation': {
          en: 'https://documents.drugflow.com/guide/Protein-Process.html',
          zh: 'https://documents.drugflow.com/zh/guide/Protein-Process.html'
        },
        'NMR Parsing': {
          en: 'https://documents.drugflow.com/guide/NMR-Parsing.html',
          zh: 'https://documents.drugflow.com/zh/guide/NMR-Parsing.html'
        },
        'Structure Extraction': {
          en: 'https://documents.drugflow.com/guide/Structure-Extraction.html',
          zh: 'https://documents.drugflow.com/zh/guide/Structure-Extraction.html'
        },
      }
    }
  },

  methods: {}
}
</script>

<style lang="css" scoped></style>
