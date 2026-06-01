/** Client-side fallback pool (server assigns AI names at match start) */
export const INDIAN_BOY_NAMES = [
  'Aarav', 'Vihaan', 'Arjun', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya',
  'Atharv', 'Advait', 'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Anirudh', 'Vivaan',
  'Aditya', 'Sai', 'Rudra', 'Parth', 'Dev', 'Neil', 'Yash', 'Rohan', 'Karan',
  'Harsh', 'Manav', 'Kunal', 'Nikhil', 'Rahul', 'Amit', 'Raj', 'Vikram', 'Suresh',
  'Ravi', 'Deepak', 'Manish', 'Sandeep', 'Varun', 'Gaurav', 'Pranav', 'Shubham',
  'Akash', 'Mohit', 'Tarun', 'Naveen', 'Ashwin', 'Bharat', 'Chetan', 'Dinesh',
];

export const INDIAN_GIRL_NAMES = [
  'Aadhya', 'Ananya', 'Diya', 'Myra', 'Kiara', 'Pari', 'Anika', 'Navya',
  'Aanya', 'Riya', 'Saanvi', 'Ishita', 'Prisha', 'Avni', 'Kavya', 'Sara',
  'Zara', 'Nisha', 'Priya', 'Sneha', 'Pooja', 'Anjali', 'Neha', 'Shruti',
  'Divya', 'Meera', 'Lakshmi', 'Sunita', 'Kavita', 'Rekha', 'Geeta', 'Sita',
  'Tara', 'Mira', 'Nandini', 'Ishani', 'Aishwarya', 'Deepika', 'Kiran', 'Jasleen',
  'Harleen', 'Simran', 'Manpreet', 'Gurpreet', 'Bhavna', 'Swati', 'Shilpa', 'Tanvi',
  'Ishika', 'Muskan',
];

export function pickRandomIndianName() {
  const pool = Math.random() < 0.5 ? INDIAN_BOY_NAMES : INDIAN_GIRL_NAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}
