// import "@/utils/sso";
import Cookies from "js-cookie";
import { getConfig } from "@/config";
import NProgress from "@/utils/progress";
import { transformI18n } from "@/plugins/i18n";
import { buildHierarchyTree } from "@/utils/tree";
import remainingRouter from "./modules/remaining";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { isUrl, openLink, cloneDeep, isAllEmpty, storageLocal } from "@pureadmin/utils";
import { ascending, getTopMenu, initRouter, isOneOfArray, getHistoryMode, findRouteByPath, handleAliveRoute, formatTwoStageRoutes, formatFlatteningRoutes } from "./utils";
import { type Router, type RouteRecordRaw, type RouteComponent, createRouter } from "vue-router";
import { type DataInfo, userKey, removeToken, multipleTabsKey } from "@/utils/auth";

/** 自动导入全部静态路由，无需再手动引入！匹配 src/router/modules 目录（任何嵌套级别）中具有 .ts 扩展名的所有文件，除了 remaining.ts 文件
 * 如何匹配所有文件请看：https://github.com/mrmlnc/fast-glob#basic-syntax
 * 如何排除文件请看：https://cn.vitejs.dev/guide/features.html#negative-patterns
 */
const modules: Record<string, any> = import.meta.glob(["./modules/**/*.ts", "!./modules/**/remaining.ts"], {
  eager: true
});

/** 原始静态路由（未做任何处理） */
const routes = [];

Object.keys(modules).forEach(key => {
  routes.push(modules[key].default);
});

/** 导出处理后的静态路由（三级及以上的路由全部拍成二级） */
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(formatFlatteningRoutes(buildHierarchyTree(ascending(routes.flat(Infinity)))));

/** 初始的静态路由，用于退出登录时重置路由 */
const initConstantRoutes: Array<RouteRecordRaw> = cloneDeep(constantRoutes);

/** 用于渲染菜单，保持原始层级 */
export const constantMenus: Array<RouteComponent> = ascending(routes.flat(Infinity)).concat(...remainingRouter);

/** 不参与菜单的路由 */
export const remainingPaths = Object.keys(remainingRouter).map(v => {
  return remainingRouter[v].path;
});

/** 创建路由实例 */
export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: constantRoutes.concat(...(remainingRouter as any)),
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number = document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  }
});

/** 重置路由 */
export function resetRouter() {
  router.clearRoutes();
  for (const route of initConstantRoutes.concat(...(remainingRouter as any))) {
    router.addRoute(route);
  }
  router.options.routes = formatTwoStageRoutes(formatFlatteningRoutes(buildHierarchyTree(ascending(routes.flat(Infinity)))));
  usePermissionStoreHook().clearAllCachePage();
}

/** 路由白名单 */
const whiteList = ["/signin", "/micro-fep", "/signup"];

const { VITE_HIDE_HOME } = import.meta.env;

