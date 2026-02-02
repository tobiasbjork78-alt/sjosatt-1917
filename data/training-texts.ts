export const HOMEROW_TEXTS = [
  // Basic single letters
  'aaaa ssss dddd ffff jjjj kkkk llll ;;;;',

  // Simple combinations
  'asdf jkl; asdf jkl; asdf jkl;',

  // Letter pairs
  'ad ad ad ad jk jk jk jk sl sl sl sl',

  // Simple words using only homerow
  'add add ask ask dad dad sad sad lads lads',

  // Progressive difficulty
  'flask flask salad salad fallals fallals',

  // Full homerow sentences
  'dad ask a lad; a sad lass; add a flask;',

  // Advanced homerow text
  'salad flask falls; ask dad; sad lass adds flask;'
];

export const WORD_LISTS = {
  homerow: [
    'add', 'ask', 'dad', 'sad', 'lad', 'lass', 'fall', 'falls', 'flask', 'salad',
    'all', 'as', 'la', 'las', 'sass', 'fads', 'ads', 'lads'
  ],

  basic: [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy'
  ],

  programming: [
    'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
    'class', 'interface', 'type', 'async', 'await', 'import', 'export',
    'default', 'public', 'private', 'static', 'extends', 'implements'
  ],

  swedish: [
    'och', 'att', 'det', 'en', 'av', 'är', 'för', 'den', 'till', 'har',
    'de', 'som', 'med', 'ett', 'på', 'var', 'vi', 'i', 'från', 'men',
    'här', 'när', 'inte', 'också', 'bara', 'skulle', 'kommer', 'mycket',
    'hej', 'tack', 'bra', 'hem', 'dag', 'år', 'tid', 'väl', 'stor', 'ny',
    'god', 'kul', 'bil', 'hus', 'bok', 'mat', 'vatten', 'kaffe', 'kött'
  ],

  numbers: [
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    '1234567890', '123', '456', '789', '0', 'first', 'second', 'third', 'fourth'
  ],

  symbols: [
    '!@#$%^&*()', '[]{}', '<>=+-', '?/', '.:;', '"\'`', '~|\\', '1!', '2@', '3#',
    '4$', '5%', '6^', '7&', '8*', '9(', '0)', 'hello@world.com', 'user123'
  ]
};

export const CODE_SNIPPETS = [
  'const name = "Hello World";',
  'function add(a, b) { return a + b; }',
  'if (user.isActive) { console.log("Active"); }',
  'for (let i = 0; i < 10; i++) { /* code */ }',
  'const users = await fetch("/api/users");',
  'export default function Component() {}',
  'interface User { id: number; name: string; }',
  'const handleClick = () => { setOpen(!open); };',
  'try { const data = JSON.parse(response); } catch (err) {}',
  'const { useState, useEffect } = React;',
  'const router = useRouter(); router.push("/home");',
  'import { NextApiRequest, NextApiResponse } from "next";',
  'Array.from({ length: 10 }, (_, i) => i + 1)',
  'const promise = new Promise((resolve, reject) => {});',
  'document.querySelector(".button").addEventListener("click", fn);'
];

export const SWEDISH_SENTENCES = [
  'Hej och välkommen till tangentbordsträning!',
  'Sverige är ett vackert land i Norden.',
  'Programmerare skriver kod varje dag.',
  'Kaffe och fika är viktigt för oss svenskar.',
  'Stockholm är Sveriges huvudstad och största stad.',
  'På sommaren är det ljust nästan hela dagen.',
  'Många svenskar talar mycket bra engelska också.',
  'Teknologi utvecklas snabbt i vårt moderna samhälle.',
  'Julafton firas den tjugofjärde december i Sverige.',
  'Midsommar är en av Sveriges viktigaste högtider.',
  'IKEA och Volvo är kända svenska företag världen över.',
  'Skansen på Djurgården är ett populärt besöksmål.',
  'Svenska språket tillhör den nordgermanska språkgruppen.',
  'Lagom är ett typiskt svenskt ord som är svårt att översätta.',
  'Allemansrätten ger alla rätt att vistas i naturen.',
  'Nobelpriset delas ut varje år i Stockholms konserthus.'
];