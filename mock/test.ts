import { defineFakeRoute } from "vite-plugin-fake-server/client";
import { proteinsData } from "./proteinsData.js";
export default defineFakeRoute([
  {
    url: "/api/v1/oss/list",
    method: "get",
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
    url: "/api/v1/oss/download",
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
    url: "/api/v1/protein/info/upload",
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
  }
]);