router.beforeEach((to: ToRouteType, _from, next) => {
  // 检查目标路由是否需要缓存（keepAlive）
  if (to.meta?.keepAlive) {
    // 将当前路由添加到缓存列表中
    handleAliveRoute(to, "add");
    // 页面整体刷新和点击标签页刷新时的处理
    if (_from.name === undefined || _from.name === "Redirect") {
      // 刷新缓存路由（先删除再添加，确保组件重新渲染）
      handleAliveRoute(to);
    }
  }
  // 从本地存储中获取用户信息
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  // 开始显示页面加载进度条
  NProgress.start();
  // 检查目标路由的name是否为外部链接（URL格式）
  const externalLink = isUrl(to?.name as string);
  // 如果不是外部链接，则设置页面标题
  if (!externalLink) {
    // 遍历匹配的路由记录，设置页面标题
    to.matched.some(item => {
      // 如果路由没有标题，则跳过
      if (!item.meta.title) return "";
      // 获取应用配置的标题
      const Title = getConfig().Title;
      // 如果有应用标题，则组合显示：页面标题 | 应用标题
      if (Title) document.title = `${transformI18n(item.meta.title)} | ${Title}`;
      // 否则只显示页面标题
      else document.title = transformI18n(item.meta.title);
    });
  }
  /** 如果已经登录并存在登录信息后不能跳转到路由白名单，而是继续保持在当前页面 */
  function toCorrectRoute() {
    // 如果目标路径在白名单中，则跳转回来源页面，否则继续导航
    whiteList.includes(to.fullPath) ? next(_from.fullPath) : next();
  }
  // 检查是否存在多标签页缓存和用户信息（表示用户已登录）
  if (Cookies.get(multipleTabsKey) && userInfo) {
    // 无权限跳转403页面
    if (to.meta?.roles && !isOneOfArray(to.meta?.roles, userInfo?.roles)) {
      // 如果用户没有访问该路由的权限，跳转到403错误页面
      next({ path: "/error/403" });
    }
    // 开启隐藏首页后在浏览器地址栏手动输入首页welcome路由则跳转到404页面
    if (VITE_HIDE_HOME === "true" && to.fullPath === "/welcome") {
      // 如果配置了隐藏首页且用户直接访问welcome路由，跳转到404页面
      next({ path: "/error/404" });
    }
    // 检查来源路由是否有name属性（表示不是页面刷新）
    if (_from?.name) {
      // name为超链接
      if (externalLink) {
        // 如果是外部链接，则在新窗口中打开链接
        openLink(to?.name as string);
        // 结束进度条显示
        NProgress.done();
      } else {
        // 否则执行正确的路由跳转
        toCorrectRoute();
      }
    } else {
      // 页面刷新时的处理
      // 检查权限存储中是否没有整体菜单且目标路径不是登录页
      if (usePermissionStoreHook().wholeMenus.length === 0 && to.path !== "/login") {
        // 初始化路由（加载动态路由）
        initRouter().then((router: Router) => {
          // 检查多标签页是否没有缓存
          if (!useMultiTagsStoreHook().getMultiTagsCache) {
            // 获取目标路径
            const { path } = to;
            // 根据路径查找对应的路由配置
            const route = findRouteByPath(path, router.options.routes[0].children);
            // 获取顶级菜单
            getTopMenu(true);
            // query、params模式路由传参数的标签页不在此处处理
            if (route && route.meta?.title) {
              // 检查是否为动态顶级路由（目录类型）
              if (isAllEmpty(route.parentId) && route.meta?.backstage) {
                // 此处为动态顶级路由（目录）
                // 获取第一个子路由的信息
                const { path, name, meta } = route.children[0];
                // 将子路由添加到多标签页
                useMultiTagsStoreHook().handleTags("push", {
                  path,
                  name,
                  meta
                });
              } else {
                // 普通路由，直接添加路由信息到多标签页
                const { path, name, meta } = route;
                useMultiTagsStoreHook().handleTags("push", {
                  path,
                  name,
                  meta
                });
              }
            }
          }
          // 确保动态路由完全加入路由列表并且不影响静态路由（注意：动态路由刷新时router.beforeEach可能会触发两次，第一次触发动态路由还未完全添加，第二次动态路由才完全添加到路由列表，如果需要在router.beforeEach做一些判断可以在to.name存在的条件下去判断，这样就只会触发一次）
          // 如果目标路由没有name属性，则重新导航到目标路径
          if (isAllEmpty(to.name)) router.push(to.fullPath);
        });
      }
      // 执行正确的路由跳转
      toCorrectRoute();
    }
  } else {
    // 用户未登录的处理逻辑
    // 如果目标路径不是登录页
    if (to.path !== "/signin") {
      // 检查目标路径是否在白名单中
      if (whiteList.indexOf(to.path) !== -1) {
        // 如果在白名单中，允许访问
        next();
      } else {
        // 如果不在白名单中，清除token并跳转到登录页
        removeToken();
        next({ path: "/signin" });
      }
    } else {
      // 如果目标路径就是登录页，直接允许访问
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
