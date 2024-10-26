import React, {
  ReactNode,
  useState,
  forwardRef,
  useImperativeHandle,
  Fragment,
} from "react";
import { Alert, Pressable, StyleSheet, ViewStyle } from "react-native";
import { useFileUpload } from "@/hooks/useFileUpload";
import useWithMediaLibraryPermission from "@/hooks/useWithMediaLibraryPermission";
import * as ImagePicker from "expo-image-picker";

type Props = {
  renderPickerContent: () => ReactNode;
  renderImage: (uploadedImage: string) => ReactNode;
  initialImage?: string;
  containerStyle?: ViewStyle;
  cropAspectRatio?: [number, number];
  allowsEditing?: boolean;
  allowedMediaTypes?: ImagePicker.MediaTypeOptions;
};

export type PhotoPickerRef = {
  getUploadedImage: () => string | null;
  reset: () => void;
};

const PhotoPicker = forwardRef<PhotoPickerRef, Props>(
  (
    {
      initialImage,
      renderPickerContent,
      renderImage,
      containerStyle,
      cropAspectRatio,
      allowsEditing = true,
      allowedMediaTypes = ImagePicker.MediaTypeOptions.All,
    }: Props,
    ref
  ) => {
    const { uploading, progress, uploadFile, resetProgress } = useFileUpload();
    const { withMediaLibraryPermission, renderPermissionDeniedModal } =
      useWithMediaLibraryPermission();
    const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(
      null
    );
    const [uploadedImage, setUploadedImage] = useState<string | null>(
      initialImage || null
    );

    useImperativeHandle(ref, () => ({
      getUploadedImage: () => uploadedImage,
      reset: () => {
        setAsset(null);
        setUploadedImage(null);
      },
    }));

    const pickImage = () =>
      withMediaLibraryPermission(async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: allowedMediaTypes,
          allowsEditing: allowsEditing,
          aspect: cropAspectRatio,
          quality: 1,
        });

        if (!result.canceled) {
          const asset = result.assets[0];
          setAsset(asset);

          if (asset?.uri && asset?.fileName && asset?.mimeType) {
            resetProgress();
            setUploadedImage(null);
            uploadFile({
              uri: asset.uri,
              name: asset.fileName,
              mimeType: asset.mimeType,
            })
              .then((result) => {
                if (result) {
                  setUploadedImage(result);
                }
              })
              .catch((err) => {
                console.error(err);
              });
          } else {
            Alert.alert("File info missing!");
          }
        }
      });

    const onPress = () => {
      pickImage();
    };

    return (
      <Fragment>
        <Pressable style={[containerStyle]} onPress={onPress}>
          {uploadedImage ? renderImage(uploadedImage) : renderPickerContent()}
        </Pressable>
      </Fragment>
    );
  }
);

const styles = StyleSheet.create({});

export default PhotoPicker;
