import React, { useRef, useEffect } from "react";
import './cards.css';
import Fireworks from "../../utils/fireworks";
import Loader from "../../utils/Loader.jsx"; // Import loader


const Stack = () => {
  const stackRef = useRef(null);

  useEffect(() => {
    const stack = stackRef.current;

    // reverse children once on mount
    const children = Array.from(stack.children);
    children.reverse().forEach((child) => stack.appendChild(child));

    // swap function
    const swap = (e) => {
      const card = stack.querySelector(".cardstack-card:last-child");
      if (e.target !== card) return;

      card.style.animation = "cardstack-swap 700ms forwards";

      setTimeout(() => {
        card.style.animation = "";
        stack.prepend(card);
      }, 700);
    };

    stack.addEventListener("click", swap);

    return () => {
      stack.removeEventListener("click", swap);
    };
  }, []);

  return (
    
    <div className="cardstack-root" style={{ position: "relative", minHeight: "100vh" }}>
      <Fireworks />

      <button className="go-to-main-button" onClick={() => window.location.href = '/main-page'}>
        Go To Main Page
      </button>

      <div style={{ position: "relative", zIndex: 1 }}></div>
        <div className="cardstack-stack" ref={stackRef}>
        <div className="cardstack-card">
            <div className="cardstack-card-content">The way your eyes sparkle feels like magic I never want to end.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your hands fit perfectly in mine, like they were made just for me.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your beauty radiates from the inside out, glowing brighter every day.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">You're so effortlessly gorgeous that words could never do you justice.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your inner beauty is even more breathtaking than your outer beauty.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your smile lights up my darkest moments without even trying.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your laugh is my favorite melody, and I could listen forever.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your voice soothes me more than any song ever could.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your gentle heart reminds me what true kindness feels like.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">The way you comfort me makes me believe in love again and again.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your presence feels like home, no matter where we are.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">You make ordinary days feel extraordinary just by being there.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your confidence inspires me to believe in myself more.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your facial expressions are the sweetest things to watch.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Even your little hand gestures make me fall for you more.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">The way you look at me makes me feel like the luckiest person alive.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your kindness shows in every little thing you do.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your humor makes life brighter and so much funnier.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">You have the most gorgeous soul I've ever known.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your honesty makes me trust you with my whole being.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your caring nature inspires me to be a better person.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your eyes tell me stories without a single word spoken.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your touch is gentle, warm, and full of love.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your understanding nature makes me feel completely safe with you.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your gorgeous smile is a picture I never want to forget.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your laugh has the power to heal even my hardest days.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your beauty leaves me speechless, every single time I see you.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your heart is the most beautiful place I've ever known.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your support means more to me than I can ever explain.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your sweet personality makes me fall for you again daily.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your hands feel like they hold my whole world together.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your inner beauty shines brighter than any star in the sky.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your style is uniquely yours, and it's always stunning.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your reactions are adorable and make me love you more.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your strength in tough times amazes me every single day.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your gorgeousness is unmatched, inside and out.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your love is the most precious gift I've ever been given.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your eyes hold a universe I want to live in forever.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your sweetness makes even silence between us feel full of love.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your brilliance inspires me to chase my dreams fearlessly.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your words touch me deeper than anyone else's ever could.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your beauty makes the world seem brighter when you're around.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your warmth is the reason I believe in soulmates.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your gorgeous heart makes me love you more each day.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your little quirks make you unique, and I adore them all.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your love feels like the safest place in the world.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your presence makes every place feel alive and beautiful.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your gorgeous smile is the reason my heart races.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your eyes are the most beautiful part of my universe.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your everything makes me grateful to be yours forever.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">I love the way your smile lights up every room</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your laugh is the most joyful sound I know</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your voice calms me more than any song ever could</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">I love how soft and beautiful your hair always looks</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">The way your eyes sparkle makes me lose myself in them</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your honesty makes me trust you with my whole heart</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">I adore your jokes its like they make even dull moments fun</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">I love the effort you put into everything you do</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your humor makes life feel brighter and easier</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your kindness reminds me how beautiful people can be.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">I love your energy, it fills every space with life.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your talent leaves me in awe again and again.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your pretty face is a picture I never tire of</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">Your beauty radiates inside and out, in everything you do.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">The way you comfort me is something I'll never forget</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">I love how sweet and gentle you are to me.</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">I love how your eyes speak volumes without words</div>
        </div>
        <div className="cardstack-card">
            <div className="cardstack-card-content">PLEASE READ ALL THE CARDS THAT DESCRIBE YOU IN A REALLY LOVELY WAY 🤭 </div>
        </div>
    </div>
    </div>
  );
};

export default Stack;
