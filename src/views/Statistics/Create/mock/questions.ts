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
    id: "6dcd7702-1d22-4a36-b0a2-05533f0e592e",
    sequence: "0001",
    title: "酥不酥脆",
    last_version: {
      id: "536ef719-870a-464d-8c6d-bfdbcfe493a2",
      updated_at: "2025-07-11T08:53:24.000000Z",
      question_type_setting: {
        id: "480ac5f5-bae3-46dd-bb67-8be6afdc7d14",
        value: "single-choice",
        name: "單選題"
      },
      question_setting_items: [
        {
          "id": "a95bde59-8608-4bce-a4cd-c2c99e73f4ea",
          "name": "好酥脆",
          "control_limit_upper": null,
          "control_limit_lower": null,
          "spec_limit_upper": null,
          "spec_limit_lower": null,
          "limit_upper": null,
          "limit_lower": null,
          "risk_level": 25,
          "score_setting": null,
          "has_child": 0,
          "has_remark": 0,
          "value": null,
          "value_operator": null
        },
        {
          "id": "67556450-cbc0-4a33-8971-95a44effad20",
          "name": "不酥脆",
          "control_limit_upper": null,
          "control_limit_lower": null,
          "spec_limit_upper": null,
          "spec_limit_lower": null,
          "limit_upper": null,
          "limit_lower": null,
          "risk_level": null,
          "score_setting": null,
          "has_child": 1,
          "has_remark": 0,
          "value": null,
          "value_operator": null,
          "question_setting_items": [
            {
              "id": "96fb530f-0be7-4221-b229-1a945a530ade",
              "name": "有點不酥脆",
              "control_limit_upper": null,
              "control_limit_lower": null,
              "spec_limit_upper": null,
              "spec_limit_lower": null,
              "limit_upper": null,
              "limit_lower": null,
              "risk_level": 21,
              "score_setting": null,
              "has_child": 0,
              "has_remark": 1,
              "value": null,
              "value_operator": null
            },
            {
              "id": "0ed53c7b-ef65-46d4-bf3a-9b617e1bb1b7",
              "name": "不酥脆",
              "control_limit_upper": null,
              "control_limit_lower": null,
              "spec_limit_upper": null,
              "spec_limit_lower": null,
              "limit_upper": null,
              "limit_lower": null,
              "risk_level": 22,
              "score_setting": null,
              "has_child": 0,
              "has_remark": 1,
              "value": null,
              "value_operator": null
            },
            {
              "id": "1fdf9b1b-0e1a-4256-97e9-bba5784a321d",
              "name": "簡直軟趴趴",
              "control_limit_upper": null,
              "control_limit_lower": null,
              "spec_limit_upper": null,
              "spec_limit_lower": null,
              "limit_upper": null,
              "limit_lower": null,
              "risk_level": 23,
              "score_setting": null,
              "has_child": 0,
              "has_remark": 1,
              "value": null,
              "value_operator": null
            }
          ]
        }
      ],
      title: "酥不酥脆",
      checklist_question: {
        id: "6dcd7702-1d22-4a36-b0a2-05533f0e592e"
      },
      checklist_question_template_version: null
    }
  },
  {
    id: "b8e3a0f1-7c29-4d1a-9a3b-5f62e7de1c01",
    sequence: "0003",
    title: "香氣強度評估",
    last_version: {
      id: "ec6d2f54-21ab-4baf-8f7f-4b2e9a1d7c90",
      updated_at: "2025-07-11T08:53:24.000000Z",
      question_type_setting: {
        id: "5a1c8b72-9d4e-4c1e-98d2-7b4d3f2a6c11",
        value: "single-choice",
        name: "單選題"
      },
      question_setting_items: [
        {
          id: "a24d7e19-3f58-4a2a-bf8d-0b6a1c5e9f20",
          name: "香氣濃郁",
          control_limit_upper: null,
          control_limit_lower: null,
          spec_limit_upper: null,
          spec_limit_lower: null,
          limit_upper: null,
          limit_lower: null,
          risk_level: 25,
          score_setting: null,
          has_child: 0,
          has_remark: 0,
          value: null,
          value_operator: null
        },
        {
          id: "c91f0a63-2b74-4d3a-9b7a-8f0a2e4c1d55",
          name: "香氣不足",
          control_limit_upper: null,
          control_limit_lower: null,
          spec_limit_upper: null,
          spec_limit_lower: null,
          limit_upper: null,
          limit_lower: null,
          risk_level: null,
          score_setting: null,
          has_child: 1,
          has_remark: 0,
          value: null,
          value_operator: null,
          question_setting_items: [
            {
              id: "e3b2c7d9-4a10-49e1-92f0-6c5d4b3a2f18",
              name: "香氣略弱",
              control_limit_upper: null,
              control_limit_lower: null,
              spec_limit_upper: null,
              spec_limit_lower: null,
              limit_upper: null,
              limit_lower: null,
              risk_level: 21,
              score_setting: null,
              has_child: 0,
              has_remark: 1,
              value: null,
              value_operator: null
            },
            {
              id: "f6a1b4c8-90de-41b7-bf2b-7e1c2d3a4f59",
              name: "香氣明顯不足",
              control_limit_upper: null,
              control_limit_lower: null,
              spec_limit_upper: null,
              spec_limit_lower: null,
              limit_upper: null,
              limit_lower: null,
              risk_level: 22,
              score_setting: null,
              has_child: 0,
              has_remark: 1,
              value: null,
              value_operator: null
            },
            {
              id: "09d4e2b7-6c31-4a58-8f0a-3b1c5d7e9a42",
              name: "幾乎無香氣",
              control_limit_upper: null,
              control_limit_lower: null,
              spec_limit_upper: null,
              spec_limit_lower: null,
              limit_upper: null,
              limit_lower: null,
              risk_level: 23,
              score_setting: null,
              has_child: 0,
              has_remark: 1,
              value: null,
              value_operator: null
            }
          ]
        }
      ],
      title: "香氣強度評估",
      checklist_question: {
        id: "b8e3a0f1-7c29-4d1a-9a3b-5f62e7de1c01"
      },
      checklist_question_template_version: null
    }
  },
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

