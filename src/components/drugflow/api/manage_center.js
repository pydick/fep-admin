import { http as request } from "@/utils/http";

//团队列表
export function get_team_list_api(params) {
  return request.get(`/api/teams?user_type=${params.user_type}&name=${params.name}&page_size=${params.page_size}&page=${params.page}&ordering=${params.ordering}`);
}

//创建团队
export function create_team_api(params) {
  return request.post("/api/teams", params);
}

//编辑团队信息
export function edit_team_api(params) {
  return request.patch(`/api/teams/${params.id}`, params);
}

//删除团队
export function delete_team_api(params) {
  return request.delete(`/api/teams/${params.id}`);
}

//根据id获取团队信息
export function get_team_api(params) {
  return request.get(`/api/teams/${params.id}`);
}

//用户个人信息
export function get_users_role() {
  return request.get("/api/users/this");
}

//修改用户个人信息
export function edit_user_api(params) {
  return request.patch(`/api/users/info`, params);
}

//修改用户手机号
export function edit_phone_api(params) {
  return request.put(`/api/users/phone`, params);
}

//增加用户mail
export function edit_email_api(params) {
  return request.put(`/api/users/email`, params);
}

//修改用户密码
export function edit_password_api(params) {
  return request.put(`/api/users/password`, params);
}

//修改团队用户角色
export function edit_teamrole_api(params) {
  return request.put(`/api/teams/${params.id}/users`, params);
}

export function get_csrf_token() {
  return request.get("/get_csrf_token");
}

//发送短信验证码
export function send_code(form) {
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.data.csrf_token);
    return request.post("/api/send_phone_verification_code", form);
  });
}

//发送邮件验证码
export function send_email_code(form) {
  return get_csrf_token().then(res => {
    localStorage.setItem("cs_csrf_token", res.data.csrf_token);
    return request.post("/api/send_mail_verification_code", form);
  });
}

//发送邮件
export function send_verify_user_email_api() {
  return request.get("/api/users/send_verify_user_email");
}

// 创建订单
export function pay_payment_api(params) {
  return request.post("/api/payment/pay", params);
}

// 同步回调获取订单状态
export function get_result_payment_api(params) {
  return request.get(`/api/payment/get_result?out_trade_no=${params.out_trade_no}`);
}

// 取消订单
export function cancel_order_payment_api(params) {
  return request.get("/api/payment/cancel_order");
}

// 消费记录列表
export function records_payment_api(params) {
  return request.get(`/api/payment/records?page_size=${params.page_size}&page=${params.page}`);
}

// 充值记录列表
export function orders_payment_api(params) {
  return request.get(`/api/payment/orders?page_size=${params.page_size}&page=${params.page}`);
}

// 同步回调获取订单状态
export function get_wx_url_api(params) {
  return request.get(`/api/payment/get_wx_url?out_trade_no=${params.out_trade_no}`);
}
