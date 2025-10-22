// src/fixtures/records.ts
export const U1 = "08447686-b51b-466f-bb41-986fd4c6d36f";
export const U2 = "45e29711-7c51-4869-825b-60d104084fcb";
export const U3 = "1224e3b4-9a67-4c08-a6ec-9805a50b624e";

export const params = [
  { key: U1, label: "調勻池pH值 v1" },
  { key: U2, label: "初級沉澱池pH值 v1" },
  { key: U3, label: "混凝池（快混）-pH值 v1" },
];

export const records = [
  { created_at: "2025-08-01T01:00:00+08:00", [U1]: 7.2, [U2]: 6.8, [U3]: 7.0, },
  { created_at: "2025-08-01T02:00:00+08:00", [U1]: 7.1, [U2]: 6.9, [U3]: 7.1, },
  { created_at: "2025-08-01T03:00:00+08:00", [U1]: 7.3, [U2]: 7.0, [U3]: 7.2 },
];
