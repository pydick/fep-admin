import { defineFakeRoute } from "vite-plugin-fake-server/client";
import { proteinsData } from "./proteinsData.js";
export default defineFakeRoute([
  {
    url: "/api/v1/auth/login1",
    method: "post",
    response: ({ body }) => {
      if (body.username === "pengyong") {
        return {
          success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/44761321",
            username: "admin",
            nickname: "小铭",
            // 一个用户可能有多个角色
            roles: ["admin"],
            // 按钮级别权限
            permissions: ["*:*:*"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.admin",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      } else {
        return {
          success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/52823142",
            username: "common",
            nickname: "小林",
            roles: ["common"],
            permissions: ["permission:btn:add", "permission:btn:edit"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.common",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.commonRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      }
    }
  },
  {
    url: "/api/v1/oss/list1",
    method: "get",
    response: ({ body }) => {
      return {
        data: {
          task_id: "1234567890"
        },
        message: "操作成功",
        success: true
      };
    }
  },
  {
    url: "/api/v1/task/init1",
    method: "post",
    response: ({ body }) => {
      return {
        success: true,
        objects: [
          {
            Key: "test.pdb"
          }
        ]
      };
    }
  },
  {
    url: "/api/v1/oss/download1",
    method: "get",
    response: ({ body }) => {
      return {
        status: 200,
        data: proteinsData,
        headers: {
          "content-disposition": "attachment; filename=test.pdb"
        }
      };
    }
  },
  {
    url: "/api/v1/protein/info/upload1",
    method: "post",
    response: ({ body }) => {
      return {
        success: true,
        data: {
          chains: [
            {
              chain_id: "A",
              start_residue_number: 701,
              end_residue_number: 985
            }
          ],
          hets: [
            {
              name: "EDO",
              residue_number: 1101,
              chain_id: "A",
              water_within_dist: [
                {
                  residue_number: 1360,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1376,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1511,
                  chain_id: "A",
                  if_water_bridge: false
                }
              ]
            },
            {
              name: "KY9",
              residue_number: 1102,
              chain_id: "A",
              water_within_dist: [
                {
                  residue_number: 1214,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1221,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1230,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1252,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1266,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1286,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1287,
                  chain_id: "A",
                  if_water_bridge: false
                }
              ]
            },
            {
              name: "NO3",
              residue_number: 1103,
              chain_id: "A",
              water_within_dist: [
                {
                  residue_number: 1310,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1531,
                  chain_id: "A",
                  if_water_bridge: false
                }
              ]
            },
            {
              name: "EDO",
              residue_number: 1104,
              chain_id: "A",
              water_within_dist: [
                {
                  residue_number: 1221,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1252,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1262,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1286,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1287,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1298,
                  chain_id: "A",
                  if_water_bridge: false
                }
              ]
            },
            {
              name: "NO3",
              residue_number: 1105,
              chain_id: "A",
              water_within_dist: [
                {
                  residue_number: 1214,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1383,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1450,
                  chain_id: "A",
                  if_water_bridge: false
                }
              ]
            },
            {
              name: "EDO",
              residue_number: 1106,
              chain_id: "A",
              water_within_dist: [
                {
                  residue_number: 1203,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1228,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1235,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1260,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1289,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1315,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1355,
                  chain_id: "A",
                  if_water_bridge: false
                },
                {
                  residue_number: 1520,
                  chain_id: "A",
                  if_water_bridge: false
                }
              ]
            }
          ]
        }
      };
    }
  },
  {
    url: "/api/v1/ligand/perturbation-graph",
    method: "post",
    response: ({ body }) => {
      return {
        success: true,
        message: "成功获取配体微扰图数据，包含 3 个节点和 3 条边",
        data: {
          nodes: [
            {
              id: "ejm_31"
            },
            {
              id: "jmc_30"
            },
            {
              id: "ejm_50"
            }
          ],
          edges: [
            {
              id: "ejm_31_to_ejm_50",
              source: "ejm_31",
              target: "ejm_50",
              label: 0.8995
            },
            {
              id: "ejm_31_to_jmc_30",
              source: "ejm_31",
              target: "jmc_30",
              label: 0.5488
            },
            {
              id: "ejm_50_to_jmc_30",
              source: "ejm_50",
              target: "jmc_30",
              label: 0.4966
            }
          ]
        }
      };
    }
  }
]);
