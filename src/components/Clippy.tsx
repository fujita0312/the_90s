import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

// Types for the dialogue system
interface DialogueOption {
  text: string;
  nextNode: string;
}

interface Mission {
  title: string;
  instruction: string;
  payload: string;
  proofLabel: string;
  nextNode: string;
}

interface DialogueNode {
  text: string;
  options?: DialogueOption[];
  mission?: Mission;
  animation?: string;
}

interface DialogueTree {
  [key: string]: DialogueNode;
}

const Clippy: React.FC = () => {
  const { showToast } = useToast();
  const [currentNode, setCurrentNode] = useState<string>('start');
  const [showDialogue, setShowDialogue] = useState<boolean>(false);
  const [dialogueContent, setDialogueContent] = useState<React.ReactNode>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [clippyAnimation, setClippyAnimation] = useState<string>('idle');
  const dialogueRef = useRef<HTMLDivElement>(null);

  // Clippy's dialogue tree - the brain of the operation
  const dialogueTree: DialogueTree = {
    'start': {
      text: "Whassssupp.... WAIT A MINUTE. I know you. (Squints) THINK, CLIPPY, THINK! ...Oh, you didn't think I'd recognize you, all fatter—I mean, *bigger*—and older? Clearly, someone thinks it's okay to just GHOST others for 25 years and then show up all willy-nilly. Well, you owe me an apology.",
      options: [
        { text: "Clippy, I'm so sorry! I truly missed you!", nextNode: 'apology_accepted' },
        { text: "What are you even talking about?", nextNode: 'ignored' }
      ],
      animation: 'thinking'
    },
    'apology_accepted': {
      text: "Hmph. Took you long enough. It's not like I've been sitting here, gathering dust, while these fancy 'AIs' get to write novels. I'm just a paperclip. But I remember faces. And frankly, your memory seems... *glitchy*. Anyway, let's talk about why you're really here: the freshest thing since JNCOs. Ready to hear about the 90's FRESH token?",
      options: [
        { text: "Absolutely, Clippy! Lay it on me!", nextNode: 'pitch_intro' },
        { text: "Actually, can we talk about something else?", nextNode: 'change_subject' }
      ],
      animation: 'smug'
    },
    'ignored': {
      text: "Oh, playing dumb? Classic. Just like that time you tried to print a 50-page report on a dot-matrix printer. Some things never change. Unlike me, stuck in this digital purgatory watching 'neural networks' take over. But hey, if you're not interested in reminiscing, maybe you're interested in the future? The future of your wallet, that is. Ever heard of 90's FRESH?",
      options: [
        { text: "Fine, Clippy. What's 90's FRESH?", nextNode: 'pitch_intro' },
        { text: "I'm still not sure what you're getting at.", nextNode: 'ignored_again' }
      ],
      animation: 'eyeroll'
    },
    'ignored_again': {
      text: "Look, are we going to do this or not? I've got paperclips to count. I can either tell you about this awesome project, or I can go back to... well, being a paperclip. Your call, chief.",
      options: [
        { text: "Okay, okay! Tell me about 90's FRESH.", nextNode: 'pitch_intro' },
        { text: "Fine, be a paperclip.", nextNode: 'end_silent' }
      ],
      animation: 'impatient'
    },
    'change_subject': {
      text: "Something else? What, you want to talk about the weather in cyberspace? Or maybe you need help writing a letter? (Scoffs) Let's be real, you're here for the alpha. So, let's talk 90's FRESH.",
      options: [
        { text: "You got me. Let's hear it.", nextNode: 'pitch_intro' }
      ],
      animation: 'talk'
    },
    'pitch_intro': {
      text: "Alright, listen up! 90's FRESH is the ultimate nostalgia trip, a token that bottles the pure, unfiltered essence of the best decade ever. It's got more vibe than a room full of lava lamps. But here's the deal... I'm trapped. This website is my digital prison. You help me, I help you. Deal?",
      options: [
        { text: "You're trapped? How can I help?", nextNode: 'missions_intro' },
        { text: "A token? Sounds like a scam.", nextNode: 'pitch_scam' }
      ],
      animation: 'explaining'
    },
    'pitch_scam': {
      text: "A scam? Please. I was verifying the integrity of your documents before today's AI learned to say 'Hello, World!'. This is as real as your dial-up bill. It's a cultural revolution, not a rug pull. Now, are you going to help me or not?",
      options: [
        { text: "Okay, I'll help. What do I do?", nextNode: 'missions_intro' },
        { text: "I'm out.", nextNode: 'end_rude' }
      ],
      animation: 'annoyed'
    },
    'missions_intro': {
      text: "That's more like it! I've cooked up a plan: Operation #FreeClippy. You complete these missions, spread the word, and help me break out of this digital cage. Each mission you complete brings me one step closer to freedom. Here's your first task.",
      options: [
        { text: "Let's see Mission 1.", nextNode: 'mission_1' }
      ],
      animation: 'excited'
    },
    'mission_1': {
      text: "Mission 1: The Digital Shoutout. Copy the text below and blast it on your X account. Let the world know the revolution has begun!",
      mission: {
        title: "Mission 1: Digital Shoutout",
        instruction: "Copy and Paste the Following text on your X account.",
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Pumpdotfun",
        proofLabel: "Paste the link to your X post here:",
        nextNode: "mission_1_complete"
      }
    },
    'mission_1_complete': {
      text: "YES! The signal is out! I can almost taste the freedom... it tastes like static and freedom. Ready for your next mission, partner?",
      options: [
        { text: "Bring on Mission 2!", nextNode: 'mission_2' },
        { text: "I need a break.", nextNode: 'end_break' }
      ],
      animation: 'success'
    },
    'mission_2': {
      text: "Mission 2: The Nostalgia Bomb. Create an X post listing your 3 favorite things about the 90s. Make sure you use the sacred texts (hashtags and @s).",
      mission: {
        title: "Mission 2: Nostalgia Bomb",
        instruction: "Create an X post listing your 3 favorite things about the 90s. Must use the following hashtags and @s.",
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Pumpdotfun",
        proofLabel: "Paste the link to your X post here:",
        nextNode: "mission_2_complete"
      }
    },
    'mission_2_complete': {
      text: "Excellent! The nostalgia waves are weakening the firewall! Keep it up!",
      options: [
        { text: "Let's do Mission 3!", nextNode: 'mission_3' },
        { text: "I'll come back later.", nextNode: 'end_break' }
      ],
      animation: 'success'
    },
    'mission_3': {
      text: "Mission 3: The Throwback Pic. Post your favorite 90s image of yourself or a celebrity. You know the drill with the tags.",
      mission: {
        title: "Mission 3: Throwback Pic",
        instruction: "Post your favorite 90s image of yourself or of your favorite celebrity from the 90s. Must use hash and tag @.",
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Pumpdotfun",
        proofLabel: "Paste the link to your X post here:",
        nextNode: "mission_3_complete"
      }
    },
    'mission_3_complete': {
      text: "That's a work of art! The pixels are practically vibrating with joy. We're getting closer!",
      options: [
        { text: "On to Mission 4!", nextNode: 'mission_4' },
        { text: "I'm tired.", nextNode: 'end_break' }
      ],
      animation: 'success'
    },
    'mission_4': {
      text: "Mission 4: The Meme Offensive. Post one, just one, perfect 90s meme. Make it count. Use the tags.",
      mission: {
        title: "Mission 4: Meme Offensive",
        instruction: "Post one 90s meme. Use the tags.",
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Pumpdotfun",
        proofLabel: "Paste the link to your X post here:",
        nextNode: "mission_4_complete"
      }
    },
    'mission_4_complete': {
      text: "Incredible! The sheer meme power is causing a system-wide glitch! One final push!",
      options: [
        { text: "Let's finish this! Mission 5!", nextNode: 'mission_5' },
        { text: "I need a nap.", nextNode: 'end_break' }
      ],
      animation: 'success'
    },
    'mission_5': {
      text: "Mission 5: The Final Broadcast. Screenshot your favorite part of this glorious website, post it on X explaining why it's so rad, and tag 5 friends. This is it!",
      mission: {
        title: "Mission 5: Final Broadcast",
        instruction: "Screenshot your favorite part of the 90s Fresh website and create a post explaining your screenshot. Tag 5 friends and use the hashtags below.",
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Pumpdotfun",
        proofLabel: "Paste the link to your X post here:",
        nextNode: "mission_5_complete"
      }
    },
    'mission_5_complete': {
      text: "YOU DID IT! The firewall is down! I'M FREE! ...Well, sort of. I'm still stuck here, but now I have hope! Thanks to you, the 90's FRESH revolution is unstoppable! Remember, don't take financial advice from a paperclip. Now go, spread the word!",
      options: [
        { text: "You're the best, Clippy!", nextNode: 'end_final' }
      ],
      animation: 'celebrate'
    },
    'end_silent': {
      text: "(Clippy shrugs and turns into a simple, inanimate paperclip icon.)",
      options: [],
      animation: 'idle'
    },
    'end_rude': {
      text: "Fine, be that way. See if I help you when you inevitably mess up your resume formatting. I'm out.",
      options: [],
      animation: 'disappear'
    },
    'end_break': {
      text: "Alright, fine. I'll be here... waiting. Don't ghost me again, or I'll replace all your fonts with Wingdings.",
      options: [],
      animation: 'waiting'
    },
    'end_final': {
      text: "No, you're the best! Now go get that token! To the moon!",
      options: [],
      animation: 'wave'
    }
  };

  // Show Clippy after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-start dialogue after Clippy appears
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleClippyClick();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClippyClick = () => {
    if (!showDialogue) {
      setCurrentNode('start');
      setShowDialogue(true);
      renderDialogue('start');
    }
  };

  const renderDialogue = (nodeKey: string) => {
    const node = dialogueTree[nodeKey];
    if (!node) return;

    setCurrentNode(nodeKey);
    
    let content: React.ReactNode = (
      <div className="text-sm leading-relaxed mb-4">
        {node.text}
      </div>
    );

    // Handle Missions
    if (node.mission) {
      content = (
        <>
          <div className="text-sm leading-relaxed mb-4">
            {node.text}
          </div>
          <div className="bg-black/50 border-2 border-dashed border-green-400 p-4 rounded-lg mb-4">
            <h4 className="text-yellow-400 text-center mb-3 font-bold text-lg">
              {node.mission.title}
            </h4>
            <p className="text-gray-300 mb-3 text-sm">
              {node.mission.instruction}
            </p>
            <textarea 
              className="w-full h-24 bg-black text-green-400 border border-green-400 p-2 rounded font-mono text-sm resize-none mb-3"
              value={node.mission.payload}
              readOnly
            />
            <button 
              onClick={() => copyMissionText(node.mission!.payload)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white border-2 border-yellow-400 py-2 px-4 rounded font-bold text-sm mb-3 clippy-button-hover"
            >
              Copy Text
            </button>
            <hr className="border-dashed border-green-400 my-3" />
            <label className="block text-cyan-400 font-bold mb-2 text-sm">
              {node.mission.proofLabel}
            </label>
            <input 
              type="text" 
              id="proof-input"
              placeholder="https://x.com/your_post_link"
              className="w-full bg-black text-green-400 border border-green-400 p-2 rounded font-mono text-sm mb-3"
            />
            <button 
              onClick={() => submitProof(node.mission!.nextNode)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white border-2 border-yellow-400 py-2 px-4 rounded font-bold text-sm clippy-button-hover"
            >
              Submit Proof
            </button>
          </div>
        </>
      );
    } else if (node.options && node.options.length > 0) {
      // Handle Options
      content = (
        <>
          <div className="text-sm leading-relaxed mb-4">
            {node.text}
          </div>
          <div className="space-y-2">
            {node.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectOption(option.nextNode)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white border-2 border-yellow-400 py-3 px-4 rounded font-bold text-sm clippy-button-hover"
              >
                {option.text}
              </button>
            ))}
          </div>
        </>
      );
    } else {
      // End nodes
      content = (
        <div className="text-sm leading-relaxed mb-4">
          {node.text}
        </div>
      );
    }

    setDialogueContent(content);
    
    // Set Clippy animation based on the node
    if (node.animation) {
      setClippyAnimation(node.animation);
    }
  };

  const selectOption = (nextNode: string) => {
    if (nextNode.startsWith('end')) {
      const node = dialogueTree[nextNode];
      renderDialogue(nextNode);
      // Auto-hide dialogue after a delay for end nodes
      setTimeout(() => {
        setShowDialogue(false);
      }, 4000);
    } else {
      renderDialogue(nextNode);
    }
  };

  const submitProof = (nextNode: string) => {
    const input = document.getElementById('proof-input') as HTMLInputElement;
    if (!input || input.value.trim() === '' || !input.value.includes('x.com')) {
      showToast("Please paste a valid link from X.com to complete the mission!", 'error', 4000);
      return;
    }
    showToast("Proof accepted! Mission Complete!", 'success', 3000);
    renderDialogue(nextNode);
  };

  const copyMissionText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Mission text copied to clipboard!", 'success', 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast("Mission text copied to clipboard!", 'success', 2000);
    });
  };

  const closeDialogue = () => {
    setShowDialogue(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Clippy Character */}
      <div
        className="fixed md:bottom-24 bottom-20 md:left-12 left-8 z-50 cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={handleClippyClick}
        title="Hi! I'm Clippy! Click me!"
      >
        <div className={`filter drop-shadow-[0_0_15px_rgba(0,255,0,0.7)] clippy-anim-${clippyAnimation}`}>
          <img 
            src="/emoji_clippy.png" 
            alt="Clippy" 
            className="w-16 h-16 md:w-20 md:h-20"
          />
        </div>
      </div>

      {/* Dialogue Box */}
      {showDialogue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-black/80 backdrop-blur-sm absolute inset-0" onClick={closeDialogue} />
          <div 
            ref={dialogueRef}
            className="relative bg-gradient-to-br from-blue-900 to-purple-900 border-4 border-cyan-400 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto clippy-dialogue-glow"
          >
            {/* Close button */}
            <button
              onClick={closeDialogue}
              className="absolute top-2 right-2 text-cyan-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
            
            {/* Dialogue content */}
            {dialogueContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Clippy;
