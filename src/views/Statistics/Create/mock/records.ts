// 非單選
export const U1 = "08447686-b51b-466f-bb41-986fd4c6d36f";
export const U2 = "45e29711-7c51-4869-825b-60d104084fcb";
export const U3 = "1224e3b4-9a67-4c08-a6ec-9805a50b624e";
export const U4 = "e2889124-a75e-422d-b29f-82001adca605";

export const params = [
  { key: U1, label: "題目1-調勻池pH值v1" },
  { key: U2, label: "題目2-初級沉澱池pH值v1" },
  { key: U3, label: "題目3-混凝池（快混-pH值 v1" },
  { key: U4, label: "題目4-袋式集塵器-廢氣風量、溫度" },
];
export const records = [
  { created_at: "2025-08-01T01:00:00+08:00", [U1]: 1, [U2]: 2, [U3]: 3, [U4]: 4 },
  { created_at: "2025-08-01T02:00:00+08:00", [U1]: 2, [U2]: 3, [U3]: 4, [U4]: 5 },
  { created_at: "2025-08-01T03:00:00+08:00", [U1]: 3, [U2]: 4, [U3]: 5, [U4]: 6 },
  { created_at: "2025-08-02T03:00:00+08:00", [U1]: 4, [U2]: 5, [U3]: 6, [U4]: 7 },
  { created_at: "2025-08-03T03:00:00+08:00", [U1]: 6, [U2]: 7, [U3]: 8, [U4]: 9 },
  { created_at: "2025-08-04T03:00:00+08:00", [U1]: 3, [U2]: 3, [U3]: 3, [U4]: 3 },
  { created_at: "2025-08-05T03:00:00+08:00", [U1]: 3, [U2]: 3, [U3]: 3, [U4]: 3 },
  { created_at: "2025-08-06T03:00:00+08:00", [U1]: 3, [U2]: 3, [U3]: 3, [U4]: 3 },
  { created_at: "2025-08-07T03:00:00+08:00", [U1]: 3, [U2]: 3, [U3]: 3, [U4]: 3 },
  { created_at: "2025-08-08T03:00:00+08:00", [U1]: 3, [U2]: 3, [U3]: 3, [U4]: 3 },
];


// 單選題
export const U11 = "6dcd7702-1d22-4a36-b0a2-05533f0e592e";
export const U22 = "b8e3a0f1-7c29-4d1a-9a3b-5f62e7de1c01";
export const U33 = "0047b9f6-9f7a-48ba-8690-4b6ec21a1491";
export const U44 = "e2889124-a75e-422d-b29f-82001adca605";
export const U55 = "08447686-b51b-466f-bb41-986fd4c6d36f";

