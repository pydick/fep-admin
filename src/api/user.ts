import { http } from "@/utils/http";
import { apiV1 } from "@/config/api";

export type UserResult = {
  success: boolean;
  message: string;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

interface IRegisterParams {
  username: string;
  password: string;
  phone: string;
}

interface ILoginParams {
  username: string;
  password: string;
}

/** 登录 */
// 改写mock
export const getLogin = (data?: ILoginParams) => {
  return http.request<UserResult>("post", `${apiV1}/auth/login`, { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

/** 注册 */
// 返回any?
export const signup = (data?: IRegisterParams) => {
  return http.request<any>("post", `${apiV1}/auth/register`, { data });
};
