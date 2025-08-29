
// 可依實際需要擴充/收斂欄位
export type ChecklistItem = {
  id: string;
  title: string;
  sequence: string;
  is_in_stats: 0 | 1;
  updated_at: string;

  // 常用的巢狀欄位（可選）
  answer_setting?: { id: string; name?: string; type?: string } | null;
  answer_value?: { id: string; label: string; value: number } | null;
  question_type_setting?: { id: string; name: string; value: string } | null;

  // 你有用到再解構，不然先用 unknown 佔位
  last_version?: unknown;
  question_setting_items?: unknown;
  question_setting?: unknown;
  remark?: string;
  keypoint?: unknown;
  common_choice_group?: unknown;
  effects?: unknown;
  factory_effects?: unknown;
  checklist_question_version?: string;
  checklist_record_answer?: unknown;
  question_qualified_standard?: unknown;
  sequence_sort_key?: string; // 如果你想自己做排序 key
  latLng?: { latitude: number; longitude: number };
  risk_level?: number;
};

// === Demo 資料 ===
// 下面是依你貼的內容整理過、可直接用來跑畫面的假資料。
// 有 [Object]/[Array] 的地方我移除或以 null/unknown 代表，之後你要再補都行。
export const DEMO_CHECKLIST_QUESTIONS: ChecklistItem[] = [
  {
    id: "064d43b0-9178-47d0-a2df-5538efe335e7",
    title: "觸媒焚化-廢觸媒裝置",
    sequence: "0001",
    is_in_stats: 1,
    updated_at: "2025-05-27T08:21:05.000000Z",
    answer_setting: { id: "c1d8c1ea-236c-482a-9965-01364fb18b80" },
    question_type_setting: { id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14", name: "單選題", value: "single-choice" },
  },
  {
    id: "20e6efbb-3f75-4e19-81f1-63a354cb44e3",
    title: "蓄熱焚化-焚化設施狀態",
    sequence: "0002",
    is_in_stats: 1,
    updated_at: "2025-05-27T08:21:05.000000Z",
    answer_setting: { id: "c1d8c1ea-236c-482a-9965-01364fb18b80" },
    question_type_setting: { id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14", name: "單選題", value: "single-choice" },
  },
  {
    id: "a3e03f14-9e12-4e24-b29f-f0ba5514564f",
    title: "蓄熱焚化-蓄熱材維護",
    sequence: "0003",
    is_in_stats: 1,
    updated_at: "2025-05-27T08:21:05.000000Z",
    answer_setting: { id: "c1d8c1ea-236c-482a-9965-01364fb18b80" },
    question_type_setting: { id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14", name: "單選題", value: "single-choice" },
  },
  {
    id: "9a4b7acb-eab1-40cf-9ab0-b257a42341ad",
    title: "蓄熱焚化-氣體交換控制閥狀態",
    sequence: "0004",
    is_in_stats: 1,
    updated_at: "2025-05-27T08:21:06.000000Z",
    answer_setting: { id: "c1d8c1ea-236c-482a-9965-01364fb18b80" },
    question_type_setting: { id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14", name: "單選題", value: "single-choice" },
  },
  {
    id: "2f6e66bd-a68f-4108-b0bc-324d2a12f30e",
    title: "冷凝防制設備-冷凝管外侵蝕",
    sequence: "0005",
    is_in_stats: 1,
    updated_at: "2025-05-27T08:21:06.000000Z",
    answer_setting: { id: "c1d8c1ea-236c-482a-9965-01364fb18b80" },
    question_type_setting: { id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14", name: "單選題", value: "single-choice" },
  },
  {
    id: "f37ee19f-06fd-430c-b466-eceb05ad9b83",
    title: "冷凝防制設備-冷凝管入口、內部侵蝕",
    sequence: "0006",
    is_in_stats: 1,
    updated_at: "2025-05-27T08:21:06.000000Z",
    answer_setting: { id: "c1d8c1ea-236c-482a-9965-01364fb18b80", name: "合規/不合規", type: "option" },
    answer_value: { id: "05e4082b-983b-4a68-a3ab-82df73ce54b4", label: "合規", value: 25 },
    question_type_setting: { id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14", name: "單選題", value: "single-choice" },
    latLng: { latitude: 25.041634480896665, longitude: 121.56278740777267 },
    risk_level: 25,
  },
  {
    id: "2580dfe3-af22-4a17-ac76-b94ef8c94495",
    title: "冷凝防制設備-冷凝管破管或冷凝管接合處洩漏",
    sequence: "0007",
    is_in_stats: 1,
    updated_at: "2025-05-27T08:21:06.000000Z",
    answer_setting: { id: "c1d8c1ea-236c-482a-9965-01364fb18b80" },
    question_type_setting: { id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14", name: "單選題", value: "single-choice" },
  },
  {
    id: "4bc5444e-8707-479b-8689-afeb4043d0d9",
    title: "冷凝防制設備-冷凝器管板腐蝕",
    sequence: "0008",
    is_in_stats: 1,
    updated_at: "2025-05-27T08:21:07.000000Z",
    answer_setting: { id: "c1d8c1ea-236c-482a-9965-01364fb18b80" },
    question_type_setting: { id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14", name: "單選題", value: "single-choice" },
  },
  // ...你可以依樣畫葫蘆把其餘項目補齊
];
