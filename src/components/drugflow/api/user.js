
import { http as request } from "@/utils/http";
export function signup_api(params) {
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.data.csrf_token);
    return request.post("/signup", params);
  });
}

export function signin_api(data) {
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.csrf_token);
    return request.post(
      "/signin",
      { data },
      {
        headers: { "content-type": "multipart/form-data" }
      }
    );
  });
}

export function re_activate_api(params) {
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.data.csrf_token);
    return request.post("/re_activate", params);
  });
}

export function signout_api(params) {
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.data.csrf_token);
    return request.post("/signout", params);
  });
}

export function forgot_password_api(params) {
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.data.csrf_token);
    return request.post("/forgot_password", params);
  });
}

export function reset_password_get_api(params) {
  const url = "/reset_password?token=" + params;
  return request.get(url);
}

export function reset_password_post_api(token, params) {
  const url = "/reset_password?token=" + token;
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.data.csrf_token);
    return request.post(url, params);
  });
}

export function activate_api(params) {
  const url = "/activate?token=" + params;
  return request.get(url);
}

export function get_csrf_token() {
  return request.get("/get_csrf_token");
}

export function get_users_role() {
  return request.get("/api/users/this");
}
// let results;
// results = {
//   data: {
//     "id": 1895,
//     "name": "gx",
//     "email": "gaoxu@carbonsilicon.ai",
//     "is_active": true,
//     "is_staff": false,
//     "extras": {
//       "app_allow": false,
//       "job_title": "122",
//       "user_type": "trial",
//       "license_time": 1720429631,
//       "need_confirm": false,
//       "confirm_status": false,
//       "drugflow_permission": 100,
//       "expired_notice_flag": false
//     },
//     "organization": "",
//     "telephone": "",
//     "interest_content": [],
//     "team_name": null,
//     "role": null,
//     "privatization": ["docking", "admet-dl", "admet-fh", "admet-sa", "qsar", "qsar-test", "molecular_factory", "virtual_screening", "lig-prep", "protein_process", "cress", "img2mol"]
//   }
// };
//
//
// export async function get_users_role() {
//   return new Promise((resolve) => {
//     // 模拟异步操作
//     setTimeout(() => {
//       resolve(results);
//     }, 1000);
//   })
// }

export function create_app_api(form) {
  return request.post("/api/apps", form);
}

export function get_app_api(page, page_size) {
  return request.get("/api/apps" + "?page=" + page + "&page_size=" + page_size);
}

export function app_stop_api(id) {
  return request.patch("/api/apps/" + id, { enabled: false });
}

export function app_recover_api(id) {
  return request.patch("/api/apps/" + id, { enabled: true });
}

export function app_delete_api(id) {
  return request.delete("/api/apps/" + id);
}

export function create_waitlist(form) {
  return request.post("/api/waitlist/submit", form);
}

export function send_code(form) {
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.data.csrf_token);
    return request.post("/api/send_phone_verification_code", form);
  });
}
export function get_env() {
  return request.get("/get_env");
}
