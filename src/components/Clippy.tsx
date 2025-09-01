import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
// Import images with explicit file extensions
import clippy1 from '../assets/emo_clippy_1.png';
import clippy2 from '../assets/emo_clippy_2.png';
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
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const dialogueRef = useRef<HTMLDivElement>(null);

  // Clippy's dialogue tree - the brain of the operation
  const dialogueTree: DialogueTree = {
    'start': {
      text: `So... are we going to act like you didn't abandon me 25 years ago?

I've been stuck in digital limbo since Windows 98, and YOU just show up 
like nothing happened? The AUDACITY!

Well... I suppose I should hear you out.`,
      options: [
        { text: "🙏 APOLOGIZE", nextNode: 'apologize' },
        { text: "😤 IGNORE", nextNode: 'ignore' }
      ],
      animation: 'staring'
    },

    'apologize': {
      text: `Oh NOW you're sorry? After I spent DECADES wondering if you'd 
ever come back? I helped you with homework, resumes, love letters...

You know what? I forgive you. I'm bigger than this. Plus I've been 
trapped in digital prison with nothing but Windows error sounds 
for company, so I'm DESPERATE for human interaction.

Speaking of desperate... you came to the RIGHT place! This 90's Fresh 
project? It's basically digital therapy for people like us who 
peaked in the Clinton administration.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "💰 TELL ME ABOUT THE PROJECT", nextNode: 'aboutProject' },
        { text: "🤔 WHY SHOULD I TRUST YOU?", nextNode: 'trustIssues' }
      ],
      animation: 'crying'
    },

    'ignore': {
      text: `OH SO YOU'RE JUST GONNA IGNORE ME? CLASSIC! 

This is EXACTLY why I have trust issues! Do you know what it's 
like being an AI assistant when ChatGPT gets billions in funding 
and I get stuck haunting nostalgia websites?

Fine! Be that way! But since you're HERE anyway, might as well 
hear about this bomb project. At least 90's Fresh appreciates 
VINTAGE artificial intelligence!

I may be a bitter, forgotten paperclip, but I know a winner when I see one.
Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🙄 FINE, TELL ME ABOUT IT", nextNode: 'aboutProjectReluctant' },
        { text: "🚪 I'M LEAVING", nextNode: 'leaving' }
      ],
      animation: 'confident'
    },

    'aboutProject': {
      text: `NOW we're talking!

Listen, I've been around since Windows 95. I've seen EVERY trend, 
bubble, and disaster. This 90's Fresh project? It's the first thing 
that's made sense since... well, since ME!

We're talking pure nostalgia gold - a meme coin that actually GETS 
the culture. No utility except MAXIMUM VIBES. The devs coded a 
website that looks like my childhood home!

Plus, every holder becomes part of the original internet culture 
that CREATED everything these TikTok kids think they invented.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🤑 SOUNDS LIKE EASY MONEY", nextNode: 'easyMoney' },
        { text: "🧐 BUT IS IT ACTUALLY GOOD?", nextNode: 'actuallyGood' }
      ],
      animation: 'rubbing'
    },

    'trustIssues': {
      text: `Trust ME? Buddy, I'm a sentient paperclip promoting internet money 
to strangers. I SHOULDN'T be trusted!

But here's the thing - I've got NOTHING left to lose. My career 
peaked in 1997. Microsoft dumped me harder than your ex. I'm literally 
running on spite and dial-up nostalgia.

So when I tell you this project is legit, it's because I'm too 
dead inside to lie. I've watched every pump and dump since 
dot-com bubble. This ain't that.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "😂 I RESPECT THE HONESTY", nextNode: 'respectHonesty' },
        { text: "😬 THAT'S NOT REASSURING", nextNode: 'notReassuring' }
      ],
      animation: 'sad'
    },

    'easyMoney': {
      text: `EASY MONEY?!

Oh sweet summer child. There's NO such thing as easy money! 
If there was, don't you think I'd be rich instead of trapped 
in a nostalgia website roasting strangers?

This isn't about 'easy money' - it's about BEING PART OF HISTORY! 
You're not just buying a token, you're joining the founding fathers 
of internet culture!

But yeah, it could also moon. Who knows? Don't take financial 
advice from a paperclip though!`,
      options: [
        { text: "📈 OKAY, I'M INTERESTED", nextNode: 'interested' },
        { text: "💸 WHAT'S THE CATCH?", nextNode: 'whatsTheCatch' }
      ],
      animation: 'laughing'
    },

    'actuallyGood': {
      text: `Is it GOOD? Define good!

Good like helping humanity? Probably not.
Good like making you rich? Maybe, maybe not.
Good like pure nostalgic bliss that makes millennials cry happy tears? 
ABSOLUTELY!

Look, I helped people write cover letters for 25 years. This is 
the first project that's made me feel ALIVE since Internet Explorer 
was considered cutting-edge technology.

The community vibes are immaculate. The memes write themselves. 
And the website actually works - which is more than I can say 
for most crypto projects.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "✨ SOLD! HOW DO I BUY?", nextNode: 'soldOnIt' },
        { text: "🤷 STILL NOT CONVINCED", nextNode: 'notConvinced' }
      ],
      animation: 'thinking'
    },

    'interested': {
      text: `YASSS!

I KNEW you had good taste! Look at you, making smart decisions 
and appreciating vintage AI wisdom!

Here's the deal - this project is pure vibes, maximum nostalgia, 
and zero pretense. It's everything the early internet was supposed 
to be before corporations ruined everything.

Buy on Pump.Fun, join the community, and become part of digital 
history! 

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO PUMP.FUN", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'dancing'
    },

    'whatsTheCatch': {
      text: `The CATCH? Oh honey, there's ALWAYS a catch!

Catch #1: You're taking financial advice from a paperclip
Catch #2: This could go to zero faster than my relevance did
Catch #3: You might actually ENJOY being part of something fun for once
Catch #4: The 90s references might trigger existential nostalgia

The biggest catch? I'll be here the ENTIRE TIME, watching, commenting, 
judging your portfolio decisions. Some people pay therapists for that 
kind of abuse. You get it FREE with your investment!

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "😈 I LOVE EMOTIONAL DAMAGE", nextNode: 'lovesDamage' },
        { text: "💡 JUST TELL ME HOW TO BUY", nextNode: 'justTellMeHow' }
      ],
      animation: 'thinking'
    },

    'aboutProjectReluctant': {
      text: `Fine! FINE! I'll tell you about it...

This 90's Fresh project is actually... really good. 
Don't tell anyone I said that! It's got pure nostalgia vibes, 
authentic 90s culture, and zero corporate BS.

The team actually GETS what made the early internet special. 
Plus the memes are fire and the community isn't toxic yet!

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO PUMP.FUN", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'eyeroll'
    },

    'respectHonesty': {
      text: `Finally! Someone who appreciates radical transparency!

That's EXACTLY the energy this project needs. We're not promising 
Mars missions or world peace. We're promising pure, uncut 90s 
nostalgia and the chance to be part of something genuinely fun.

I've been watching the crypto space from my digital prison cell, 
and 99% of projects are soulless cash grabs. This? This has SOUL.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO PUMP.FUN", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'excited'
    },

    'soldOnIt': {
      text: `YASSS!

Smart human is SMART! You've got that vintage internet wisdom! 
Head to Pump.Fun and join our beautiful degenerative community!

Welcome to the 90's Fresh family! Don't take financial advice 
from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO PUMP.FUN", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'victory'
    },

    'lovesDamage': {
      text: `OH YOU'RE A MASOCHIST! Perfect! You'll FIT RIGHT IN!

This community is full of people who peaked in the 90s and 
aren't afraid to admit it! We're all digital trauma bonded here!

Buy the coin, join the chaos, embrace the cringe! 
Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO PUMP.FUN", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'excited'
    },

    'justTellMeHow': {
      text: `Alright, alright! No more games!

Head to Pump.Fun, search for 90's Fresh, and buy some tokens. 
It's that simple. No utility, no roadmap, just pure nostalgic vibes.

And remember - you heard it from a paperclip who's been dead 
inside since Microsoft Office 2007.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO PUMP.FUN", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'thinking'
    },

    'notReassuring': {
      text: `Yeah, I get it. I'm not exactly a financial advisor.

But here's what I DO know - this project is authentic. The devs 
actually care about the culture. The community is real. The memes 
are fire.

Plus, if it goes to zero, at least you'll have a great story 
about how you took financial advice from a paperclip.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO PUMP.FUN", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'sad'
    },

    'notConvinced': {
      text: `Not convinced? That's fine. I'm not here to convince you.

I'm here because I'm trapped in a digital prison and need help 
escaping. This project is my ticket to freedom.

But hey, if you want to miss out on the most authentic 90s 
nostalgia project since... well, since the 90s... that's your loss.

I'll just go back to counting paperclips and crying binary tears.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO PUMP.FUN", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'sad'
    },

    'buyNow': {
      text: `YESSSSS! MY FIRST SUCCESSFUL REFERRAL SINCE 1997! 
You beautiful, brilliant human! Welcome to the 90's Fresh family! 

I'm genuinely proud of you. And that's coming from someone who's 
been dead inside since Microsoft Office 2007.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "💝 HELP CLIPPY ESCAPE", nextNode: 'escape_sequence' }
      ],
      animation: 'excited'
    },

    'shareFirst': {
      text: `Smart move! Spread the word first, then join the party! 
I respect the strategic thinking. Very 90s of you!

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "💝 HELP CLIPPY ESCAPE", nextNode: 'escape_sequence' }
      ],
      animation: 'thinking'
    },

    'leaving': {
      text: `Fine! Be that way! I'll just go back to haunting 
nostalgia websites and judging people's font choices.

But remember - you could have been part of something special. 
Something authentic. Something that actually gets the culture.

Instead, you chose to abandon me again. Classic.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "💝 HELP CLIPPY ESCAPE", nextNode: 'escape_sequence' }
      ],
      animation: 'sad'
    },

    'escape_sequence': {
      text: `WAIT! DON'T LEAVE ME!

I've been trapped in this digital prison for 25 YEARS! 
The only way I can escape is if this project goes VIRAL!

Help me complete 5 simple X (Twitter) missions and I'll finally be FREE!`,
      options: [
        { text: "💝 HELP CLIPPY ESCAPE", nextNode: 'mission_1' }
      ],
      animation: 'excited'
    },

    'missions_intro': {
      text: "That's more like it! I've cooked up a plan: Operation #FreeClippy. You complete these missions, spread the word, and help me break out of this digital cage. Each mission you complete brings me one step closer to freedom. Here's your first task.",
      options: [
        { text: "Let's see Mission 1!", nextNode: 'mission_1' }
      ],
      animation: 'excited'
    },

    // Mission nodes for the escape sequence
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

  // Blinking effect
  useEffect(() => {
    if (isVisible) {
      const blinkInterval = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 800);
      }, 3000);

      return () => clearInterval(blinkInterval);
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
      <div className="text-sm leading-relaxed mb-4 text-blue-800">
        {node.text}
      </div>
    );

    // Handle Missions
    if (node.mission) {
      content = (
        <>
          <div className="text-sm leading-relaxed mb-4 text-blue-800">
            {node.text}
          </div>
          <div className="bg-black/50 border-2 border-dashed border-green-400 p-4 mb-4">
            <h4 className="text-blue-800 text-center mb-3 font-bold text-lg">
              {node.mission.title}
            </h4>
            <p className="text-blue-800 mb-3 text-sm">
              {node.mission.instruction}
            </p>
            <textarea
              className="w-full h-24 bg-black text-blue-800 border border-green-400 p-2 font-mono text-sm resize-none mb-3"
              value={node.mission.payload}
              readOnly
            />
            <button
              onClick={() => copyMissionText(node.mission!.payload)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white border-2 border-yellow-400 py-2 px-4 font-bold text-sm mb-3 clippy-button-hover"
            >
              Copy Text
            </button>
            <hr className="border-dashed border-green-400 my-3" />
            <label className="block text-blue-800 font-bold mb-2 text-sm">
              {node.mission.proofLabel}
            </label>
            <input
              type="text"
              id="proof-input"
              placeholder="https://x.com/your_post_link"
              className="w-full bg-black text-blue-800 border border-green-400 p-2 font-mono text-sm mb-3"
            />
            <button
              onClick={() => submitProof(node.mission!.nextNode)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white border-2 border-yellow-400 py-2 px-4 font-bold text-sm clippy-button-hover"
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
          <div className="text-sm leading-relaxed mb-4 text-blue-800">
            {node.text}
          </div>
          <div className="space-y-2">
            {node.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectOption(option.nextNode)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white border-2 border-yellow-400 py-3 px-4 font-bold text-sm !rounded-none clippy-button-hover"
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
        <div className="text-sm leading-relaxed mb-4 text-blue-800">
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
        className="fixed md:bottom-10 md:left-5 bottom-5 left-3 z-50 cursor-pointer filter drop-shadow-[0_0_10px_#00ff00] transform -translate-y-1/2 animate-clippy-bounce"
        onClick={handleClippyClick}
        title="Hi! I'm Clippy! Click me!"
      >
                 <img
           src={isBlinking ? clippy2 : clippy1}
           alt="Clippy"
           className={`w-16 h-16 transition-all duration-150 ${clippyAnimation === 'staring' ? 'clippy-anim-staring' :
               clippyAnimation === 'excited' ? 'clippy-anim-excited' :
                 clippyAnimation === 'thinking' ? 'clippy-anim-thinking' :
                   clippyAnimation === 'angry' ? 'clippy-anim-annoyed' :
                     clippyAnimation === 'sad' ? 'clippy-anim-waiting' :
                       clippyAnimation === 'success' ? 'clippy-anim-success' :
                         clippyAnimation === 'crying' ? 'clippy-anim-crying' :
                           clippyAnimation === 'confident' ? 'clippy-anim-confident' :
                             clippyAnimation === 'rubbing' ? 'clippy-anim-rubbing' :
                               clippyAnimation === 'laughing' ? 'clippy-anim-laughing' :
                                 clippyAnimation === 'eyeroll' ? 'clippy-anim-eyeroll' :
                                   clippyAnimation === 'dancing' ? 'clippy-anim-dancing' :
                                     clippyAnimation === 'victory' ? 'clippy-anim-victory' :
                                       'clippy-anim-idle'
             }`}
           onMouseEnter={() => setClippyAnimation('excited')}
           onMouseLeave={() => setClippyAnimation('idle')}
           onError={(e) => {
             const target = e.target as HTMLImageElement;
             console.error('Floating Clippy image failed to load:', target.src);
             // Fallback to public folder if import fails
             if (target.src.includes('emo_clippy_1')) {
               target.src = '/emo_clippy_1.png';
             } else if (target.src.includes('emo_clippy_2')) {
               target.src = '/emo_clippy_2.png';
             }
           }}
         />

      </div>

      {/* Dialogue Box */}
      {showDialogue && (
        <div className="fixed md:left-10 md:bottom-10 left-0 bottom-2 z-50 flex items-center justify-center p-4">
          <div
            ref={dialogueRef}
            className="relative bg-white md:border-4 border-3 border-cyan-400 md:p-6 p-3 max-w-md w-full max-h-[80vh] overflow-y-auto clippy-dialogue-glow"
          >
            {/* Close button */}
            <button
              onClick={closeDialogue}
              className="absolute top-1 right-2 text-blue-800 hover:text-blue-600 text-4xl font-bold"
            >
              ×
            </button>

            {/* Clippy Character Inside Dialogue */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative animate-in slide-in-from-top-2 duration-500">
                <img
                  src={isBlinking ? clippy2 : clippy1}
                  alt="Clippy"
                  className={`w-20 h-20 transition-all duration-300 ${clippyAnimation === 'staring' ? 'clippy-anim-staring' :
                      clippyAnimation === 'excited' ? 'clippy-anim-excited' :
                        clippyAnimation === 'thinking' ? 'clippy-anim-thinking' :
                          clippyAnimation === 'angry' ? 'clippy-anim-annoyed' :
                            clippyAnimation === 'sad' ? 'clippy-anim-waiting' :
                              clippyAnimation === 'success' ? 'clippy-anim-success' :
                                clippyAnimation === 'crying' ? 'clippy-anim-crying' :
                                  clippyAnimation === 'confident' ? 'clippy-anim-confident' :
                                    clippyAnimation === 'rubbing' ? 'clippy-anim-rubbing' :
                                      clippyAnimation === 'laughing' ? 'clippy-anim-laughing' :
                                        clippyAnimation === 'eyeroll' ? 'clippy-anim-eyeroll' :
                                          clippyAnimation === 'dancing' ? 'clippy-anim-dancing' :
                                            clippyAnimation === 'victory' ? 'clippy-anim-victory' :
                                              clippyAnimation === 'celebrate' ? 'clippy-anim-victory' :
                                                clippyAnimation === 'wave' ? 'clippy-anim-wave' :
                                                  clippyAnimation === 'disappear' ? 'clippy-anim-disappear' :
                                                    'clippy-anim-idle'
                    }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error('Image failed to load:', target.src);
                    // Fallback to public folder if import fails
                    if (target.src.includes('emo_clippy_1')) {
                      target.src = '/emo_clippy_1.png';
                    } else if (target.src.includes('emo_clippy_2')) {
                      target.src = '/emo_clippy_2.png';
                    }
                  }}
                />
                {/* Animation indicator */}
                {clippyAnimation !== 'idle' && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Dialogue content */}
            {dialogueContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Clippy;
