export const STEPS = [
  { n: 1, label: 'Upload' },
  { n: 2, label: 'Metadata' },
  { n: 3, label: 'Distribute' },
  { n: 4, label: 'Social' },
  { n: 5, label: 'Launch' },
]

export const GENRES = [
  'Hip-Hop/Rap', 'R&B/Soul', 'Trap', 'Boom Bap', 'Lo-Fi Hip-Hop',
  'Drill', 'Conscious Rap', 'Alt Hip-Hop', 'Pop', 'Electronic', 'Gospel', 'Neo-Soul'
]

export const MOODS = [
  'Dark', 'Chill', 'Aggressive', 'Melancholic', 'Motivational',
  'Nostalgic', 'Energetic', 'Introspective', 'Triumphant', 'Romantic', 'Smooth', 'Hard'
]

export const INITIAL_TRACK = {
  file: null,
  fileName: '',
  duration: 0,
  fileSize: 0,
  format: '',
  bpm: '',
  title: '',
  artist: '',
  genre: 'Hip-Hop/Rap',
  subgenre: '',
  mood: '',
  key: '',
  explicit: false,
  language: 'en',
  releaseDate: '',
  copyrightOwner: '',
  aiDisclosure: true,
  description: '',
}
