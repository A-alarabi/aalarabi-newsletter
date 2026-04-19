export interface TriviaQuestion {
  q: string
  choices: string[]
  correct: number
  category: string
}

export const TRIVIA_BANK: TriviaQuestion[] = [
  { category: 'Geography', q: 'What is the capital of Australia?', choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correct: 2 },
  { category: 'Geography', q: 'The Nile river flows mainly through which continent?', choices: ['Asia', 'Africa', 'Europe', 'South America'], correct: 1 },
  { category: 'Geography', q: 'Which country has the most islands?', choices: ['Indonesia', 'Sweden', 'Philippines', 'Finland'], correct: 1 },
  { category: 'Science', q: 'How many bones are in the adult human body?', choices: ['186', '206', '226', '246'], correct: 1 },
  { category: 'Science', q: 'What is the chemical symbol for gold?', choices: ['Go', 'Gd', 'Au', 'Ag'], correct: 2 },
  { category: 'Science', q: 'Which planet has the most moons?', choices: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correct: 1 },
  { category: 'Science', q: 'What gas do plants absorb from the atmosphere?', choices: ['Oxygen', 'Hydrogen', 'Carbon dioxide', 'Nitrogen'], correct: 2 },
  { category: 'History', q: 'In what year did World War II end?', choices: ['1943', '1944', '1945', '1946'], correct: 2 },
  { category: 'History', q: 'Who was the first person to walk on the moon?', choices: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'Michael Collins'], correct: 1 },
  { category: 'History', q: 'The Great Wall of China was built primarily to defend against whom?', choices: ['Mongols', 'Romans', 'Japanese', 'Persians'], correct: 0 },
  { category: 'Pop Culture', q: 'Which artist painted the Mona Lisa?', choices: ['Michelangelo', 'Raphael', 'Da Vinci', 'Donatello'], correct: 2 },
  { category: 'Pop Culture', q: 'In what year was the first iPhone released?', choices: ['2005', '2007', '2009', '2011'], correct: 1 },
  { category: 'Pop Culture', q: 'Which band released the album "Abbey Road"?', choices: ['The Rolling Stones', 'The Beatles', 'Led Zeppelin', 'Pink Floyd'], correct: 1 },
  { category: 'Math', q: 'What is 15% of 200?', choices: ['20', '25', '30', '35'], correct: 2 },
  { category: 'Math', q: 'How many sides does a dodecagon have?', choices: ['10', '11', '12', '13'], correct: 2 },
  { category: 'Math', q: 'What is the square root of 144?', choices: ['11', '12', '13', '14'], correct: 1 },
  { category: 'Nature', q: 'What is the largest mammal on Earth?', choices: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'], correct: 1 },
  { category: 'Nature', q: 'How many hearts does an octopus have?', choices: ['1', '2', '3', '4'], correct: 2 },
  { category: 'Nature', q: 'Bananas are technically what type of fruit?', choices: ['Drupe', 'Berry', 'Citrus', 'Pome'], correct: 1 },
  { category: 'Gaming', q: 'Which company created Mario?', choices: ['Sega', 'Sony', 'Nintendo', 'Atari'], correct: 2 },
  { category: 'Gaming', q: 'In what year was Minecraft first released?', choices: ['2007', '2009', '2011', '2013'], correct: 2 },
  { category: 'Gaming', q: 'What color is Kirby?', choices: ['Yellow', 'Pink', 'Green', 'Blue'], correct: 1 },
]
