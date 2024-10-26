import * as MediaLibrary from "expo-media-library";

export default function useWithMediaLibraryPermission() {
  const [status, requestPermission] = MediaLibrary.usePermissions();

  const withMediaLibraryPermission = async (callback: () => Promise<void>) => {
    if (status?.granted) {
      callback();
      return;
    }

    const response = await requestPermission();
    if (response.granted) {
      callback();
      return;
    }

    if (response.canAskAgain) {
      return;
    }
  };

  const renderPermissionDeniedModal = () => {};

  return {
    withMediaLibraryPermission,
    renderPermissionDeniedModal,
  };
}
