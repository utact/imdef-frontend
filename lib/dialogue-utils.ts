export interface DialogueState {
  step: number;
  phase: number;
  isProcessing: boolean;
  isBanished: boolean;
}

export const DIALOGUE_PHASES = {
  INITIAL: 1,
  FRIEND_CONFIRMATION: 2,
  SUSPICIOUS_RESPONSE: 3,
  NAME_INPUT: 4,
  PURPOSE_INPUT: 5,
  NAME_CONFIRMATION: 6,
  FRIEND_FINAL: 7,
  BANISHMENT_FINAL: 8,
  UNIFIED_FINAL: 9,
  TRUE_FINAL: 10,
} as const;

export const SPACESHIP_IMAGES = {
  HAPPY: "edog_01.png",
  ANGRY: "edog_02.png",
  SURPRISED: "edog_03.png",
} as const;

export function getDialogues(isBanished: boolean): string[] {
  return isBanished
    ? ["넌 저번에 추방당한 녀석이잖아.", "너에게 들려줄 이야기는 없어."]
    : ["어이, 거기 너!", "여기가 어떤 곳인 줄은 아는 거냐?"];
}

export function isFinalMessage(text: string): boolean {
  return text === "오늘은 돌아가라." || text === "아쉽게 됐군.";
}

export function shouldShowHint(
  dialogueStep: number,
  dialoguesLength: number,
  inputPhase: number,
  displayedText: string,
  isBanished: boolean,
  isTyping: boolean
): boolean {
  if (isTyping || isFinalMessage(displayedText)) return false;

  return (
    dialogueStep < dialoguesLength - 1 ||
    (isBanished && displayedText === "너에게 들려줄 이야기는 없어.") ||
    displayedText === "미안하지만, 너는 추방이다!" ||
    [2, 3, 6, 7, 9].includes(inputPhase)
  );
}

export function shouldBlockKeyInput(
  inputPhase: number,
  dialogueStep: number,
  dialoguesLength: number,
  displayedText: string,
  isBanished: boolean
): boolean {
  // Block final messages completely
  if (isFinalMessage(displayedText)) return true;

  // Block final phases
  if (
    inputPhase === DIALOGUE_PHASES.TRUE_FINAL ||
    (isBanished && inputPhase === DIALOGUE_PHASES.BANISHMENT_FINAL)
  ) {
    return true;
  }

  // Block input phases and final dialogue steps
  return (
    (!isBanished &&
      [DIALOGUE_PHASES.NAME_INPUT, DIALOGUE_PHASES.PURPOSE_INPUT].includes(
        inputPhase
      )) ||
    (inputPhase === DIALOGUE_PHASES.INITIAL &&
      dialogueStep === dialoguesLength - 1 &&
      !isBanished)
  );
}