export const params002 = [
  {
    "label": "廚餘設備檢查：閥門Ａ 無異常",
    "option_id": "a95bde59-8608-4bce-a4cd-c2c99e73f4ea",
    "question_id": "6dcd7702-1d22-4a36-b0a2-05533f0e592e"
  },
  {
    "label": "廚餘設備檢查：閥門Ａ 高風險",
    "option_id": "96fb530f-0be7-4221-b229-1a945a530ade",
    "question_id": "6dcd7702-1d22-4a36-b0a2-05533f0e592e"
  },
  {
    "label": "廚餘設備檢查：閥門Ａ 中風險",
    "option_id": "1fdf9b1b-0e1a-4256-97e9-bba5784a321d",
    "question_id": "6dcd7702-1d22-4a36-b0a2-05533f0e592e"
  },
  {
    "label": "廚餘設備檢查：閥門Ａ 低風險",
    "option_id": "1fdf9b1b-0e1a-4256-97e9-bba5784a321",
    "question_id": "6dcd7702-1d22-4a36-b0a2-05533f0e592e"
  },
  {
    "label": "廚餘設備檢查：閥門Ａ 不適用",
    "option_id": "1fdf9b1b-0e1a-4256-97e9-bba5784a321f",
    "question_id": "6dcd7702-1d22-4a36-b0a2-05533f0e592e"
  },

  {
    "label": "煮沸時間：無異常",
    "option_id": "a24d7e19-3f58-4a2a-bf8d-0b6a1c5e9aaa",
    "question_id": "b8e3a0f1-7c29-4d1a-9a3b-5f62e7de1c01"
  },
  {
    "label": "煮沸時間：低度風險",
    "option_id": "a24d7e19-3f58-4a2a-bf8d-0b6a1c5e9bbb",
    "question_id": "b8e3a0f1-7c29-4d1a-9a3b-5f62e7de1c01"
  },
  {
    "label": "煮沸時間：中度風險",
    "option_id": "a24d7e19-3f58-4a2a-bf8d-0b6a1c5e9ccc",
    "question_id": "b8e3a0f1-7c29-4d1a-9a3b-5f62e7de1c01"
  },
  {
    "label": "煮沸時間：高度風險",
    "option_id": "f6a1b4c8-90de-41b7-bf2b-7e1c2d3a4ddd",
    "question_id": "b8e3a0f1-7c29-4d1a-9a3b-5f62e7de1c01"
  },
  {
    "label": "煮沸時間：不適用",
    "option_id": "f6a1b4c8-90de-41b7-bf2b-7e1c2d3a4eee",
    "question_id": "b8e3a0f1-7c29-4d1a-9a3b-5f62e7de1c01"
  },

  {
    "label": "溫度：合規",
    "option_id": "656a2ddc-fd70-43fd-a4ea-77bf66bcbcc5",
    "question_id": "0047b9f6-9f7a-48ba-8690-4b6ec21a1491"
  },
  {
    "label": "溫度: 低度風險",
    "option_id": "69e90250-0c64-44df-a9d4-48f179b92aaa",
    "question_id": "0047b9f6-9f7a-48ba-8690-4b6ec21a1491"
  },
  {
    "label": "溫度: 中度風險",
    "option_id": "69e90250-0c64-44df-a9d4-48f179b92bbb",
    "question_id": "0047b9f6-9f7a-48ba-8690-4b6ec21a1491"
  },
  {
    "label": "溫度: 高度風險",
    "option_id": "69e90250-0c64-44df-a9d4-48f179b92ccc",
    "question_id": "0047b9f6-9f7a-48ba-8690-4b6ec21a1491"
  },
  {
    "label": "溫度: 不適用",
    "option_id": "69e90250-0c64-44df-a9d4-48f179b92ddd",
    "question_id": "0047b9f6-9f7a-48ba-8690-4b6ec21a1491"
  },
  {
    "label": "題目4-袋式集塵器-廢氣風量、溫度",
    "question_id": "e2889124-a75e-422d-b29f-82001adca605"
  },
   {
    "label": "題目5-調勻池pH值v55",
    "question_id": "08447686-b51b-466f-bb41-986fd4c6d36f"
  },
];

export const records002 = [
  {
    created_at: "2025-08-01T01:00:00+08:00",
    [U11]: [
      {
        "id": "1fdf9b1b-0e1a-4256-97e9-bba5784a321",
        "name": "廚餘設備檢查：閥門Ａ 低風險",
        "risk_level": 21
      }
    ],
    [U22]: [
      {
        "id": "a24d7e19-3f58-4a2a-bf8d-0b6a1c5e9ccc",
        "name": "煮沸時間：中度風險",
        "risk_level": 22
      }
    ],
    [U33]: [
      {
        "id": "69e90250-0c64-44df-a9d4-48f179b92ccc",
        "name": "溫度: 高度風險",
        "risk_level": 23
      }
    ],
    [U44]: 30,
    [U55]: 50
  },
  {
    created_at: "2025-08-01T02:00:00+08:00",
    [U11]: [
      {
        "id": "a95bde59-8608-4bce-a4cd-c2c99e73f4ea",
        "name": "廚餘設備檢查：閥門Ａ 無異常",
        "risk_level": 25
      }
    ],
    [U22]: [
      {
        "id": "a24d7e19-3f58-4a2a-bf8d-0b6a1c5e9aaa",
        "name": "煮沸時間：無異常",
        "risk_level": 25
      }
    ],
    [U33]: [
      {
        "id": "656a2ddc-fd70-43fd-a4ea-77bf66bcbcc5",
        "name": "溫度：合規",
        "risk_level": 25
      }
    ],
    [U44]: 33,
    [U55]: 55
  },
];