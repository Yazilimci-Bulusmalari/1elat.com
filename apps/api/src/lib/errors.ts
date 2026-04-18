export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Permission denied") {
    super(403, message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = "CONFLICT") {
    super(409, message, code);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super(429, "Too many requests", "RATE_LIMIT");
    this.name = "RateLimitError";
  }
}

export class ProjectValidationError extends AppError {
  constructor(public missingFields: string[]) {
    super(
      422,
      "Yayınlama için eksik veya geçersiz alanlar var",
      "PROJECT_PUBLISH_INVALID",
    );
    this.name = "ProjectValidationError";
  }
}

export class FileTooLargeError extends AppError {
  constructor(message = "Dosya boyutu çok büyük") {
    super(413, message, "FILE_TOO_LARGE");
    this.name = "FileTooLargeError";
  }
}

export class UnsupportedMediaTypeError extends AppError {
  constructor(message = "Desteklenmeyen dosya türü") {
    super(415, message, "UNSUPPORTED_MEDIA_TYPE");
    this.name = "UnsupportedMediaTypeError";
  }
}

export class MediaLimitExceededError extends AppError {
  constructor(message = "Galeri sınırı aşıldı") {
    super(409, message, "MEDIA_LIMIT_EXCEEDED");
    this.name = "MediaLimitExceededError";
  }
}

export class NestingTooDeepError extends AppError {
  constructor(message = "Yorum derinlik sınırı aşıldı") {
    super(422, message, "NESTING_TOO_DEEP");
    this.name = "NestingTooDeepError";
  }
}

export class DuplicateInvitationError extends ConflictError {
  constructor(message = "Bu kullanıcıya zaten bekleyen bir davet var") {
    super(message, "DUPLICATE_INVITATION");
    this.name = "DuplicateInvitationError";
  }
}

export class AlreadyMemberError extends ConflictError {
  constructor(message = "Kullanıcı zaten üye") {
    super(message, "ALREADY_MEMBER");
    this.name = "AlreadyMemberError";
  }
}

export class CannotInviteSelfError extends AppError {
  constructor(message = "Kendinizi davet edemezsiniz") {
    super(422, message, "CANNOT_INVITE_SELF");
    this.name = "CannotInviteSelfError";
  }
}

export class CannotFollowOwnProjectError extends AppError {
  constructor(message = "Kendi projenizi takip edemezsiniz") {
    super(422, message, "CANNOT_FOLLOW_OWN_PROJECT");
    this.name = "CannotFollowOwnProjectError";
  }
}

export class InvitationNotPendingError extends ConflictError {
  constructor(message = "Bu davet artık beklemede değil") {
    super(message, "INVITATION_NOT_PENDING");
    this.name = "InvitationNotPendingError";
  }
}

export class OwnerCannotLeaveError extends AppError {
  constructor(message = "Sahip projeden ayrılamaz") {
    super(422, message, "OWNER_CANNOT_LEAVE");
    this.name = "OwnerCannotLeaveError";
  }
}
