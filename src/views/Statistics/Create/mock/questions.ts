// 原始後端回來的題目型別（可簡化）
export type RawQuestion = {
    id: string;
    sequence: string;
    title: string;
    last_version: {
        question_type_setting: { value: string; name: string };
        question_setting_items: Array<{ id: string; name: string }>;
    };
};

// 直接把你貼的那一大段陣列貼進來
export const RAW_QUESTIONS: RawQuestion[] = [
  {
    id: "08447686-b51b-466f-bb41-986fd4c6d36f",
    sequence: "0001",
    title: "調勻池pH值",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "45e29711-7c51-4869-825b-60d104084fcb",
    sequence: "0002",
    title: "初級沉澱池pH值",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "1224e3b4-9a67-4c08-a6ec-9805a50b624e",
    sequence: "0003",
    title: "混凝池（快混）-pH值",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "e2889124-a75e-422d-b29f-82001adca605",
    sequence: "0004",
    title: "袋式集塵器-廢氣風量、溫度",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "009451f3-bfca-4650-b58c-218000e3729f",
    sequence: "0005",
    title: "袋式集塵器-風車馬達電流",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "6029d066-5ea1-42bf-a384-0f58f7083bda",
    sequence: "0006",
    title: "袋式集塵器-濾室壓差",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "22d5e0e5-3f12-4324-8537-3474ecf1751b",
    sequence: "0007",
    title: "袋式集塵器-不透光計讀值",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "7fc5b081-e97d-4133-b013-b6725c3e1ac3",
    sequence: "0008",
    title: "旋風集塵器-(目視)排氣之不透光率",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "8ece9f60-0271-431d-bd53-2e5d7107f05e",
    sequence: "0009",
    title: "圍封式及局部集氣系統-廢氣流量",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  },
  {
    id: "98e0f1ff-7280-4758-abb9-ad14a6936a89",
    sequence: "0010",
    title: "圍封式及局部集氣系統-累計用電度數",
    last_version: {
      question_type_setting: { value: "num", name: "數值題" },
      question_setting_items: []
    }
  }
];

