import { useEffect, useState } from 'react';

const INDIAN_NAMES = [
  'Aarav',
  'Priya',
  'Rahul',
  'Ananya',
  'Vikram',
  'Kavya',
  'Arjun',
  'Sneha',
  'Rohit',
  'Pooja',
  'Aditya',
  'Neha',
  'Karan',
  'Divya',
  'Manish',
  'Ishita',
  'Suresh',
  'Riya',
  'Amit',
  'Shreya',
  'Sanjay',
  'Anjali',
  'Rohan',
  'Meera',
  'Deepak',
  'Sakshi',
  'Naveen',
  'Nidhi',
  'Varun',
  'Tanvi',
  'Akash',
  'Preeti',
  'Harsh',
  'Lakshmi',
  'Kunal',
  'Swati',
  'Rajesh',
  'Aisha',
  'Dev',
  'Kavita',
];

const WIN_AMOUNTS = [50, 100, 200, 250, 500, 750, 1000, 1500, 2000, 2500, 5000, 7500, 10000, 15000, 25000];

const GAMES = ['Ludo', 'Head & Tail', 'Tournament', '2v2 Battle', 'Mega Win'];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function formatAmount(n) {
  return Number(n).toLocaleString('en-IN');
}

function buildItems(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    id: `ticker-${i}`,
    name: pick(INDIAN_NAMES),
    amount: pick(WIN_AMOUNTS),
    game: pick(GAMES),
  }));
}

function TickerContent({ items }) {
  return (
    <>
      {items.map((item) => (
        <span key={item.id} className="rush-win-ticker-item">
          <span className="rush-win-ticker-dot" aria-hidden />
          <span className="rush-win-ticker-name">{item.name}</span>
          <span className="rush-win-ticker-won">won</span>
          <span className="rush-win-ticker-amt">₹{formatAmount(item.amount)}</span>
          <span className="rush-win-ticker-game">in {item.game}</span>
        </span>
      ))}
    </>
  );
}

export default function RushWinTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(buildItems(22));
  }, []);

  if (!items.length) return null;

  return (
    <div className="rush-win-ticker" aria-label="Recent winners" role="marquee">
      <div className="rush-win-ticker-glow" aria-hidden />
      <div className="rush-win-ticker-track">
        <div className="rush-win-ticker-inner">
          <TickerContent items={items} />
          <TickerContent items={items.map((it, i) => ({ ...it, id: `${it.id}-dup-${i}` }))} />
        </div>
      </div>
    </div>
  );
}
