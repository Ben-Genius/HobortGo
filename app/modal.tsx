import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ModalScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-white items-center justify-center px-10">
      <View className="w-20 h-20 bg-slate-50 rounded-lg items-center justify-center mb-8 border border-slate-100">
        <Ionicons name="information-circle-outline" size={40} color="#F0782D" />
      </View>

      <Text className="text-brand-secondary text-2xl font-black text-center mb-4">Modal Content</Text>
      <Text className="text-slate-400 text-sm text-center mb-10 leading-6 font-medium">
        This screen represents a modal information view, designed with our new flat brand aesthetic.
      </Text>

      <TouchableOpacity
        className="w-full h-16 bg-brand-orange rounded-lg items-center justify-center"
        onPress={() => router.back()}>
        <Text className="text-white font-black text-xs uppercase tracking-[4px]">Close Modal</Text>
      </TouchableOpacity>

      <Link href="/" dismissTo className="mt-6">
        <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Back to Home</Text>
      </Link>
    </View>
  );
}
