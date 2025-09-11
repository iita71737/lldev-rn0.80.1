#!/usr/bin/env bash
set -euo pipefail

# === 0) 基本設定（在 android/ 目錄下執行） ===
: "${AAB:=app/release/app-release.aab}"

SDK_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
ZIPALIGN="$SDK_HOME/build-tools/35.0.0/zipalign"

# 尋找 bundletool：優先用環境變數；否則依序在「目前目錄、上一層專案根、Downloads」找
resolve_bundletool() {
  if [ -n "${BUNDLETOOL_JAR:-}" ] && [ -f "$BUNDLETOOL_JAR" ]; then
    echo "$BUNDLETOOL_JAR"; return
  fi

  # 目前目錄（android/）
  local c1
  c1="$(ls -1 bundletool-all-*.jar 2>/dev/null | head -n1 || true)"
  if [ -n "$c1" ] && [ -f "$c1" ]; then echo "$c1"; return; fi

  # 上一層（專案根）
  local c2
  c2="$(ls -1 ../bundletool-all-*.jar 2>/dev/null | head -n1 || true)"
  if [ -n "$c2" ] && [ -f "$c2" ]; then echo "$c2"; return; fi

  # 使用者 Downloads
  local c3
  c3="$(ls -1 "$HOME"/Downloads/bundletool-all-*.jar 2>/dev/null | head -n1 || true)"
  if [ -n "$c3" ] && [ -f "$c3" ]; then echo "$c3"; return; fi

  echo ""
}

JAR="$(resolve_bundletool)"
if [ -z "$JAR" ]; then
  echo "❌ 找不到 bundletool-all-*.jar。請下載到「android/」或專案根目錄，或設定 BUNDLETOOL_JAR。"
  echo "👉 下載：https://github.com/google/bundletool/releases"
  exit 1
fi

# === 1) 前置檢查 ===
[ -f "$AAB" ] || { echo "❌ 找不到 AAB：$AAB；先執行： ./gradlew :app:bundleRelease"; exit 1; }
[ -x "$ZIPALIGN" ] || { echo "❌ 找不到 zipalign 35：$ZIPALIGN；請在 SDK Manager 安裝 Build-Tools 35 或設定 ANDROID_HOME/ANDROID_SDK_ROOT。"; exit 1; }
java -jar "$JAR" version >/dev/null 2>&1 || { echo "❌ 無法執行 bundletool：$JAR"; exit 1; }

echo "Using bundletool: $JAR"
echo "Using zipalign:   $ZIPALIGN"
echo "Using AAB:        $AAB"

# === 2) 從 AAB 產出 apks ===
echo "==> 1) 從 AAB 產生 apks"
java -jar "$JAR" build-apks \
  --bundle "$AAB" \
  --output out.apks \
  --mode=default \
  --overwrite

rm -rf apks && mkdir apks
unzip -o out.apks -d apks >/dev/null

# === 3) 逐一檢查每個 APK 的 16KB 對齊 ===
echo "==> 2) 逐一檢查每個 APK 的 16KB 對齊"
APK_LIST=$(find apks -type f -name "*.apk" | sort || true)
if [ -z "$APK_LIST" ]; then
  echo "❌ 沒有找到任何 APK；請檢查 out.apks 是否成功或 bundletool 版本。"
  exit 1
fi

FAILED_LIST=()
while IFS= read -r apk; do
  echo ">>> zipalign 檢查：$apk"
  if ! "$ZIPALIGN" -c -P 16 -v 4 "$apk" >/tmp/zipalign_out 2>&1; then
    echo "❌ FAIL: $apk"
    FAILED_LIST+=("$apk")
  else
    echo "✅ OK: $apk"
  fi
done <<< "$APK_LIST"

if [ ${#FAILED_LIST[@]} -eq 0 ]; then
  echo "🎉 所有 APK 都通過 16KB 檢查（AAB 應可過 Play）"
  exit 0
fi

# === 4) 列出失敗 APK 內的 .so（嫌疑犯清單） ===
echo "==> 3) 列出失敗 APK 內的 .so（嫌疑犯清單）"
for bad_apk in "${FAILED_LIST[@]}"; do
  echo "------ $bad_apk ------"
  unzip -l "$bad_apk" | grep '\.so$' || echo "(這個 APK 內沒有 .so)"
done

echo
echo "⚠️ 下一步：用 Gradle 對回依賴並升級相容版本："
echo "./gradlew :app:dependencies --configuration releaseRuntimeClasspath"
echo "./gradlew :app:dependencyInsight --configuration releaseRuntimeClasspath --dependency <關鍵字>"
exit 1
