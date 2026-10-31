import { useEffect, useState } from "react";
import { WORDS } from "./words.js";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const MAX = 6;

function dayWord() {
  const d = new Date();
  const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return WORDS[n % WORDS.length];
}

function score(guess, ans) {
  const res = Array(5).fill("no");
  const left = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === ans[i]) res[i] = "ok";
    else left[ans[i]] = (left[ans[i]] || 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "no" && left[guess[i]]) {
      res[i] = "has";
      left[guess[i]]--;
    }
  }
  return res;
}

export default function App() {
  const [answer, setAnswer] = useState(dayWord);
  const [guesses, setGuesses] = useState([]);
  const [cur, setCur] = useState("");
  const [msg, setMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [status, setStatus] = useState("play");

  const keyColors = {};
  guesses.forEach((g) =>
    score(g, answer).forEach((s, i) => {
      const c = g[i];
      const p = keyColors[c];
      if (s === "ok" || (s === "has" && p !== "ok") || !p) keyColors[c] = s;
    })
  );

  function press(k) {
    if (status !== "play") return;
    if (k === "enter") {
      if (cur.length < 5) {
        setMsg("Yetarli harf yo’q");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      const next = [...guesses, cur];
      setGuesses(next);
      setCur("");
      setMsg("");
      const wait = 5 * 280 + 500;
      if (cur === answer) {
        setTimeout(() => {
          setStatus("win");
          setMsg("Barakalla! To’g’ri topdingiz!");
        }, wait);
      } else if (next.length === MAX) {
        setTimeout(() => {
          setStatus("lose");
          setMsg("Yutqazdingiz. So’z: " + answer.toUpperCase());
        }, wait);
      }
    } else if (k === "del") {
      setCur(cur.slice(0, -1));
      setMsg("");
    } else if (cur.length < 5) {
      setCur(cur + k);
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") press("enter");
      else if (e.key === "Backspace") press("del");
      else if (/^[a-z]$/i.test(e.key)) press(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function restart() {
    const pool = WORDS.filter((w) => w !== answer);
    setAnswer(pool[Math.floor(Math.random() * pool.length)]);
    setGuesses([]);
    setCur("");
    setMsg("");
    setStatus("play");
  }

  const rows = [];
  for (let r = 0; r < MAX; r++) {
    const done = r < guesses.length;
    const active = r === guesses.length;
    const word = done ? guesses[r] : active ? cur : "";
    const sc = done ? score(guesses[r], answer) : null;
    rows.push(
      <div key={r} className={"row" + (active && shake ? " shake" : "")}>
        {[0, 1, 2, 3, 4].map((i) => {
          const cls =
            "tile" +
            (done ? " " + sc[i] + (r === guesses.length - 1 ? " flip" : "") : word[i] ? " f" : "");
          return (
            <div key={i} className={cls} style={{ "--i": i }}>
              {word[i] || ""}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <h1>So’z top</h1>
      <p className="sub">5 harfli o’zbekcha so’zni 6 urinishda toping.</p>
      <div className="legend">
        <span><i style={{ background: "var(--ok)" }} />to’g’ri joyda</span>
        <span><i style={{ background: "var(--has)" }} />so’zda bor, joyi boshqa</span>
        <span><i style={{ background: "var(--no)" }} />so’zda yo’q</span>
      </div>
      <div className="board" role="grid" aria-label="O’yin taxtasi">{rows}</div>
      <div className="msg" role="status" aria-live="polite">{msg}</div>
      {status !== "play" && (
        <button className="btn" onClick={restart}>Yangi so’z</button>
      )}
      <div className="kb">
        {ROWS.map((row, ri) => (
          <div key={ri} className="kr">
            {ri === 2 && <button className="k w" onClick={() => press("enter")}>Yuborish</button>}
            {row.split("").map((c) => (
              <button key={c} className={"k " + (keyColors[c] || "")} onClick={() => press(c)} aria-label={c}>
                {c}
              </button>
            ))}
            {ri === 2 && <button className="k w" onClick={() => press("del")}>O’chirish</button>}
          </div>
        ))}
      </div>
    </>
  );
}
