"use client"
import Galaxy from "@/components/Galaxy"
import DialogueBox from "@/components/DialogueBox"
import type React from "react"
import { memo, useMemo } from "react"
import { useState, useEffect, useCallback } from "react"
import { verifyKeyword } from "@/lib/api"
import { getDialogues, DIALOGUE_PHASES, SPACESHIP_IMAGES, shouldBlockKeyInput } from "@/lib/dialogue-utils"

const MemoizedGalaxy = memo(Galaxy)

export default function HomePage() {
  const [warpIntensity, setWarpIntensity] = useState(0)
  const [hideUI, setHideUI] = useState(false)
  const [showSpaceship, setShowSpaceship] = useState(false)
  const [showDialogue, setShowDialogue] = useState(false)
  const [dialogueStep, setDialogueStep] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [showResponse, setShowResponse] = useState(false)
  const [spaceshipImage, setSpaceshipImage] = useState(SPACESHIP_IMAGES.HAPPY)
  const [inputPhase, setInputPhase] = useState(DIALOGUE_PHASES.INITIAL)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isBanished, setIsBanished] = useState(false)

  const dialogues = useMemo(() => getDialogues(isBanished), [isBanished])
  const dialoguesLength = useMemo(() => dialogues.length, [dialogues])

  const resetToFirstScreen = useCallback(() => {
    setShowSpaceship(false)
    setShowDialogue(false)

    setTimeout(() => {
      setWarpIntensity(50)

      setTimeout(() => {
        const reductionStartTime = Date.now()
        const maxIntensity = 50

        const animateReduction = () => {
          const reductionElapsed = Date.now() - reductionStartTime
          const reductionProgress = Math.min(reductionElapsed / 2000, 1)
          const easedProgress = 1 - Math.pow(1 - reductionProgress, 3)
          const reducedIntensity = maxIntensity * (1 - easedProgress)

          setWarpIntensity(reducedIntensity)

          if (reductionProgress < 1) {
            requestAnimationFrame(animateReduction)
          } else {
            setWarpIntensity(0)
            setHideUI(false)
            setDialogueStep(0)
            setDisplayedText("")
            setIsTyping(false)
            setUserInput("")
            setShowResponse(false)
            setSpaceshipImage(SPACESHIP_IMAGES.HAPPY)
            setInputPhase(DIALOGUE_PHASES.INITIAL)
            setIsProcessing(false)
          }
        }
        requestAnimationFrame(animateReduction)
      }, 200)
    }, 100)
  }, [])

  const resetSession = useCallback(() => {
    localStorage.removeItem("imdef_banished")
    window.location.reload()
  }, [])

  const typeText = useCallback((text: string, callback?: () => void) => {
    setIsTyping(true)
    setDisplayedText("")
    let index = 0
    let lastTime = 0

    const typeFrame = (currentTime: number) => {
      if (currentTime - lastTime >= 80) {
        setDisplayedText(text.slice(0, index + 1))
        index++
        lastTime = currentTime

        if (index >= text.length) {
          setIsTyping(false)
          if (callback) callback()
          return
        }
      }
      requestAnimationFrame(typeFrame)
    }
    requestAnimationFrame(typeFrame)
  }, [])

  const handleNextDialogue = useCallback(() => {
    if (isBanished) {
      if (dialogueStep < dialoguesLength - 1) {
        setDialogueStep((prev) => prev + 1)
        typeText(dialogues[dialogueStep + 1], () => setIsProcessing(false))
      } else {
        typeText("아쉽게 됐군.", () => {
          setTimeout(resetToFirstScreen, 1000)
        })
      }
      return
    }

    // Handle regular dialogue flow
    const dialogueActions = {
      [DIALOGUE_PHASES.FRIEND_CONFIRMATION]: () =>
        typeText("너의 이름은 뭐지?", () => {
          setInputPhase(DIALOGUE_PHASES.NAME_INPUT)
          setShowResponse(false)
          setIsProcessing(false)
        }),
      [DIALOGUE_PHASES.SUSPICIOUS_RESPONSE]: () => {
        setSpaceshipImage(SPACESHIP_IMAGES.HAPPY)
        typeText("여기 온 목적을 밝혀라!", () => {
          setInputPhase(DIALOGUE_PHASES.PURPOSE_INPUT)
          setShowResponse(false)
          setIsProcessing(false)
        })
      },
      [DIALOGUE_PHASES.NAME_CONFIRMATION]: () =>
        typeText("일단 알겠어, 그대로 전달하도록 하지.", () => {
          setInputPhase(DIALOGUE_PHASES.UNIFIED_FINAL)
          setShowResponse(false)
          setIsProcessing(false)
        }),
      [DIALOGUE_PHASES.FRIEND_FINAL]: () =>
        typeText("오늘은 돌아가라.", () => {
          setTimeout(resetToFirstScreen, 1000)
        }),
      [DIALOGUE_PHASES.UNIFIED_FINAL]: () =>
        typeText("오늘은 돌아가라.", () => {
          setTimeout(resetToFirstScreen, 1000)
        }),
      [DIALOGUE_PHASES.BANISHMENT_FINAL]: () =>
        typeText("아쉽게 됐군.", () => {
          localStorage.setItem("imdef_banished", "true")
          setIsBanished(true)
          setTimeout(resetToFirstScreen, 1000)
        }),
    }

    if (dialogueStep < dialoguesLength - 1) {
      setDialogueStep((prev) => prev + 1)
      typeText(dialogues[dialogueStep + 1], () => setIsProcessing(false))
    } else if (dialogueActions[inputPhase]) {
      dialogueActions[inputPhase]()
    }
  }, [dialogueStep, inputPhase, typeText, isBanished, dialogues, dialoguesLength, resetToFirstScreen])

  useEffect(() => {
    const banishmentStatus = localStorage.getItem("imdef_banished")
    if (banishmentStatus === "true") {
      setIsBanished(true)
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!showDialogue || isTyping || isProcessing) return
      if (event.target instanceof HTMLInputElement) return

      if (shouldBlockKeyInput(inputPhase, dialogueStep, dialoguesLength, displayedText, isBanished)) {
        event.preventDefault()
        return
      }

      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault()
        setIsProcessing(true)
        handleNextDialogue()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [
    showDialogue,
    isTyping,
    dialogueStep,
    inputPhase,
    isProcessing,
    isBanished,
    displayedText,
    dialoguesLength,
    handleNextDialogue,
  ])

  useEffect(() => {
    if (showSpaceship && !showDialogue) {
      const timer = setTimeout(() => {
        setShowDialogue(true)
        typeText(dialogues[0])
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [showSpaceship, showDialogue, dialogues, typeText])

  const handleUserInput = useCallback(
    async (input: string) => {
      const trimmedInput = input.trim()
      if (!trimmedInput) return

      setShowResponse(true)

      try {
        if (inputPhase === DIALOGUE_PHASES.INITIAL) {
          const verification = await verifyKeyword(trimmedInput)

          if (verification.isValid) {
            typeText("그래?", () => {
              setInputPhase(DIALOGUE_PHASES.FRIEND_CONFIRMATION)
              setShowResponse(false)
              setIsProcessing(false)
            })
          } else {
            setSpaceshipImage(SPACESHIP_IMAGES.ANGRY)
            typeText("흠... 수상한 걸?", () => {
              setInputPhase(DIALOGUE_PHASES.SUSPICIOUS_RESPONSE)
              setShowResponse(false)
              setIsProcessing(false)
            })
          }
        } else if (inputPhase === DIALOGUE_PHASES.NAME_INPUT) {
          const verification = await verifyKeyword(trimmedInput)

          if (verification.isValid) {
            setSpaceshipImage(SPACESHIP_IMAGES.SURPRISED)
            typeText("정말이냐?", () => {
              setInputPhase(DIALOGUE_PHASES.NAME_CONFIRMATION)
              setShowResponse(false)
              setIsProcessing(false)
            })
          } else {
            typeText("처음 듣는 이름이군, 전달할테니 조금 기다리도록 해.", () => {
              setInputPhase(DIALOGUE_PHASES.FRIEND_FINAL)
              setShowResponse(false)
              setIsProcessing(false)
            })
          }
        } else if (inputPhase === DIALOGUE_PHASES.PURPOSE_INPUT) {
          typeText("미안하지만, 너는 추방이다!", () => {
            setInputPhase(DIALOGUE_PHASES.BANISHMENT_FINAL)
            setShowResponse(false)
            setIsProcessing(false)
          })
        }
      } catch (error) {
        console.error("Input processing error:", error)
        // Fallback handling
        setIsProcessing(false)
      }

      setUserInput("")
    },
    [inputPhase, typeText],
  )

  const handleInputSubmit = useCallback(() => {
    if (userInput.trim()) {
      handleUserInput(userInput)
    }
  }, [userInput, handleUserInput])

  const handleInputKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        handleInputSubmit()
      }
    },
    [handleInputSubmit],
  )

  const handleDiveInto = useCallback(() => {
    setHideUI(true)

    const startTime = Date.now()
    const animateWarp = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / 3000, 1)
      const intensity = Math.pow(progress, 3) * 50
      setWarpIntensity(intensity)

      if (progress < 1) {
        requestAnimationFrame(animateWarp)
      } else {
        setTimeout(() => setShowSpaceship(true), 100)
      }
    }
    requestAnimationFrame(animateWarp)
  }, [])

  const handleWarpReduction = useCallback(() => {
    const reductionStartTime = Date.now()
    const maxIntensity = warpIntensity

    const animateReduction = () => {
      const reductionElapsed = Date.now() - reductionStartTime
      const reductionProgress = Math.min(reductionElapsed / 2000, 1)
      const easedProgress = 1 - Math.pow(1 - reductionProgress, 3)
      const reducedIntensity = maxIntensity * (1 - easedProgress)

      setWarpIntensity(reducedIntensity)

      if (reductionProgress < 1) {
        requestAnimationFrame(animateReduction)
      }
    }
    requestAnimationFrame(animateReduction)
  }, [warpIntensity])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <button
        onClick={resetSession}
        className="fixed top-4 right-4 z-50 px-3 py-1 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 text-xs rounded
                   hover:bg-red-500/30 transition-colors"
        title="Reset Session (Dev)"
      >
        Reset
      </button>

      <div className="absolute inset-0">
        <MemoizedGalaxy
          mouseInteraction={false}
          mouseRepulsion={false}
          density={1.2}
          glowIntensity={0.4}
          saturation={0.3}
          hueShift={240}
          twinkleIntensity={0.5}
          rotationSpeed={0.05}
          speed={0.8}
          transparent={false}
          autoCenterRepulsion={warpIntensity}
          repulsionStrength={5}
        />
      </div>

      {!hideUI && (
        <div className="group cursor-pointer z-10 flex flex-col items-center">
          <h1 className="text-6xl font-serif font-bold text-white tracking-wider transition-transform duration-300 group-hover:-translate-y-4">
            imdef
          </h1>
          <button
            onClick={handleDiveInto}
            className="mt-2 px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full 
                       opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0
                       hover:bg-white/20 hover:border-white/30"
          >
            Dive into
          </button>
        </div>
      )}

      {showSpaceship && (
        <div className="z-20 flex items-center justify-center">
          <img
            src={spaceshipImage || "/placeholder.svg"}
            alt="Space Dog Ship"
            className="w-64 h-64 object-contain animate-in fade-in zoom-in duration-1000 ease-out"
            style={{
              filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))",
              animation: "float 3s ease-in-out infinite",
            }}
          />
        </div>
      )}

      <DialogueBox
        showDialogue={showDialogue}
        dialogueStep={dialogueStep}
        displayedText={displayedText}
        isTyping={isTyping}
        userInput={userInput}
        setUserInput={setUserInput}
        showResponse={showResponse}
        inputPhase={inputPhase}
        onUserInput={handleUserInput}
        onNextDialogue={handleNextDialogue}
        isProcessing={isProcessing}
        isBanished={isBanished}
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
      `}</style>
    </div>
  )
}
