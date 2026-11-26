#!/usr/bin/env bash
# APK derleme (Gradle'sız): aapt2 -> javac -> d8 -> zipalign -> apksigner
set -euo pipefail
cd "$(dirname "$0")/.."
SDK=${ANDROID_HOME:-/opt/android}
BT=$SDK/build-tools/35.0.0
AJAR=$SDK/platforms/android-35/android.jar
OUT=build/apk
rm -rf $OUT && mkdir -p $OUT/res $OUT/classes $OUT/assets/www
node build.mjs
cp dist/index.html $OUT/assets/www/index.html
$BT/aapt2 compile --dir android/res -o $OUT/res.zip
$BT/aapt2 link -o $OUT/unsigned.apk -I $AJAR --manifest android/AndroidManifest.xml -A $OUT/assets $OUT/res.zip --min-sdk-version 26 --target-sdk-version 35
javac -nowarn --release 11 -classpath $AJAR -d $OUT/classes $(find android/src -name '*.java') 2>&1 | grep -v "Picked up" || true
$BT/d8 --release --min-api 26 --lib $AJAR --output $OUT $(find $OUT/classes -name '*.class')
(cd $OUT && zip -q -j unsigned.apk classes.dex)
$BT/zipalign -f -p 4 $OUT/unsigned.apk $OUT/aligned.apk
KS=android/debug.keystore
[ -f $KS ] || keytool -genkeypair -keystore $KS -storepass dronsavasi -keypass dronsavasi -alias dron -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Dron Savasi,O=Oyun,C=TR" 2>&1 | grep -v "Picked up" || true
mkdir -p release
$BT/apksigner sign --ks $KS --ks-pass pass:dronsavasi --key-pass pass:dronsavasi --ks-key-alias dron --out release/DronSavasi.apk $OUT/aligned.apk
$BT/apksigner verify release/DronSavasi.apk && ls -la release/DronSavasi.apk
