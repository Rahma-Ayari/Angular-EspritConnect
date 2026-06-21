export type CaptchaType = 'IMAGE' | 'LOGO' | 'PUZZLE' | 'QUESTION';

export interface CaptchaImageOption {
  id: string;
  url: string;
  label?: string;
}

export interface CaptchaQuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface CaptchaPuzzleData {
  backgroundUrl: string;
  pieceUrl: string;
  canvasWidth: number;
  canvasHeight: number;
  pieceWidth: number;
  pieceHeight: number;
  slotX: number;
  slotY: number;
  pieceStartX: number;
  pieceStartY: number;
}

export interface CaptchaChallenge {
  captchaId: number;
  captchaType: CaptchaType;
  question: string;
  images?: CaptchaImageOption[];
  options?: CaptchaQuestionOption[];
  puzzleData?: CaptchaPuzzleData;
}

export interface CaptchaVerifyRequest {
  captchaId: number;
  answers: string[];
}

export interface CaptchaVerifyResponse {
  success: boolean;
  message: string;
  captchaId?: number;
  captchaToken?: string;
}

export interface CaptchaVerifiedState {
  captchaId: number;
  captchaToken: string;
}
