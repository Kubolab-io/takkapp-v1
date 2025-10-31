import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Evitar que el usuario regrese
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="basica" />
      <Stack.Screen name="ubicacion" />
      <Stack.Screen name="descripcion" />
      <Stack.Screen name="instagram" />
      <Stack.Screen name="hobbies" />
      <Stack.Screen name="completado" />
    </Stack>
  );
}
