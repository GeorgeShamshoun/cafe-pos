// Error handling utility
export class AppError extends Error {
  constructor(message, code = "UNKNOWN_ERROR") {
    super(message);
    this.code = code;
    this.name = "AppError";
  }
}

// Handle Supabase errors
export const handleSupabaseError = (error) => {
  if (!error) return null;

  if (error.code === "23503") {
    return new AppError(
      "لا يمكن تنفيذ هذه العملية لوجود سجلات مرتبطة",
      "FOREIGN_KEY_VIOLATION"
    );
  }

  if (error.code === "23505") {
    return new AppError(
      "هذا العنصر موجود بالفعل",
      "UNIQUE_VIOLATION"
    );
  }

  if (error.message?.includes("JWT")) {
    return new AppError(
      "جلستك انتهت، يرجى تسجيل الدخول مرة أخرى",
      "AUTH_ERROR"
    );
  }

  return new AppError(
    error.message || "حدث خطأ غير متوقع",
    error.code || "UNKNOWN_ERROR"
  );
};

// Log error with context
export const logError = (error, context = "") => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error?.message,
    code: error?.code,
    stack: error?.stack,
  };

  console.error("[ERROR]", errorInfo);

  // TODO: Send to error tracking service (e.g., Sentry)
  // sentryClient.captureException(error, { extra: { context } });
};
