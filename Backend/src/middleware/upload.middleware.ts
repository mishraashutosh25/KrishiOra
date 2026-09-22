import { Request, Response, NextFunction } from "express";

export interface UploadValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

/**
 * Validates base64 data URLs submitted in JSON requests (e.g. avatars, document attachments).
 */
export const validateBase64Upload = (
  fieldName = "image",
  options: UploadValidationOptions = {}
) => {
  const maxBytes = options.maxSizeBytes || DEFAULT_MAX_SIZE;
  const allowed = options.allowedMimeTypes || DEFAULT_ALLOWED_TYPES;

  return (req: Request, res: Response, next: NextFunction) => {
    const data = req.body?.[fieldName];

    if (!data) {
      return next(); // optional field
    }

    if (typeof data !== "string") {
      return res.status(400).json({
        success: false,
        code: "INVALID_UPLOAD_FORMAT",
        message: `${fieldName} must be a valid base64 data URL string`,
      });
    }

    // Match data:[<mediatype>][;base64],<data>
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        code: "INVALID_BASE64_SCHEME",
        message: `${fieldName} must be formatted as a standard data URL (data:<mime-type>;base64,<data>)`,
      });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];

    if (!allowed.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: `Unsupported format '${mimeType}'. Allowed formats: ${allowed.join(", ")}`,
      });
    }

    // Calculate approximate byte size of base64
    const approximateSize = (base64Data.length * 3) / 4;
    if (approximateSize > maxBytes) {
      const maxMb = (maxBytes / (1024 * 1024)).toFixed(1);
      return res.status(413).json({
        success: false,
        code: "FILE_TOO_LARGE",
        message: `File size exceeds the allowed limit of ${maxMb}MB`,
      });
    }

    // Attach parsed metadata to request
    (req as any).uploadedMedia = {
      mimeType,
      sizeBytes: approximateSize,
      buffer: Buffer.from(base64Data, "base64"),
    };

    next();
  };
};
