async function fetchQuote() {
  try {
    const res = await fetch("https://programming-quotesapi.vercel.app/api/random");
    const data = await res.json();

    return {
      text: data.quote,
      author: data.author
    };
  } catch (err) {
    return {
      text: "Error fetching quote.",
      author: "System"
    };
  }
}

function typeText(element, html, speed = 25) {
  element.innerHTML = "";
  let index = 0;

  const interval = setInterval(() => {
    element.innerHTML = html.slice(0, index);
    index++;
    if (index > html.length) clearInterval(interval);
  }, speed);
}

async function displayQuote() {
  const el = document.getElementById("terminalText");

  const quote = await fetchQuote();

  const html = 
    `> <span class="quote-text">"${quote.text}"</span>\n` +
    `> <span class="quote-author">— ${quote.author}</span>`;

  typeText(el, html);
}

displayQuote();