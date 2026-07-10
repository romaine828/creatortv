export interface Show {
  id: string
  title: string
  description: string
  youtubeId: string
  duration: string
  category: string
  host?: string
  isLive?: boolean
  airTime?: string
  videoType?: 'youtube' | 'upload' | 'tiktok' | 'direct'  // where the video actually lives
  videoUrl?: string       // used when videoType is 'upload', 'tiktok', or 'direct'
  thumbnailUrl?: string   // custom thumbnail for non-YouTube videos
  exclusive?: boolean     // true = only shown to paid members
}

export interface Channel {
  id: string
  number: number
  name: string
  tagline: string
  color: string
  bgGradient: string
  textGradient: string
  emoji: string
  shows: Show[]
}

export const CHANNELS: Channel[] = [
  {
    id: 'inspirational',
    number: 1,
    name: 'Inspire TV',
    tagline: 'Light Your Fire Daily',
    color: '#a855f7',
    bgGradient: 'from-purple-900/40 via-purple-800/20 to-transparent',
    textGradient: 'from-purple-400 to-pink-400',
    emoji: '✨',
    shows: [
      {
        id: 'ins-1',
        title: 'Grit: The Power of Passion & Perseverance',
        description: 'Angela Duckworth shows why talent is overrated — grit and perseverance are the true predictors of success.',
        youtubeId: 'H14bBuluwB8',
        duration: '6:12',
        category: 'Motivation',
        host: 'Angela Duckworth',
        airTime: 'NOW LIVE'
      },
      {
        id: 'ins-2',
        title: 'Try Something New for 30 Days',
        description: "Matt Cutts shares a simple idea that will help you achieve your dream goals — just do it for 30 days.",
        youtubeId: 'UNP03fDSj1U',
        duration: '3:27',
        category: 'Habits',
        host: 'Matt Cutts',
        airTime: '2:00 PM'
      },
      {
        id: 'ins-3',
        title: 'The Happy Secret to Better Work',
        description: 'Shawn Achor argues happiness inspires productivity and reveals 5 daily habits that rewire your brain.',
        youtubeId: 'fLJsdqxnZb0',
        duration: '12:20',
        category: 'Happiness',
        host: 'Shawn Achor',
        airTime: '3:00 PM'
      },
      {
        id: 'ins-4',
        title: 'How to Stop Screwing Yourself Over',
        description: 'Mel Robbins reveals the 5-second rule and how to take control of your decisions and your life.',
        youtubeId: 'Lp7E973zozc',
        duration: '21:39',
        category: 'Mindset',
        host: 'Mel Robbins',
        airTime: '4:00 PM'
      },
      {
        id: 'ins-5',
        title: 'Everyday Leadership',
        description: 'Drew Dudley redefines leadership as everyday acts of humanity that change people\'s lives.',
        youtubeId: 'uAy6EZRXoYE',
        duration: '6:13',
        category: 'Leadership',
        host: 'Drew Dudley',
        airTime: '5:00 PM'
      },
    ]
  },
  {
    id: 'educational',
    number: 2,
    name: 'Edu Hub',
    tagline: 'Learn Something New Every Day',
    color: '#3b82f6',
    bgGradient: 'from-blue-900/40 via-blue-800/20 to-transparent',
    textGradient: 'from-blue-400 to-cyan-400',
    emoji: '📚',
    shows: [
      {
        id: 'edu-1',
        title: 'Optimistic Nihilism',
        description: 'A mind-expanding look at the universe\'s indifference and why that might actually be the most liberating realization of all.',
        youtubeId: 'MBRqu0YOH14',
        duration: '7:06',
        category: 'Philosophy',
        host: 'Kurzgesagt',
        airTime: 'NOW LIVE'
      },
      {
        id: 'edu-2',
        title: 'The Big Bang — Before The Beginning',
        description: 'What happened before the Big Bang? Exploring the science and philosophy of cosmic origins.',
        youtubeId: 'HdPzOWlLrbE',
        duration: '10:11',
        category: 'Space & Science',
        host: 'Kurzgesagt',
        airTime: '2:30 PM'
      },
      {
        id: 'edu-3',
        title: 'Math Is the Hidden Secret',
        description: 'Roger Antonsen reveals how perspective and mathematics unlock the deepest truths in nature, art, and life.',
        youtubeId: 'ZQElzjCsl9o',
        duration: '13:51',
        category: 'Mathematics',
        host: 'Roger Antonsen',
        airTime: '3:30 PM'
      },
      {
        id: 'edu-4',
        title: 'Inside the Mind of a Master Procrastinator',
        description: 'Tim Urban takes us on a hilarious journey into the mind of a procrastinator and what it means to get things done.',
        youtubeId: 'arj7oStGLkU',
        duration: '14:04',
        category: 'Psychology',
        host: 'Tim Urban',
        airTime: '4:30 PM'
      },
      {
        id: 'edu-5',
        title: '8 Secrets of Success',
        description: 'Richard St. John spent 7 years interviewing 500+ successful people. Here are the 8 traits they all share.',
        youtubeId: 'Y6bbMQXQ180',
        duration: '3:33',
        category: 'Success',
        host: 'Richard St. John',
        airTime: '5:30 PM'
      },
    ]
  },
  {
    id: 'business',
    number: 3,
    name: 'Biz Network',
    tagline: 'Build Your Empire',
    color: '#f59e0b',
    bgGradient: 'from-amber-900/40 via-amber-800/20 to-transparent',
    textGradient: 'from-amber-400 to-orange-400',
    emoji: '💼',
    shows: [
      {
        id: 'biz-1',
        title: 'The Single Biggest Reason Startups Succeed',
        description: 'After 200+ company pitches, Bill Gross discovered the #1 factor that determines startup success.',
        youtubeId: 'bNpx7gpSqbY',
        duration: '6:40',
        category: 'Entrepreneurship',
        host: 'Bill Gross',
        airTime: 'NOW LIVE'
      },
      {
        id: 'biz-2',
        title: 'How to Make Work-Life Balance Work',
        description: 'Nigel Marsh lays out an honest and funny framework for building a life with real, meaningful work-life balance.',
        youtubeId: '4oUzBPRBFkM',
        duration: '10:04',
        category: 'Work & Life',
        host: 'Nigel Marsh',
        airTime: '2:00 PM'
      },
      {
        id: 'biz-3',
        title: 'What Makes a Great Leader?',
        description: 'Roselinde Torres studied leaders across the globe and found three powerful questions that define the great from the good.',
        youtubeId: 'tEiCFlROWxM',
        duration: '9:08',
        category: 'Leadership',
        host: 'Roselinde Torres',
        airTime: '3:00 PM'
      },
      {
        id: 'biz-4',
        title: 'How to Pitch to Investors',
        description: 'David S. Rose breaks down the art of pitching, what VCs really look for, and how to nail your investor presentation.',
        youtubeId: 'hKBGNEWpFoc',
        duration: '14:49',
        category: 'Funding',
        host: 'David S. Rose',
        airTime: '4:00 PM'
      },
      {
        id: 'biz-5',
        title: 'The Art of Choosing',
        description: 'Sheena Iyengar explores the science behind how and why we make choices — and what it means for business.',
        youtubeId: '6ELAkV2fOjw',
        duration: '24:09',
        category: 'Strategy',
        host: 'Sheena Iyengar',
        airTime: '5:00 PM'
      },
    ]
  },
  {
    id: 'health',
    number: 4,
    name: 'Wellness TV',
    tagline: 'Live Your Best Life',
    color: '#10b981',
    bgGradient: 'from-emerald-900/40 via-emerald-800/20 to-transparent',
    textGradient: 'from-emerald-400 to-teal-400',
    emoji: '💚',
    shows: [
      {
        id: 'hlth-1',
        title: 'Full Body Morning Yoga',
        description: '20-minute energizing morning yoga flow to start your day with balance, strength, and clarity.',
        youtubeId: 'VaoV1PrYft4',
        duration: '22:16',
        category: 'Yoga',
        host: 'Yoga With Adriene',
        airTime: 'NOW LIVE'
      },
      {
        id: 'hlth-2',
        title: 'How to Make Stress Your Friend',
        description: 'Kelly McGonigal reveals how changing your mindset about stress can literally save your life.',
        youtubeId: 'RcGyVTAoXEU',
        duration: '14:28',
        category: 'Mental Health',
        host: 'Kelly McGonigal',
        airTime: '2:00 PM'
      },
      {
        id: 'hlth-3',
        title: 'Sleep Is Your Superpower',
        description: 'Matt Walker reveals the science of sleep and why it may be the most important health decision you make every day.',
        youtubeId: '5MuIMqhT8pM',
        duration: '19:18',
        category: 'Sleep',
        host: 'Matt Walker',
        airTime: '3:00 PM'
      },
      {
        id: 'hlth-4',
        title: 'Mindfulness & Meditation Guide',
        description: 'A calming 10-minute guided meditation to reduce anxiety, sharpen focus, and find stillness.',
        youtubeId: 'inpok4MKVLM',
        duration: '10:00',
        category: 'Meditation',
        host: 'Headspace',
        airTime: '4:00 PM'
      },
      {
        id: 'hlth-5',
        title: 'Eating to Starve Cancer',
        description: 'Dr. William Li presents breakthrough science on how the food you eat can fight cancer and other diseases.',
        youtubeId: 'B9RruLkAUm8',
        duration: '20:27',
        category: 'Nutrition',
        host: 'Dr. William Li',
        airTime: '5:00 PM'
      },
    ]
  },
  {
    id: 'creator',
    number: 5,
    name: 'Creator Network',
    tagline: 'Build · Grow · Monetize',
    color: '#f43f5e',
    bgGradient: 'from-rose-900/40 via-pink-800/20 to-transparent',
    textGradient: 'from-rose-400 to-orange-400',
    emoji: '🎬',
    shows: [
      {
        id: 'cr-1',
        title: 'How to Grow on YouTube in 2024',
        description: 'The proven strategies top creators use to grow channels fast — algorithm secrets, thumbnails, titles, and community building.',
        youtubeId: 'OLbLKkuGF2I',
        duration: '16:22',
        category: 'YouTube Growth',
        host: 'Think Media',
        airTime: 'NOW LIVE'
      },
      {
        id: 'cr-2',
        title: 'How to Start a Podcast',
        description: 'Everything you need to launch your first podcast — equipment, recording, editing, distribution and growing your audience.',
        youtubeId: 'WnA0dFJMgBQ',
        duration: '18:45',
        category: 'Podcasting',
        host: 'Pat Flynn',
        airTime: '2:00 PM'
      },
      {
        id: 'cr-3',
        title: 'Content Creation for Beginners',
        description: 'Your complete guide to starting content creation from zero — cameras, lighting, editing and finding your niche.',
        youtubeId: 'OnKMBOcujck',
        duration: '20:11',
        category: 'Content Creation',
        host: 'Roberto Blake',
        airTime: '3:00 PM'
      },
      {
        id: 'cr-4',
        title: 'How to Monetize Your Audience',
        description: 'The top 7 revenue streams every creator should know — from ads and sponsorships to digital products and memberships.',
        youtubeId: 'qPSLFHlOOqk',
        duration: '14:30',
        category: 'Monetization',
        host: 'Ali Abdaal',
        airTime: '4:00 PM'
      },
      {
        id: 'cr-5',
        title: 'Build Your Personal Brand',
        description: 'How to craft a powerful personal brand online that attracts opportunities, clients, and a loyal community.',
        youtubeId: 'o0fDAfKPaOo',
        duration: '12:15',
        category: 'Branding',
        host: 'Gary Vaynerchuk',
        airTime: '5:00 PM'
      },
    ]
  },

  {
    id: 'ai',
    number: 6,
    name: 'AI World',
    tagline: 'The Future Is Now',
    color: '#06b6d4',
    bgGradient: 'from-cyan-900/40 via-cyan-800/20 to-transparent',
    textGradient: 'from-cyan-400 to-blue-400',
    emoji: '🤖',
    shows: [
      {
        id: 'ai-1',
        title: 'How Large Language Models Work',
        description: 'A clear, visual explanation of how AI language models like ChatGPT and Claude actually work under the hood — tokens, transformers, and more.',
        youtubeId: 'zjkBMFhNj_g',
        duration: '27:17',
        category: 'AI Explained',
        host: '3Blue1Brown',
        airTime: 'NOW LIVE'
      },
      {
        id: 'ai-2',
        title: 'The Brilliant Future of AI — Demis Hassabis',
        description: 'Google DeepMind CEO Demis Hassabis discusses the transformative potential of AI and what the next decade of artificial intelligence looks like.',
        youtubeId: 'srFKEFXTLSg',
        duration: '24:00',
        category: 'AI Future',
        host: 'Demis Hassabis',
        airTime: '2:00 PM'
      },
      {
        id: 'ai-3',
        title: 'How AI Could Save the World — Mustafa Suleyman',
        description: 'AI pioneer Mustafa Suleyman explains why AI is the most transformative technology in human history and how to ensure it benefits everyone.',
        youtubeId: 'bk-nQ7HF6k4',
        duration: '15:23',
        category: 'AI & Society',
        host: 'Mustafa Suleyman',
        airTime: '3:00 PM'
      },
      {
        id: 'ai-4',
        title: 'AI for Beginners: What You Need to Know',
        description: 'A complete beginner-friendly breakdown of artificial intelligence — what it is, how it works, and how it\'s changing every industry.',
        youtubeId: 'ad79nYk2keg',
        duration: '17:46',
        category: 'Beginner Guide',
        host: 'IBM Technology',
        airTime: '4:00 PM'
      },
      {
        id: 'ai-5',
        title: 'Sam Altman on the Future of OpenAI & ChatGPT',
        description: 'OpenAI CEO Sam Altman shares his vision for the future of AI, the path to AGI, and what it means for humanity.',
        youtubeId: 'e1cf58tYLtY',
        duration: '28:44',
        category: 'AI Leaders',
        host: 'Sam Altman',
        airTime: '5:00 PM'
      },
    ]
  }  ,
  {
    id: 'guest',
    number: 7,
    name: 'Guest Channel',
    tagline: 'Voices Worth Hearing',
    color: '#f59e0b',
    bgGradient: 'from-amber-900/40 via-amber-800/20 to-transparent',
    textGradient: 'from-amber-400 to-orange-400',
    emoji: '🎤',
    shows: [
      {
        id: 'guest-1',
        title: 'Brené Brown: The Power of Vulnerability',
        description: 'Researcher and storyteller Brené Brown studies human connection — our ability to empathize, belong, love. A courageous look at what it means to be vulnerable.',
        youtubeId: 'iCvmsMzlF7o',
        duration: '20:04',
        category: 'Featured Guest',
        host: 'Brené Brown',
        airTime: '9:00 AM'
      },
      {
        id: 'guest-2',
        title: 'Simon Sinek: How Great Leaders Inspire Action',
        description: 'Simon Sinek presents a simple but powerful model for how leaders and organizations inspire — starting with WHY. One of the most watched TED talks ever.',
        youtubeId: 'qp0HIF3SfI4',
        duration: '18:04',
        category: 'Leadership Guest',
        host: 'Simon Sinek',
        airTime: '10:00 AM'
      },
      {
        id: 'guest-3',
        title: 'Matthew McConaughey: This Is Why You Are Not Happy',
        description: 'Oscar-winning actor Matthew McConaughey shares the real reasons people struggle to find happiness and the life philosophy that changed everything for him.',
        youtubeId: 'BmCTQ_mkzHU',
        duration: '14:21',
        category: 'Life Wisdom',
        host: 'Matthew McConaughey',
        airTime: '11:00 AM'
      },
      {
        id: 'guest-4',
        title: 'Jim Carrey: Commencement Address at MUM',
        description: 'Jim Carrey delivers a hilarious and deeply moving speech about fear, love, and following your true purpose. A masterclass in comedy and wisdom combined.',
        youtubeId: 'V80-gPkpH6M',
        duration: '26:08',
        category: 'Special Guest',
        host: 'Jim Carrey',
        airTime: '12:00 PM'
      },
      {
        id: 'guest-5',
        title: 'Oprah Winfrey: Stanford Commencement Address',
        description: 'Media mogul and philanthropist Oprah Winfrey shares her life lessons on failure, gratitude, and finding your true calling at Stanford University.',
        youtubeId: 'BMebvxFEKXA',
        duration: '29:52',
        category: 'Special Guest',
        host: 'Oprah Winfrey',
        airTime: '1:00 PM'
      },
    ]
  }
]

export function getChannelById(id: string): Channel | undefined {
  return CHANNELS.find(c => c.id === id)
}
