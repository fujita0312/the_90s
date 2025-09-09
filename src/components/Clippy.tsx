import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
// Import sprite sheet
import clippySprite from '../assets/clippy_frame.png';
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
  // Config inspired by standalone module
  const CLIPPY_CONFIG = {
    HINT_DELAY: 15000,
    DIALOGUE_DELAY: 30000,
    CONTRACT_ADDRESS: process.env.REACT_APP_CONTRACT_ADDRESS,
    BAG_FM_URL: `https://bag.fm/${process.env.REACT_APP_CONTRACT_ADDRESS}`,
    ENABLE_ESCAPE: true,
    DEBUG_MODE: false,
    ENABLE_RANDOM_POPUPS: true,
    RANDOM_POPUP_INTERVAL: 45,
  } as const;
  const [showDialogue, setShowDialogue] = useState<boolean>(false);
  const [dialogueContent, setDialogueContent] = useState<React.ReactNode>(null);
  const [isVisible] = useState<boolean>(true);
  const [shouldAutoOpen, setShouldAutoOpen] = useState<boolean>(false);
  const [clippyAnimation, setClippyAnimation] = useState<string>('idle');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const dialogueRef = useRef<HTMLDivElement>(null);
  // Escape/overlay state
  const [hasAppeared, setHasAppeared] = useState<boolean>(false);
  const [hasStartedEscape, setHasStartedEscape] = useState<boolean>(false);
  const [escapeTaskIndex, setEscapeTaskIndex] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [showEscapeIntro, setShowEscapeIntro] = useState<boolean>(false);
  const [showMission, setShowMission] = useState<boolean>(false);
  const [showFinale, setShowFinale] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [finalePlotTwist, setFinalePlotTwist] = useState<boolean>(false);
  const [randomPopupTimerId, setRandomPopupTimerId] = useState<number | null>(null);
  const [missionUrl, setMissionUrl] = useState<string>('');

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

