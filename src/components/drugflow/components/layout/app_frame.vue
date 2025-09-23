<template>
  <div class="">
    <el-dialog v-if="isvisited && !not_show_other && (((confirm_status === null || confirm_status === undefined) && (need_confirm === null || need_confirm === undefined)) || (confirm_status === false && need_confirm === false) || (confirm_status === true && need_confirm === false && timeLeft < 0))" v-model="application" :before-close="handleClose" :close-on-click-modal="false" :close-on-press-escape="false" style="min-width: 700px" width="70%">
      <div v-if="confirm_status === true && timeLeft < 0" style="display: flex; flex-direction: column; align-items: center">
        <p v-html="t('message.2m已到期')" />
        <img src="../../assets/hh_code.png" style="width: 16%" />
        <p v-html="t('message.扫描二维码')" />
      </div>
      <div v-else>
        <!-- <p v-if="confirm_status === false && need_confirm === false && timeLeft > 0" v-html="t('message.更新信息')"></p> -->
        <p v-if="confirm_status === false && need_confirm === false && timeLeft < 0" v-html="t('message.48h已到期')" />
        <!-- <p v-if="(confirm_status === null || confirm_status === undefined) &&
          (need_confirm === null || confirm_status === undefined)
          " v-html="t('message.填写信息进入新版本')"></p>
        <div v-if="confirm_status !== true && need_confirm !== true" style="max-width: 700px; margin: 3rem 0">
          <el-form ref="application_form" :model="form" :rules="rules" label-width="7rem">
            <el-form-item :label="t('message.姓名')" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item :label="t('message.电话号码')" prop="telephone">
              <el-input v-model="form.telephone" />
            </el-form-item>
            <el-form-item prop="verification_code">
              <div style="display: flex; width: 100%">
                <el-input v-model="form.verification_code" autocomplete="off" />
                <el-button v-if="codeShow" style="margin-left: 10px" type="primary" @click="get_code(form.telephone)">{{ t('index.获取验证码')
                  }}
                </el-button>
                <span v-else class="count">{{ t('message.60s后重试前') }} {{ count }} {{ t('message.60s后重试后') }}</span>
              </div>
            </el-form-item>
            <el-form-item :label="t('message.单位名称')" prop="organization">
              <el-input v-model="form.organization" />
            </el-form-item>
            <el-form-item :label="t('message.工作职务')" prop="position">
              <el-input v-model="form.position" />
            </el-form-item>
            <el-form-item>
              <el-button style="width: 20%; max-width: 120px" type="success" @click="submit">
                提交申请
              </el-button>
            </el-form-item>
          </el-form>
        </div> -->
        <div v-if="(confirm_status === null || confirm_status === undefined) && (need_confirm === null || confirm_status === undefined)">
          <p v-html="t('message.新版本具体功能')" />
          <p class="title" v-html="t('index.活性预测')" />
          <p v-html="t('index.活性预测介绍')" />
          <p class="title" v-html="t('index.成药性预测')" />
          <p v-html="t('index.成药性预测介绍')" />
          <p class="title" v-html="t('index.分子生成')" />
          <p v-html="t('index.分子生成介绍')" />
          <p class="title" v-html="t('index.AI建模')" />
          <p v-html="t('index.AI建模介绍')" />
          <p class="title" v-html="t('index.其他工具')" />
          <p v-html="t('index.其他工具介绍')" />
          <p v-html="t('message.感谢关注')" />
        </div>
      </div>
    </el-dialog>

    <div v-if="if_alert_browser" class="alert_div">
      {{ t("message.请更新您的浏览器") }}
      <span>
        <el-button circle class="hover_black" size="small" text @click="close_alert">
          <el-icon>
            <Close />
          </el-icon>
        </el-button>
      </span>
    </div>

    <app_narrow_leftbar :privatization="privatization" :api_permission="api_permission" :is_staff="user_info.is_staff" :left_main_item_now="main_tab" :left_sub_item_now="tab_name" :uemail="user_info.uemail" :uname="user_info.uname" />

    <el-scrollbar v-if="space" class="mainpage" max-height="100vh">
      <app_title_topbar :space_id="space.id" :tab_name="tab_name" :task_type="task_type">
        <template #title>
          <slot name="title" />
        </template>
      </app_title_topbar>
      <slot />
      <el-popover placement="bottom-start" trigger="click" width="400">
        <template #reference>
          <div style="position: absolute; top: 12px; font-size: 14px; z-index: 999; border: 1px solid #0061ee; border-radius: 6px; overflow: hidden" :style="{ right: privatization ? '200px' : '320px' }">
            <el-button v-if="!create_space" style="font-size: 14px; border: none" @click="no_show">
              <span style="color: #333">{{ space_check }}</span>
            </el-button>
            <el-button v-if="!create_space" style="font-size: 14px; border: none; margin: 0" type="info" @click="no_show">
              <span style="color: #fff">{{ t("data.切换space") }}</span>
            </el-button>
          </div>
        </template>
        <div v-for="item in space_list" :key="item.id" :style="{ padding: item.isShow ? '0' : '0 0.5rem', borderBottom: '1px solid #ccc' }" style="min-width: 200px" class="space">
          <div v-if="!item.isShow" style="display: flex; align-items: center; justify-content: space-between; width: 100%">
            <el-button v-if="item.status === 1" type="primary" circle text plain size="small" @click="change_space(item.ws_id, item.name)">
              <el-icon><StarFilled /></el-icon>
            </el-button>
            <el-button v-else type="primary" circle plain text size="small" @click="change_space(item.ws_id, item.name)">
              <el-icon><Star /></el-icon>
            </el-button>

            <p :style="{ color: item.isCheck ? '#1989fa' : '#333' }" style="margin: 0.5rem 1rem; font-size: 14px; flex: 1; text-align: center; cursor: pointer" @click="check_space(item, item.name)">
              {{ item.name }}
            </p>
            <div style="width: 60px">
              <el-button type="primary" circle plain text size="small" @click="show_input(item.ws_id)">
                <el-icon size="14"><Edit /></el-icon>
              </el-button>
              <el-popconfirm :title="t('data.确认删除')" @confirm="delete_ws(item.ws_id)">
                <template #reference>
                  <el-button type="danger" circle text size="small" @click.stop="">
                    <el-icon size="14"><Delete /></el-icon>
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
          <el-input v-else v-model="item.name" placeholder="Change Space Name" @change="change_space_name(item.name, item.ws_id)" @keydown.enter="no_show" />
        </div>
        <div class="space" style="padding: 0; margin-top: 10px">
          <el-button :icon="Plus" style="width: 100%" @click="create_space = !create_space">New Space</el-button>
        </div>
      </el-popover>
    </el-scrollbar>

    <el-dialog v-model="create_space" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="space_list.length ? true : false" :title="t('data.创建WorkSpace')" width="40%">
      <span>{{ t("data.请先创建您的WorkSpace") }}</span>
      <div style="display: flex; align-items: center; margin-top: 2rem">
        <span style="white-space: nowrap; width: 9rem">{{ t("data.WorkSpace名称") }}:</span>
        <el-input v-model="newSpace" placeholder="Please input WorkSpace name" style="flex: 1" />
      </div>
      <div style="display: flex; align-items: center; margin-top: 1rem">
        <span style="white-space: nowrap; width: 9rem" />
        <el-checkbox v-model="checked" :disabled="!space_list.length" style="flex: 1">
          <span style="font-size: 12px">{{ t("data.设置为默认WorkSpace") }}</span>
        </el-checkbox>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="add_space(newSpace, space_list.length)">{{ t("message.提交") }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="gpt_dialog" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
      <p v-html="t('message.更新信息_gpt')" />
      <div style="max-width: 700px; margin: 3rem 0">
        <el-form ref="gpt_form_ref" :model="gpt_form" :rules="rules" label-width="7rem">
          <el-form-item :label="t('message.姓名')" prop="name">
            <el-input v-model="gpt_form.name" />
          </el-form-item>
          <el-form-item v-if="drugflow_need_gpt_telephone" :label="t('message.电话号码')" prop="telephone">
            <el-input v-model="gpt_form.telephone" />
          </el-form-item>
          <el-form-item v-if="drugflow_need_gpt_telephone" prop="verification_code">
            <div style="display: flex; width: 100%">
              <el-input v-model="gpt_form.verification_code" autocomplete="off" />
              <el-button v-if="codeShow" style="margin-left: 10px" type="primary" @click="get_code(gpt_form.telephone)">{{ t("index.获取验证码") }}</el-button>
              <span v-else class="count">{{ t("message.60s后重试前") }} {{ count }} {{ t("message.60s后重试后") }}</span>
            </div>
          </el-form-item>
          <el-form-item v-if="drugflow_need_gpt_email" :label="t('message.Email')" prop="email">
            <el-input v-model="gpt_form.email" />
          </el-form-item>
          <el-form-item v-if="drugflow_need_gpt_email" prop="verification_code">
            <div style="display: flex; width: 100%">
              <el-input v-model="gpt_form.verification_code" autocomplete="off" />
              <el-button v-if="codeShow" style="margin-left: 10px" type="primary" @click="get_code_email(gpt_form.email)">{{ t("index.获取验证码") }}</el-button>
              <span v-else class="count">{{ t("message.60s后重试前") }} {{ count }} {{ t("message.60s后重试后") }}</span>
            </div>
          </el-form-item>
          <el-form-item :label="t('message.单位名称')" prop="organization">
            <el-input v-model="gpt_form.organization" />
          </el-form-item>
          <el-form-item :label="t('message.工作职务')" prop="position">
            <el-input v-model="gpt_form.position" />
          </el-form-item>
          <el-form-item>
            <el-button style="width: 20%; max-width: 120px" type="success" :loading="btn_loading" @click="submit_gpt">
              {{ t("result.确认") }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import app_narrow_leftbar from "./app_narrow_leftbar.vue";
import app_title_topbar from "./app_title_topbar.vue";
import { get_users_role, send_code } from "@drugflow/api/user";
import { useI18n } from "vue-i18n";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { create_waitlist } from "@drugflow/api/user";
// import { ElMessage, ElMessageBox } from 'element-plus'
import { edit_user_api, edit_phone_api, edit_email_api, send_email_code, send_verify_user_email_api } from "@drugflow/api/manage_center";
import { isMobile } from "../../utils/validate";
import dayjs from "dayjs";
import { create_new_space, get_space, jobs_migrate, rename, set_default, delete_space } from "@drugflow/api/data";
import { Plus } from "@element-plus/icons-vue";

export default {
  name: "app_frame",
  components: { app_title_topbar, app_narrow_leftbar },
  props: {
    main_tab: {
      type: String,
      default: "Main Module"
    },
    tab_name: {
      type: String,
      default: "ADMET"
    },
    auto_narrow: {
      type: Boolean,
      default: false
    },
    task_type: {
      type: String,
      default: "all"
    },
    api_permission: {
      type: Boolean,
      default: false
    }
  },
  emits: ["space_id"],

  setup(props, context) {
    const { t } = useI18n();
    const if_left_narrow = ref(false);
    if (props.auto_narrow) {
      if_left_narrow.value = true;
    }
    const activeName = ref("first");
    const loadingtext = ref("SUBMIT");
    const if_alert_browser = ref(false);
    const application = ref(true);
    const user_type = ref(1);
    const confirm_status = ref(null);
    const need_confirm = ref(true);
    const license_time = ref();
    const timeLeft = ref();
    const application_form = ref();
    const gpt_form_ref = ref();
    const timers = ref(null);
    const codeShow = ref(true);
    const count = ref(0);
    const space_check = ref("");
    const show_check = ref(false);
    const newSpace = ref("");
    const create_space = ref(false);
    const data_list = ref([]);
    const space_list = ref([]);
    const show_data = ref(false);
    const checked = ref(true);
    const space = ref(null);
    const gpt_dialog = ref(false);
    const not_show_other = ref(false);
    const drugflow_need_gpt_telephone = ref(false);
    const drugflow_need_gpt_email = ref(false);
    const btn_loading = ref(false);
    const gpt_form = ref({
      name: "",
      organization: "",
      position: "",
      telephone: "",
      verification_code: "",
      email: ""
    });
    const form = ref({
      name: "",
      organization: "",
      position: "",
      telephone: "",
      verification_code: ""
    });
    const privatization = ref([]);

    if (typeof WebSocket !== "function") {
      if_alert_browser.value = true;
    }
    const user_info = ref({});
    let tmp_permission = false;
    const isvisited = ref();
    if (!sessionStorage.getItem("isvisited")) {
      // 第一次进入网站
      isvisited.value = true;
      get_users_role()
        .then(res => {
          sessionStorage.setItem("isvisited", "true");
          if (res.data.privatization) {
            sessionStorage.setItem("privatization", res.data.privatization);
          } else {
            sessionStorage.setItem("privatization", "null");
          }
        })
        .catch(() => {
          // 待补充
        });
    } else {
      // 不是第一次进入网站
    }
    console.log("cs_user_info", localStorage.getItem("cs_user_info"));
    if (localStorage.getItem("cs_user_info")) {
      user_info.value = JSON.parse(localStorage.getItem("cs_user_info"));
      context.emit("update:api_permission", user_info.value.api_permission);
    } else {
      get_users_role()
        .then(res => {
          user_info.value.uname = res.data.name;
          user_info.value.uemail = res.data.email;
          user_info.value.is_staff = res.data.is_staff;
          privatization.value = res.data.privatization;
          if (res.data.extras.api_permission) {
            tmp_permission = res.data.extras.api_permission;
          }
          context.emit("update:api_permission", tmp_permission);

          localStorage.setItem(
            "cs_user_info",
            JSON.stringify({
              uname: res.data.name,
              uemail: res.data.email,
              is_staff: res.data.is_staff,
              api_permission: tmp_permission
            })
          );
        })
        .catch(err => {
          console.error(err);
        });
    }
    const ismobile = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("Please input email address"));
      } else if (!isMobile(value)) {
        callback(new Error("Please input the correct email address"));
      } else {
        callback();
      }
    };
    const rules = reactive({
      name: [{ trigger: "blur", required: true }],
      organization: [{ trigger: "blur", required: true, message: "This is required" }],
      telephone: [
        {
          validator: ismobile,
          trigger: "blur",
          required: true,
          message: "Please input email address"
        }
      ],
      position: [{ trigger: "blur", required: true, message: "This is required" }]
    });
    // const deadline = new Date('2023-05-31T23:59:59').getTime()
    const currentTime = ref(dayjs().unix());
    const remainingTime = ref(0);
    let timer;

    const calcRemainingTime = () => {
      const diff = Math.floor((license_time.value - currentTime.value) / 1000);
      // const diff = Math.floor((deadline - currentTime.value) / 1000)
      if (diff > 0) {
        remainingTime.value = diff;
      } else {
        clearInterval(timer);
        remainingTime.value = 0;
      }
    };

    const change_space = (id, space) => {
      set_default({
        ws_id: id
      }).then(res => {
        get_space_list();
      });
    };
    const show_input = id => {
      for (let i = 0; i < space_list.value.length; i++) {
        if (space_list.value[i].ws_id === id) {
          space_list.value[i].isShow = true;
        } else {
          space_list.value[i].isShow = false;
        }
      }
    };
    const change_space_name = (name, id) => {
      rename({
        ws_id: id,
        new_name: name
      })
        .then(res => {
          // console.log(res)
          get_space_list();
        })
        .catch(err => {
          console.log(err);
        });
      // for (let i = 0; i < space_list.value.length; i++) {
      //   if (space_list.value[i].id === id) {
      //     if (space_list.value[i].isCheck) {
      //       space_check.value = name
      //     }
      //   }
      // }
    };
    const no_show = () => {
      for (let i = 0; i < space_list.value.length; i++) {
        space_list.value[i].isShow = false;
      }
    };
    const delete_ws = ws_id => {
      delete_space(ws_id)
        .then(res => {
          get_space_list();
          ElMessage({
            message: t("data.删除成功"),
            type: "success"
          });
        })
        .catch(err => {
          console.error(err);
          ElMessage.error(t("data.删除失败"));
        });
    };
    const get_space_list = (num = null) => {
      get_space()
        .then(res => {
          if (num === 0) {
            jobs_migrate({
              ws_id: res.data.results[0].ws_id
            });
          }
          if (res.data.results.length) {
            create_space.value = false;
            space_list.value = res.data.results;
            let num = 0;
            for (let i = 0; i < res.data.results.length; i++) {
              space_list.value[i].isShow = false;
              space_list.value[i].isCheck = false;
              if (res.data.results[i].status === 1) {
                // console.log(res.data.results[i])
                num += 1;
                context.emit("space_id", res.data.results[i]);
                space.value = res.data.results[i];
                space_check.value = res.data.results[i].name;
                space_list.value[i].isCheck = true;
                return;
              }
            }
            if (num === 0) {
              context.emit("space_id", res.data.results[0]);
              space.value = res.data.results[0];
              space_check.value = res.data.results[0].name;
              space_list.value[0].isCheck = true;
            }
          } else {
            create_space.value = true;
            // console.log(create_space.value)
          }
        })
        .catch(err => {
          console.log(err);
        });
    };

    onMounted(() => {
      timer = setInterval(() => {
        currentTime.value = dayjs().unix();
        calcRemainingTime();
      }, 1000);
    });

    onUnmounted(() => {
      clearInterval(timer);
    });

    return {
      t,
      if_left_narrow,
      activeName,
      loadingtext,
      context,
      if_alert_browser,
      user_info,
      application,
      form,
      user_type,
      confirm_status,
      need_confirm,
      license_time,
      timeLeft,
      rules,
      application_form,
      gpt_form_ref,
      isvisited,
      timers,
      codeShow,
      count,
      space_list,
      change_space,
      show_input,
      change_space_name,
      // add_space,
      no_show,
      get_space_list,
      space_check,
      data_list,
      show_check,
      newSpace,
      show_data,
      Plus,
      checked,
      create_space,
      delete_ws,
      // check_space,
      space,
      gpt_dialog,
      not_show_other,
      gpt_form,
      drugflow_need_gpt_telephone,
      drugflow_need_gpt_email,
      btn_loading,
      privatization
    };
  },
  mounted() {
    get_users_role().then(res => {
      console.log(res);
      this.user_type = res.data.extras.user_type;
      this.confirm_status = res.data.extras.confirm_status;
      this.need_confirm = res.data.extras.need_confirm;
      this.license_time = res.data.extras.license_time;
      this.form.name = res.data.name;
      this.form.organization = res.data.organization;
      this.form.telephone = res.data.telephone;
      this.privatization = res.data.privatization;
      console.log(this.privatization);
      this.timeLeft = this.license_time - dayjs().unix();
      localStorage.setItem("user_type", this.user_type);
      this.check_for_gpt(res);
      // console.log(this.license_time)
      // console.log(dayjs().unix())
      // console.log(this.timeLeft)
    });
    this.get_space_list();
  },
  methods: {
    close_alert() {
      this.if_alert_browser = false;
    },
    check_for_gpt(res) {
      console.log("in check_for_gpt", res.data);
      if (res.data.extras.user_from && res.data.extras.user_from === "gpt") {
        if (res.data.name == "" && (!res.data.telephone || !res.data.email)) {
          this.gpt_dialog = true;
          this.not_show_other = true;
          if (!res.data.telephone) {
            this.drugflow_need_gpt_telephone = true;
          }
          if (!res.data.email) {
            this.drugflow_need_gpt_email = true;
          }
        }
      }
    },
    check_space(space, name) {
      this.space_check = name;
      this.$emit("space_id", space);
      for (let i = 0; i < this.space_list.length; i++) {
        if (this.space_list[i].ws_id === space.ws_id) {
          this.space_list[i].isCheck = true;
        } else {
          this.space_list[i].isCheck = false;
        }
      }
    },

    add_space(name, num) {
      if (this.newSpace !== "") {
        create_new_space({
          ws_name: name,
          is_default: this.checked
        })
          .then(res => {
            console.log(res);
            this.create_space = false;
            this.get_space_list(num);
          })
          .catch(err => {
            console.log(err);
          });
        this.newSpace = "";
      }
    },
    submit_gpt() {
      this.gpt_form_ref.validate(async valid => {
        if (valid) {
          this.btn_loading = true;
          if (this.gpt_form.telephone) {
            let params = {
              phone: this.gpt_form.telephone,
              verification_code: this.gpt_form.verification_code
            };
            try {
              const phone_res = await edit_phone_api(params);
            } catch (err) {
              console.log(err);
              ElMessage.error(this.t("message.手机号验证码错误"));
              this.btn_loading = false;
              return;
            }
          } else {
            let params = {
              email: this.gpt_form.email,
              verification_code: this.gpt_form.verification_code
            };
            try {
              const email_res = await edit_email_api(params);
            } catch (err) {
              console.log(err);
              ElMessage.error(this.t("message.邮箱验证码错误"));
              this.btn_loading = false;
              return;
            }
          }
          const formData = {
            name: this.gpt_form.name,
            organization: this.gpt_form.organization,
            job_title: this.gpt_form.position
          };
          if (this.gpt_form.email) {
            formData.email = this.gpt_form.email;
          }
          try {
            const info_ref = await edit_user_api(formData);
            ElMessage({
              message: this.t("message.修改成功"),
              type: "success"
            });
          } catch (err) {
            console.log(err);
            ElMessage.error(this.t("message.修改失败"));
            this.btn_loading = false;
            return;
          }
          this.btn_loading = false;
          this.gpt_dialog = false;
          try {
            await send_verify_user_email_api();
          } catch (err) {
            console.log(err);
            ElMessage.error("发送审核邮件失败");
          }
        }
      });
    },
    submit() {
      this.application_form.validate(valid => {
        if (valid) {
          const formData = new FormData();
          formData.append("name", this.form.name);
          formData.append("organization", this.form.organization);
          formData.append("telephone", this.form.telephone);
          formData.append("verification_code", this.form.verification_code);
          formData.append("job_title", this.form.position);
          formData.append("action", "submit");
          create_waitlist(formData)
            .then(res => {
              console.log(res);
              this.application = false;
              if (res.data.status) {
                ElMessageBox.alert("您的申请已经收到，我们将尽快审核，请耐心等待", {
                  confirmButtonText: "OK",
                  type: "success"
                });
              }
            })
            .catch(err => {
              this.application = false;
              console.log(err);
            });
        }
      });
    },
    get_code(telephone) {
      const TIME_COUNT = 60;
      this.count = TIME_COUNT;
      this.codeShow = false;
      this.timers = setInterval(() => {
        if (this.count > 0 && this.count <= TIME_COUNT) {
          this.count--;
        } else {
          this.codeShow = true;
          clearInterval(this.timers);
          this.timers = null;
        }
      }, 1000);
      const formData = new FormData();
      formData.append("phone", telephone);
      formData.append("country_intl", 86);
      send_code(formData)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err.response.data.detail);
        });
    },
    get_code_email(email) {
      const TIME_COUNT = 60;
      this.count = TIME_COUNT;
      this.codeShow = false;
      this.timers = setInterval(() => {
        if (this.count > 0 && this.count <= TIME_COUNT) {
          this.count--;
        } else {
          this.codeShow = true;
          clearInterval(this.timers);
          this.timers = null;
        }
      }, 1000);
      const formData = new FormData();
      formData.append("email", email);
      send_email_code(formData)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err.response.data.detail);
        });
    },
    handleClose() {
      if ((this.confirm_status === null || this.confirm_status === undefined) && (this.need_confirm === null || this.need_confirm === undefined)) {
        const formData = new FormData();
        formData.append("name", this.form.name);
        formData.append("organization", this.form.organization);
        formData.append("telephone", this.form.telephone);
        formData.append("verification_code", this.form.verification_code);
        formData.append("job_title", this.form.position);
        formData.append("action", "close");
        create_waitlist(formData)
          .then(res => {
            console.log(res);
            this.application = false;
          })
          .catch(err => {
            this.application = false;
            console.log(err);
          });
      } else {
        this.application = false;
      }
    }
  }
};
</script>

<style lang="css" scoped>
.space:hover {
  background: #ecf5ff;
}

.count {
  white-space: nowrap;
  margin-left: 10px;
  color: #999999;
}

.alert_div {
  line-height: 2.5rem;
  background: #b80ca3cc;
  color: #f2f2f2;
  text-align: center;
  font-size: 14px;
}

.leftbar {
  width: 15rem;
  background: rgb(14, 66, 210);
  position: relative;
  top: 0;
  z-index: 2;
  transition: width 0.3s;
}

.narrow {
  width: 3.3rem;
}

.mainpage {
  background: #fff;
  position: relative;
  top: 0;
  transition: 0.3s;
  width: calc(100% - 3.3rem);
  left: 3.3rem;
}

.mainpage_change {
  width: calc(100% - 3.3rem);
  left: 3.3rem;
}

.hover_black {
  color: #f2f2f2;
}

.hover_black:hover {
  color: #333;
}

.title {
  color: #5794ff;
  font-weight: bold;
  font-size: 16px;
}
</style>
