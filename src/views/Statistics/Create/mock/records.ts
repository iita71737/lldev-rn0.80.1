// src/fixtures/records.ts
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
  { created_at: "2025-08-01T01:00:00+08:00", [U1]: 100, [U2]: 101, [U3]: 102, [U4]: 103 },
  { created_at: "2025-08-01T02:00:00+08:00", [U1]: 104, [U2]: 105, [U3]: 106, [U4]: 107 },
  { created_at: "2025-08-01T03:00:00+08:00", [U1]: 108, [U2]: 109, [U3]: 110, [U4]: 111 },
];
