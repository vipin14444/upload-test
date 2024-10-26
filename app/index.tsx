import PhotoPicker, {
  PhotoPickerRef,
} from "@/components/primitives/PhotoPicker";
import { dv } from "@/utils/scaling";
import { Image } from "expo-image";
import { MediaTypeOptions } from "expo-image-picker";
import { useRef } from "react";
import { Text, View, ViewStyle } from "react-native";

export default function Index() {
  const photoPickerRef1 = useRef<PhotoPickerRef>(null);

  const width = dv(200);
  const height = dv(120);

  const getPhotoPickerStyle = (): ViewStyle => ({
    borderRadius: dv(8),
    overflow: "hidden",
    width: width,
    height: height,
  });

  const renderPickerContent = () => (
    <View
      style={{
        backgroundColor: "#F7F5F5",
        padding: dv(16),
        alignItems: "center",
        justifyContent: "center",
        width: width,
        height: height,
      }}
    >
      {/* <Feather
        name="plus"
        size={fv(32)}
        color="#515151"
        style={{ marginBottom: dv(4) }}
      /> */}
      <Text>Add Image</Text>
    </View>
  );

  const renderImage = (uploadedImage: string) => (
    <Image
      source={{ uri: uploadedImage }}
      style={{ width: width, height: height }}
    />
  );

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>

      <PhotoPicker
        ref={photoPickerRef1}
        containerStyle={getPhotoPickerStyle()}
        renderPickerContent={renderPickerContent}
        renderImage={renderImage}
        allowedMediaTypes={MediaTypeOptions.Images}
      />
    </View>
  );
}
