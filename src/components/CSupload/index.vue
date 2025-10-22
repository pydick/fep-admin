<template>
  <el-upload ref="upload_ref" :auto-upload="false" :on-change="file_on_change" :show-file-list="false" :accept="file_accept" style="width: 100%" :http-request="upload_oss">
    <template #trigger>
      <el-input :modelValue="file_name" :input-style="{ textAlign: 'center' }" :placeholder="inp_placeholder" readonly style="width: 100%; cursor: pointer">
        <template v-if="is_slot" #append>
          <slot />
        </template>
      </el-input>
    </template>
  </el-upload>
</template>

<script>
import { useI18n } from "vue-i18n";
import { check_file_size } from "@/utils/common";
import { check_pdb_api, dataset_content, ds_duplicate, presign_url, save_file, upload, create_oss } from "@/api/data";
import { ossUpload, checkProtein } from "@/api/fep";
// import { ElMessage, ElMessageBox } from "element-plus";
import { ref } from "vue";

export default {
  name: "upload",
  components: {},
  props: {
    file_name: {
      type: String,
      default: ""
    },
    inp_placeholder: {
      type: String,
      default: ""
    },
    file_accept: {
      type: String,
      default: ""
    },
    task_type: {
      type: String,
      default: "data_center"
    },
    ws_id: {
      type: String,
      default: ""
    },
    is_slot: {
      type: Boolean,
      default: true
    },
    is_big_file: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { t } = useI18n();
    const file_action = ref();
    const file_osskey = ref();
    const type_arr = props.file_accept.split(",").map(function (item) {
      return item.trim().substring(1);
    });
    const privatization = ref(sessionStorage.getItem("privatization"));
    return {
      t,
      context,
      type_arr,
      file_action,
      file_osskey,
      privatization
    };
  },
  methods: {
    check_pdb(file) {
      const formData = new FormData();
      formData.append("pdb_file", file);
      return check_pdb_api(formData);
    },
    async file_on_change(file, fileList) {
      if (fileList.length > 1) {
        fileList.splice(0, 1);
      }
      if (fileList.length) {
        const formData = new FormData();
        formData.append("file", file.raw);
        console.log(file);
        const checkRes = await checkProtein(formData);
        if (checkRes.success) {
          const res = await ossUpload(formData);
          if (res.success) {
            this.$emit("uploadSuc", res.key);
          } else {
            ElMessage.error("上传失败");
          }
        } else {
          ElMessage.error("检查未通过");
        }
      }
    },
    file_on_change1(file, fileList) {
      if (fileList.length > 1) {
        fileList.splice(0, 1);
      }
      if (fileList.length) {
        this.$emit("show-event");
        if (this.type_arr.includes(file.name.split(".").pop().toLowerCase())) {
          if (this.privatization !== "null") {
            const formData = new FormData();
            formData.append("name", file.name);
            formData.append("from_type", "raw");
            formData.append("ws_id", this.ws_id);
            formData.append("source", JSON.stringify({ module: this.task_type }));
            formData.append("dataset", file.raw);
            ds_duplicate(this.ws_id, file.name).then(data => {
              if (!data.data.status) {
                if (["pdb"].includes(file.name.split(".").pop().toLowerCase())) {
                  this.check_pdb(file.raw).then(check_pdb_res => {
                    if (check_pdb_res.data.status) {
                      upload(formData)
                        .then(res => {
                          if (res.data.status) {
                            this.context.emit("update:file_name", file.name);
                            this.context.emit("custom-event", { id: res.data.dataset_id, name: file.name, pdb_string: check_pdb_res.data.pdb_string });
                          } else {
                            this.$emit("hide-event");
                            ElMessageBox.alert(res.data.detail, this.t("message.错误信息"), {
                              confirmButtonText: "OK",
                              type: "error"
                            });
                          }
                        })
                        .catch(err => {
                          this.$emit("hide-event");
                          this.context.emit("update:file_name", "");
                          ElMessageBox.alert(err.response.data.detail, this.t("message.错误信息"), {
                            confirmButtonText: "OK",
                            type: "error"
                          });
                        });
                    } else {
                      this.$emit("hide-event");
                      ElMessageBox.alert("There are some issues with the file you uploaded, which has caused the platform to be unable to parse it. Please make the necessary modifications before uploading. <br><br>Error message: " + check_pdb_res.data.msg, this.t("message.错误信息"), {
                        confirmButtonText: "OK",
                        type: "error",
                        dangerouslyUseHTMLString: true
                      });
                    }
                  });
                } else if (["csv", "sdf"].includes(file.name.split(".").pop().toLowerCase())) {
                  upload(formData)
                    .then(res => {
                      this.$emit("hide-event");
                      if (res.data.status) {
                        this.context.emit("update:file_name", file.name);
                        this.context.emit("custom-event", { id: res.data.dataset_id, name: file.name });
                      } else {
                        ElMessageBox.alert(res.data.detail, this.t("message.错误信息"), {
                          confirmButtonText: "OK",
                          type: "error"
                        });
                      }
                    })
                    .catch(err => {
                      this.$emit("hide-event");
                      this.context.emit("update:file_name", "");
                      ElMessageBox.alert(err.response.data.detail, this.t("message.错误信息"), {
                        confirmButtonText: "OK",
                        type: "error"
                      });
                    });
                } else {
                  presign_url(file.name).then(res => {
                    if (res.data.status) {
                      this.file_action = res.data.url;
                      this.file_osskey = res.data.osskey;
                      this.$refs.upload_ref.submit();
                    }
                  });
                }
              } else {
                this.$emit("hide-event");
                fileList.splice(0, 1);
                ElMessageBox.alert(this.t("data.存在相同的数据集"), this.t("message.错误信息"), {
                  confirmButtonText: "OK",
                  type: "error"
                });
              }
            });
          } else {
            if (check_file_size(file.size)) {
              const formData = new FormData();
              formData.append("name", file.name);
              formData.append("from_type", "raw");
              formData.append("ws_id", this.ws_id);
              formData.append("source", JSON.stringify({ module: this.task_type }));
              formData.append("dataset", file.raw);
              ds_duplicate(this.ws_id, file.name).then(data => {
                if (!data.data.status) {
                  if (["pdb"].includes(file.name.split(".").pop().toLowerCase())) {
                    this.check_pdb(file.raw).then(check_pdb_res => {
                      if (check_pdb_res.data.status) {
                        if (check_pdb_res.data.pdb_string) {
                          const file_DFFixed = new File([check_pdb_res.data.pdb_string], file.name);
                          const formData_DFFixed = new FormData();
                          formData_DFFixed.append("name", file.name);
                          formData_DFFixed.append("from_type", "raw");
                          formData_DFFixed.append("ws_id", this.ws_id);
                          formData_DFFixed.append("source", JSON.stringify({ module: this.task_type }));
                          formData_DFFixed.append("dataset", file_DFFixed);
                          upload(formData_DFFixed)
                            .then(res => {
                              if (res.data.status) {
                                this.context.emit("update:file_name", file.name);
                                this.context.emit("custom-event", { id: res.data.dataset_id, name: file.name });
                              } else {
                                this.$emit("hide-event");
                                ElMessageBox.alert(res.data.detail, this.t("message.错误信息"), {
                                  confirmButtonText: "OK",
                                  type: "error"
                                });
                              }
                            })
                            .catch(err => {
                              this.$emit("hide-event");
                              this.context.emit("update:file_name", "");
                              ElMessageBox.alert(err.response.data.detail, this.t("message.错误信息"), {
                                confirmButtonText: "OK",
                                type: "error"
                              });
                            });
                        } else {
                          upload(formData)
                            .then(res => {
                              if (res.data.status) {
                                this.context.emit("update:file_name", file.name);
                                this.context.emit("custom-event", { id: res.data.dataset_id, name: file.name });
                              } else {
                                this.$emit("hide-event");
                                ElMessageBox.alert(res.data.detail, this.t("message.错误信息"), {
                                  confirmButtonText: "OK",
                                  type: "error"
                                });
                              }
                            })
                            .catch(err => {
                              this.$emit("hide-event");
                              this.context.emit("update:file_name", "");
                              ElMessageBox.alert(err.response.data.detail, this.t("message.错误信息"), {
                                confirmButtonText: "OK",
                                type: "error"
                              });
                            });
                        }
                      } else {
                        this.$emit("hide-event");
                        ElMessageBox.alert("There are some issues with the file you uploaded, which has caused the platform to be unable to parse it. Please make the necessary modifications before uploading. <br><br>Error message: " + check_pdb_res.data.msg, this.t("message.错误信息"), {
                          confirmButtonText: "OK",
                          type: "error",
                          dangerouslyUseHTMLString: true
                        });
                      }
                    });
                  } else if (["csv", "sdf"].includes(file.name.split(".").pop().toLowerCase())) {
                    upload(formData)
                      .then(res => {
                        this.$emit("hide-event");
                        if (res.data.status) {
                          this.context.emit("update:file_name", file.name);
                          this.context.emit("custom-event", { id: res.data.dataset_id, name: file.name });
                        } else {
                          ElMessageBox.alert(res.data.detail, this.t("message.错误信息"), {
                            confirmButtonText: "OK",
                            type: "error"
                          });
                        }
                      })
                      .catch(err => {
                        this.$emit("hide-event");
                        this.context.emit("update:file_name", "");
                        ElMessageBox.alert(err.response.data.detail, this.t("message.错误信息"), {
                          confirmButtonText: "OK",
                          type: "error"
                        });
                      });
                  } else {
                    presign_url(file.name).then(res => {
                      if (res.data.status) {
                        this.file_action = res.data.url;
                        this.file_osskey = res.data.osskey;
                        this.$refs.upload_ref.submit();
                      }
                    });
                  }
                } else {
                  this.$emit("hide-event");
                  fileList.splice(0, 1);
                  ElMessageBox.alert(this.t("data.存在相同的数据集"), this.t("message.错误信息"), {
                    confirmButtonText: "OK",
                    type: "error"
                  });
                }
              });
            } else {
              if (this.is_big_file) {
                if (["csv"].includes(file.name.split(".").pop().toLowerCase())) {
                  if (file.size / (1024 * 1024 * 100) < 1) {
                    presign_url(file.name).then(res => {
                      if (res.data.status) {
                        this.file_action = res.data.url;
                        this.file_osskey = res.data.osskey;
                        this.$refs.upload_ref.submit();
                      }
                    });
                  } else {
                    this.$emit("hide-event");
                    ElMessageBox.alert(this.t("screen.文件大小不能超过100M"), this.t("message.错误信息"), {
                      confirmButtonText: "OK",
                      type: "error"
                    });
                  }
                } else if (["sdf"].includes(file.name.split(".").pop().toLowerCase())) {
                  if (file.size / (1024 * 1024 * 1024) < 1) {
                    presign_url(file.name).then(res => {
                      if (res.data.status) {
                        this.file_action = res.data.url;
                        this.file_osskey = res.data.osskey;
                        this.$refs.upload_ref.submit();
                      }
                    });
                  } else {
                    this.$emit("hide-event");
                    ElMessageBox.alert(this.t("screen.文件大小不能超过1GB"), this.t("message.错误信息"), {
                      confirmButtonText: "OK",
                      type: "error"
                    });
                  }
                } else {
                  presign_url(file.name).then(res => {
                    if (res.data.status) {
                      this.file_action = res.data.url;
                      this.file_osskey = res.data.osskey;
                      this.$refs.upload_ref.submit();
                    }
                  });
                }
              } else {
                this.$emit("hide-event");
                ElMessageBox.alert(this.t("screen.文件大小不能超过10M"), this.t("message.错误信息"), {
                  confirmButtonText: "OK",
                  type: "error"
                });
              }
            }
          }
        } else {
          this.$emit("hide-event");
          ElMessageBox.alert(this.t(`screen.只能上传csvsdf`), this.t("message.错误信息"), {
            confirmButtonText: "OK",
            type: "error"
          });
        }
      }
    },
    upload_oss(param) {
      ds_duplicate(this.ws_id, param.file.file_name).then(res => {
        if (!res.data.status) {
          let headers;
          if (param.file.name.split(".").pop().toLowerCase() === "csv") {
            const reader = new FileReader();
            reader.onload = e => {
              const contents = e.target.result;
              const lines = contents.split("\n");
              headers = lines.slice(0, 4);
              // headers = lines[0].split(',')
              // console.log(headers);
            };
            reader.readAsText(param.file);
          }
          save_file(this.file_action, param.file).then(res => {
            const formData = new FormData();
            formData.append("name", param.file.name);
            formData.append("from_type", "raw");
            formData.append("ws_id", this.ws_id);
            formData.append("source", JSON.stringify({ module: this.task_type }));
            if (param.file.name.split(".").pop().toLowerCase() === "csv") {
              formData.append("header_nlines", JSON.stringify(headers));
            } else {
              formData.append("header_nlines", JSON.stringify([]));
            }
            formData.append("osskey ", this.file_osskey);
            create_oss(formData).then(data => {
              this.$emit("hide-event");
              if (data.data.status) {
                this.context.emit("update:file_name", param.file.name);
                this.context.emit("custom-event", { id: data.data.dataset_id, name: param.file.name, file: param.file, osskey: this.file_osskey });
              } else {
                ElMessageBox.alert(data.data.detail, this.t("message.错误信息"), {
                  confirmButtonText: "OK",
                  type: "error"
                });
              }
            });
          });
        } else {
          this.$emit("hide-event");
          param.fileList.splice(0, 1);
          ElMessageBox.alert(this.t("data.存在相同的数据集"), this.t("message.错误信息"), {
            confirmButtonText: "OK",
            type: "error"
          });
        }
      });
    }
  }
};
</script>

<style scoped></style>
