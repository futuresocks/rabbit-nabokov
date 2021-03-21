import {useEffect, useState} from 'react';

const App = () => {
  const [cards, setCards] = useState([]);
  const [dealerCard, setDealerCard] = useState(null);
  const [playerCard, setPlayerCard] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [outcome, setOutcome] = useState('');
  const [playerFunds, setPlayerFunds] = useState(100);
  const [playerBet, setPlayerBet] = useState(null);
  const [inputValue, setInputValue] = useState(0);

  useEffect(() => {
    fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1&jokers_enabled=true")
      .then(res => res.json())
      .then(({deck_id}) => {
        fetch(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=21`)
        .then(res => res.json())
        .then(({cards}) => setCards(cards));
      })
  }, [])

  useEffect(() => {
    setDealerCard(cards.splice(0,1)[0]);
    setPlayerCards(cards.splice(0, 5));
  }, [cards])

  useEffect(() => {
    if(!playerCard) return;
    playGame();
  }, [playerCard])

  useEffect(() => {
    if(!outcome) return;
    const PAYOUTS = {
      "RABBIT": 1,
      "KHOROSHO": 2,
      "PIROSHKY": 10,
      "MISCHA": 50,
      "KATYUSHA": -10,
      "RABBIT NABOKOV": 100
    }
    const updatedFunds = playerFunds + (playerBet * PAYOUTS[outcome]);
    console.log(updatedFunds);
    setPlayerFunds(updatedFunds);
  }, [outcome])

  const checkForRabbit = () => {
    const CARD_VALUES = {
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      "10": 10,
      "JACK": 11,
      "QUEEN": 12,
      "KING": 13, 
      "ACE": 14
    };
    const acceptableValues = [-2, 2];
    return acceptableValues.includes(CARD_VALUES[playerCard.value] - CARD_VALUES[dealerCard.value]);
  }

  const checkForKhorosho = () => {
    const acceptableValues = ["KING", "QUEEN", "JACK", "10"];
    return acceptableValues.includes(playerCard.value) && playerCard.suit === dealerCard.suit;
  }

  const checkForPiroshky = () => {
    return playerCard.value === 'ACE' && dealerCard.value === 'ACE';
  }

  const checkForMischa = () => {
    return dealerCard.value === '2' && playerCard.value === 'JOKER';
  }

  const checkForKatyusha = () => {
    return dealerCard.value === '2' && playerCard.value === '2';
  }

  const checkForRabbitNabokov = () => {
    return dealerCard.value === 'JOKER' && playerCard.code === '2H';
  }

  const playGame = () => {
    // 1) If the difference in the value is 2, that's a "Rabbit" and the Player wins how much he bet.
    if(checkForRabbit()) return setOutcome("RABBIT")
    // 2) If the Player has a face card (King, Queen, Jack) or 10, and it matches the suit of the dealer's card, that's a "Khorosho/Good" and the Player wins double his bet.
    if(checkForKhorosho()) return setOutcome("KHOROSHO")
    // 3) If the Dealer reveals an Ace and the Player reveals an Ace, that's a "Piroshky/Feast" and the Player wins 10 times his bet.
    if(checkForPiroshky()) return setOutcome('PIROSHKY')
    // 4a) If the Dealer reveals a 2, only a Joker can beat it. If the Player does reveal a Joker, that's a "Mischa" and he wins 50 times his bet.
    if(checkForMischa()) return setOutcome('MISCHA')
    // 4b) If the Player shows a 2 and the Dealer shows a 2, that's a "Katyusha/Casualty" and the Player loses 10 times his bet.
    if(checkForKatyusha()) return setOutcome('KATYUSHA')
    // 5) If the Dealer shows a Joker and the Player plays a 2 of Hearts, that's a "Rabbit Nabokov" and the Player wins 100 times his bet.
    if(checkForRabbitNabokov()) return setOutcome('RABBIT NABOKOV')
    // 6) If none of the above occur then it is a "Potov/Miss" and the Player loses his bet.
    setOutcome('POTOV'); 
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const bet = parseInt(inputValue);
    setPlayerBet(bet);
    setPlayerFunds(playerFunds - bet);
  }

  return (
    <div className="App">
      {outcome && <h1>THAT'S A {outcome}</h1>}
      {dealerCard && <img src={dealerCard.image}/>}
      {playerCards && playerCards.map(card => {
        return <img src={card.image} onClick={() => setPlayerCard(card)}/>
      })}
      {playerBet && <h2>YOU'VE BET {playerBet}</h2>}
      <h2>Funds: {playerFunds}</h2>
      <form onSubmit={handleSubmit}>
        <input min={0} max={playerFunds} type="number" value={inputValue} onChange={e => setInputValue(e.target.value)}/>
        <input type="submit" value="Bet"/>
      </form>
    </div>
  );
}

export default App;
