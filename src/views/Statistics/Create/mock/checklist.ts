// 1) 型別（只保留你會用到的欄位，避免過胖）
export type SystemLocale = { name: string };
export type SystemClass = {
  id: string;
  icon: string;
  locales: { tw?: SystemLocale; cn?: SystemLocale; us?: SystemLocale };
  name: string;
};
export type SystemSubclass = SystemClass & { sequence: string | null };

export type ChecklistLastVersion = {
  id: string;
  checklist_template_version: string | null;
};

export type Checklist = {
  id: string;
  updated_user: { id: string; name: string; avatar: string };
  sequence: string | null;
  is_active: number;
  updated_at: string;
  name: string;
  frequency: any | null;
  expired_before_days: number | null;
  factory_tags: { id: string; name: string }[];
  last_version: ChecklistLastVersion;
  reviewers: any[];
  owner: { id: string; name: string; avatar: string };
  checklist_template: any | null;
  checkers: any[];
  system_classes: SystemClass[];
  system_subclasses: SystemSubclass[];
  is_collect: boolean;
  has_draft: boolean;
  has_assignment: boolean;
  has_renew_template: number;
  general_schedule_setting_count: number;
};

// 2) 實際假資料
export const MOCK_CHECKLIST: Checklist = {
  "id": "d83babc4-741b-46aa-b058-7d58744f0ccd",
  "updated_user": {
    "id": "af5a7abd-bbef-11ee-89b0-42010a8c000b",
    "name": "陳姿臻 [KM]",
    "avatar": "https://api.esgoal.com/api/user/avatar/1679907485qkJrF/S__30400741.jpg?signature=2a18..."
  },
  "sequence": null,
  "is_active": 0,
  "updated_at": "2025-05-22T11:46:12.000000Z",
  "name": "急救箱物品檢點表",
  "frequency": null,
  "expired_before_days": null,
  "factory_tags": [{ "id": "c9f26140-990c-480a-b12a-85eb58ddd720", "name": "職安" }],
  "last_version": { "id": "e2b09ca8-53a1-4775-aa8e-651f9263aaa6", "checklist_template_version": null },
  "reviewers": [],
  "owner": {
    "id": "af5a7abd-bbef-11ee-89b0-42010a8c000b",
    "name": "陳姿臻 [KM]",
    "avatar": "https://api.esgoal.com/api/user/avatar/1679907485qkJrF/S__30400741.jpg?signature=2a18..."
  },
  "checklist_template": null,
  "checkers": [],
  "system_classes": [
    {
      "id": "b0bba98a-bbef-11ee-89b0-42010a8c000b",
      "icon": "https://api.esgoal.com/api/system_class/icon/1597028930r0QNX/...",
      "locales": {
        "tw": { "name": "勞工及職業病" },
        "cn": { "name": "劳工及职业病" },
        "us": { "name": "Labor and Occupational Disease" }
      },
      "name": "勞工及職業病"
    }
  ],
  "system_subclasses": [
    {
      "sequence": null,
      "id": "b0bd8cd3-bbef-11ee-89b0-42010a8c000b",
      "icon": "https://api.esgoal.com/api/system_class/icon/1597029239w4xZJ/...",
      "locales": {
        "tw": { "name": "職業安全衛生" },
        "cn": { "name": "职业安全卫生" },
        "us": { "name": "Occupational Safety and Health" }
      },
      "name": "職業安全衛生"
    }
  ],
  "is_collect": false,
  "has_draft": false,
  "has_assignment": true,
  "has_renew_template": 0,
  "general_schedule_setting_count": 2
} as const;

// 3) 可覆寫的工廠方法（寫測試或 A/B 畫面很方便）
export const makeChecklist = (overrides: Partial<Checklist> = {}): Checklist => ({
  ...MOCK_CHECKLIST,
  ...overrides,
});

// 4)（可選）凍結避免在畫面被誤改
export const FROZEN_CHECKLIST: Readonly<Checklist> = Object.freeze({ ...MOCK_CHECKLIST });
