import { useState } from "react";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Alert } from "react-native";

export type UploadObject = {
  uri: string;
  name: string;
  mimeType: string;
};

const AWS_REGION = ""; // Your AWS region
const AWS_ACCESS_KEY = ""; // Your AWS access key
const AWS_SECRET_KEY = ""; // Your AWS secret key
const AWS_MEDIA_BUCKET_NAME = ""; // Your AWS S3 bucket name
const BUCKET_CDN = ""; // Your AWS S3 bucket CDN
const BUCKET_PATH = "input"; // Your S3 bucket sub path
const config: S3ClientConfig = {
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
};

const s3Client = new S3Client(config);

const generateFileName = (name: string) => {
  const extension = name.split(".").pop();
  const timestamp = new Date().getTime().toString();
  const salt = (Math.random() * 1000000).toFixed();
  const fileName = `${timestamp}_${salt}.${extension}`;
  return fileName;
};

export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (data: UploadObject) => {
    const { uri, name, mimeType } = data;

    if (!uri || !name) return;
    const file = await FileSystem.getInfoAsync(uri);

    if (!file.exists) {
      console.warn("File does not exist");
      return;
    }

    const fileStream = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileName = generateFileName(name) || name;
    // Set up the upload parameters
    const key = `${BUCKET_PATH}/${fileName}`;
    const uploadParams = {
      Bucket: AWS_MEDIA_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(fileStream, "base64"),
      ContentType: mimeType,
    };

    // Create a new upload instance and track progress
    try {
      setUploading(true);
      const upload = new Upload({
        client: s3Client,
        params: uploadParams,
        leavePartsOnError: false, // Clean up on failure
      });

      // Monitor the progress
      upload.on("httpUploadProgress", (progress) => {
        if (progress.total && progress.loaded) {
          const percentage = (progress.loaded / progress.total) * 100;
          setProgress(+percentage.toFixed(2));
          console.log(`Progress: ${percentage.toFixed(2)}%`);
        }
      });

      // Execute the upload
      const response = await upload.done();
      console.log("Upload complete:", response);
      setUploading(false);
      return `${BUCKET_CDN}/${key}`;
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Error", "Failed to upload file. Please try again.");
      setUploading(false);
    }
  };

  const resetProgress = () => {
    setProgress(0);
  };

  return { progress, uploadFile, resetProgress, uploading };
}
