import { AlertDialogProvider } from "@/components/AlertDialog";
import { DATABASE_NAME, migrateDatabaseIfNeeded } from "@/database";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

import { Loading } from "@/components/Loading";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { View } from "react-native";

import "@/global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loading />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={migrateDatabaseIfNeeded}
      >
        <AlertDialogProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transactions/[id]" />
            <Stack.Screen name="transaction-edit/[id]" />
          </Stack>
        </AlertDialogProvider>
      </SQLiteProvider>
    </>
  );
}