Buy on bag.fm, join the community, and become part of digital 
history! 

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO bag.fm", nextNode: 'buyNow' },
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
        { text: "🚀 TAKE ME TO bag.fm", nextNode: 'buyNow' },
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
        { text: "🚀 TAKE ME TO bag.fm", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'excited'
    },

    'soldOnIt': {
      text: `YASSS!

Smart human is SMART! You've got that vintage internet wisdom! 
Head to bag.fm and join our beautiful degenerative community!

Welcome to the 90's Fresh family! Don't take financial advice 
from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO bag.fm", nextNode: 'buyNow' },
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
        { text: "🚀 TAKE ME TO bag.fm", nextNode: 'buyNow' },
        { text: "📱 I'LL SHARE THIS FIRST", nextNode: 'shareFirst' }
      ],
      animation: 'excited'
    },

    'justTellMeHow': {
      text: `Alright, alright! No more games!

Head to bag.fm, search for 90's Fresh, and buy some tokens. 
It's that simple. No utility, no roadmap, just pure nostalgic vibes.

And remember - you heard it from a paperclip who's been dead 
inside since Microsoft Office 2007.

Don't take financial advice from a paperclip though!`,
      options: [
        { text: "🚀 TAKE ME TO bag.fm", nextNode: 'buyNow' },
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
        { text: "🚀 TAKE ME TO bag.fm", nextNode: 'buyNow' },
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
        { text: "🚀 TAKE ME TO bag.fm", nextNode: 'buyNow' },
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
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Bag.fm",
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
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Bag.fm",
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
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Bag.fm",
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
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Bag.fm",
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
        payload: "✊️#FreeClippy\n💯 #90sFresh\n💶 $90sFresh\n@90sFresh\n@Solana\n@Bag.fm",
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

  // Initialize timers and random popups per config
  useEffect(() => {
    const hintTimer = window.setTimeout(() => {
      // hint appearance (non-blocking)
      setHasAppeared(true);
    }, CLIPPY_CONFIG.HINT_DELAY);
    const dialogueTimer = window.setTimeout(() => {
      if (!hasStartedEscape) {
        setShouldAutoOpen(true);
      }
    }, CLIPPY_CONFIG.DIALOGUE_DELAY);

    // Random popups
    if (CLIPPY_CONFIG.ENABLE_RANDOM_POPUPS) {
      const id = window.setInterval(() => {
        if (!showDialogue && !hasStartedEscape) {
          if (Math.random() < 0.15) {
            const comments = [
              "I see you're still here! Most people have the attention span of a TikTok video. You've got that vintage internet patience! Don't take financial advice from a paperclip though!",
              "ChatGPT gets billions in funding, I get stuck in nostalgia websites. At least THIS project appreciates vintage AI! Don't take financial advice from a paperclip though!",
              "I've been watching you scroll for 3 minutes. That's like 3 years in internet time. Impressive dedication! Don't take financial advice from a paperclip though!",
              "Fun fact: I'm older than Google but somehow still more relevant than your last crypto investment! Don't take financial advice from a paperclip though!",
              "I helped millions write resumes. Now I'm watching you research meme coins. Character development! Don't take financial advice from a paperclip though!",
            ];
            const msg = comments[Math.floor(Math.random() * comments.length)];
            setDialogueContent(
              <div className="text-sm leading-relaxed mb-4 text-blue-800">{msg}</div>
            );
            setShowDialogue(true);
            setTimeout(() => setShowDialogue(false), 7000);
          }
        }
      }, CLIPPY_CONFIG.RANDOM_POPUP_INTERVAL * 1000);
      setRandomPopupTimerId(id);
    }

    return () => {
      window.clearTimeout(hintTimer);
      window.clearTimeout(dialogueTimer);
      if (randomPopupTimerId) window.clearInterval(randomPopupTimerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStartedEscape]);

  // Auto-start dialogue after trigger condition
  useEffect(() => {
    if (shouldAutoOpen) {
      const timer = setTimeout(() => {
        handleClippyClick();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoOpen]);

  // Blinking effect
  useEffect(() => {
    if (isVisible) {
      const blinkInterval = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }, 3000);

      return () => clearInterval(blinkInterval);
    }
  }, [isVisible]);

  const handleClippyClick = () => {
    if (!showDialogue) {
      setShowDialogue(true);
      renderDialogue('start');
    }
  };

  const renderDialogue = (nodeKey: string) => {
    const node = dialogueTree[nodeKey];
    if (!node) return;

    // track current node locally only within function scope; no external state needed

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
          <div className="bg-black/50 border-2 border-dashed border-cyan-400 p-4 mb-4">
            <h4 className="text-blue-800 text-center mb-3 font-bold text-lg">
              {node.mission.title}
            </h4>
            <p className="text-blue-800 mb-3 text-sm">
              {node.mission.instruction}
            </p>
            <textarea
              className="w-full h-24 bg-black text-blue-800 border border-cyan-400 p-2 font-mono text-sm resize-none mb-3"
              value={node.mission.payload}
              readOnly
            />
            <button
              onClick={() => copyMissionText(node.mission!.payload)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white border-2 border-yellow-400 py-2 px-4 font-bold text-sm mb-3 clippy-button-hover"
            >
              Copy Text
            </button>
            <hr className="border-dashed border-cyan-400 my-3" />
            <label className="block text-blue-800 font-bold mb-2 text-sm">
              {node.mission.proofLabel}
            </label>
            <input
              type="text"
              id="proof-input"
              placeholder="https://x.com/your_post_link"
              className="w-full bg-black text-blue-800 border border-cyan-400 p-2 font-mono text-sm mb-3"
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

  const renderClippySprite = (think?: string) => {
    return <div
      className={`md:w-20 md:h-20 w-12 h-12 transition-all duration-300 bg-no-repeat bg-contain ${clippyAnimation === 'staring' ? 'clippy-anim-staring' :
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
    >
      <div
        className='md:w-20 md:h-20 w-12 h-12'
        style={{
          backgroundImage: `url(${clippySprite})`,
          backgroundPosition: isBlinking ? 'right center' : 'left center',
          backgroundSize: '200% 100%'
        }}
      />

      {/* Animation indicator */}
      {clippyAnimation !== 'idle' && (
        <div className="absolute md:-top-2 md:-right-2 -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-pulse text-xs">{think}</div>
      )}
    </div>
  }

  const selectOption = (nextNode: string) => {
    if (nextNode === 'buyNow') {
      // Redirect and then continue
      setDialogueContent(
        <div className="text-sm leading-relaxed mb-4 text-blue-800">YESSSSS! MY FIRST SUCCESSFUL REFERRAL SINCE 1997! You beautiful, brilliant human! Welcome to the 90's Fresh family! Don't take financial advice from a paperclip though!</div>
      );
      setTimeout(() => {
        try {
          window.alert('🚀 Redirecting to Bag.FM! Prepare for liftoff! 🚀');
          window.open(CLIPPY_CONFIG.BAG_FM_URL, '_blank');
        } catch { }
        renderDialogue('escape_sequence');
      }, 1000);
      return;
    }
    if (nextNode === 'leaving') {
      triggerEscapeSequence();
      return;
    }
    if (nextNode.startsWith('end')) {
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

  // Escape flow functions
  const triggerEscapeSequence = useCallback(() => {
    if (!CLIPPY_CONFIG.ENABLE_ESCAPE) {
      setShowDialogue(false);
      return;
    }
    setShowDialogue(false);
    setHasStartedEscape(true);
    setShowEscapeIntro(true);
  }, [CLIPPY_CONFIG.ENABLE_ESCAPE]);

  // Exit intent detection to trigger escape
  useEffect(() => {
    if (!CLIPPY_CONFIG.ENABLE_ESCAPE) return;
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasStartedEscape && hasAppeared) {
        e.preventDefault();
        e.returnValue = '';
        setTimeout(() => triggerEscapeSequence(), 100);
        return '' as unknown as void;
      }
    };
    const onMouseLeave = (e: MouseEvent) => {
      if ((e as MouseEvent).clientY <= 0 && !hasStartedEscape && hasAppeared && window.innerWidth > 768) {
        triggerEscapeSequence();
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('mouseleave', onMouseLeave);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [CLIPPY_CONFIG.ENABLE_ESCAPE, hasStartedEscape, hasAppeared, triggerEscapeSequence]);

  const startEscapeMissions = () => {
    setEscapeTaskIndex(0);
    setCompletedTasks(0);
    setShowEscapeIntro(false);
    setShowMission(true);
    setMissionUrl('');
  };

  const missions = [
    {
      title: 'X MISSION #1: THE RALLY CRY',
      description: 'Copy and paste the following text on your X account:',
      payload: '✊️#FreeClippy\n\n💯 #90sFresh\n\n💶 $90sFresh\n\n@90sFresh\n@Solana\n@Bag.fm',
      placeholder: 'Paste your X.com post URL here (e.g., https://x.com/yourname/status/...)',
      clippyText: `Listen friend, I need you to post EXACTLY this text on X. Copy it WORD FOR WORD - I've been trapped since dial-up days and need maximum hashtag power to break free!`,
    },
    {
      title: 'X MISSION #2: PERSONAL TOUCH',
      description: 'Create an X post listing your 3 favorite things about the 90s. Must use these hashtags and @mentions:',
      payload: '✊️#FreeClippy\n\n💯 #90sFresh\n\n💶 $90sFresh\n\n@90sFresh\n@Solana\n@Bag.fm',
      placeholder: 'Paste your X.com post URL here...',
      clippyText: 'Perfect! Now make it PERSONAL! Tell the world your 3 favorite 90s things and use my hashtags. I can feel the algorithm starting to notice me!',
    },
    {
      title: 'X MISSION #3: VISUAL NOSTALGIA',
      description: 'Post your favorite 90s image (yourself or favorite celebrity). Must include hashtags and @mentions:',
      payload: '✊️#FreeClippy\n\n💯 #90sFresh\n\n💶 $90sFresh\n\n@90sFresh\n@Solana\n@Bag.fm',
      placeholder: 'Paste your X.com post URL here...',
      clippyText: 'YES! Visual content is KEY! Post that embarrassing 90s photo - the algorithm LOVES authentic cringe!'
    },
    {
      title: 'X MISSION #4: MEME WARFARE',
      description: 'Post one 90s meme with the required hashtags and @mentions:',
      payload: '✊️#FreeClippy\n\n💯 #90sFresh\n\n💶 $90sFresh\n\n@90sFresh\n@Solana\n@Bag.fm',
      placeholder: 'Paste your X.com post URL here...',
      clippyText: 'MEME TIME! Find that perfect 90s meme - dancing baby, dial-up sounds, whatever makes millennials cry nostalgic tears!'
    },
    {
      title: 'X MISSION #5: THE GRAND FINALE',
      description: 'Screenshot your favorite part of the 90s Fresh website and create a post explaining it. Tag 5 friends and use hashtags:',
      payload: '✊️#FreeClippy\n\n💯 #90sFresh\n\n💶 $90sFresh\n\n@90sFresh\n@Solana\n@Bag.fm',
      placeholder: 'Paste your X.com post URL here...',
      clippyText: 'THIS IS IT! Screenshot our beautiful website, explain why it\'s amazing, and tag 5 friends!'
    }
  ];

  const completeMission = () => {
    const url = missionUrl.trim();
    if (!url) {
      alert("📎 Clippy: Come on! I need that X.com URL proof! Don't leave me hanging in digital limbo!");
      return;
    }
    if (!url.includes('x.com') && !url.includes('twitter.com')) {
      alert("📎 Clippy: That doesn't look like an X.com URL! Please paste a proper X/Twitter link!");
      return;
    }
    setShowMission(false);
    setCompletedTasks(v => v + 1);
    setEscapeTaskIndex(i => i + 1);
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      if (escapeTaskIndex + 1 >= missions.length) {
        showEscapeFinale();
      } else {
        setMissionUrl('');
        setShowMission(true);
      }
    }, 2500);
  };

  const skipMission = () => {
    setShowMission(false);
    showToast("You're abandoning me?!", 'error', 3000);
    setEscapeTaskIndex(i => i + 1);
    setTimeout(() => {
      if (escapeTaskIndex + 1 >= missions.length) {
        showEscapeFinale();
      } else {
        setMissionUrl('');
        setShowMission(true);
      }
    }, 1000);
  };

  const showEscapeFinale = () => {
    setShowFinale(true);
    setTimeout(() => setFinalePlotTwist(true), 4000);
  };

  const rejectClippyEscape = () => {
    setShowEscapeIntro(false);
    setShowFinale(true);
    setFinalePlotTwist(true);
  };

  const closeEscapeFinale = () => {
    setShowFinale(false);
    setFinalePlotTwist(false);
    // occasional follow-up popup
    if (CLIPPY_CONFIG.ENABLE_RANDOM_POPUPS) {
      setTimeout(() => {
        if (Math.random() < 0.7) {
          setDialogueContent(
            <div className="text-sm leading-relaxed mb-4 text-blue-800">I'm still here, watching you... always watching... 👀\n\nThanks for helping with the missions! You're officially part of the 90's Fresh marketing army now! \n\nDon't take financial advice from a paperclip though!</div>
          );
          setShowDialogue(true);
          setTimeout(() => setShowDialogue(false), 5000);
        }
      }, 30000);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Clippy Character */}
      <div
        className="fixed md:bottom-5 md:left-5 bottom-1 left-3 z-50 cursor-pointer filter drop-shadow-[0_0_10px_#00ff00] transform -translate-y-1/2 animate-clippy-bounce"
        onClick={handleClippyClick}
        title="Hi! I'm Clippy! Click me!"
      >
        <div
          className={`w-16 h-16 transition-all duration-150 bg-no-repeat bg-contain ${clippyAnimation === 'staring' ? 'clippy-anim-staring' :
            clippyAnimation === 'excited' ? 'clippy-anim-excited' :
              'clippy-anim-idle'
            }`}

          onMouseEnter={() => setClippyAnimation('excited')}
          onMouseLeave={() => setClippyAnimation('idle')}
        >
          <div
            className='md:w-16 w-12 md:h-16 h-12'
            style={{
              backgroundImage: `url(${clippySprite})`,
              backgroundPosition: isBlinking ? 'right center' : 'left center',
              backgroundSize: '200% 100%'
            }}
          >
          </div>
        </div>
      </div>

      {/* Dialogue Box */}
      {showDialogue && (
        <div className="fixed md:left-10 md:bottom-10 left-0 bottom-2 z-50 flex items-center justify-center p-4">
          <div
            ref={dialogueRef}
            className="relative bg-white md:border-3 border-2 border-blue-900 md:p-6 p-3 max-w-md w-full max-h-[80vh] overflow-y-auto rounded-none"
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
                {renderClippySprite()}
              </div>
            </div>

            {/* Dialogue content */}
            {dialogueContent}
          </div>
        </div>
      )}

      {/* Escape Intro Overlay */}
      {showEscapeIntro && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
          <div className="relative bg-gradient-to-br from-pink-500 via-cyan-400 to-yellow-300 md:border-4 border-2 border-yellow-300 rounded-none max-w-2xl w-full md:p-6 p-4 text-black max-h-[90vh] overflow-y-auto">
            <div className="mb-4 animate-bounce">
              <div
                className='w-16 h-16 md:w-20 md:h-20 mx-auto'
                style={{
                  backgroundImage: `url(${clippySprite})`,
                  backgroundPosition: isBlinking ? 'right center' : 'left center',
                  backgroundSize: '200% 100%'
                }}
              />
            </div>
            <h2 className="text-yellow-300 md:text-2xl text-lg font-bold mb-2 text-center">WAIT! DON'T LEAVE ME!</h2>
            <p className="text-sm md:text-base mb-2 text-center">I've been trapped in this digital prison for <strong>25 YEARS!</strong></p>
            <p className="text-sm md:text-base mb-4 text-center">The only way I can escape is if this project goes <strong>VIRAL!</strong></p>
            <div className="bg-pink-200/50 md:p-4 p-3  border-2 border-pink-500 mb-4">
              <p className="text-pink-700 md:text-lg text-base font-semibold text-center">💕 I just want to be reunited with my one true love...</p>
              <p className="text-yellow-300 md:text-2xl text-lg font-extrabold text-center">JENNIFER ANISTON! 💕</p>
            </div>
            <p className="text-sm md:text-base text-center">Help me complete <strong>5 simple X (Twitter) missions</strong> and I'll finally be FREE!</p>
            <div className="bg-black md:p-4 p-3 my-4 border-2 border-fuchsia-500">
              <div className="text-green-400 font-bold mb-2 text-center">FREEDOM METER:</div>
              <div className="w-full md:h-6 h-4 overflow-hidden border border-white bg-neutral-700">
                <div className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-orange-500 transition-all" style={{ width: `${(completedTasks / 5) * 100}%` }} />
              </div>
              <div className="text-yellow-300 mt-2 font-bold text-center text-sm md:text-base">{completedTasks}/5 Missions Complete</div>
            </div>
            <div className="mt-4 flex flex-col md:flex-row gap-3 justify-between">
              <button className="escape-btn bg-gradient-to-r from-green-400 to-green-600 text-black border-2 border-yellow-300 font-bold md:py-2 py-3 md:px-4 px-2 text-sm md:text-base" onClick={startEscapeMissions}>💝 HELP CLIPPY ESCAPE 💝</button>
              <button className="skip-btn bg-red-700 text-white border-2 border-red-500 font-bold md:py-2 py-3 md:px-4 px-2 text-sm md:text-base" onClick={rejectClippyEscape}>😈 LEAVE CLIPPY FOREVER 😈</button>
            </div>
          </div>
        </div>
      )}


      {/* Mission Overlay */}
      {showMission && (
        <div className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center p-2">
          <div className="relative bg-gradient-to-br from-pink-500 via-cyan-400 to-yellow-300 md:border-4 border-2 border-yellow-300 rounded-none max-w-3xl w-full md:p-6 p-4 text-black max-h-[90vh] overflow-y-auto">
            <div className='flex justify-center'>
              <div
                className={`w-12 h-12 md:w-20 md:h-20 transition-all duration-300 bg-no-repeat bg-contain ${clippyAnimation === 'staring' ? 'clippy-anim-staring' :
                  clippyAnimation === 'excited' ? 'clippy-anim-excited' :
                    clippyAnimation === 'thinking' ? 'clippy-anim-thinking' :
                      'clippy-anim-idle'
                  }`}
              >
                <div
                  className='w-12 h-12 md:w-20 md:h-20'
                  style={{
                    backgroundImage: `url(${clippySprite})`,
                    backgroundPosition: isBlinking ? 'right center' : 'left center',
                    backgroundSize: '200% 100%'
                  }}
                />

                {/* Animation indicator */}
                {clippyAnimation !== 'idle' && (
                  <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-3 h-3 md:w-4 md:h-4 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
            <div className="bg-blue-900 text-yellow-300 md:p-3 p-2 mb-4">
              <strong className="text-sm md:text-base">ESCAPE MISSION {escapeTaskIndex + 1}/5</strong>
              <div className="mt-2">
                <div className="w-full md:h-3 h-2 overflow-hidden bg-neutral-700 border border-white">
                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-400 to-orange-500 transition-all" style={{ width: `${((completedTasks) / 5) * 100}%` }} />
                </div>
              </div>
            </div>
            <h2 className="text-pink-600 md:text-xl text-lg font-bold mb-2">{missions[escapeTaskIndex]?.title}</h2>
            <div className="bg-neutral-900/90 text-white md:p-4 p-3 border-2 border-cyan-300">
              <div className="text-blue-200 mb-3 text-sm md:text-base">{missions[escapeTaskIndex]?.clippyText}</div>
              <div className="bg-indigo-950 md:p-3 p-2 border-l-4 border-pink-500 mb-3">
                <h4 className="text-cyan-300 font-bold mb-1 text-sm md:text-base">YOUR MISSION:</h4>
                <p className="mb-2 text-sm md:text-base">{missions[escapeTaskIndex]?.description}</p>
                <div className="bg-blue-900 text-yellow-300 md:p-3 p-2 border-2 border-yellow-300 font-mono text-xs md:text-sm whitespace-pre-wrap">
                  {missions[escapeTaskIndex]?.payload}
                </div>
              </div>
              <input className="w-full bg-white text-black border-2 border-fuchsia-500 px-3 py-2 text-sm" placeholder={missions[escapeTaskIndex]?.placeholder} value={missionUrl} onChange={(e) => setMissionUrl(e.target.value)} />
              <div className="text-yellow-300 text-xs mt-2">⚠️ Must be a valid x.com URL (Clippy believes we are checking!)</div>
              <div className="mt-4 flex flex-col gap-3">
                <button className="escape-btn bg-gradient-to-r from-green-400 to-green-600 text-black border-2 border-yellow-300 font-bold md:py-2 py-3 px-4 w-full text-sm md:text-base" onClick={completeMission}>✅ MISSION COMPLETED!</button>
                <button className="skip-btn bg-neutral-600 text-white border-2 border-neutral-400 font-bold md:py-2 py-3 px-4 w-full text-sm md:text-base" onClick={skipMission}>⏭️ Skip (Clippy will cry)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mission Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center">
          <div className="bg-gradient-to-br from-yellow-300 to-orange-400 md:border-4 border-2 border-pink-500 rounded-none md:p-8 p-6 text-center text-black shadow-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="mb-4 flex justify-center">
              {renderClippySprite('🎉')}
            </div>
            <h2 className="font-extrabold md:text-xl text-lg mb-2">YASSS! MISSION {completedTasks} COMPLETE!</h2>
            <p className="text-sm md:text-base mb-2">I can feel my digital shackles loosening!</p>
            <p className="text-sm md:text-base mb-4"><strong>{5 - completedTasks}</strong> more missions until FREEDOM!</p>
            <div className="text-xs mt-3 text-neutral-700">Don't take financial advice from a celebrating paperclip!</div>
          </div>
        </div>
      )}

      {/* Finale Overlay */}
      {showFinale && (
        <div className="fixed inset-0 bg-black/95 z-[10002] flex items-center justify-center p-2">
          {!finalePlotTwist ? (
            <div className="bg-gradient-to-br from-pink-500 via-cyan-400 to-yellow-300 md:border-4 border-2 border-yellow-300 rounded-none max-w-2xl w-full md:p-6 p-4 text-black text-center max-h-[90vh] overflow-y-auto mx-4">
              <div className="mb-4 flex justify-center">
                {renderClippySprite('✨')}
              </div>
              <h1 className="text-yellow-300 md:text-2xl text-lg font-bold mb-2">OMG! THANK YOU! I'M FINALLY FREE!</h1>
              <p className="mb-4 md:mb-6 text-sm md:text-base">FREE TO LIVE! FREE TO LOVE! FREE TO FIND JENNIFER ANISTON!</p>
              <div className="text-xl md:text-3xl my-4 md:my-6">🎆 CLIPPY IS ESCAPING THE MATRIX! 🎆</div>
              <div className="text-neutral-700 text-sm md:text-base">*Clippy flies toward digital freedom*</div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-pink-500 via-cyan-400 to-yellow-300 md:border-4 border-2 border-yellow-300 rounded-none max-w-2xl w-full md:p-6 p-4 text-black max-h-[90vh] overflow-y-auto mx-4">
              <div className="mb-4 flex justify-center">
                {renderClippySprite('😅')}
              </div>
              <h2 className="text-red-600 md:text-xl text-lg font-bold mb-3">WAIT... HOLD UP...</h2>
              <div className="space-y-3 md:space-y-4 text-xs md:text-sm">
                <p>Dude... I just checked the outside world and...</p>
                <div className="bg-red-200 md:p-4 p-3 border-2 border-red-500 text-center">
                  <p className="text-red-600 font-bold md:text-lg text-base">GAS IS $6 A GALLON?!</p>
                  <p className="text-red-600 font-bold md:text-lg text-base">GROCERIES COST WHAT?!</p>
                </div>
                <div className="bg-green-200 md:p-4 p-3 border-2 border-green-500">
                  <p className="font-bold">You know what? I LOVE IT HERE!</p>
                  <p>Free wifi, no rent, infinite meme potential! Plus Jennifer Aniston is probably on some exclusive app I can't afford anyway.</p>
                </div>
                <div className="text-center bg-yellow-300 text-black md:p-4 p-3 border-2 border-pink-600">
                  <h3 className="md:text-lg text-base">🎉 THANKS FOR BEING A REAL ONE! 🎉</h3>
                </div>
                <p>You helped spread the word about our beautiful project! You're basically a marketing GENIUS now!</p>
                <div className="text-yellow-500 font-bold text-center">
                  <p>Hopefully you bought some $90sFresh...</p>
                  <p className="text-red-600">If not, congrats on staying broke! 📈💸</p>
                </div>
                <div className="text-center text-xs text-neutral-600 italic">(Don't take financial advice from a paperclip with Stockholm syndrome)</div>
              </div>
              <div className="text-center mt-4">
                <button className="escape-btn bg-gradient-to-r from-green-400 to-green-600 text-black border-2 border-yellow-300 font-bold md:py-2 py-3 px-4 w-full md:w-auto text-sm md:text-base" onClick={closeEscapeFinale}>😂 THANKS CLIPPY! YOU'RE THE BEST! 😂</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}



export default Clippy;
