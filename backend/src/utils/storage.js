// const {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
//   HeadBucketCommand,
//   GetObjectCommand,
// } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const { v4: uuidv4 } = require("uuid");

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//   },
// });

// // Validate S3 connection on startup
// (async () => {
//   try {
//     await s3Client.send(
//       new HeadBucketCommand({
//         Bucket: process.env.S3_BUCKET_NAME,
//       })
//     );
//     logger.info("Successfully connected to S3 bucket");
//   } catch (error) {
//     logger.error("S3 connection failed:", error.message);
//     process.exit(1);
//   }
// })();

// export const uploadFile = async (fileBuffer, fileName, mimetype) => {
//   try {
//     // Generate unique filename with UUID
//     const fileExtension = fileName.split(".").pop();
//     const uniqueFileName = `${uuidv4()}.${fileExtension}`;

//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: uniqueFileName,
//       Body: fileBuffer,
//       ContentType: mimetype,
//       ACL: "private", // Ensure private access by default
//       Metadata: {
//         originalName: fileName,
//         uploadedAt: new Date().toISOString(),
//       },
//     };

//     await s3Client.send(new PutObjectCommand(params));

//     const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

//     logger.info(`File uploaded successfully: ${fileUrl}`, {
//       fileName,
//       fileSize: fileBuffer.byteLength,
//       mimetype,
//     });

//     return {
//       url: fileUrl,
//       fileName: uniqueFileName,
//       originalName: fileName,
//       mimetype,
//       size: fileBuffer.byteLength,
//     };
//   } catch (error) {
//     logger.error(`File upload failed for ${fileName}: ${error.message}`, {
//       errorCode: error.$metadata?.httpStatusCode,
//       awsRequestId: error.$metadata?.requestId,
//     });
//     throw new Error(`File upload failed: ${error.message}`);
//   }
// };

// export const deleteFile = async (fileName) => {
//   try {
//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key: fileName,
//     };

//     await s3Client.send(new DeleteObjectCommand(params));
//     logger.info(`File deleted successfully: ${fileName}`);
//     return true;
//   } catch (error) {
//     logger.error(`File deletion failed for ${fileName}: ${error.message}`, {
//       errorCode: error.$metadata?.httpStatusCode,
//     });
//     throw new Error(`File deletion failed: ${error.message}`);
//   }
// };

// // Additional utility functions
// export const generatePresignedUrl = async (fileName, expiresIn = 3600) => {
//   const command = new GetObjectCommand({
//     Bucket: process.env.S3_BUCKET_NAME,
//     Key: fileName,
//   });

//   return await getSignedUrl(s3Client, command, { expiresIn });
// };

// export const validateFile = (file) => {
//   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
//   const ALLOWED_MIME_TYPES = [
//     "image/jpeg",
//     "image/png",
//     "application/pdf",
//     "text/plain",
//   ];

//   if (file.size > MAX_FILE_SIZE) {
//     throw new Error("File size exceeds 10MB limit");
//   }

//   if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//     throw new Error("Invalid file type");
//   }
// };

// export const deleteMultipleFiles = async (fileNames) => {
//   try {
//     const deletePromises = fileNames.map((fileName) =>
//       deleteFile(fileName).catch((error) => {
//         logger.warn(`Failed to delete ${fileName}: ${error.message}`);
//         return null;
//       })
//     );

//     await Promise.all(deletePromises);
//     return true;
//   } catch (error) {
//     logger.error("Bulk file deletion failed:", error.message);
//     throw new Error("Bulk deletion failed");
//   }
// };
