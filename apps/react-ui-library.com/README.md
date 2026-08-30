# Build for android
npx expo prebuild --clean
npx expo run:android --device

## Android Build (local)
eas build --platform android --profile development --local
npx expo serve

# preview build
eas build --platform android --profile preview --local

## iOS Build (local)
eas build --platform ios --profile simulator --local

eas build:run -p ios
eas build:run -p ios --latest

# preview build
eas build --platform ios --profile preview --local
