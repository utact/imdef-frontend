"use client";
import React from "react";
import { getDialogues, shouldShowHint } from "@/lib/dialogue-utils";
import { isMobileDevice } from "@/lib/mobile-utils";

interface DialogueBoxProps {
  showDialogue: boolean;
  dialogueStep: number;
  displayedText: string;
  isTyping: boolean;
  userInput: string;
  setUserInput: (value: string) => void;
  showResponse: boolean;
  inputPhase: number;
  onUserInput: (input: string) => void;
  onNextDialogue: () => void;
  isProcessing: boolean;
  isBanished?: boolean;
}

const DialogueBox = React.memo(
  ({
    showDialogue,
    dialogueStep,
    displayedText,
    isTyping,
    userInput,
    setUserInput,
    showResponse,
    inputPhase,
    onUserInput,
    onNextDialogue,
    isProcessing,
    isBanished = false,
  }: DialogueBoxProps) => {
    const dialogues = getDialogues(isBanished);
    const isMobile = isMobileDevice();

    const handleInputSubmit = () => {
      if (userInput.trim()) {
        onUserInput(userInput);
      }
    };

    const handleInputKeyPress = (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleInputSubmit();
      }
    };

    if (!showDialogue) return null;

    const shouldShowInput =
      !isBanished &&
      ((dialogueStep === dialogues.length - 1 &&
        inputPhase === 1 &&
        !showResponse) ||
        ([4, 5].includes(inputPhase) && !showResponse)) &&
      !isTyping;

    return (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-4xl px-4">
        <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center mb-3">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-blue-300 font-medium text-sm tracking-wide">
              ???
            </span>
          </div>

          <div className="mb-4">
            <p className="text-white text-lg leading-relaxed font-light min-h-[1.75rem]">
              {displayedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>

          <div className="flex justify-end">
            {shouldShowHint(
              dialogueStep,
              dialogues.length,
              inputPhase,
              displayedText,
              isBanished,
              isTyping
            ) && (
              <div className="flex items-center gap-3">
                <div className="text-gray-400 text-sm">
                  {isMobile
                    ? "버튼을 눌러 계속하세요"
                    : "스페이스바 또는 엔터키를 눌러 계속하세요"}
                </div>
                {isMobile && (
                  <button
                    onClick={onNextDialogue}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 
                             text-blue-300 rounded-lg transition-all duration-200 hover:scale-105
                             text-sm font-medium"
                  >
                    다음 ▶
                  </button>
                )}
              </div>
            )}

            {shouldShowInput && (
              <div className="w-full">
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleInputKeyPress}
                    placeholder="답변을 입력하세요..."
                    className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 
                         focus:bg-gray-800/70 transition-all duration-200"
                    autoFocus
                  />
                  <button
                    onClick={handleInputSubmit}
                    disabled={!userInput.trim()}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 
                         text-blue-300 rounded-lg transition-all duration-200 hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    전송
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

DialogueBox.displayName = "DialogueBox";

export default DialogueBox;
